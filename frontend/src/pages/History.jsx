import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, BarChart2, Plus, Calendar, Activity, ShieldCheck } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function History() {
  const navigate = useNavigate();
  const { setScanResult } = useApp();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);



  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    setUser(user);
    if (user?.user_metadata) {
      setEditName(user.user_metadata.full_name || '');
      setEditAge(user.user_metadata.age || '');
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: editName,
          age: parseInt(editAge, 10)
        }
      });
      if (error) throw error;
      setUser(data.user);
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/reports`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchUser();
      fetchHistory();
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Clinical History</h1>
            <p className="text-gray-400 mt-1">Track your dental health progress over time</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> New Scan
          </button>
        </div>

        {user && (
          <div className="card p-6 bg-brand-950/20 border-brand-800/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-brand-400 uppercase tracking-widest">Patient Profile</h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors px-3 py-1.5 rounded-lg border border-brand-800/30 bg-brand-900/40"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-400 px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className="btn-primary !py-1.5 !px-4 text-xs"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-brand-950/40 border border-brand-800/30 rounded-xl py-2.5 px-4 text-white text-sm focus:ring-1 focus:ring-brand-500 outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Biological Age</label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full bg-brand-950/40 border border-brand-800/30 rounded-xl py-2.5 px-4 text-white text-sm focus:ring-1 focus:ring-brand-500 outline-none"
                    placeholder="Enter age"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Full Name</p>
                  <p className="text-white font-semibold">{user.user_metadata?.full_name || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Email Address</p>
                  <p className="text-white font-semibold">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Biological Age</p>
                  <p className="text-white font-semibold">{user.user_metadata?.age ? `${user.user_metadata.age} years` : 'Not provided'}</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-brand-800/20">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                Connected to Supabase Cloud · Account Secure
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="card p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mx-auto text-gray-500">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">No scans yet</h2>
            <p className="text-gray-400 max-w-sm mx-auto">Upload your first X-ray to start tracking your dental health history.</p>
            <button onClick={() => navigate('/')} className="btn-secondary">Start Analysis</button>
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="card p-5 flex items-center justify-between hover:border-brand-700/50 transition-all cursor-pointer group"
                onClick={() => {
                  setScanResult({
                    scan_id: report.id,
                    scan_date: report.created_at,
                    patient_name: user?.user_metadata?.full_name || "Patient",
                    biological_age: user?.user_metadata?.age || report.dental_age,
                    dental_age: report.dental_age,
                    xray_image_url: report.xray_url,
                    xray_dimensions: { width: 1200, height: 800 },
                    risk_score: report.overall_triage === 'RED' ? 'High' : report.overall_triage === 'YELLOW' ? 'Medium' : 'Low',
                    overall_health: report.overall_triage === 'RED' ? 40 : report.overall_triage === 'YELLOW' ? 70 : 90,
                    findings: report.findings,
                    treatment: report.treatment
                  });
                  navigate('/dashboard');
                }}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${report.overall_triage === 'RED' ? 'bg-red-950/30 border-red-800/30 text-red-400' :
                    report.overall_triage === 'YELLOW' ? 'bg-amber-950/30 border-amber-800/30 text-amber-400' :
                      'bg-emerald-950/30 border-emerald-800/30 text-emerald-400'
                    }`}>
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-white text-lg">
                        {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${report.overall_triage === 'RED' ? 'bg-red-950 text-red-400' :
                        report.overall_triage === 'YELLOW' ? 'bg-amber-950 text-amber-400' :
                          'bg-emerald-950 text-emerald-400'
                        }`}>
                        {report.overall_triage}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" /> {report.findings.length} findings</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
