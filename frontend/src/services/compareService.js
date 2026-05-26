/**
 * Compare two full scan results finding-by-finding
 */
export function compareScans(scanA, scanB) {
  const changes = [];

  // Build lookup maps
  const aMap = new Map();
  const bMap = new Map();

  // Key = "tooth_id::condition" for matching
  const makeKey = (f) => `${f.tooth_id}::${f.condition}`;

  scanA.findings.forEach(f => aMap.set(makeKey(f), f));
  scanB.findings.forEach(f => bMap.set(makeKey(f), f));

  // Findings in B (check against A)
  bMap.forEach((bFinding, key) => {
    const aFinding = aMap.get(key);
    const bSev = bFinding.severity;
    
    if (!aFinding) {
      // NEW finding — appeared in B
      changes.push({
        tooth_id: bFinding.tooth_id,
        condition: bFinding.condition,
        changeType: 'new',
        scanB_severity: bFinding.severity,
        scanB_confidence: bFinding.confidence,
        severityDelta: bSev,
        changeLabel: `New: ${bFinding.condition} detected on tooth ${bFinding.tooth_id} (severity ${bFinding.severity})`,
      });
    } else {
      // Existing finding — check if worsened/improved/stable
      const aSev = aFinding.severity;
      const delta = bSev - aSev;
      let changeType;
      let changeLabel;
      
      if (delta > 0) {
        changeType = 'worsened';
        changeLabel = `Worsened: ${bFinding.condition} on tooth ${bFinding.tooth_id} went from level ${aFinding.severity} to ${bFinding.severity}`;
      } else if (delta < 0) {
        changeType = 'improved';
        changeLabel = `Improved: ${bFinding.condition} on tooth ${bFinding.tooth_id} went from level ${aFinding.severity} to ${bFinding.severity}`;
      } else {
        changeType = 'stable';
        changeLabel = `Stable: ${bFinding.condition} on tooth ${bFinding.tooth_id} unchanged at level ${bFinding.severity}`;
      }
      
      changes.push({
        tooth_id: bFinding.tooth_id,
        condition: bFinding.condition,
        changeType,
        scanA_severity: aFinding.severity,
        scanB_severity: bFinding.severity,
        scanA_confidence: aFinding.confidence,
        scanB_confidence: bFinding.confidence,
        severityDelta: delta,
        changeLabel,
      });
    }
  });

  // Findings in A but NOT in B = resolved
  aMap.forEach((aFinding, key) => {
    if (!bMap.has(key)) {
      const aSev = aFinding.severity;
      changes.push({
        tooth_id: aFinding.tooth_id,
        condition: aFinding.condition,
        changeType: 'resolved',
        scanA_severity: aFinding.severity,
        scanA_confidence: aFinding.confidence,
        severityDelta: -aSev,
        changeLabel: `Resolved: ${aFinding.condition} on tooth ${aFinding.tooth_id} no longer detected`,
      });
    }
  });

  // Progression score: -100 (much worse) to +100 (much better)
  let score = 0;
  changes.forEach(c => {
    const bSevVal = c.scanB_severity ?? 0;
    const aSevVal = c.scanA_severity ?? 0;

    if (c.changeType === 'new') score -= bSevVal * 15;
    if (c.changeType === 'worsened') score -= Math.abs(c.severityDelta) * 12;
    if (c.changeType === 'resolved') score += aSevVal * 15;
    if (c.changeType === 'improved') score += Math.abs(c.severityDelta) * 12;
  });
  score = Math.max(-100, Math.min(100, score));

  const health_trend = score > 10 ? 'improving' : score < -10 ? 'worsening' : 'stable';

  return {
    scanA_date: scanA.scan_date,
    scanB_date: scanB.scan_date,
    scanA_triage: scanA.risk_score === 'High' ? 'RED' : scanA.risk_score === 'Medium' ? 'YELLOW' : 'GREEN',
    scanB_triage: scanB.risk_score === 'High' ? 'RED' : scanB.risk_score === 'Medium' ? 'YELLOW' : 'GREEN',
    changes,
    new_findings: changes.filter(c => c.changeType === 'new'),
    resolved_findings: changes.filter(c => c.changeType === 'resolved'),
    worsened_findings: changes.filter(c => c.changeType === 'worsened'),
    improved_findings: changes.filter(c => c.changeType === 'improved'),
    stable_findings: changes.filter(c => c.changeType === 'stable'),
    progression_score: score,
    health_trend,
  };
}

/**
 * Call Gemini/Claude with comparison data for narrative generation
 */
export async function generateComparisonNarrative(comparison, patientName) {
  try {
    throw new Error("LLM API not configured for comparison yet");
  } catch (err) {
    console.warn('LLM comparison failed, using clinical fallback:', err);
    return {
      ai_narrative: buildFallbackNarrative(comparison, patientName),
      ai_recommendations: buildFallbackRecommendations(comparison),
      urgency_change: comparison.health_trend === 'worsening'
        ? 'Treatment urgency has increased since the last scan.'
        : comparison.health_trend === 'improving'
        ? 'Treatment urgency has decreased — your dental health is improving.'
        : 'Treatment urgency remains similar to the previous scan.',
    };
  }
}

function buildFallbackNarrative(c, name) {
  if (c.health_trend === 'improving') {
    return `${name}'s dental health has shown improvement since the last scan. ${c.resolved_findings.length} issue(s) have resolved and ${c.improved_findings.length} have improved in severity. This is a positive trend. Continue with scheduled treatment and maintain good oral hygiene. The progression score of ${c.progression_score}/100 indicates the treatment plan is working effectively.`;
  }
  if (c.health_trend === 'worsening') {
    return `${name}'s dental health has declined since the last scan. ${c.new_findings.length} new issue(s) have appeared and ${c.worsened_findings.length} existing issue(s) have worsened. Prompt attention is recommended. The progression score of ${c.progression_score}/100 suggests that treatment should be prioritised without further delay to prevent additional deterioration.`;
  }
  return `${name}'s dental health has remained largely stable since the last scan. While ${c.new_findings.length} new finding(s) were detected, ${c.resolved_findings.length} previous issue(s) have resolved. Continue with the current treatment plan and attend the next scheduled check-up.`;
}

function buildFallbackRecommendations(c) {
  const recs = [];
  if (c.worsened_findings.length > 0)
    recs.push(`Prioritise treatment for ${c.worsened_findings[0].condition} on tooth ${c.worsened_findings[0].tooth_id} — severity has increased`);
  if (c.new_findings.length > 0)
    recs.push(`Schedule evaluation for ${c.new_findings.length} newly detected finding(s)`);
  if (c.resolved_findings.length > 0)
    recs.push(`${c.resolved_findings.length} finding(s) have resolved — confirm with in-person examination`);
  recs.push('Maintain twice-daily brushing and flossing routine');
  recs.push('Return for follow-up X-ray in 6 months to track progression');
  return recs.slice(0, 5);
}
