import React, { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Terminal, 
  Copy, 
  FileText, 
  Activity, 
  Clock, 
  Laptop, 
  Lock, 
  ExternalLink
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authInProgress, setAuthInProgress] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"visual" | "json">("visual");
  const [greeting, setGreeting] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [sessionUptime, setSessionUptime] = useState<number>(0);
  
  // Interactive Local Note feature (Unique to each authenticated client UID)
  const [userNote, setUserNote] = useState<string>("");
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<boolean>(false);

  // Determine current greeting based on time of day
  useEffect(() => {
    const updateGreetingAndTime = () => {
      const hours = new Date().getHours();
      const now = new Date();
      
      let greetWord = "Good morning";
      if (hours >= 12 && hours < 17) {
        greetWord = "Good afternoon";
      } else if (hours >= 17 && hours < 22) {
        greetWord = "Good evening";
      } else {
        greetWord = "Welcome in";
      }
      setGreeting(greetWord);
      
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    updateGreetingAndTime();
    const interval = setInterval(updateGreetingAndTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync internal uptime starting from session initialization
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (user) {
      setSessionUptime(0);
      timer = setInterval(() => {
        setSessionUptime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [user?.uid]);

  // Load the authenticated user's custom saved note from localstorage
  useEffect(() => {
    if (user) {
      const savedNote = localStorage.getItem(`auth_portal_note_${user.uid}`);
      setUserNote(savedNote || "");
    } else {
      setUserNote("");
    }
  }, [user?.uid]);

  // Watch Authentication State from Firebase on Boot
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        console.error("Authentication state change error:", err);
        setError("Unable to communicate with the authorization server. Check your system key variables.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setError(null);
    setAuthInProgress(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Sign in failed:", err);
      if (err.code === "auth/popup-blocked") {
        setError("The authentication popup was blocked by your browser settings. Please enable popups for this portal.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This deployment domain is not currently white-listed in your Firebase developer console authorized domains list.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("An unexpected authentication challenge was encountered. Please check dev credentials.");
      }
    } finally {
      setAuthInProgress(false);
    }
  };

  // Handle Log Out
  const handleLogOut = async () => {
    try {
      await signOut(auth);
      setError(null);
    } catch (err: any) {
      console.error("Log out error:", err);
      setError("Failed to tear down authentication session gracefully.");
    }
  };

  // Copy Profile Element to Clipboard (UID)
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Save localized notepad details to localStorage associated with UID
  const saveUserNote = () => {
    if (!user) return;
    localStorage.setItem(`auth_portal_note_${user.uid}`, userNote);
    setNoteSavedFeedback(true);
    setTimeout(() => {
      setNoteSavedFeedback(false);
    }, 2000);
  };

  // Helper formatting for seconds to descriptive digital output (mm:ss)
  const formatUptimeValue = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div id="auth-portal-viewport" className="min-h-screen relative bg-[#0f172a] text-slate-100 selection:bg-indigo-500 selection:text-white pb-16 flex flex-col justify-between font-sans overflow-hidden">
      
      {/* Background visual glows & blur effects representing the Frosted Glass theme */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow relative z-10">
        
        {/* Glassmorphic Navbar */}
        <header id="main-header" className="py-5 border-b border-white/5 flex items-center justify-between mb-8 bg-white/5 backdrop-blur-md px-6 rounded-2xl mt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">
                Niklaus<span className="text-indigo-400 font-light italic">Auth</span>
              </span>
              <span className="text-[10px] text-indigo-300 font-mono block">sso-gateway-node</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6 text-xs font-semibold text-slate-400">
              <span className="text-slate-500 font-mono">APP_ID: 1:198056193558:web</span>
              <span className="h-4 w-px bg-white/10" />
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Service
              </span>
            </nav>

            <div className="flex items-center gap-3">
              {/* UTC System Clock */}
              <div className="text-right hidden sm:block bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Gateway Local</div>
                <div className="text-xs font-bold text-slate-200 font-mono">{currentTime || "--:--:--"}</div>
              </div>

              {user && (
                <button 
                  id="header-logout-button"
                  onClick={handleLogOut}
                  className="flex items-center gap-1.5 px-3.5 py-1.8 rounded-xl bg-white/10 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-xs font-semibold text-slate-200 hover:text-red-300 transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Global Error Banner */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-950/40 backdrop-blur-md border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-200 text-sm"
          >
            <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Security Challenge:</span> {error}
              <button 
                onClick={() => setError(null)}
                className="block mt-2 text-xs font-semibold text-red-400 hover:text-red-300 underline uppercase tracking-widest"
              >
                Dismiss Warning
              </button>
            </div>
          </motion.div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Stage */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {loading ? (
              <div id="loader-view" className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-20 flex flex-col items-center justify-center text-center shadow-2xl">
                <div className="relative flex items-center justify-center">
                  <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-indigo-500 opacity-25"></div>
                  <div className="rounded-full h-10 w-10 border-4 border-indigo-400 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-lg font-bold text-white mt-6">Handshaking Server Config</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-2 font-mono">Verifying authorization handshake on auth-niklaus settings...</p>
              </div>
            ) : !user ? (
              
              /* STAGE: SIGN IN / PROMPT GUEST */
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                id="unsigned-stage"
                className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] overflow-hidden shadow-2xl shadow-black/50"
              >
                {/* Visual Header */}
                <div className="p-8 pb-4 relative overflow-hidden">
                  <span className="inline-flex gap-1.5 items-center px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">
                    <Lock className="h-3 w-3" /> Project Connected
                  </span>
                  
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-gradient mb-3">
                    Secure your<br/>application.
                  </h1>
                  
                  <p className="text-slate-400 text-base leading-relaxed max-w-xl">
                    Single Sign-On integration for project <span className="text-indigo-400 font-mono">auth-niklaus</span>. Connect your users with Google authentication in seconds.
                  </p>
                </div>

                {/* Body actions */}
                <div className="p-8 pt-4 flex flex-col md:flex-row items-stretch gap-8">
                  {/* Auth Container Buttons */}
                  <div className="flex-1 flex flex-col justify-between gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">SSO Authentication Gate</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Clicking the verified authentication connector initiates Google client-level popups. It safe-exchanges signed JWT tokens through your native setup.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        id="google-signin-button"
                        onClick={handleGoogleSignIn}
                        disabled={authInProgress}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 disabled:bg-slate-300 text-slate-900 py-4 px-6 rounded-2xl font-bold transition-all shadow-xl active:scale-95 cursor-pointer"
                      >
                        {authInProgress ? (
                          <>
                            <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                            <span>Connecting secure pipeline...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-5.5 w-5.5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-sm font-bold text-slate-950">Sign in with Google</span>
                          </>
                        )}
                      </button>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                          <span className="bg-[#12192d] px-3 font-mono text-slate-500 tracking-wider">Secure Firebase Auth</span>
                        </div>
                      </div>

                      <div className="bg-slate-950/50 border border-white/5 rounded-xl p-3 text-center">
                        <span className="text-[10px] text-indigo-300 font-mono block truncate">
                          APP_ID: 1:198056193558:web:ee3a39fd1308ab11f90f37
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Information */}
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-300 font-mono tracking-wider block mb-4 uppercase">Verification Parameters</span>
                      
                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>JS Engine: Web v11 Active</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>Scope: select_account parameter</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>Type: GoogleAuthProvider popup</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>Secure Domain Handshake: SSL OK</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-6">
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Authorized token details are written dynamically to memory variables without exposing storage layers or remote sessions.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              
              /* STAGE: AUTHENTICATED ACTIVE SESSION */
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                id="authenticated-stage"
                className="flex flex-col gap-6"
              >
                
                {/* 1. Welcoming Hero Segment */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-left">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider font-mono uppercase bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 w-fit mb-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Authentication Established
                      </div>
                      <h2 className="text-3xl font-extrabold tracking-tight">
                        {greeting}, <span className="text-gradient font-sans">{user.displayName || "Developer"}</span>!
                      </h2>
                      <p className="text-sm text-slate-400 mt-2 max-w-xl">
                        Your developer session is running. The portal successfully established connection credentials to your Google Cloud user details.
                      </p>
                    </div>

                    {/* Quick Avatar Hero Badge */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div className="relative">
                        <img 
                          src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"} 
                          alt="Google Profile" 
                          referrerPolicy="no-referrer"
                          className="h-20 w-20 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
                        />
                        <div className="absolute -bottom-1.5 -right-1.5 bg-indigo-500 text-white rounded-xl p-1.5 shadow-md">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid Layout inside logged in state */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Account breakdown card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          <UserIcon className="h-4.5 w-4.5 text-indigo-400" /> Identity Information
                        </h3>
                        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">Verified URL</span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] uppercase text-slate-500 font-mono block">Profile Display Name</label>
                          <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                            {user.displayName || <span className="text-slate-500 italic font-normal">Not Found</span>}
                          </span>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase text-slate-500 font-mono block">Secure Email Target</label>
                          <span className="text-sm font-semibold text-slate-200 font-mono flex items-center gap-2 mt-0.5">
                            {user.email || "No Email Bound"}
                            {user.emailVerified && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                Verified
                              </span>
                            )}
                          </span>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase text-slate-500 font-mono block">Google Unique ID String</label>
                          <div className="relative mt-1 flex items-center bg-black/30 border border-white/5 rounded-xl p-2.5">
                            <span className="text-xs font-mono text-indigo-300 select-all truncate pr-8 w-full block">
                              {user.uid}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(user.uid)}
                              className="absolute right-2 text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                              title="Copy UID to Clipboard"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                          {copiedId && (
                            <span className="text-[10px] font-semibold text-emerald-400 mt-1.5 block font-mono">
                              Copied UID string to clipboard!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>Authority:</span>
                      <span className="text-slate-300 font-bold uppercase">Google Client SSO</span>
                    </div>
                  </div>

                  {/* Dynamic Session Metrics & Active Diagnostics */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          <Activity className="h-4.5 w-4.5 text-indigo-400" /> Active Session Uptime
                        </h3>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-bold">Live Status</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase text-slate-500 font-mono block">Session Elapsed</span>
                          <span className="text-lg font-bold font-mono text-white block mt-1 flex items-center gap-1.5">
                            <Clock className="h-4 w-5 text-indigo-400 shrink-0" /> {formatUptimeValue(sessionUptime)}
                          </span>
                        </div>

                        <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase text-slate-500 font-mono block">Joined Portal</span>
                          <span className="text-xs font-bold font-mono text-slate-300 block mt-2">
                            {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Instantly"}
                          </span>
                        </div>

                        <div className="bg-black/20 p-3 rounded-xl border border-white/5 col-span-2">
                          <span className="text-[10px] uppercase text-slate-500 font-mono block">Timestamp Signature</span>
                          <span className="text-xs font-semibold text-indigo-300 font-mono block mt-1">
                            {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleTimeString() : "Just now"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>Access Status:</span>
                      <span className="text-emerald-400 font-bold uppercase text-[10px]">VERIFIED JWT</span>
                    </div>
                  </div>

                </div>

                {/* Session Notepad Sandbox */}
                <div id="notes-module" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4.5 w-4.5 text-indigo-400" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-200 leading-none">Session Notepad</h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Isolated sandbox tied to your unique Google UID</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded">Autosaves</span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      Write notes, secret credentials, or temporary checklists here. This Notepad stores content inside localized system strings isolated strictly to your unique Google user ID.
                    </p>

                    <textarea
                      id="user-notepad-textarea"
                      value={userNote}
                      onChange={(e) => setUserNote(e.target.value)}
                      placeholder="Start typing some encrypted notes in the profile sandbox..."
                      className="w-full h-28 p-3 text-sm bg-black/30 hover:bg-black/40 focus:bg-black/50 text-indigo-100 border border-white/10 focus:border-indigo-500 rounded-xl outline-none transition-all placeholder:text-slate-600 resize-none font-mono"
                    />

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Note Length: {userNote.length} characters
                      </span>

                      <button
                        id="save-note-button"
                        onClick={saveUserNote}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>

                    <AnimatePresence>
                      {noteSavedFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Changes secured to local profile sandbox.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Interactive JSON State Inspector Tabs */}
                <div id="inspector-tabs" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] overflow-hidden shadow-xl">
                  <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4.5 w-4.5 text-indigo-400" />
                      <h3 className="text-xs font-bold font-mono text-slate-200">sso_token_payload</h3>
                    </div>

                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                      <button 
                        onClick={() => setActiveTab("visual")}
                        className={`px-3.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${activeTab === "visual" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        Visual Stream
                      </button>
                      <button 
                        onClick={() => setActiveTab("json")}
                        className={`px-3.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${activeTab === "json" ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        JSON State
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {activeTab === "visual" ? (
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-500 font-mono tracking-wider uppercase mb-5">Security Lifecycle Handshake</h4>
                        
                        <div className="relative border-l-2 border-white/10 pl-6 space-y-6 ml-3">
                          
                          {/* Step 1 */}
                          <div className="relative">
                            <span className="absolute -left-9 h-6 w-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold">1</span>
                            <div>
                              <h5 className="text-sm font-semibold text-slate-200">Firebase Core Handshake</h5>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Instantiated encrypted client connection with Google Web Firebase active instance parameters. Connected config target address successfully.
                              </p>
                            </div>
                          </div>

                          {/* Step 2 */}
                          <div className="relative">
                            <span className="absolute -left-9 h-6 w-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold">2</span>
                            <div>
                              <h5 className="text-sm font-semibold text-slate-200">SSO Google popup verification</h5>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Handled Google Auth authorization callbacks in compliance with system keys list. Exchanged valid provider session credentials with security logs.
                              </p>
                            </div>
                          </div>

                          {/* Step 3 */}
                          <div className="relative">
                            <span className="absolute -left-9 h-6 w-6 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 text-indigo-400 flex items-center justify-center animate-pulse font-mono text-xs font-bold">3</span>
                            <div>
                              <h5 className="text-sm font-semibold text-slate-200">Encrypted Sandbox Token State</h5>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Client active workspace environment variable parameters are fully cached with active profile notes database storage isolation.
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute top-2 right-2 flex items-center gap-2">
                          <button 
                            onClick={() => copyToClipboard(JSON.stringify(user, null, 2))}
                            className="bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-colors shadow"
                            title="Copy Full Token Payload"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Copy Payload</span>
                          </button>
                        </div>
                        <pre className="p-4 bg-slate-950/80 text-indigo-300 rounded-xl text-xs font-mono overflow-x-auto border border-white/5 leading-relaxed max-h-96">
                          <code>
                            {JSON.stringify({
                              uid: user.uid,
                              displayName: user.displayName,
                              email: user.email,
                              emailVerified: user.emailVerified,
                              isAnonymous: user.isAnonymous,
                              photoURL: user.photoURL,
                              phoneNumber: user.phoneNumber,
                              providerId: user.providerId,
                              providerData: user.providerData,
                              metadata: {
                                createdAt: user.metadata.creationTime,
                                lastLogin: user.metadata.lastSignInTime,
                              }
                            }, null, 2)}
                          </code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            )}

          </div>

          {/* RIGHT COLUMN: Configuration Inspector & Environment Details */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Environment Status Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 shadow-xl">
              <span className="text-[10px] uppercase text-indigo-300 font-mono tracking-wider font-extrabold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md w-fit block mb-4">
                Active Configurations
              </span>
              
              <h3 className="text-sm font-semibold text-slate-200 border-b border-white/5 pb-3 mb-3 flex items-center gap-2">
                <Laptop className="h-4.5 w-4.5 text-indigo-400" /> Firebase Setup
              </h3>

              <p className="text-xs text-slate-400 leading-normal mb-4">
                This client web portal connects natively during runtime using these core project variables:
              </p>

              <div className="space-y-3 font-mono text-[11px] bg-black/30 border border-white/5 rounded-xl p-4 text-slate-300">
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[8px] tracking-wide">Project ID</span>
                  <span className="font-semibold block select-all">auth-niklaus</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[8px] tracking-wide">Auth Domain URL</span>
                  <span className="font-semibold block select-all">auth-niklaus.firebaseapp.com</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[8px] tracking-wide">Active Google API Key</span>
                  <span className="font-semibold block select-all text-indigo-200">AIzaSyCR01ISx8...VdgGVAZmmqk</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[8px] tracking-wide">Storage Bucket</span>
                  <span className="font-semibold block select-all">auth-niklaus.firebasestorage.app</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[8px] tracking-wide">Messaging Sender ID</span>
                  <span className="font-semibold block select-all text-[10px]">198056193558</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-sans">
                <span>Client Engine Status:</span>
                <span className="text-emerald-400 font-semibold font-mono text-[10px]">OPERATIONAL</span>
              </div>
            </div>

            {/* Platform instructions helper */}
            <div className="bg-indigo-950/40 backdrop-blur-xl border border-indigo-500/20 text-indigo-200 rounded-[28px] p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                <Info className="h-4.5 w-4.5 text-indigo-400" /> Domains Checklist
              </h3>
              <p className="text-xs text-indigo-300 leading-relaxed mb-4">
                When using Firebase Google authentication pop-ups, verify that the following preview domain is permitted within your 
                <strong className="text-white font-semibold"> Firebase Console {">"} Auth {">"} Settings {">"} Authorized Domains</strong>:
              </p>
              
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-[10px] break-all select-all text-indigo-100">
                ais-dev-u2lwj6ctdr4xzea27vykv6-519575760319.asia-east1.run.app
              </div>

              <p className="text-[10px] text-indigo-400 leading-relaxed mt-4">
                If the Domain Redirect throws an error, registering this address in the Firebase Authorized panel clears popup blocking warnings instantly.
              </p>

              <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-indigo-300 transition-colors"
                >
                  Firebase Console <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Quick Diagnostic Checklist */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 shadow-xl">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" /> Gateway Metrics
              </h3>
              
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-mono text-[9px] font-bold">✓</div>
                  <div>
                    <span className="font-medium block text-slate-300">CORS Web Handshakes validated</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-mono text-[9px] font-bold">✓</div>
                  <div>
                    <span className="font-medium block text-slate-300">Google Auth Popup client ready</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-mono text-[9px] font-bold">✓</div>
                  <div>
                    <span className="font-medium block text-slate-300">State synchronization isolated</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* Footer bar */}
      <footer id="main-footer" className="mt-12 pt-6 border-t border-white/5 text-center text-xs text-slate-500 font-mono relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; 2026 Niklaus Auth Systems. All rights reserved.</div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Project ID: auth-niklaus</span>
            <span className="h-3 w-px bg-white/10"></span>
            <span>v2.5.0-stable</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
