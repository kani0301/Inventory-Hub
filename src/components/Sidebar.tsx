import React from "react";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  History, 
  Sparkles, 
  FileSpreadsheet, 
  LogOut, 
  Building2,
  Menu,
  X,
  User,
  AlertTriangle
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
  lowStockCount: number;
}

export default function Sidebar({ currentTab, onChangeTab, user, onLogout, lowStockCount }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Inventory Products", icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: "suppliers", label: "Suppliers Directory", icon: Users },
    { id: "movements", label: "Stock Ledger", icon: History },
    { id: "ai", label: "Gemini AI Advisor", icon: Sparkles, highlight: true },
    { id: "reports", label: "Reports Console", icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Mobile Header Tracker Toggle */}
      <div className="lg:hidden bg-white border-b border-slate-200 text-slate-800 p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <span className="font-display font-bold tracking-tight text-md text-slate-900">AcuStock System</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors focus:outline-none"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white text-slate-800 flex flex-col justify-between
        transform lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out border-r border-slate-200
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div>
          {/* Logo Brand Segment */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-800 font-display">AcuStock</span>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">v3.5 Enterprise</p>
              </div>
            </div>
            {/* Close button for mobile inside sidebar */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group duration-150 cursor-pointer
                    ${isActive 
                      ? "bg-indigo-50 text-indigo-600 font-semibold" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`
                      w-4.5 h-4.5 transition-colors
                      ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}
                      ${item.highlight ? "text-amber-500 animate-pulse" : ""}
                    `} />
                    <span className="font-sans">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200/50 font-mono">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {item.badge}
                    </span>
                  )}
                  
                  {item.highlight && !isActive && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">
                      AI Advise
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gemini AI Insight Block */}
        <div className="p-4 mb-4 mx-4 bg-slate-900 rounded-2xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-400 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Gemini AI Insight</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-80">
            Demand for inventory SKU records is forecasted server-side. Restocks are prioritized in real-time.
          </p>
        </div>

        {/* User Account Details Panel */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
              alt={user?.name || "Member avatar"} 
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/10 filter saturate-110"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate font-display">{user?.name || "Alex Mercer"}</p>
              <button 
                onClick={() => onChangeTab("profile")}
                className="text-[10px] text-indigo-600 hover:text-indigo-700 font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <User className="w-2.5 h-2.5" />
                Edit Profile
              </button>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 hover:border-red-500/20 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-semibold transition-all duration-150 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>

      {/* Backdrop overlay for mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}
    </>
  );
}
