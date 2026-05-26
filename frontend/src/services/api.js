/**
 * api.js — DentalVision AI Frontend
 * Orchestrates real-time communication with the FastAPI backend and validates AI results.
 */

import { validateAnalysisResult, logValidationIssues } from '../utils/dataValidator';

const USE_MOCK = false; 
const BASE_URL = import.meta.env.PROD 
  ? 'https://dentra-ai-1.onrender.com' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:8000');

// Local cache for performance
const resultCache = {};

/**
 * Sends an X-ray to the backend and returns the validated, high-accuracy analysis.
 */
export async function analyzeScan(
  file, 
  patientInfo = { name: 'Patient', age: 30, sex: 'M' }
) {
  if (USE_MOCK) {
    throw new Error("Mock mode is disabled. Please ensure backend is running.");
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('patient_name', patientInfo.name);
  formData.append('patient_age', String(patientInfo.age));
  formData.append('patient_sex', patientInfo.sex);

  try {
    const res = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Backend error: ${res.status}`);
    }

    let rawData = await res.json();

    const validatedData = validateAnalysisResult(rawData);

    validatedData.findings.forEach((f) => logValidationIssues(f));

    resultCache[validatedData.scan_id] = validatedData;

    return validatedData;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

/**
 * Compatibility wrapper for existing upload flows.
 */
export async function uploadXray(file, patientInfo) {
  const result = await analyzeScan(file, patientInfo);
  return { scan_id: result.scan_id };
}

/**
 * Retrieves cached or fresh scan results.
 */
export async function getScanResults(scanId) {
  if (resultCache[scanId]) return resultCache[scanId];
  throw new Error(`Scan ${scanId} not found in local cache.`);
}

export async function fetchSecondOpinion(findings) {
  try {
    const res = await fetch(`${BASE_URL}/api/second-opinion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ findings }),
    });

    if (!res.ok) throw new Error(`Second opinion failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Second opinion error:', error);
    throw error;
  }
}

/**
 * Checks if the backend inference engine is online.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * After every successful analysis, save to localStorage.
 */
export function saveScanToHistory(result) {
  const history = JSON.parse(
    localStorage.getItem('scan_history') ?? '[]'
  );
  
  const summary = {
    scan_id: result.scan_id,
    patient_name: result.patient_name,
    patient_age: result.biological_age,
    scan_date: result.scan_date ?? new Date().toISOString(),
    overall_triage: result.findings.length > 0 ? (result.findings.some(f => f.triage === 'RED') ? 'RED' : result.findings.some(f => f.triage === 'YELLOW') ? 'YELLOW' : 'GREEN') : 'GREEN',
    finding_count: result.findings.length,
    high_count: result.findings.filter(f => f.triage === 'RED').length,
    medium_count: result.findings.filter(f => f.triage === 'YELLOW').length,
    low_count: result.findings.filter(f => f.triage === 'GREEN').length,
    conditions_preview: Array.from(new Set(result.findings.map(f => f.condition))).slice(0, 3),
  };
  
  const existing = history.findIndex(h => h.scan_id === result.scan_id);
  if (existing >= 0) history[existing] = summary;
  else history.unshift(summary);

  const updatedHistory = history.slice(0, 20);
  localStorage.setItem('scan_history', JSON.stringify(updatedHistory));
  
  try {
    localStorage.setItem(`scan_full_${result.scan_id}`, JSON.stringify(result));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.warn("Storage quota exceeded. Evicting images of older scans to make space...");
      
      // Step 1: Try stripping the heavy xray_image_url from older scans in the history
      for (let i = updatedHistory.length - 1; i >= 0; i--) {
        const oldScanId = updatedHistory[i].scan_id;
        if (oldScanId !== result.scan_id) {
          const oldRaw = localStorage.getItem(`scan_full_${oldScanId}`);
          if (oldRaw) {
            try {
              const oldData = JSON.parse(oldRaw);
              if (oldData.xray_image_url) {
                delete oldData.xray_image_url;
                localStorage.setItem(`scan_full_${oldScanId}`, JSON.stringify(oldData));
              }
            } catch {
              // Ignore parse/write errors for individual items
            }
          }
          
          try {
            localStorage.setItem(`scan_full_${result.scan_id}`, JSON.stringify(result));
            console.log("Successfully saved scan after clearing old images.");
            return;
          } catch {
            // Keep looping to free up more space
          }
        }
      }
      
      // Step 2: If still out of space, delete older full scans entirely
      for (let i = updatedHistory.length - 1; i >= 0; i--) {
        const oldScanId = updatedHistory[i].scan_id;
        if (oldScanId !== result.scan_id) {
          localStorage.removeItem(`scan_full_${oldScanId}`);
          try {
            localStorage.setItem(`scan_full_${result.scan_id}`, JSON.stringify(result));
            console.log("Successfully saved scan after deleting old full scans.");
            return;
          } catch {
            // Keep deleting
          }
        }
      }
    } else {
      throw e;
    }
  }
}

/**
 * Loads full findings for a specific scan.
 */
export function loadFullScan(scanId) {
  const raw = localStorage.getItem(`scan_full_${scanId}`);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Retrieves the summary list of all recent scans.
 */
export function loadScanHistory() {
  return JSON.parse(localStorage.getItem('scan_history') ?? '[]');
}

export default { 
  analyzeScan, 
  uploadXray, 
  getScanResults, 
  fetchSecondOpinion, 
  checkBackendHealth, 
  saveScanToHistory, 
  loadFullScan, 
  loadScanHistory 
};
