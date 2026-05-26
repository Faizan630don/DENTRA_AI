import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../services/supabase';
import Layout from '../components/Layout';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        localStorage.setItem('supabase_token', session.access_token);
        window.dispatchEvent(new Event('storage'));
        navigate('/history');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleResend = async () => {
    if (!email) return;
    
    setResending(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: { emailRedirectTo: window.location.origin + '/auth' }
      });
      if (resendError) throw resendError;
      setError("Confirmation email resent! Please check your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
          if (authError.message.includes("Email not confirmed")) {
            throw new Error("Email not confirmed. Please check your inbox or click resend below.");
          }
          throw authError;
        }
        
        if (data.session) {
          localStorage.setItem('supabase_token', data.session.access_token);
          window.dispatchEvent(new Event('storage'));
          navigate('/history');
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { 
            emailRedirectTo: window.location.origin + '/auth',
            data: {
              full_name: fullName,
              age: parseInt(age, 10)
            }
          }
        });
        
        if (authError) throw authError;
        
        if (data.session) {
          localStorage.setItem('supabase_token', data.session.access_token);
          window.dispatchEvent(new Event('storage'));
          navigate('/history');
          return;
        }

        if (data.user) {
          navigate('/');
        }
      }
    } catch (err) {
      console.error("Auth Error:", err);
      let msg = err.message;
      if (msg.includes("rate limit") || msg.includes("Too many requests")) {
        msg = "Rate limit exceeded. Please wait a minute.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isUnconfirmed = error?.toLowerCase().includes("not confirmed");

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-600/20 border border-brand-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-brand-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-400 mt-2">
              {isLogin ? 'Access your dental health history' : 'Start tracking your dental journey today'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="card p-8 space-y-6">
            {error && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm animate-shake">
                  {error}
                </div>
                {isUnconfirmed && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full text-xs font-bold text-brand-400 hover:text-brand-300 text-center flex items-center justify-center gap-2"
                  >
                    {resending ? <div className="w-3 h-3 border border-brand-400 border-t-transparent rounded-full animate-spin" /> : null}
                    Resend confirmation link
                  </button>
                )}
              </div>
            )}

            <div className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative">
                      <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required={!isLogin}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-surface-raised border border-surface-border rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
                        placeholder="Faizan Khan"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Age</label>
                    <input
                      type="number"
                      required={!isLogin}
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-surface-raised border border-surface-border rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
                      placeholder="25"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-raised border border-surface-border rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-raised border border-surface-border rounded-xl py-3 pl-10 pr-12 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base justify-center gap-2 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                <> <LogIn className="w-5 h-5" /> Sign In </>
              ) : (
                <> <UserPlus className="w-5 h-5" /> Create Account </>
              )}
            </button>

            <p className="text-center text-sm text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-brand-400 font-bold hover:text-brand-300 underline-offset-4 hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </form>

          <div className="text-center">
            <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-400 text-xs flex items-center gap-1 mx-auto transition-colors">
              Continue as guest <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
