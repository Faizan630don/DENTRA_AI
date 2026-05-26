"""
DentalVision AI — FastAPI Backend
Integrated with Gemini for professional AI reporting and Supabase for storage.
Uses CNNModelService for real-time YOLOv8/v11 inference.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
import io
import uuid
import logging
import base64
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from supabase import create_client, Client
from config import settings
from llm_service import generate_report, compare_reports
from model_service import cnn_service
from services.second_opinion_ai import SecondOpinionAI
from utils import process_dicom_or_image

# ─────────────────────────────────────────────────────────────────────────────
# Initialize Services
# ─────────────────────────────────────────────────────────────────────────────
so_ai = SecondOpinionAI(api_key=settings.groq_api_key)

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Initialize FastAPI + Supabase
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(title="DentalVision AI API", version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

# ─────────────────────────────────────────────────────────────────────────────
# Data Models
# ─────────────────────────────────────────────────────────────────────────────
class Finding(BaseModel):
    id: str
    tooth_id: str
    condition: str
    severity: int
    confidence: float
    bbox: Dict[str, float]
    triage: str
    explanation: Optional[str] = "Clinical description pending."
    patient_explanation: Optional[str] = "Analysis in progress."
    dentist_notes: Optional[str] = "AI verification queued."
    timeline_progression: Optional[Dict[str, str]] = None
    clinical_name: Optional[str] = None
    second_opinion: str = "pending"
    icdas_code: Optional[str] = None

class TreatmentProcedure(BaseModel):
    name: str
    tooth_id: str
    urgency: str
    cost_low: float
    cost_high: float
    description: str
    patient_description: str

class CompareRequest(BaseModel):
    old_report_id: str
    new_report_id: str

class TreatmentPlan(BaseModel):
    priority_list: List[str]
    procedures: List[TreatmentProcedure]
    cost_estimate_inr: Dict[str, float]
    patient_summary: str
    dentist_summary: str

class AnalysisResponse(BaseModel):
    scan_id: str
    scan_date: str
    patient_name: str
    biological_age: int
    dental_age: int
    findings: List[Finding]
    risk_score: str
    overall_health: int
    treatment: TreatmentPlan
    xray_image_url: str

# Authentication Dependency
def get_current_user(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        return "anonymous"
    token = authorization.split(" ")[1]
    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user.id if user_response and user_response.user else "anonymous"
    except:
        return "anonymous"

# ─────────────────────────────────────────────────────────────────────────────
# CORE ENDPOINT: /analyze
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_xray(
    file: UploadFile = File(...),
    patient_name: str = Form("Patient"),
    patient_age: int = Form(30),
    patient_sex: str = Form("M"),
):
    file_bytes = await file.read()
    
    try:
        processed_image_bytes = process_dicom_or_image(file_bytes, file.filename)
        
        if not processed_image_bytes:
            raise HTTPException(status_code=400, detail="Failed to process image.")

        # Run Real Inference via Model Service
        findings_data, overall_triage, summary_text = await cnn_service.predict(processed_image_bytes)
        
        # Map to Pydantic models
        findings = [Finding(**f) for f in findings_data]

        # Generate AI Reports with Gemini
        ai_findings = [{"tooth_id": str(f.tooth_id or '').strip(), "condition": f.condition, "severity": f.severity} for f in findings]
        
        # Combined request to Gemini for consistency (Multimodal Vision Audit)
        treatment_plan_raw = generate_report({
            "output_mode": "treatment_plan",
            "findings": ai_findings,
            "patient_name": patient_name
        }, image_bytes=processed_image_bytes)

        # Health Score Heuristic
        overall_health = max(10, 95 - (len(findings) * 8))
        if overall_triage == "RED": overall_health = min(overall_health, 45)
        elif overall_triage == "YELLOW": overall_health = min(overall_health, 75)

        processed_image_b64 = base64.b64encode(processed_image_bytes).decode('utf-8')
        
        # Ensure treatment_plan_raw is a dict with correct keys
        treatment = treatment_plan_raw if isinstance(treatment_plan_raw, dict) else {
            "priority_list": [],
            "procedures": [],
            "cost_estimate_inr": {"low": 0, "high": 0},
            "patient_summary": summary_text,
            "dentist_summary": "Analysis complete."
        }
        
        try:
            valid_treatment = TreatmentPlan(**treatment)
        except Exception as e:
            logger.error(f"TreatmentPlan Validation Error: {e}")
            valid_treatment = TreatmentPlan(
                priority_list=[f"Review {len(findings)} detected conditions"],
                procedures=[],
                cost_estimate_inr={"low": 0, "high": 0},
                patient_summary="The AI has identified several areas of concern. Detailed descriptive report generation failed schema validation.",
                dentist_summary="Inference complete. High-accuracy detections are available in the viewer."
            )

        return AnalysisResponse(
            scan_id=str(uuid.uuid4()),
            scan_date=datetime.now().isoformat(),
            patient_name=patient_name,
            biological_age=patient_age,
            dental_age=patient_age + (len(findings) // 2),
            findings=findings,
            risk_score=overall_triage.replace("RED", "High").replace("YELLOW", "Medium").replace("GREEN", "Low"),
            overall_health=overall_health,
            treatment=valid_treatment,
            xray_image_url=f"data:image/jpeg;base64,{processed_image_b64}"
        )
        
    except Exception as e:
        logger.error(f"Analysis Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI Analysis Failed: {str(e)}")

@app.post("/save-report")
async def save_report(request: AnalysisResponse, user_id: str = Depends(get_current_user)):
    if user_id == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required to save reports")
    try:
        # Map internal risk score back to clinical triage for database storage
        triage_map = {"High": "RED", "Medium": "YELLOW", "Low": "GREEN"}
        
        data = {
            "user_id": user_id,
            "findings": [f.dict() for f in request.findings],
            "treatment": request.treatment.dict(),
            "patient_summary": request.treatment.patient_summary,
            "overall_triage": triage_map.get(request.risk_score, "GREEN"),
            "dental_age": request.dental_age,
            "xray_url": request.xray_image_url
        }
        response = supabase.table("reports").insert(data).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        logger.error(f"Save Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reports")
async def get_reports(user_id: str = Depends(get_current_user)):
    if user_id == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        response = supabase.table("reports").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"reports": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compare-reports")
async def compare_historical_reports(request: CompareRequest, user_id: str = Depends(get_current_user)):
    try:
        old_res = supabase.table("reports").select("findings").eq("id", request.old_report_id).single().execute()
        new_res = supabase.table("reports").select("findings").eq("id", request.new_report_id).single().execute()
        
        comparison = compare_reports(old_res.data['findings'], new_res.data['findings'])
        return {"comparison": comparison}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/second-opinion")
async def get_second_opinion(data: Dict[str, Any]):
    """
    Main endpoint for second opinion analysis.
    Uses intelligent simulation (Model B) for efficient production verification.
    """
    findings = data.get("findings")
    if not findings:
        raise HTTPException(status_code=400, detail="Findings data is required")
        
    try:
        result = await so_ai.analyze(findings)
        return result
    except Exception as e:
        logger.error(f"Second Opinion API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "model_ready": cnn_service.model is not None}

@app.get("/test")
async def test():
    if cnn_service.model is None: return {"error": "Model not loaded"}
    return {"model": "YOLO (best.pt)", "classes": cnn_service.model.names}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

