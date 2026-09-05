import { Settings, Shield, LogOut, ShieldCheck, Mail, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();

  const displayName = user?.name || 'Chittlu Sai';
  const displayEmail = user?.email || 'chittlusai@gmail.com';
  const displayRole = user?.role || 'Cybersecurity Analyst (Lead)';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Defender Profile & Security Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage authenticated credentials, multi-factor tokens, and account policies.</p>
      </div>

      {/* User Info Card */}
      <div className="card bg-white border border-slate-200 shadow-sm p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-400 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{displayName}</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <ShieldCheck size={12} /> MFA Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-mono mt-0.5 flex items-center gap-1.5 truncate">
              <Mail size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{displayEmail}</span>
            </p>
            <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mt-1">
              {displayRole}
            </p>
          </div>
        </div>

        <button
          onClick={() => { logout(); window.location.href = '/'; }}
          className="btn-secondary text-xs px-4 py-2 text-red-600 border-red-200 hover:bg-red-50 flex items-center justify-center gap-1.5 cursor-pointer font-bold shrink-0 w-full sm:w-auto min-h-[40px]"
        >
          <LogOut size={14} /> End Session
        </button>
      </div>

      {/* Security Telemetry Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">AUTHENTICATION LEVEL</span>
          <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <KeyRound size={15} className="text-orange-500" />
            2FA / OTP Enforced
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">SESSION PERSISTENCE</span>
          <div className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
            <ShieldCheck size={15} />
            Hardware Encrypted
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">LAST LOGIN TELEMETRY</span>
          <div className="text-sm font-mono text-slate-700 mt-1">
            {user?.lastLogin || 'Today (Active)'}
          </div>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-white border border-slate-200 p-5 rounded-2xl hover:border-orange-300 transition-all cursor-pointer group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">Account Credentials</h3>
              <p className="text-xs text-slate-500">Update display name, password, or security questions.</p>
            </div>
          </div>
        </div>

        <div className="card bg-white border border-slate-200 p-5 rounded-2xl hover:border-emerald-300 transition-all cursor-pointer group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Zero-Trust Policies</h3>
              <p className="text-xs text-slate-500">Manage IP allowlists, scan logging retention, and MFA codes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
