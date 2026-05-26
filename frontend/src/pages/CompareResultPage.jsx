import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  GitCompare, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Download,
  Sparkles
} from 'lucide-react';
import { generateComparisonReport } from '../utils/reportGenerator';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';

export default function CompareResultPage() {
  const navigate = useNavigate();
  const [comparison] = useState(() => {
    const raw = sessionStorage.getItem('last_comparison');
    return raw ? JSON.parse(raw) : null;
  });
  const [filter, setFilter] = useState('all');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!comparison) {
      navigate('/compare');
    }
  }, [comparison, navigate]);

  if (!comparison) return null;

  const handleDownload = async () => {
    if (!comparison) return;
    setIsDownloading(true);
    const loadingToast = toast.loading('Generating your comparison report...');
    
    try {
      const patientName = sessionStorage.getItem('current_patient_name') || 'Patient';
      await generateComparisonReport(comparison, patientName);
      toast.success('Report downloaded successfully!', { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report.', { id: loadingToast });
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredChanges = comparison.changes.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'worsened') return c.changeType === 'worsened';
    if (filter === 'new') return c.changeType === 'new';
    if (filter === 'improved') return c.changeType === 'improved' || c.changeType === 'resolved';
    return true;
  });

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/compare')} className="btn-secondary !p-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                AI Health Comparison Analysis
              </h1>
              <p className="text-gray-400 text-sm">
                Scan A ({formatDate(comparison.scanA_date)}) vs Scan B ({formatDate(comparison.scanB_date)})
              </p>
            </div>
          </div>
          <button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="btn-primary !px-6 !py-3 gap-2 disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            {isDownloading ? 'Generating...' : 'Download Comparison Report'}
          </button>
        </div>

        {/* Top Stats: Score & Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progression Score */}
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Progression Score</p>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-black ${comparison.progression_score < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {comparison.progression_score > 0 ? '+' : ''}{comparison.progression_score}
                </span>
                <span className="text-gray-600 font-bold text-lg mb-1">/ 100</span>
                <span className="text-sm text-gray-400 ml-4 mb-2">
                  {comparison.progression_score < -20 ? '"Getting worse"' : comparison.progression_score > 20 ? '"Improving"' : '"Stable"'}
                </span>
              </div>
              <ProgressionBar score={comparison.progression_score} />
              <p className="text-[10px] text-gray-600 mt-4 text-center italic">Negative scores indicate disease progression or new issues detected.</p>
            </div>
          </div>

          {/* Health Trend */}
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Health Trend</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {comparison.health_trend === 'worsening' ? (
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  ) : comparison.health_trend === 'improving' ? (
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <Minus className="w-8 h-8 text-amber-500" />
                  )}
                  <span className={`text-2xl font-extrabold capitalize ${
                    comparison.health_trend === 'worsening' ? 'text-red-400' :
                    comparison.health_trend === 'improving' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {comparison.health_trend}
                  </span>
                </div>
                <TriageArrow from={comparison.scanA_triage} to={comparison.scanB_triage} />
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between">
                 <div className="text-center px-4">
                   <p className="text-xs text-gray-500 uppercase">Findings A</p>
                   <p className="text-xl font-bold text-white">{comparison.changes.filter(c => c.scanA_severity).length}</p>
                 </div>
                 <div className="flex items-center text-gray-700">
                   <ChevronRight className="w-4 h-4" />
                 </div>
                 <div className="text-center px-4">
                   <p className="text-xs text-gray-500 uppercase">Findings B</p>
                   <p className="text-xl font-bold text-white">{comparison.changes.filter(c => c.scanB_severity).length}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Summary Tabs */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <TabButton 
              active={filter === 'all'} 
              onClick={() => setFilter('all')} 
              label="All Changes" 
              count={comparison.changes.length} 
              color="white"
            />
            <TabButton 
              active={filter === 'worsened'} 
              onClick={() => setFilter('worsened')} 
              label="Worsened" 
              count={comparison.worsened_findings.length} 
              color="red-400"
            />
            <TabButton 
              active={filter === 'new'} 
              onClick={() => setFilter('new')} 
              label="New Findings" 
              count={comparison.new_findings.length} 
              color="amber-400"
            />
            <TabButton 
              active={filter === 'improved'} 
              onClick={() => setFilter('improved')} 
              label="Improved/Resolved" 
              count={comparison.improved_findings.length + comparison.resolved_findings.length} 
              color="emerald-400"
            />
          </div>

          {/* Diff Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] uppercase tracking-widest text-gray-500 font-black">
                    <th className="px-6 py-4">Tooth</th>
                    <th className="px-6 py-4">Condition</th>
                    <th className="px-6 py-4 text-center">Scan A</th>
                    <th className="px-6 py-4 text-center">Scan B</th>
                    <th className="px-6 py-4 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredChanges.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                        No findings match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredChanges.map((change, idx) => (
                      <tr 
                        key={idx} 
                        className={`group transition-colors ${
                          change.changeType === 'worsened' ? 'bg-red-500/[0.03] border-l-2 border-l-red-500' :
                          change.changeType === 'new' ? 'bg-amber-500/[0.03] border-l-2 border-l-amber-500' :
                          change.changeType === 'resolved' ? 'bg-emerald-500/[0.03] border-l-2 border-l-emerald-500 opacity-60' :
                          change.changeType === 'improved' ? 'bg-emerald-500/[0.02] border-l-2 border-l-emerald-500' :
                          'border-l-2 border-l-transparent'
                        }`}
                      >
                        <td className="px-6 py-4 font-mono font-bold text-white">T-{change.tooth_id}</td>
                        <td className="px-6 py-4">
                          <p className={`font-bold text-sm ${change.changeType === 'resolved' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                            {change.condition}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <SeverityCell severity={change.scanA_severity} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <SeverityCell severity={change.scanB_severity} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ProgressBadge change={change} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Narrative Section */}
        <div className="card p-8 bg-gradient-to-br from-surface-card to-brand-950/20 border-brand-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Sparkles className="w-24 h-24 text-brand-400" />
          </div>
          
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-brand-400" />
            AI Evolution Analysis
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <p className="text-gray-300 leading-relaxed text-lg">
                {comparison.ai_narrative}
              </p>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs font-bold text-gray-500 uppercase mb-3">Clinical Recommendations</p>
                <ul className="space-y-3">
                  {comparison.ai_recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border ${
                comparison.health_trend === 'worsening' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
              }`}>
                <AlertTriangle className={`w-6 h-6 mb-3 ${comparison.health_trend === 'worsening' ? 'text-red-400' : 'text-emerald-400'}`} />
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Clinical Urgency</p>
                <p className={`text-sm font-bold leading-tight ${comparison.health_trend === 'worsening' ? 'text-red-200' : 'text-emerald-200'}`}>
                  {comparison.urgency_change}
                </p>
              </div>

              <button 
                onClick={() => navigate('/compare')}
                className="btn-secondary w-full py-4 text-sm font-bold uppercase tracking-widest gap-2"
              >
                <GitCompare className="w-4 h-4" />
                Compare Other Scans
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ProgressionBar({ score }) {
  const position = ((score + 100) / 200) * 100;
  const color = score < -20 ? '#EF4444' : score > 20 ? '#22C55E' : '#F59E0B';
  return (
    <div className="relative h-3 bg-surface-raised rounded-full w-full mt-2">
      <div className="absolute left-0 top-0 h-full w-1/2 bg-red-900/40 rounded-l-full" />
      <div className="absolute right-0 top-0 h-full w-1/2 bg-green-900/40 rounded-r-full" />
      <div className="absolute left-1/2 top-0 w-px h-full bg-surface-border" />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-1000"
        style={{ left: `calc(${position}% - 8px)`, background: color }}
      />
    </div>
  );
}

function TriageArrow({ from, to }) {
  const getTriageColor = (t) => {
    if (t === 'RED') return 'text-red-500';
    if (t === 'YELLOW') return 'text-amber-500';
    return 'text-emerald-500';
  };

  return (
    <div className="flex items-center gap-2 font-black text-sm">
      <span className={getTriageColor(from)}>● {from}</span>
      <span className="text-gray-700">→</span>
      <span className={getTriageColor(to)}>● {to}</span>
    </div>
  );
}

function SeverityCell({ severity }) {
  if (severity === undefined || severity === null) return <span className="text-gray-800">—</span>;
  
  const level = severity;
  const color = level >= 4 ? 'text-red-400' : level >= 3 ? 'text-amber-400' : 'text-emerald-400';
  const dotColor = level >= 4 ? 'bg-red-500' : level >= 3 ? 'bg-amber-500' : 'bg-emerald-500';
  const label = level >= 4 ? 'High' : level >= 3 ? 'Medium' : 'Low';
  
  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="inline-flex items-center gap-2 bg-white/[0.03] px-3 py-1 rounded-full border border-white/5">
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span className={`text-[10px] font-black uppercase ${color}`}>Level {level}</span>
      </div>
      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">{label}</span>
    </div>
  );
}

function ProgressBadge({ change }) {
  if (change.changeType === 'new') return <span className="badge bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-black uppercase">NEW</span>;
  if (change.changeType === 'resolved') return <span className="text-emerald-400 text-xs font-bold">✓ Resolved</span>;
  
  const delta = change.severityDelta;
  if (delta > 0) return <span className="text-red-400 text-xs font-bold">▲ +{delta} Worsened</span>;
  if (delta < 0) return <span className="text-emerald-400 text-xs font-bold">▼ {delta} Improved</span>;
  
  return <span className="text-gray-600 text-xs font-bold">Stable</span>;
}

function TabButton({ active, onClick, label, count, color }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
        active 
          ? `bg-white/10 border-white/20 text-white` 
          : `bg-transparent border-white/5 text-gray-500 hover:border-white/10`
      }`}
    >
      {label} <span className={`ml-1.5 opacity-60 text-${color}`}>{count}</span>
    </button>
  );
}
