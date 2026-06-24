import React, { useState } from "react";
import { 
  User, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Clock, 
  CheckCircle2,
  Building2,
  Lock,
  Database,
  Trash2
} from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface ProfileViewProps {
  user: any;
  onUpdateProfile: (profileData: any) => Promise<any>;
  onResetDb: () => Promise<void>;
  onSeedDb: () => Promise<void>;
}

export default function ProfileView({ user, onUpdateProfile, onResetDb, onSeedDb }: ProfileViewProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "Manager");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [resetState, setResetState] = useState("");
  const [seedState, setSeedState] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = async () => {
    setShowResetConfirm(false);
    setMaintenanceLoading(true);
    setResetState("");
    setSeedState("");
    try {
      await onResetDb();
      setResetState("All database records wiped! Your system is now a blank canvas ready for fresh custom entries.");
    } catch (err: any) {
      setError(err.message || "Failed to reset system database.");
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleSeed = () => {
    setShowSeedConfirm(true);
  };

  const handleConfirmSeed = async () => {
    setShowSeedConfirm(false);
    setMaintenanceLoading(true);
    setResetState("");
    setSeedState("");
    try {
      await onSeedDb();
      setSeedState("Demo seed records successfully re-injected. Enjoy exploring!");
    } catch (err: any) {
      setError(err.message || "Failed to seed demo records.");
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await onUpdateProfile({ name, email, avatar, role });
      setSuccess("Profile settings successfully synced to master database records.");
    } catch (err: any) {
      setError(err.message || "Failed to sync profile settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight">Manager Profile Settings</h1>
        <p className="text-slate-500 text-sm font-sans">Modify your system credentials and organizational role parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Card display preview */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center space-y-4">
          <div className="relative inline-block">
            <img 
              src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
              alt={name} 
              className="w-28 h-28 rounded-3xl object-cover mx-auto ring-4 ring-indigo-50 font-display border border-slate-200/50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1.5 right-6 bg-emerald-500 text-white p-1 rounded-full border-2 border-white" title="Active session status">
              <span className="block w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
            </div>
          </div>

          <div>
            <h3 className="font-display font-extrabold text-slate-800 text-md tracking-tight">{name || "Unnamed Manager"}</h3>
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-0.5">{role}</p>
          </div>

          <div className="pt-3 border-t border-slate-50 space-y-2 text-xs text-slate-500 text-left">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{email || "No email assigned"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>AcuStock Enterprise HQ</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Status: <span className="font-bold text-emerald-600">ACTIVE SESSION</span></span>
            </div>
          </div>
        </div>

        {/* Right column: Form editor */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-display font-bold text-slate-800 text-sm mb-4">Edit Profile Parameters</h3>

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            
            {success && (
              <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 font-semibold rounded-r-lg flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 font-semibold rounded-r-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-3.5 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Business Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-3.5 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Organizational Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-3.5 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs text-slate-700 cursor-pointer"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Inventory Manager</option>
                  <option value="Associate">Warehouse Associate</option>
                  <option value="Auditor">Security Auditor</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Avatar Display Image URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full pl-3.5 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs text-slate-700"
                />
              </div>
            </div>

            {/* Locked accounts detail warning */}
            <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-[10.5px] leading-relaxed text-slate-500 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700">Protected parameters key</p>
                <p className="mt-0.5">Password modifications are managed under federated sign-on credentials keys. Seek system IT support details to alter encryption passwords.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Parameter Settings</span>
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* System Database Maintenance / Administrative control block */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="font-display font-medium text-slate-800 text-sm flex items-center gap-2">
            <Database className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
            <span>Database Maintenance & Operations</span>
          </h2>
          <p className="text-slate-500 text-[11px] font-sans mt-0.5">
            Manage data persistence configurations. You can wipe all seed/placeholder entries to test clean real-time product entries from scratch, or re-populate the standard metrics catalog instantly.
          </p>
        </div>

        {resetState && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-semibold rounded-r-lg">
            {resetState}
          </div>
        )}

        {seedState && (
          <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-xs font-semibold rounded-r-lg">
            {seedState}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleReset}
            disabled={maintenanceLoading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4.5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Clear All Database Records & Start Fresh</span>
          </button>

          <button
            onClick={handleSeed}
            disabled={maintenanceLoading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${maintenanceLoading ? "animate-spin" : ""}`} />
            <span>Re-Populate Demo Seed Metrics</span>
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        title="CRITICAL WARNING: Wipe All System Data?"
        description="Are you absolutely sure you want to permanently clear ALL products, suppliers, inventory categories, and transaction history? This action is irreversible, and resets the system to a clean slate ready for fresh records."
        confirmText="Yes, Wipe Database"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmModal
        isOpen={showSeedConfirm}
        title="Populate Demo Seed Metrics"
        description="This will instantly load verified mock products, physical ware locations, initial supplier links, and history ledgers into the database to preview analytic operations. Proceed?"
        confirmText="Proceed"
        cancelText="Cancel"
        isDanger={false}
        onConfirm={handleConfirmSeed}
        onCancel={() => setShowSeedConfirm(false)}
      />

    </div>
  );
}
