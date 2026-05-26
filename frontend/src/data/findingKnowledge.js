/**
 * findingKnowledge.js — DentalVision AI Knowledge Base
 * 
 * Single source of truth for clinical explanations, severity levels,
 * and treatment recommendations for detected dental conditions.
 */

export const FINDING_KNOWLEDGE = {

  // ── CAVITY / CARIES ────────────────────────────────────────────────────────
  'Cavity': {
    conditionName: 'Dental Cavity (Caries)',
    category: 'cavity',
    icon: '🕳️',
    whatItIs: 'A cavity is a permanently damaged area in the hard surface of your tooth that has developed into a tiny hole. It\'s caused by bacteria producing acid that slowly eats through the tooth enamel.',
    whatAISaw: 'The AI detected a radiolucent (darker) region within the tooth structure, indicating enamel or dentin breakdown inconsistent with healthy tooth density.',
    severityDescriptions: {
      1: { label: 'Enamel Only', clinical: 'Decay confined to outer enamel layer. No pain yet. Highly treatable.', color: 'green' },
      2: { label: 'Approaching Dentin', clinical: 'Decay has breached enamel and approaching the dentin layer. May cause sensitivity to cold.', color: 'green' },
      3: { label: 'Dentin Involved', clinical: 'Decay in dentin. Sensitivity to sweet and cold. Filling needed urgently.', color: 'amber' },
      4: { label: 'Near Pulp', clinical: 'Decay approaching the pulp chamber. Significant pain risk. Root canal may be needed.', color: 'red' },
      5: { label: 'Pulp Involved', clinical: 'Decay has reached or entered the pulp. Root canal treatment is necessary.', color: 'red' },
    },
    treatments: {
      primary: 'Composite Resin Filling',
      alternative: 'Amalgam Filling (silver)',
      urgency: 'within-week',
      costRange: { min: 1000, max: 2500 },
    },
    ifUntreated: 'Decay will reach the pulp within weeks to months, causing severe pain and requiring a root canal (5-8× more expensive). In advanced cases, the tooth may need extraction.',
    dentistNote: 'ICDAS scoring recommended. Monitor adjacent teeth for proximal caries spread.',
    icdas: 'ICDAS 2-4',
  },

  // ── IMPACTED TOOTH ─────────────────────────────────────────────────────────
  'Impacted Tooth': {
    conditionName: 'Impacted Tooth',
    category: 'alignment',
    icon: '😬',
    whatItIs: 'An impacted tooth is one that cannot fully erupt into the mouth because it is blocked by other teeth, bone, or soft tissue. Wisdom teeth (third molars) are most commonly affected.',
    whatAISaw: 'The AI detected a tooth crown positioned at an abnormal angle within the jawbone, surrounded by bone tissue, indicating failure to fully erupt. The tooth axis is non-vertical relative to the occlusal plane.',
    severityDescriptions: {
      1: { label: 'Partial Eruption', clinical: 'Tooth partially visible, minimal impaction. Low immediate risk but monitor for infection.', color: 'green' },
      2: { label: 'Soft Tissue Impaction', clinical: 'Crown covered by gum tissue only. Pericoronitis risk. Cleaning difficult.', color: 'green' },
      3: { label: 'Partial Bony Impaction', clinical: 'Tooth partially embedded in bone. Moderate surgical complexity for removal.', color: 'amber' },
      4: { label: 'Full Bony Impaction', clinical: 'Tooth completely enclosed in bone. High surgical complexity. Adjacent tooth root resorption risk.', color: 'red' },
      5: { label: 'Complex Impaction', clinical: 'Deep impaction near nerve canal (IAN) or sinus floor. Specialist referral recommended.', color: 'red' },
    },
    treatments: {
      primary: 'Surgical Extraction',
      alternative: 'Orthodontic Exposure (if strategically important tooth)',
      urgency: 'within-month',
      costRange: { min: 5000, max: 12000 },
    },
    ifUntreated: 'Impacted teeth can cause cyst formation, infection (pericoronitis), crowding of adjacent teeth, and root resorption of neighbouring teeth. Pain episodes will increase in frequency.',
    dentistNote: 'Assess proximity to inferior alveolar nerve before surgical planning. Consider CBCT for complex cases. Check for follicular cyst formation.',
  },

  // ── ROOT CANAL TREATMENT (model flags this as needed) ─────────────────────
  'Root Canal Treatment': {
    conditionName: 'Root Canal Required',
    category: 'infection',
    icon: '🦠',
    whatItIs: 'The AI has identified signs suggesting the pulp (nerve and blood supply) inside your tooth is infected or severely compromised. A root canal removes this infected tissue to save the tooth.',
    whatAISaw: 'The AI detected periapical radiolucency (dark area at root tip) and/or significant coronal destruction suggesting pulp involvement. Widened periodontal ligament space may also be present.',
    severityDescriptions: {
      1: { label: 'Pulp Irritation', clinical: 'Reversible pulpitis — pulp may recover with indirect pulp cap.', color: 'green' },
      2: { label: 'Irreversible Pulpitis', clinical: 'Pulp permanently damaged. Root canal is the only option to save the tooth.', color: 'amber' },
      3: { label: 'Pulp Necrosis', clinical: 'Pulp tissue is dead. Infection risk is high. Root canal required urgently.', color: 'amber' },
      4: { label: 'Periapical Abscess', clinical: 'Infection has spread to surrounding bone. Swelling and severe pain likely. Immediate treatment required.', color: 'red' },
      5: { label: 'Spreading Infection', clinical: 'Infection spreading beyond tooth apex. Risk to adjacent structures. Urgent intervention needed.', color: 'red' },
    },
    treatments: {
      primary: 'Root Canal Treatment (RCT) + Crown',
      alternative: 'Extraction + Implant or Bridge',
      urgency: 'within-week',
      costRange: { min: 4000, max: 8000 },
    },
    ifUntreated: 'The infection will spread to the jawbone, potentially causing a dental abscess. In severe cases, infection can spread to the jaw, neck, or even become life-threatening (Ludwig\'s angina). The tooth will eventually be lost.',
    dentistNote: 'Verify pulp vitality with cold/EPT tests. CBCT recommended for curved canals. Check for internal/external resorption. Post-RCT crown strongly advised for posterior teeth.',
    icdas: 'PAI 3-5',
  },

  // ── BONE LOSS ──────────────────────────────────────────────────────────────
  'Bone Loss': {
    conditionName: 'Alveolar Bone Loss',
    category: 'bone',
    icon: '📉',
    whatItIs: 'Bone loss around the roots of your teeth is a sign of periodontal (gum) disease. The supporting bone that holds your teeth in place is being destroyed by bacterial infection in the gum tissue.',
    whatAISaw: 'The AI detected reduction in crestal bone height relative to the cemento-enamel junction (CEJ). The bone level appears lower than the normal 1-2mm below CEJ, indicating active or chronic periodontitis.',
    severityDescriptions: {
      1: { label: 'Early (< 15%)', clinical: 'Minimal bone loss. Gingivitis stage. Reversible with professional cleaning and improved hygiene.', color: 'green' },
      2: { label: 'Mild (15-33%)', clinical: 'Early periodontitis. Scaling and root planing required. Good prognosis with treatment.', color: 'green' },
      3: { label: 'Moderate (33-50%)', clinical: 'Moderate periodontitis. Multiple visits of deep cleaning needed. Guarded prognosis.', color: 'amber' },
      4: { label: 'Severe (50-66%)', clinical: 'Severe periodontitis. Surgical intervention may be required. Questionable prognosis.', color: 'red' },
      5: { label: 'Advanced (> 66%)', clinical: 'Advanced bone loss. Tooth mobility likely. Extraction may be inevitable.', color: 'red' },
    },
    treatments: {
      primary: 'Scaling & Root Planing (SRP)',
      alternative: 'Periodontal Flap Surgery (advanced cases)',
      urgency: 'within-month',
      costRange: { min: 10000, max: 30000 },
    },
    ifUntreated: 'Bone loss is irreversible once it occurs. Without treatment, it progresses silently — teeth become loose, shift position, and are eventually lost. Bone loss is also linked to cardiovascular disease and diabetes complications.',
    dentistNote: 'Measure pocket depths clinically. Assess furcation involvement for multi-rooted teeth. Consider full-mouth periapical series. Refer to periodontist for stage III-IV disease.',
  },

  // ── CROWN ──────────────────────────────────────────────────────────────────
  'Crown': {
    conditionName: 'Dental Crown Detected',
    category: 'restoration',
    icon: '👑',
    whatItIs: 'The AI has identified an existing dental crown (cap) on this tooth. A crown is a tooth-shaped covering placed over a damaged tooth to restore its shape, size, and function.',
    whatAISaw: 'The AI detected a radiopaque (bright white) restoration covering the entire clinical crown of the tooth, with density and margins consistent with a metal, PFM, or ceramic crown restoration.',
    severityDescriptions: {
      1: { label: 'Crown Intact', clinical: 'Crown appears well-fitting with no visible defects. Routine monitoring.', color: 'green' },
      2: { label: 'Minor Marginal Gap', clinical: 'Small gap at crown margin detected. Secondary decay risk. Monitor closely.', color: 'green' },
      3: { label: 'Marginal Leakage', clinical: 'Gap at margin allowing bacterial infiltration. Secondary caries likely developing.', color: 'amber' },
      4: { label: 'Crown Fracture', clinical: 'Crown shows signs of cracking or fracture. Replacement indicated.', color: 'red' },
      5: { label: 'Crown Failure', clinical: 'Crown has failed — significant leakage, fracture, or loss of retention. Immediate replacement needed.', color: 'red' },
    },
    treatments: {
      primary: 'Crown Evaluation — Replace if marginal leakage detected',
      alternative: 'Repair if fracture is minor',
      urgency: 'routine',
      costRange: { min: 5000, max: 20000 },
    },
    ifUntreated: 'A failing crown allows bacteria to enter, causing secondary caries under the crown which may not be visible until it reaches the pulp. This can destroy the underlying tooth structure entirely.',
    dentistNote: 'Check crown margins with probe. Transilluminate for fractures. Periapical radiograph to check root and bone status. Check occlusion for premature contacts.',
  },

  // ── FILLING ────────────────────────────────────────────────────────────────
  'Filling': {
    conditionName: 'Existing Dental Filling',
    category: 'restoration',
    icon: '🔧',
    whatItIs: 'The AI detected an existing filling in this tooth — a restorative material placed to repair a cavity or damage. Fillings need to be monitored for wear, fracture, and marginal leakage over time.',
    whatAISaw: 'The AI detected a radiopaque (bright) or radiolucent (dark depending on material) restoration within the tooth crown, distinct from natural tooth structure, consistent with amalgam, composite, or GIC filling material.',
    severityDescriptions: {
      1: { label: 'Filling Intact', clinical: 'Filling appears well-adapted with good margins. No secondary caries visible.', color: 'green' },
      2: { label: 'Minor Wear', clinical: 'Filling showing surface wear but margins still sealed.', color: 'green' },
      3: { label: 'Marginal Breakdown', clinical: 'Filling margin breakdown. Secondary caries risk. Monitor or replace.', color: 'amber' },
      4: { label: 'Secondary Caries', clinical: 'New decay forming around or under the filling. Replacement required.', color: 'red' },
      5: { label: 'Filling Failure', clinical: 'Filling fractured or lost significant bulk. Immediate replacement needed, possible crown.', color: 'red' },
    },
    treatments: {
      primary: 'Monitor (if intact) or Replace filling',
      alternative: 'Crown if insufficient tooth structure remains',
      urgency: 'routine',
      costRange: { min: 1500, max: 3000 },
    },
    ifUntreated: 'A failing filling allows bacteria to re-enter the tooth, causing secondary decay that progresses faster than primary caries due to lack of enamel barrier. Can lead to root canal need.',
    dentistNote: 'Probe margins for ditching. Check for voids on bitewing. Assess remaining tooth structure for crown candidacy if > 50% lost.',
  },

  // ── PERIAPICAL LESION ──────────────────────────────────────────────────────
  'Periapical Shadow': {
    conditionName: 'Periapical Lesion',
    category: 'infection',
    icon: '🔍',
    whatItIs: 'A periapical lesion is an area of infection or inflammation at the tip of a tooth root. It usually develops when bacteria from an infected or dead pulp spreads to the surrounding bone.',
    whatAISaw: 'The AI detected a radiolucent (dark) halo around the root apex, indicating bone destruction from a chronic or acute inflammatory process. The lesion boundary may be well-defined (cyst) or diffuse (abscess).',
    severityDescriptions: {
      1: { label: 'Widened PDL Space', clinical: 'Subtle widening of periodontal ligament at apex. Early sign — watch closely.', color: 'green' },
      2: { label: 'Small Lesion (< 5mm)', clinical: 'Small periapical radiolucency. Root canal treatment has good success rate.', color: 'green' },
      3: { label: 'Moderate Lesion (5-10mm)', clinical: 'Established periapical pathology. Root canal treatment required. Healing takes 6-12 months.', color: 'amber' },
      4: { label: 'Large Lesion (> 10mm)', clinical: 'Large lesion — possible cyst formation. Root canal + surgical apicoectomy may be needed.', color: 'red' },
      5: { label: 'Spreading Infection', clinical: 'Lesion affecting adjacent teeth or cortical plate perforation. Urgent surgical intervention.', color: 'red' },
    },
    treatments: {
      primary: 'Root Canal Treatment',
      alternative: 'Apicoectomy (surgical) if RCT fails',
      urgency: 'within-week',
      costRange: { min: 5000, max: 10000 },
    },
    ifUntreated: 'Periapical lesions grow slowly but persistently. A cyst can expand silently for years, destroying jawbone. If it becomes an abscess, the infection can spread rapidly and become life-threatening.',
    dentistNote: 'PAI scoring: 1-5. Differentiate granuloma vs cyst vs abscess. CBCT for accurate 3D lesion assessment. Post-treatment review at 6 months with radiograph.',
    icdas: 'PAI 2-5',
  },

  // ── CALCULUS ───────────────────────────────────────────────────────────────
  'Calculus': {
    conditionName: 'Dental Calculus (Tartar)',
    category: 'bone',
    icon: '🪨',
    whatItIs: 'Calculus (tartar) is hardened dental plaque that has mineralised on the tooth surface, especially below the gum line. It cannot be removed by brushing — only a dentist can remove it with professional tools.',
    whatAISaw: 'The AI detected irregular radiopaque deposits along the root surfaces, consistent with subgingival calculus — particularly at interproximal areas and below the gum line.',
    severityDescriptions: {
      1: { label: 'Supragingival Only', clinical: 'Calculus above gum line. Easily removed with routine scaling.', color: 'green' },
      2: { label: 'Early Subgingival', clinical: 'Calculus beginning below gum line. SRP required.', color: 'green' },
      3: { label: 'Moderate Subgingival', clinical: 'Significant subgingival deposits. Multiple SRP sessions needed.', color: 'amber' },
      4: { label: 'Heavy Deposits', clinical: 'Heavy calculus causing significant bone loss. Periodontal surgery may be indicated.', color: 'red' },
      5: { label: 'Bridging Calculus', clinical: 'Calculus bridging between teeth. Severe periodontitis. Specialist referral needed.', color: 'red' },
    },
    treatments: {
      primary: 'Scaling & Root Planing',
      alternative: 'Periodontal Surgery (severe cases)',
      urgency: 'within-month',
      costRange: { min: 1500, max: 3000 },
    },
    ifUntreated: 'Calculus provides a rough surface for more bacteria to attach, accelerating gum disease and bone loss. Left untreated, it leads to periodontitis, tooth mobility, and eventual tooth loss.',
    dentistNote: 'Full-mouth debridement first visit. Reassess pockets at 6-8 weeks post SRP. Patient education on interdental cleaning essential.',
  },

  // ── MISSING TOOTH ──────────────────────────────────────────────────────────
  'Missing Tooth': {
    conditionName: 'Missing Tooth (Edentulous Space)',
    category: 'structural',
    icon: '🫥',
    whatItIs: 'A missing tooth leaves a gap in your dental arch. Beyond aesthetics, this gap causes neighbouring teeth to drift, opposing teeth to over-erupt, and bone to resorb in the area — creating a cascade of problems.',
    whatAISaw: 'The AI detected an edentulous (toothless) region in the dental arch with no tooth crown visible. The alveolar bone in the area may show signs of resorption consistent with a long-standing extraction site.',
    severityDescriptions: {
      1: { label: 'Recent Extraction', clinical: 'Fresh extraction site. Bone still present. Ideal time for implant planning.', color: 'green' },
      2: { label: 'Early Resorption', clinical: 'Some bone loss in extraction site. Implant still straightforward.', color: 'green' },
      3: { label: 'Moderate Resorption', clinical: 'Significant bone loss. May need bone graft before implant.', color: 'amber' },
      4: { label: 'Adjacent Tooth Drift', clinical: 'Neighbouring teeth have drifted into space. Orthodontic correction may be needed.', color: 'red' },
      5: { label: 'Severe Resorption', clinical: 'Severe bone loss with adjacent drifting. Complex case. Specialist required.', color: 'red' },
    },
    treatments: {
      primary: 'Dental Implant',
      alternative: 'Dental Bridge or Removable Partial Denture',
      urgency: 'within-month',
      costRange: { min: 25000, max: 60000 },
    },
    ifUntreated: 'Untreated edentulous spaces cause: adjacent teeth drifting and tilting, opposing teeth over-erupting, bone loss accelerating, bite collapse, TMJ problems, and increasing difficulty of future replacement as more bone is lost.',
    dentistNote: 'Measure ridge width and height. CBCT for implant planning. Check adjacent tooth vitality. Assess opposing tooth for over-eruption. Consider timing relative to bone graft if needed.',
  },

  // ── FRACTURE ───────────────────────────────────────────────────────────────
  'Fractured Crown': {
    conditionName: 'Tooth Fracture',
    category: 'structural',
    icon: '💥',
    whatItIs: 'A fracture in your tooth — ranging from a surface crack (craze line) to a deep split reaching the root. Fractures can be invisible to the naked eye but visible in X-rays or causing symptoms.',
    whatAISaw: 'The AI detected a discontinuity in the normal radiodensity pattern of the tooth crown or root, suggesting a fracture line. The pattern and location determine fracture type and prognosis.',
    severityDescriptions: {
      1: { label: 'Craze Line', clinical: 'Superficial crack in enamel only. No treatment needed. Cosmetic concern only.', color: 'green' },
      2: { label: 'Fractured Cusp', clinical: 'Piece of cusp broken off. Filling or onlay to restore function.', color: 'green' },
      3: { label: 'Cracked Tooth', clinical: 'Crack extending toward root. Crown needed urgently before crack deepens.', color: 'amber' },
      4: { label: 'Split Tooth', clinical: 'Tooth split into two segments. Prognosis poor. Extraction likely needed.', color: 'red' },
      5: { label: 'Vertical Root Fracture', clinical: 'Fracture in root — worst prognosis. Extraction is usually the only option.', color: 'red' },
    },
    treatments: {
      primary: 'Crown (if crack is above gum line)',
      alternative: 'Extraction + Implant (if fracture is below gum line)',
      urgency: 'within-week',
      costRange: { min: 5000, max: 8000 },
    },
    ifUntreated: 'Cracks propagate under chewing forces. A manageable crack today becomes a split tooth requiring extraction tomorrow. Bacteria enter cracks causing pulp infection and abscess.',
    dentistNote: 'Transilluminate to map fracture extent. Bite stick test for pain localization. Check if fracture line extends below CEJ — determines restorability vs extraction.',
  },
};

// ── Helper: get knowledge for any condition key ─────────────────────────────
export function getKnowledge(condition) {
  // Direct match
  if (FINDING_KNOWLEDGE[condition]) return FINDING_KNOWLEDGE[condition];
  
  // Fuzzy match (case-insensitive, partial)
  const lower = condition.toLowerCase();
  const match = Object.entries(FINDING_KNOWLEDGE).find(([key]) =>
    key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())
  );
  return match?.[1] ?? null;
}

// ── Urgency display config ──────────────────────────────────────────────────
export const URGENCY_CONFIG = {
  'immediate':     { label: 'Immediate — Today',     color: 'text-red-400',    bg: 'bg-red-950/40 border-red-800/40' },
  'within-week':   { label: 'Urgent — Within 1 Week', color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/40' },
  'within-month':  { label: 'Soon — Within 1 Month',  color: 'text-amber-400',  bg: 'bg-amber-950/40 border-amber-800/40' },
  'routine':       { label: 'Routine — Next Visit',   color: 'text-sky-400',    bg: 'bg-sky-950/40 border-sky-800/40' },
  'monitor':       { label: 'Monitor — Watch & Wait', color: 'text-green-400',  bg: 'bg-green-950/40 border-green-800/40' },
};
