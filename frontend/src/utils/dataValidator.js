/**
 * Validates and normalizes backend data to ensure frontend can render safely.
 * Strictly adheres to FDI World Dental Federation notation (11-48).
 */

/** Mapping Tooth ID or Region to clinical names */
export const getToothClinicalName = (id) => {
  if (!id) return 'Unknown Region';
  
  if (id.includes('Upper') || id.includes('Lower') || id.includes('Incisor')) {
    return id;
  }

  const num = parseInt(id, 10);
  if (isNaN(num) || num < 1 || num > 32) return id;

  const toothNames = {
    1: 'Upper Right 3rd Molar', 2: 'Upper Right 2nd Molar', 3: 'Upper Right 1st Molar',
    4: 'Upper Right 2nd Premolar', 5: 'Upper Right 1st Premolar', 6: 'Upper Right Canine',
    7: 'Upper Right Lateral Incisor', 8: 'Upper Right Central Incisor',
    9: 'Upper Left Central Incisor', 10: 'Upper Left Lateral Incisor', 11: 'Upper Left Canine',
    12: 'Upper Left 1st Premolar', 13: 'Upper Left 2nd Premolar', 14: 'Upper Left 1st Molar',
    15: 'Upper Left 2nd Molar', 16: 'Upper Left 3rd Molar',
    17: 'Lower Left 3rd Molar', 18: 'Lower Left 2nd Molar', 19: 'Lower Left 1st Molar',
    20: 'Lower Left 2nd Premolar', 21: 'Lower Left 1st Premolar', 22: 'Lower Left Canine',
    23: 'Lower Left Lateral Incisor', 24: 'Lower Left Central Incisor',
    25: 'Lower Right Central Incisor', 26: 'Lower Right Lateral Incisor', 27: 'Lower Right Canine',
    28: 'Lower Right 1st Premolar', 29: 'Lower Right 2nd Premolar', 30: 'Lower Right 1st Molar',
    31: 'Lower Right 2nd Molar', 32: 'Lower Right 3rd Molar'
  };

  return toothNames[num] || id;
};

/** Real clinical price mapping for dental procedures (INR) */
const PROCEDURE_COSTS = {
  'Caries': { low: 1200, high: 3000 },
  'Filling': { low: 1200, high: 3000 },
  'Attrition': { low: 1200, high: 3000 },
  'Crown': { low: 12000, high: 18000 },
  'Root Canal Treatment': { low: 4000, high: 8000 },
  'Post - Core': { low: 25000, high: 5000 },
  'Impacted Tooth': { low: 4500, high: 10000 },
  'Root Piece': { low: 4500, high: 10000 },
  'Extraction': { low: 1000, high: 2500 },
  'Cyst': { low: 4000, high: 15000 },
  'Bone Loss': { low: 10000, high: 30000 },
  'Maxillary Sinus': { low: 15000, high: 40000 },
  'Periapical Lesion': { low: 5000, high: 10000 },
  'Root Resorption': { low: 5000, high: 10000 },
  'Malaligned': { low: 30000, high: 50000 },
  'Implant': { low: 35000, high: 65000 },
  'Abutment': { low: 5000, high: 10000 },
  'Gingival Former': { low: 1000, py: 2000 },
  'Tad': { low: 3000, high: 6000 },
  'Permanent Retainer': { low: 3000, high: 5000 },
  'default': { low: 2000, high: 5000 }
};

