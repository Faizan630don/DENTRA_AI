/**
 * Realistic demo scan result used for the "Try Live Demo" feature.
 * Mimics a genuine YOLO + LLM pipeline output so the full viewer &
 * dashboard are populated with meaningful data.
 */
export const DEMO_SCAN = {
  scan_id: 'demo-2024-xray-001',
  scan_date: new Date().toISOString(),
  patient_name: 'Demo Patient',
  biological_age: 34,
  dental_age: 38,

  overall_health: 54,
  risk_score: 'High',

  findings: [
    {
      // FDI #14 = upper right 1st premolar → IMAGE LEFT side (patient right), upper jaw
      // Visible as a distinct premolar ~35% from the left edge of the image
      id: 'det_0_0',
      tooth_id: '14',
      condition: 'Caries',
      severity: 4,
      confidence: 0.91,
      triage: 'RED',
      bbox: { x: 0.335, y: 0.385, width: 0.055, height: 0.095 },
      explanation: 'Active dental caries detected on the occlusal surface of tooth #14. High confidence detection indicating significant enamel and possible dentin involvement.',
      patient_explanation: 'A cavity was found on your upper right first premolar (#14). This needs prompt treatment to prevent it from reaching the nerve.',
      dentist_notes: 'Deep occlusal caries approaching pulp. Consider indirect pulp cap vs. RCT depending on vitality test. ICD-10: K02.51.',
      timeline_progression: {
        now: 'Active caries — enamel/dentin involved.',
        sixMonths: 'Likely pulpal involvement if untreated.',
        oneYear: 'Probable abscess formation, extraction risk.',
      },
      clinical_name: 'Occlusal Caries',
      icdas_code: 'ICDAS 4',
    },
    {
      // FDI #36 = lower left 1st molar → IMAGE RIGHT side (patient left), lower jaw
      // Visible as a large molar ~65-72% from left in the lower arch
      id: 'det_1_1',
      tooth_id: '36',
      condition: 'Periapical Lesion',
      severity: 5,
      confidence: 0.87,
      triage: 'RED',
      bbox: { x: 0.622, y: 0.575, width: 0.072, height: 0.105 },
      explanation: 'Periapical radiolucency observed at the apex of tooth #36, indicating chronic periapical periodontitis.',
      patient_explanation: 'There is an infection at the tip of the root of your lower left molar (#36). This can cause significant pain and needs urgent attention.',
      dentist_notes: 'Well-defined periapical lucency ~4mm diameter. Non-vital tooth likely. CBCT recommended. RCT or apicoectomy indicated.',
      timeline_progression: {
        now: 'Periapical lesion — chronic stage.',
        sixMonths: 'Potential acute exacerbation and swelling.',
        oneYear: 'Bone destruction and systemic infection risk.',
      },
      clinical_name: 'Chronic Periapical Periodontitis',
      icdas_code: 'N/A',
    },
    {
      // FDI #11 = upper right central incisor → slightly left of center in IMAGE (x ≈ 0.45-0.50)
      // Bone loss is visible as reduced bone height at the alveolar crest
      id: 'det_2_2',
      tooth_id: '11',
      condition: 'Bone Loss',
      severity: 4,
      confidence: 0.82,
      triage: 'RED',
      bbox: { x: 0.44, y: 0.37, width: 0.05, height: 0.10 },
      explanation: 'Horizontal alveolar bone loss detected at the anterior maxilla. Suggests moderate periodontal disease.',
      patient_explanation: 'The bone supporting your upper front teeth has receded. This is an early sign of gum disease.',
      dentist_notes: 'Approximately 30–40% horizontal bone loss. Stage II/Grade B periodontitis. SRP recommended, re-eval in 6w.',
      timeline_progression: {
        now: 'Moderate bone loss — active periodontitis.',
        sixMonths: 'Further bone resorption without SRP.',
        oneYear: 'Tooth mobility and potential tooth loss.',
      },
      clinical_name: 'Alveolar Bone Loss',
    },
    {
      // FDI #18 = upper right wisdom tooth → FAR IMAGE LEFT (patient right), angled/impacted
      // The generated image shows an angled tooth mass on the left side around x: 0.08-0.18
      id: 'det_3_3',
      tooth_id: '18',
      condition: 'Impacted Tooth',
      severity: 4,
      confidence: 0.95,
      triage: 'RED',
      bbox: { x: 0.075, y: 0.40, width: 0.095, height: 0.115 },
      explanation: 'Third molar (#18) is horizontally impacted, with the crown partially overlapping the distal root of #17.',
      patient_explanation: 'Your upper-right wisdom tooth is stuck horizontally inside the jaw and cannot erupt normally. Surgical removal is advised.',
      dentist_notes: 'Mesio-angular impaction Class IIA. Risk of pericoronitis and caries on distal #17. OMS referral recommended.',
      timeline_progression: {
        now: 'Horizontal impaction — asymptomatic.',
        sixMonths: 'Risk of pericoronitis flare-up.',
        oneYear: 'Caries on #17 distal surface likely.',
      },
      clinical_name: 'Horizontally Impacted Wisdom Tooth',
    },
    {
      // FDI #25 = upper left 2nd premolar → IMAGE RIGHT (patient left), upper jaw ~60-66%
      id: 'det_4_4',
      tooth_id: '25',
      condition: 'Root Canal Treatment',
      severity: 3,
      confidence: 0.89,
      triage: 'YELLOW',
      bbox: { x: 0.610, y: 0.385, width: 0.055, height: 0.115 },
      explanation: 'Radiopaque material consistent with root canal obturation visible in tooth #25. Appears adequately filled.',
      patient_explanation: 'Tooth #25 has had a root canal in the past. It looks acceptable but should be monitored.',
      dentist_notes: 'Acceptable RCT, no periapical pathology. Crown recommended to prevent fracture.',
      timeline_progression: {
        now: 'Existing RCT — stable.',
        sixMonths: 'Monitoring advised.',
        oneYear: 'Crown placement prevents fracture risk.',
      },
      clinical_name: 'Root Canal Obturation',
    },
    {
      // FDI #21 = upper left central incisor → just right of center in IMAGE (x ≈ 0.50-0.55)
      id: 'det_5_5',
      tooth_id: '21',
      condition: 'Filling',
      severity: 1,
      confidence: 0.97,
      triage: 'GREEN',
      bbox: { x: 0.498, y: 0.385, width: 0.048, height: 0.095 },
      explanation: 'Composite resin filling detected on tooth #21. Margins appear intact.',
      patient_explanation: 'Tooth #21 has an existing filling that looks fine.',
      dentist_notes: 'Composite restoration with intact margins. No replacement needed at this time.',
      timeline_progression: {
        now: 'Restoration intact.',
        sixMonths: 'Routine monitoring.',
        oneYear: 'Re-evaluate restoration margins.',
      },
      clinical_name: 'Composite Restoration',
    },
    {
      // FDI #46 = lower right 1st molar → IMAGE LEFT (patient right), lower jaw ~28-36%
      id: 'det_6_6',
      tooth_id: '46',
      condition: 'Crown',
      severity: 1,
      confidence: 0.93,
      triage: 'GREEN',
      bbox: { x: 0.282, y: 0.575, width: 0.068, height: 0.10 },
      explanation: 'Existing full crown on tooth #46. No marginal gaps or periapical pathology noted.',
      patient_explanation: 'Tooth #46 has a dental crown that appears to be in good condition.',
      dentist_notes: 'Well-adapted crown. No recurrent decay or marginal discrepancy detected.',
      timeline_progression: {
        now: 'Crown intact — no issues.',
        sixMonths: 'Routine review.',
        oneYear: 'Annual radiographic check.',
      },
      clinical_name: 'Full-Coverage Crown',
    },
  ],

  treatment: {
    priority_list: [
      'Urgent: Treat periapical lesion on #36 (endodontic therapy or extraction)',
      'Urgent: Restore caries on #14 (composite or crown)',
      'Urgent: Surgical removal of impacted #18',
      'Soon: Scaling & Root Planing for bone loss around #11',
      'Routine: Crown placement on existing RCT (#25)',
    ],
    procedures: [
      {
        name: 'Root Canal Therapy — #36',
        tooth_id: 'Tooth #36',
        urgency: 'Immediate',
        cost_low: 4500,
        cost_high: 8000,
        description: 'Endodontic therapy to eliminate periapical infection and preserve the tooth. Followed by post-core and crown.',
        patient_description: 'A root canal procedure to clear the infection at the root tip of your molar and save the tooth.',
      },
      {
        name: 'Caries Restoration — #14',
        tooth_id: 'Tooth #14',
        urgency: 'Immediate',
        cost_low: 1500,
        cost_high: 3500,
        description: 'Excavation of carious lesion with composite resin or ceramic inlay restoration.',
        patient_description: 'Removing the cavity and filling the tooth to stop it from getting worse.',
      },
      {
        name: 'Surgical Extraction — #18',
        tooth_id: 'Tooth #18',
        urgency: 'Soon',
        cost_low: 3000,
        cost_high: 7000,
        description: 'Surgical removal of horizontally impacted third molar under local anesthesia by OMS.',
        patient_description: 'Removing the wisdom tooth that\'s stuck in your jaw to prevent future pain and damage.',
      },
      {
        name: 'Full-Mouth Scaling & Root Planing',
        tooth_id: 'All quadrants',
        urgency: 'Soon',
        cost_low: 2000,
        cost_high: 5000,
        description: 'Deep cleaning to remove calculus and biofilm sub-gingivally, halting bone loss progression.',
        patient_description: 'A deep clean of your gums and tooth roots to stop the gum disease from getting worse.',
      },
      {
        name: 'Porcelain Crown — #25',
        tooth_id: 'Tooth #25',
        urgency: 'Routine',
        cost_low: 5000,
        cost_high: 12000,
        description: 'Full-coverage porcelain crown to protect the existing root-canal treated tooth from fracture.',
        patient_description: 'Placing a cap over your root-canal treated tooth to protect and strengthen it.',
      },
    ],
    cost_estimate_inr: { low: 16000, high: 35500 },
    patient_summary:
      'Your X-ray shows 4 conditions that need attention, including an infection at the root of a molar and a deep cavity. Early treatment will prevent pain, tooth loss, and higher costs down the line. Book with a dentist within the next 2 weeks.',
    dentist_summary:
      'Panoramic radiograph reveals: periapical lucency at #36 (chronic periodontitis), deep occlusal caries at #14 with pulpal proximity risk, horizontal impaction of #18 (mesio-angular), and Stage II/Grade B periodontitis with ~35% horizontal bone loss. Two existing restorations (#21, #46) are stable. Immediate referrals recommended for endodontic and surgical management.',
  },

  xray_image_url: '/demo-xray.jpg',
  xray_dimensions: { width: 1200, height: 600 },
};
