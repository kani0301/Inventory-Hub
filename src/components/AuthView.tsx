import React, { useState } from "react";
import { ShieldCheck, UserCheck, Key, Mail, Building2, Eye, EyeOff, Loader2 } from "lucide-react";

interface AuthViewProps {
  onSuccess: (token: string, user: any) => void;
}

export default function AuthView({ onSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = isLogin 
      ? { username, password }
      : { username, password, name, email };

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please check your credentials.");
      }

      // Save token in localStorage & notify state
      localStorage.setItem("inventory_token", data.token);
      onSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Endpoint error - check server log");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setUsername("admin");
    setPassword("password123");
    setIsLogin(true);
    setError("");
    
    // Auto trigger submission parameters for easy login!
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "password123" }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("inventory_token", data.token);
        onSuccess(data.token, data.user);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError("Admin account auto-seed failed. Please fill manually.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-root" className="min-h-screen bg-serenity-gradient flex items-center justify-center p-4 font-sans selection:bg-indigo-150">
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden grid md:grid-cols-12 min-h-[600px] border border-indigo-50/50">
        
        {/* Left Side: Modern Visual Enterprise Showcase */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#4F6D9F] via-[#635583] to-[#806A78] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle elegant pattern details */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_45%)]" />
          <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                <Building2 className="w-6 h-6 text-purple-300" />
              </div>
              <span className="font-display font-bold tracking-tight text-lg">AcuStock System</span>
            </div>
          </div>

          <div className="relative z-10 my-12">
            <h1 className="font-display text-3xl font-extrabold tracking-tight leading-tight">
              Enterprise Resource & <span className="text-purple-300">Smart Inventory</span> Controls.
            </h1>
            <p className="mt-4 text-purple-100 text-sm leading-relaxed">
              Synthesizing real-time telemetry stock movements, high-precision replenishment timelines, and integrated Google Gemini demand-forecasting analytics.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-3 text-xs text-purple-200 border-t border-purple-500/30 pt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-300 shrink-0" />
              <span>Durable JSON transaction ledger system</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-300 shrink-0" />
              <span>Multi-tier administrator session protection</span>
            </div>
          </div>
        </div>

        {/* Right Side: Responsive Glassmorphic Form Card */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {isLogin ? "Welcome back" : "Create manager profile"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isLogin 
                ? "Sign in to monitor products, manage suppliers, and request forecasts." 
                : "Fill in the parameters below to configure your system access."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-lg font-medium">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Mercer"
                      className="w-full text-sm pl-3.5 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Business Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex.mercer@corp.com"
                      className="w-full text-sm pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full text-sm pl-3.5 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1.5">
                Admin Seed Credentials: <span className="font-semibold text-slate-600 bg-slate-100 px-1 rounded">admin</span> / <span className="font-semibold text-slate-600 bg-slate-100 px-1 rounded">password123</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold rounded-xl text-sm transition-all focus:ring-4 focus:ring-violet-150 shadow-md cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 py-0.5 animate-spin" />
                  <span>Processing request...</span>
                </>
              ) : (
                <span>{isLogin ? "Sign In to Dashboard" : "Register and Launch"}</span>
              )}
            </button>
          </form>

          {/* Quick Demo Seat Loader */}
          {isLogin && (
            <button
              onClick={handleQuickDemo}
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 border border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50/50 text-purple-700 font-medium rounded-xl text-xs transition-all cursor-pointer"
            >
              <span>⚡ One-Click instant credentials bypass login</span>
            </button>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-xs text-violet-600 hover:text-violet-800 font-semibold focus:outline-none cursor-pointer"
            >
              {isLogin 
                ? "Don't have a profile yet? Register one here" 
                : "Already have a manager profile? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
