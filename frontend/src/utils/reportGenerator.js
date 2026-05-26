/**
 * Generates a professional PDF report for a single scan.
 */
export async function generateScanReport(result, patientMode = false) {
  const element = document.createElement('div');
  element.style.padding = '40px';
  element.style.fontFamily = 'sans-serif';
  element.style.color = '#1a1b1e';
  element.style.backgroundColor = '#fff';
  element.style.width = '800px';

  const dateStr = new Date(result.scan_date).toLocaleDateString('en-IN', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });

  const triageColor = result.risk_score === 'High' ? '#ef4444' : result.risk_score === 'Medium' ? '#f59e0b' : '#10b981';

  element.innerHTML = `
    <div style="border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="margin: 0; color: #0ea5e9; font-size: 24px;">DentalVision AI</h1>
        <p style="margin: 5px 0 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Smart Diagnostic Report</p>
      </div>
      <div style="text-align: right;">
        <div style="display: inline-block; padding: 6px 12px; border-radius: 20px; background: ${triageColor}20; color: ${triageColor}; font-weight: bold; font-size: 10px; border: 1px solid ${triageColor}40;">
          ${result.risk_score.toUpperCase()} RISK
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 12px;">
      <div>
        <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase;">Patient Name</p>
        <p style="margin: 4px 0 0; font-weight: bold; font-size: 16px;">${result.patient_name}</p>
      </div>
      <div>
        <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase;">Scan Date</p>
        <p style="margin: 4px 0 0; font-weight: bold; font-size: 16px;">${dateStr}</p>
      </div>
      <div>
        <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase;">Dental Age</p>
        <p style="margin: 4px 0 0; font-weight: bold; font-size: 16px;">${result.dental_age} years</p>
      </div>
      <div>
        <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase;">Scan ID</p>
        <p style="margin: 4px 0 0; font-weight: bold; font-size: 16px; font-family: monospace;">${result.scan_id.substring(0, 8).toUpperCase()}</p>
      </div>
    </div>

    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 16px; border-left: 4px solid #0ea5e9; padding-left: 12px; margin-bottom: 15px;">AI Clinical Summary</h2>
      <p style="color: #475569; line-height: 1.6; font-size: 14px;">
        ${patientMode ? result.treatment.patient_summary : result.treatment.dentist_summary}
      </p>
    </div>

    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 16px; border-left: 4px solid #0ea5e9; padding-left: 12px; margin-bottom: 15px;">Key Findings (${result.findings.length})</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left;">
            <th style="padding: 12px; border: 1px solid #e2e8f0;">Tooth</th>
            <th style="padding: 12px; border: 1px solid #e2e8f0;">Condition</th>
            <th style="padding: 12px; border: 1px solid #e2e8f0;">Severity</th>
            <th style="padding: 12px; border: 1px solid #e2e8f0;">Confidence</th>
          </tr>
        </thead>
        <tbody>
          ${result.findings.map(f => {
            const sevLevel = f.severity;
            const sevColor = sevLevel >= 4 ? '#ef4444' : sevLevel >= 3 ? '#f59e0b' : '#10b981';
            const sevLabel = sevLevel >= 4 ? 'High' : sevLevel >= 3 ? 'Medium' : 'Low';
            return `
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">T-${f.tooth_id}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${f.condition}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="color: ${sevColor}; font-weight: bold;">
                  Level ${sevLevel} (${sevLabel})
                </span>
              </td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #94a3b8;">${Math.round(f.confidence * 100)}%</td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
    </div>

    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 16px; border-left: 4px solid #0ea5e9; padding-left: 12px; margin-bottom: 15px;">Recommended Care Plan</h2>
      <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
        ${result.treatment.procedures.map(p => `
          <div style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: bold; font-size: 14px;">${p.name}</span>
              <span style="font-size: 11px; font-weight: bold; color: ${p.urgency === 'Immediate' ? '#ef4444' : '#64748b'};">${p.urgency.toUpperCase()}</span>
            </div>
            <p style="margin: 0; font-size: 12px; color: #64748b;">${p.description}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
      <p style="margin: 0; font-size: 10px; color: #94a3b8; max-width: 500px; margin: 0 auto; line-height: 1.5;">
        <strong>Disclaimer:</strong> This report is generated by DentalVision AI and is intended for informational purposes. 
        It does not replace a clinical examination by a licensed dentist. All findings should be clinically verified before treatment.
      </p>
      <p style="margin-top: 10px; font-size: 10px; color: #0ea5e9; font-weight: bold;">dentalvision-ai.com</p>
    </div>
  `;

  const options = {
    margin: 10,
    filename: `DentalReport_${result.patient_name.replace(/\s+/g, '_')}_${result.scan_id.substring(0, 6)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  return window.html2pdf().set(options).from(element).save();
}

/**
 * Generates a professional comparison report between two scans.
 */
export async function generateComparisonReport(comparison, patientName) {
  const element = document.createElement('div');
  element.style.padding = '40px';
  element.style.fontFamily = 'sans-serif';
  element.style.color = '#1a1b1e';
  element.style.backgroundColor = '#fff';
  element.style.width = '800px';

  const dateA = new Date(comparison.scanA_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const dateB = new Date(comparison.scanB_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const scoreColor = comparison.progression_score < 0 ? '#ef4444' : comparison.progression_score > 0 ? '#10b981' : '#f59e0b';

  element.innerHTML = `
    <div style="border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="margin: 0; color: #0ea5e9; font-size: 24px;">DentalVision AI</h1>
        <p style="margin: 5px 0 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Health Progression Analysis</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 12px;">
      <div>
        <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase;">Patient Name</p>
        <p style="margin: 4px 0 0; font-weight: bold; font-size: 16px;">${patientName}</p>
      </div>
      <div>
        <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase;">Comparison Period</p>
        <p style="margin: 4px 0 0; font-weight: bold; font-size: 16px;">${dateA} — ${dateB}</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
      <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
        <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase;">Progression Score</p>
        <p style="margin: 10px 0 0; font-size: 32px; font-weight: 900; color: ${scoreColor};">
          ${comparison.progression_score > 0 ? '+' : ''}${comparison.progression_score}
        </p>
        <p style="margin: 5px 0 0; font-size: 12px; color: #64748b;">on a scale of -100 to +100</p>
      </div>
      <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
        <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase;">Health Trend</p>
        <p style="margin: 10px 0 0; font-size: 24px; font-weight: bold; color: ${scoreColor}; text-transform: capitalize;">
          ${comparison.health_trend}
        </p>
        <p style="margin: 5px 0 0; font-size: 12px; color: #64748b;">
          ${comparison.scanA_triage} → ${comparison.scanB_triage}
        </p>
      </div>
    </div>

    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 16px; border-left: 4px solid #0ea5e9; padding-left: 12px; margin-bottom: 15px;">Evolution Analysis</h2>
      <p style="color: #475569; line-height: 1.6; font-size: 14px;">
        ${comparison.ai_narrative}
      </p>
    </div>

    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 16px; border-left: 4px solid #0ea5e9; padding-left: 12px; margin-bottom: 15px;">Changes Detected</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background: #f1f5f9; text-align: left;">
            <th style="padding: 12px; border: 1px solid #e2e8f0;">Tooth</th>
            <th style="padding: 12px; border: 1px solid #e2e8f0;">Condition</th>
            <th style="padding: 12px; border: 1px solid #e2e8f0;">Status</th>
            <th style="padding: 12px; border: 1px solid #e2e8f0;">Detail</th>
          </tr>
        </thead>
        <tbody>
          ${comparison.changes.map(c => `
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">T-${c.tooth_id}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${c.condition}</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">
                <span style="font-weight: bold; color: ${c.changeType === 'worsened' || c.changeType === 'new' ? '#ef4444' : c.changeType === 'stable' ? '#64748b' : '#10b981'};">
                  ${c.changeType.toUpperCase()}
                </span>
              </td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #64748b; font-size: 11px;">${c.changeLabel}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 16px; border-left: 4px solid #0ea5e9; padding-left: 12px; margin-bottom: 15px;">Recommendations</h2>
      <ul style="padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
        ${comparison.ai_recommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>
      <p style="margin-top: 15px; font-weight: bold; color: ${scoreColor}; font-size: 14px;">
        ${comparison.urgency_change}
      </p>
    </div>

    <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
      <p style="margin: 0; font-size: 10px; color: #94a3b8; max-width: 500px; margin: 0 auto; line-height: 1.5;">
        This comparison report is generated using spatial AI analysis to track dental pathology over time. 
        Please review these changes with your dentist during your next clinical appointment.
      </p>
    </div>
  `;

  const options = {
    margin: 10,
    filename: `Dental_Comparison_${patientName.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  return window.html2pdf().set(options).from(element).save();
}
