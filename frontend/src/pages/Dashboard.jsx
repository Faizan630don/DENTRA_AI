import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Eye, Download, CheckCircle2, Printer,
  Calendar, User, FileText, Sparkles, User2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import RiskPanel from '../components/dashboard/RiskPanel';
import RiskTimeline from '../components/dashboard/RiskTimeline';
import NearbyClinicFinder from '../components/dashboard/NearbyClinicFinder';
import { generateScanReport } from '../utils/reportGenerator';
import { toast } from 'react-hot-toast';
import NeuralNetwork3D from '../components/layout/NeuralNetwork3D';
import Layout from '../components/Layout';

export default function Dashboard() {
  const navigate = useNavigate();
  const { scanResult, mode } = useApp();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!scanResult) navigate('/');
  }, [scanResult, navigate]);

  if (!scanResult) return null;

  const isDentist = mode === 'dentist';

  const handleDownload = async () => {
    if (!scanResult) return;
    setIsDownloading(true);
    const loadingToast = toast.loading('Generating your professional report...');
    
    try {
      await generateScanReport(scanResult, mode === 'patient');
      toast.success('Report downloaded successfully!', { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report. Please try again.', { id: loadingToast });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-4rem)] bg-surface/90 animate-fade-in overflow-hidden">
        <NeuralNetwork3D />
        <div className="relative z-10">
          {/* Header */}
          <div className="border-b border-surface-border bg-surface-card sticky top-16 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/viewer')} className="btn-secondary !py-1.5 !px-3 text-xs">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Viewer
                </button>
                <div>
                  <h1 className="text-sm font-bold text-white">Smart Report Dashboard</h1>
                  <p className="text-[11px] text-gray-500">
                    {isDentist ? 'Clinical Summary Report' : 'Your Dental Health Summary'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/patient')}
                  className="btn-secondary !py-1.5 !px-3 text-xs hidden sm:flex"
                >
                  <User2 className="w-3.5 h-3.5" />
                  Patient View
                </button>
                <button
                  onClick={() => navigate('/viewer')}
                  className="btn-secondary !py-1.5 !px-3 text-xs hidden sm:flex"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View X-ray
                </button>
                <button 
                  onClick={handleDownload} 
                  disabled={isDownloading}
                  className="btn-primary !py-1.5 !px-4 text-xs disabled:opacity-50"
                >
                  <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                  {isDownloading ? 'Generating...' : 'Download Report'}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {/* Patient info bar */}
            <div className="card p-4 mb-5 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="font-semibold text-white text-sm">{scanResult.patient_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Scan Date</p>
                  <p className="font-semibold text-white text-sm">
                    {new Date(scanResult.scan_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Scan ID</p>
                  <p className="font-semibold text-white text-sm font-mono">{scanResult.scan_id.toUpperCase()}</p>
                </div>
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-semibold">Analysis Complete</span>
                </div>
              </div>
            </div>

            {/* AI Summary Banner */}
            <div className="card p-5 mb-5 border-brand-800/30 bg-brand-950/20">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider mb-1">
                    {isDentist ? 'Clinical AI Summary' : 'AI Health Summary'}
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {isDentist ? scanResult.treatment.dentist_summary : scanResult.treatment.patient_summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left: Risk Panel */}
              <div className="space-y-5">
                <RiskPanel result={scanResult} />
                
                {/* Nearby Clinics */}
                <NearbyClinicFinder 
                  condition={
                    scanResult.findings.find(f => f.severity >= 4)?.condition || 
                    scanResult.findings[0]?.condition || 
                    'Dental Checkup'
                  } 
                />
              </div>

              {/* Right: Timeline + procedures */}
              <div className="space-y-5">
                <RiskTimeline result={scanResult} />

                {/* Procedure details card */}
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Printer className="w-4 h-4 text-brand-400" />
                    <p className="section-label !mb-0">Recommended Procedures</p>
                  </div>
                  <div className="space-y-3">
                    {scanResult.treatment.procedures.map((p, idx) => (
                      <div key={`${p.name}-${idx}`} className="p-3 rounded-xl bg-surface-raised border border-surface-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-white">
                            {p.name}
                          </span>
                          <span className={`badge border text-[10px] ${
                            p.urgency === 'Immediate' ? 'bg-red-950/60 text-red-400 border-red-800/50'
                            : p.urgency === 'Soon' ? 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                            : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                          }`}>
                            {p.urgency}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono mb-1.5">{p.tooth_id}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {isDentist ? p.description : p.patient_description}
                        </p>
                        <p className="text-xs font-semibold text-brand-400 mt-2">
                          ₹{p.cost_low.toLocaleString('en-IN')} – ₹{p.cost_high.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Print-friendly footer */}
            <div className="mt-6 p-4 rounded-2xl border border-surface-border bg-surface-card text-center">
              <p className="text-xs text-gray-600 max-w-xl mx-auto">
                <span className="font-semibold text-gray-500">Disclaimer: </span>
                This AI-generated report is for informational purposes only and does not constitute medical advice.
                Always consult a licensed dental professional for diagnosis and treatment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