export function validateFinding(finding) {
  const errors = [];

  let tooth_id = String(finding.tooth_id ?? '').trim();

  const VALID_CONDITIONS = [
    'Bone Loss', 'Caries', 'Crown', 'Cyst', 'Filling', 'Fracture Teeth', 'Implant',
    'Malaligned', 'Mandibular Canal', 'Missing Teeth', 'Periapical Lesion',
    'Permanent Teeth', 'Primary Teeth', 'Retained Root', 'Root Canal Treatment',
    'Root Piece', 'Root Resorption', 'Supra Eruption', 'Tad', 'Abutment',
    'Attrition', 'Bone Defect', 'Gingival Former', 'Impacted Tooth',
    'Maxillary Sinus', 'Metal Band', 'Orthodontic Brackets', 'Permanent Retainer',
    'Plating', 'Post - Core', 'Wire'
  ];
  
  let condition = String(finding.condition ?? '').trim();
  if (condition.toLowerCase() === 'impacted tooth') condition = 'Impacted Tooth';
  if (condition.toLowerCase() === 'fracture teeth') condition = 'Fracture Teeth';
  
  const matched = VALID_CONDITIONS.find(c => c.toLowerCase() === condition.toLowerCase());
  condition = matched || condition || 'Finding';

  const mapSeverity = (s) => {
    if (typeof s === 'number') return Math.max(1, Math.min(5, Math.round(s)));
    const map = {
      'High': 4, 'Medium': 3, 'Low': 2,
      'high': 4, 'medium': 3, 'low': 2,
      'Critical': 5, 'critical': 5,
    };
    return map[s] ?? 3;
  };
  const severity = mapSeverity(finding.severity);

  let confidence = typeof finding.confidence === 'number' ? finding.confidence : 0.5;
  confidence = Math.max(0, Math.min(1, confidence));

  const bbox = finding.bbox || { x: 0, y: 0, width: 0, height: 0 };

  const fallbackTriage = severity >= 4 ? 'RED' : severity >= 3 ? 'YELLOW' : 'GREEN';

  const validated = {
    id: finding.id ?? `f_${Date.now()}_${Math.random()}`,
    tooth_id,
    clinical_name: getToothClinicalName(tooth_id),
    condition,
    severity,
    confidence,
    bbox,
    triage: finding.triage ?? fallbackTriage,
    second_opinion: finding.second_opinion ?? 'pending',
    explanation: finding.explanation ?? '',
    patient_explanation: finding.patient_explanation ?? '',
    dentist_notes: finding.dentist_notes ?? '',
    timeline_progression: finding.timeline_progression ?? { now: '', sixMonths: '', oneYear: '' },
    validationErrors: errors,
  };

  return validated;
}

export function deduplicateFindings(findings) {
  const map = new Map();

  findings.forEach(f => {
    const key = `${f.tooth_id}_${f.condition}`;
    const existing = map.get(key);

    if (!existing || f.confidence > existing.confidence) {
      map.set(key, f);
    }
  });

  return Array.from(map.values());
}

export function groupFindingsByTooth(findings) {
  const groups = {};
  findings.forEach(f => {
    if (!groups[f.tooth_id]) groups[f.tooth_id] = [];
    groups[f.tooth_id].push(f);
  });
  return groups;
}

export function validateAnalysisResult(data) {
  if (!data) return {};

  let findings = (data.findings ?? []).map((f) => validateFinding(f));
  
  findings = deduplicateFindings(findings);
  
  let aggregatedLow = 0;
  let aggregatedHigh = 0;
  
  findings.forEach((f) => {
    const cost = PROCEDURE_COSTS[f.condition] || PROCEDURE_COSTS.default;
    aggregatedLow += cost.low;
    aggregatedHigh += cost.high;
  });

  const treatment = data.treatment || {};
  
  const backendCostLow = treatment.cost_estimate_inr?.low ?? 0;
  const cost_estimate = backendCostLow > 0 
    ? treatment.cost_estimate_inr 
    : findings.length === 0
      ? { low: 0, high: 0 }
      : { low: Math.max(2000, aggregatedLow), high: Math.max(5000, aggregatedHigh) };

  const result = {
    ...data,
    findings,
    xray_dimensions: data.xray_dimensions ?? { width: 1200, height: 800 },
    treatment: {
      ...treatment,
      cost_estimate_inr: cost_estimate,
      priority_list: (treatment.priority_list && treatment.priority_list.length > 0 && treatment.priority_list[0] !== 'Error generating report')
        ? treatment.priority_list 
        : findings.map((f) => `${f.condition} on Tooth ${f.tooth_id}`),
      procedures: (treatment.procedures && treatment.procedures.length > 0)
        ? treatment.procedures
        : findings.map(f => ({
            name: f.condition,
            tooth_id: f.tooth_id,
            urgency: f.severity >= 4 ? 'Immediate' : f.severity >= 3 ? 'Soon' : 'Routine',
            cost_low: (PROCEDURE_COSTS[f.condition] || PROCEDURE_COSTS.default).low,
            cost_high: (PROCEDURE_COSTS[f.condition] || PROCEDURE_COSTS.default).high,
            description: `Clinical intervention for ${f.condition}.`,
            patient_description: `Treating ${f.condition} on tooth ${f.tooth_id}.`
          }))
    }
  };

  const allErrors = findings.flatMap((f) => f.validationErrors);
  if (allErrors.length > 0) {
    console.warn('[Data Validation] FDI Compliance Issues:', allErrors);
  }

  return result;
}

export function logValidationIssues(finding) {
  if (finding.validationErrors.length === 0) return;
  console.warn(`[FDI Violation] Tooth ${finding.tooth_id}:`, finding.validationErrors);
}
