import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitCompare, Clock, User, CheckCircle2 } from 'lucide-react';
import { loadScanHistory, loadFullScan } from '../services/api';
import { compareScans, generateComparisonNarrative } from '../services/compareService';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';

const COMPARE_MESSAGES = [
  'Loading scan histories...',
  'Matching findings tooth-by-tooth...',
  'Calculating progression score...',
  'Running AI evolution analysis...',
  'Generating clinical recommendations...',
];

export default function Compare() {
  const navigate = useNavigate();
  const [history] = useState(() => {
    const data = loadScanHistory();
    return [...data].sort((a, b) => new Date(b.scan_date).getTime() - new Date(a.scan_date).getTime());
  });
  const [scanA, setScanA] = useState(null);
  const [scanB, setScanB] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % COMPARE_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSelectScan = (scan) => {
    if (scanA?.scan_id === scan.scan_id) {
      setScanA(null);
      return;
    }
    if (scanB?.scan_id === scan.scan_id) {
      setScanB(null);
      return;
    }

    if (!scanA) {
      setScanA(scan);
    } else if (!scanB) {
      setScanB(scan);
    } else {
      toast.error("Please unselect a scan first to choose another.");
    }
  };

  const handleCompare = async () => {
    if (!scanA || !scanB) return;
    setIsLoading(true);
    setLoadingMsgIdx(0);

    try {
      const fullA = loadFullScan(scanA.scan_id);
      const fullB = loadFullScan(scanB.scan_id);

      if (!fullA || !fullB) {
        throw new Error("Full scan data missing for comparison.");
      }

      const dateA = new Date(fullA.scan_date).getTime();
      const dateB = new Date(fullB.scan_date).getTime();
      const [older, newer] = dateA < dateB ? [fullA, fullB] : [fullB, fullA];

      const baseComparison = compareScans(older, newer);

      const llmResult = await generateComparisonNarrative(
        baseComparison,
        newer.patient_name || 'Patient',
        newer.biological_age || 30
      );

      const fullComparison = { ...baseComparison, ...llmResult };

      sessionStorage.setItem('last_comparison', JSON.stringify(fullComparison));
      sessionStorage.setItem('current_patient_name', newer.patient_name || 'Patient');
      navigate('/compare/result');
      
    } catch (err) {
      console.error(err);
      toast.error('Comparison failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }).replace(',', ' ·');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in relative min-h-[80vh]">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary !p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-brand-400" />
              AI Health Comparison
            </h1>
            <p className="text-gray-400 text-sm">Compare two scans to visualize health trends over time</p>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 mb-8 relative">
              <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <GitCompare className="absolute inset-0 m-auto w-8 h-8 text-brand-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Analyzing Evolution</h2>
            <p className="text-brand-400 font-mono text-sm animate-pulse">{COMPARE_MESSAGES[loadingMsgIdx]}</p>
          </div>
        )}

        {/* Scan List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Select 2 Scans from History</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {history.length === 0 ? (
              <div className="card p-12 text-center border-dashed border-white/10">
                <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">No scan history found. Please upload a scan first.</p>
              </div>
            ) : (
              history.map((scan) => {
                const isA = scanA?.scan_id === scan.scan_id;
                const isB = scanB?.scan_id === scan.scan_id;
                const isSelected = isA || isB;

                return (
                  <div
                    key={scan.scan_id}
                    onClick={() => handleSelectScan(scan)}
                    className={`group relative card p-5 cursor-pointer transition-all border-2 overflow-hidden ${
                      isA ? 'border-blue-500 bg-blue-500/5' : 
                      isB ? 'border-purple-500 bg-purple-500/5' : 
                      'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                    }`}
                  >
                    {isSelected && (
                      <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase tracking-tighter rounded-bl-xl text-white ${isA ? 'bg-blue-500' : 'bg-purple-500'}`}>
                        {isA ? 'Scan A' : 'Scan B'}
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-gray-500">{formatDate(scan.scan_date)}</span>
                          <span className={`badge border text-[10px] ${
                            scan.overall_triage === 'RED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            scan.overall_triage === 'YELLOW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {scan.overall_triage} Triage
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-600" />
                          {scan.patient_name || 'Unknown Patient'} <span className="text-gray-600 font-normal">· Age {scan.patient_age}</span>
                        </h3>
                      </div>

                      <div className="md:text-right">
                        {scan.finding_count > 0 ? (
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-white">
                              🦷 {scan.finding_count} findings: 
                              <span className="text-red-400 ml-1"> {scan.high_count} High</span>
                              <span className="text-amber-400"> · {scan.medium_count} Med</span>
                              <span className="text-gray-400"> · {scan.low_count} Low</span>
                            </p>
                            <p className="text-[11px] text-gray-500 italic">
                              Conditions: {scan.conditions_preview.join(', ')} {scan.finding_count > 3 && `+${scan.finding_count - 3} more`}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>No issues found ✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Compare Button */}
        <div className="sticky bottom-8 z-20">
          <button
            onClick={handleCompare}
            disabled={!scanA || !scanB || isLoading}
            className={`btn-primary w-full py-4 text-lg gap-3 shadow-2xl transition-all duration-300 ${
              (!scanA || !scanB) ? 'grayscale opacity-50 cursor-not-allowed translate-y-2' : 'scale-105'
            }`}
          >
            {(!scanA || !scanB) ? (
              <>Select 2 scans to compare</>
            ) : (
              <>
                <GitCompare className="w-5 h-5" />
                Compare Scan A vs Scan B →
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
