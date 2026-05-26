import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Brain, Sparkles, CheckCircle, FileImage, X, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { uploadXray, getScanResults, saveScanToHistory } from '../services/api';
import { validateAnalysisResult } from '../utils/dataValidator';
import { supabase } from '../services/supabase';
import Hero3D from '../components/layout/Hero3D';
import { DEMO_SCAN } from '../data/demoScan';
import Layout from '../components/Layout';

const ANALYSIS_STEPS = [
  { label: 'Preprocessing X-ray…',       delay: 0 },
  { label: 'Detecting tooth structures…', delay: 700 },
  { label: 'Running cavity detection…',  delay: 1400 },
  { label: 'Analyzing bone density…',    delay: 2000 },
  { label: 'Generating AI report…',      delay: 2500 },
];

export default function Upload() {
  const navigate = useNavigate();
  const { setScanResult, setUploadedFile, setUploadedImageUrl } = useApp();
  const [state, setState] = useState('idle');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f.type.match(/image\/(jpeg|png|webp|gif)|application\/dicom/)) {
      setError('Please upload a valid X-ray image (JPG, PNG, WebP, or DICOM).');
      return;
    }
    setError(null);
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setState('idle');
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const handleDragOver = (e) => { e.preventDefault(); setState('dragging'); };
  const handleDragLeave = () => setState('idle');

  const startAnalysis = async () => {
    if (!file) return;
    setState('uploading');
    setProgress(0);
    setCurrentStep(0);

    try {
      ANALYSIS_STEPS.forEach((step, i) => {
        setTimeout(() => {
          setCurrentStep(i);
          setProgress(Math.round(((i + 1) / ANALYSIS_STEPS.length) * 100));
          if (i === 1) setState('analyzing');
        }, step.delay);
      });

      const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      const patientInfo = user?.user_metadata ? {
        name: user.user_metadata.full_name || 'Patient',
        age: user.user_metadata.age || 30,
        sex: 'M'
      } : { name: 'Patient', age: 30, sex: 'M' };

      const { scan_id } = await uploadXray(file, patientInfo);
      const rawResult = await getScanResults(scan_id);
      
      const result = validateAnalysisResult(rawResult);

      saveScanToHistory(result);

      const token = localStorage.getItem('supabase_token');
      if (token) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/save-report`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(result)
          });
          console.log("✓ Report saved to history");
        } catch (err) {
          console.warn("Could not save report to history:", err);
        }
      }

      setProgress(100);
      setState('done');
      setScanResult(result);
      setUploadedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setUploadedImageUrl(objectUrl);

      setTimeout(() => navigate('/viewer'), 500);
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please try again.');
      setState('idle');
    }
  };

  const runDemo = () => {
    setState('uploading');
    setProgress(0);
    setCurrentStep(0);

    ANALYSIS_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setCurrentStep(i);
        setProgress(Math.round(((i + 1) / ANALYSIS_STEPS.length) * 100));
        if (i === 1) setState('analyzing');
      }, step.delay);
    });

    const totalDuration = ANALYSIS_STEPS[ANALYSIS_STEPS.length - 1].delay + 900;
    setTimeout(() => {
      setProgress(100);
      setState('done');
      setScanResult(DEMO_SCAN);
      setUploadedFile(null);
      setUploadedImageUrl('/demo-xray.jpg');
      setTimeout(() => navigate('/viewer'), 400);
    }, totalDuration);
  };

  const isLoading = state === 'uploading' || state === 'analyzing';

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 overflow-hidden">
        <Hero3D />
        <div className="w-full max-w-xl animate-slide-up relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/10 border border-brand-600/20 text-brand-300 text-xs font-semibold mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Second Opinion
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-3 leading-tight">
              Upload Your <span className="text-gradient">Dental X-ray</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Get an instant AI analysis with findings, risk scores, and treatment recommendations.
            </p>
          </div>

          {/* Drop Zone */}
          {!isLoading && state !== 'done' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !file && fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
                state === 'dragging'
                  ? 'border-brand-500 bg-brand-600/10 scale-[1.02]'
                  : file
                  ? 'border-brand-700/50 bg-surface-card cursor-default'
                  : 'border-surface-border hover:border-brand-700 bg-surface-card hover:bg-surface-raised cursor-pointer'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.dcm"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {file && preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="X-ray preview"
                    className="w-full max-h-72 object-contain bg-black"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card/90 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
                        <FileImage className="w-5 h-5 text-brand-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setState('idle'); }}
                      className="p-2 rounded-lg bg-surface-raised hover:bg-red-900/40 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-600/20 flex items-center justify-center mb-5">
                    <UploadIcon className="w-8 h-8 text-brand-400" />
                  </div>
                  <p className="text-white font-semibold text-lg mb-1">Drop your X-ray here</p>
                  <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
                  <div className="flex gap-2">
                    {['JPG', 'PNG', 'WebP', 'DICOM'].map((ext) => (
                      <span key={ext} className="px-2 py-0.5 rounded bg-surface-raised text-gray-500 text-[11px] font-mono">{ext}</span>
                    ))}
                  </div>
                </div>
              )}

              {state === 'dragging' && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-600/5 backdrop-blur-sm">
                  <p className="text-brand-300 font-bold text-lg">Release to upload</p>
                </div>
              )}
            </div>
          )}

          {/* Analyzing overlay */}
          {isLoading && (
            <div className="card p-8 text-center animate-fade-in">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-brand-600/20 animate-ping-slow" />
                <div className="absolute inset-2 rounded-full border-2 border-brand-500/30 animate-ping-slow" style={{ animationDelay: '0.3s' }} />
                <div className="w-full h-full rounded-full bg-brand-600/10 border border-brand-600/30 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-brand-400 animate-pulse" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-1">AI Analyzing X-ray…</h2>
              <p className="text-gray-400 text-sm mb-6">
                {ANALYSIS_STEPS[currentStep]?.label ?? 'Finalizing…'}
              </p>

              {/* Progress bar */}
              <div className="h-2 bg-surface-raised rounded-full overflow-hidden mb-2 max-w-xs mx-auto">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 font-mono">{progress}% complete</p>

              {/* Steps */}
              <div className="mt-6 space-y-1.5 text-left max-w-xs mx-auto">
                {ANALYSIS_STEPS.map((step, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs transition-all ${
                    i < currentStep ? 'text-emerald-400' : i === currentStep ? 'text-brand-300' : 'text-gray-600'
                  }`}>
                    {i < currentStep
                      ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      : <div className={`w-3.5 h-3.5 rounded-full border shrink-0 ${i === currentStep ? 'border-brand-400 bg-brand-400/20' : 'border-gray-700'}`} />
                    }
                    {step.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          {/* CTA */}
          {!isLoading && state !== 'done' && (
            <div className="mt-5 flex flex-col items-center gap-4">
              <button
                id="analyze-btn"
                onClick={startAnalysis}
                disabled={!file}
                className="btn-primary w-full max-w-xs justify-center py-3 text-base"
              >
                <Brain className="w-5 h-5" />
                Analyze X-ray with AI
              </button>

              <div className="flex items-center gap-3 w-full max-w-xs">
                <div className="flex-1 h-px bg-surface-border" />
                <span className="text-[11px] text-gray-600 font-semibold tracking-wider uppercase">or</span>
                <div className="flex-1 h-px bg-surface-border" />
              </div>

              <button
                id="live-demo-btn"
                onClick={runDemo}
                className="
                  group relative w-full max-w-xs flex items-center justify-center gap-2.5
                  py-3 px-5 rounded-xl text-sm font-semibold
                  border border-amber-500/40 bg-amber-500/5
                  text-amber-300 hover:text-amber-200
                  hover:border-amber-400/70 hover:bg-amber-500/10
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50
                "
              >
                <span className="absolute inset-0 rounded-xl bg-amber-400/0 group-hover:bg-amber-400/5 transition-colors duration-300" />
                <Zap className="w-4 h-4 shrink-0 group-hover:animate-bounce" />
                Try Live Demo — No X-ray needed
              </button>

              <p className="text-xs text-gray-600 text-center max-w-sm">
                {file
                  ? 'Your X-ray is processed securely. No data is stored permanently.'
                  : 'Upload an X-ray above, or try the live demo to explore all features instantly.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
