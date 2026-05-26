import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeft, User2, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import XrayViewer from '../components/viewer/XrayViewer';
import FindingsList from '../components/viewer/FindingsList';
import Scene from '../components/3D/Scene';
import Header3D from '../components/UI/Header';
import Controls3D from '../components/UI/Controls';
import { useAnimationStore } from '../store/animationStore';
import Layout from '../components/Layout';

export default function Viewer() {
  const navigate = useNavigate();
  const { scanResult, setScanResult, uploadedImageUrl, selectedFinding, setSelectedFinding } = useApp();
  const fetchedRef = useRef(false);
  const isDemo = scanResult?.scan_id?.startsWith('demo-') ?? false;
  
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [hasBeenMounted3D, setHasBeenMounted3D] = useState(false);

  const selectedObject = useAnimationStore((state) => state.selectedObject);
  const setSelectedObject = useAnimationStore((state) => state.setSelectedObject);

  // Synchronize selection: selecting a finding in the list focuses that tooth in 3D
  useEffect(() => {
    if (selectedFinding) {
      if (selectedObject !== selectedFinding.tooth_id) {
        setSelectedObject(selectedFinding.tooth_id);
      }
    } else {
      // Only clear selectedObject if it points to a tooth with an active finding.
      // This allows healthy teeth to remain selected when clicked in 3D model.
      if (selectedObject) {
        const hasFinding = scanResult?.findings?.some(f => String(f.tooth_id) === String(selectedObject));
        if (hasFinding) {
          setSelectedObject(null);
        }
      }
    }
  }, [selectedFinding, selectedObject, setSelectedObject, scanResult]);

  useEffect(() => {
    if (!scanResult) {
      navigate('/');
      return;
    }

    if (isDemo) return;

    if (!fetchedRef.current && scanResult.findings.some(f => f.second_opinion === 'pending')) {
      fetchedRef.current = true;
      api.fetchSecondOpinion(scanResult.findings).then((soResult) => {
        if (soResult && soResult.consensus) {
          const updatedFindings = scanResult.findings.map(f => {
            const agree = soResult.consensus.agreements?.find((a) => a.id === f.id);
            const disagree = soResult.consensus.disagreements?.find((d) => d.id === f.id);
            if (agree) return { ...f, second_opinion: 'agree' };
            if (disagree) return { ...f, second_opinion: 'disagree' };
            return f;
          });
          setScanResult({ ...scanResult, findings: updatedFindings });
        }
      }).catch(err => {
        console.error("Second opinion fetch failed:", err);
      });
    }
  }, [scanResult, navigate, setScanResult, isDemo]);

  if (!scanResult) return null;

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
        {/* Top toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border bg-surface-card shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="btn-secondary !py-1.5 !px-3 text-xs gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              {isDemo ? 'Back' : 'Re-upload'}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white">X-ray Analysis Viewer</h1>
                {isDemo && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/40 text-amber-300">
                    <Zap className="w-2.5 h-2.5" />
                    Demo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                {scanResult.findings.length} findings detected · {scanResult.scan_date ? new Date(scanResult.scan_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
              </p>
            </div>
          </div>

          {/* View Toggles (2D vs 3D) */}
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3.5 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === '2d' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              2D X-Ray
            </button>
            <button
              onClick={() => {
                setViewMode('3d');
                setHasBeenMounted3D(true);
              }}
              className={`px-3.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === '3d' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>3D Model</span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/patient')}
              className="btn-secondary !py-1.5 !px-4 text-xs hidden sm:flex"
            >
              <User2 className="w-3.5 h-3.5" />
              Patient View
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary !py-1.5 !px-4 text-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              View Report
            </button>
          </div>
        </div>

        {/* Main layout: viewer + findings panel */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Main viewing area (Takes most space) */}
          <div className="flex-1 min-w-0 border-r border-surface-border relative">
            <div className={`w-full h-full ${viewMode === '2d' ? 'block' : 'hidden'}`}>
              <XrayViewer
                imageUrl={scanResult.xray_image_url || uploadedImageUrl}
                findings={scanResult.findings}
                activeFindingId={selectedFinding?.id}
                onFindingClick={(f) => setSelectedFinding(f)}
              />
            </div>
            
            {hasBeenMounted3D && (
              <div className={`relative w-full h-full bg-slate-950 overflow-hidden ${viewMode === '3d' ? 'block' : 'hidden'}`}>
                <Scene />
                <Header3D />
                <Controls3D />
              </div>
            )}
          </div>

          {/* Findings panel sidebar */}
          <div className="w-[340px] shrink-0 overflow-y-auto flex flex-col bg-surface-card">
            <FindingsList findings={scanResult.findings} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
