import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  ChevronRight, 
  AlertTriangle, 
  Activity, 
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Cpu
} from "lucide-react";
import { AIInsights, Product } from "../types";

interface AiInsightsViewProps {
  products: Product[];
  onTriggerRestock: (productId: string) => void;
}

export default function AiInsightsView({ products, onTriggerRestock }: AiInsightsViewProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAiInsights = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setInsights(data);
    } catch (err: any) {
      setError("Failed to run Gemini AI optimizations handshake. Please ensure server is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Look in sessionStorage for cached insights first to prevent excessive API requests
    const cached = sessionStorage.getItem("acu_ai_insights");
    if (cached) {
      try {
        setInsights(JSON.parse(cached));
      } catch (e) {
        fetchAiInsights();
      }
    } else {
      fetchAiInsights();
    }
  }, []);

  useEffect(() => {
    if (insights) {
      sessionStorage.setItem("acu_ai_insights", JSON.stringify(insights));
    }
  }, [insights]);

  const handleRefresh = () => {
    fetchAiInsights();
  };

  return (
    <div className="space-y-6">
      
      {/* Header and trigger buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
            <span>Gemini AI Business Advisor</span>
          </h1>
          <p className="text-slate-500 text-sm">Automated demand forecasting, inventory reorder weights, and capital-flow optimizations.</p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl text-xs transition-all shadow-md cursor-pointer select-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Recalculate Models</span>
        </button>
      </div>

      {loading && (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-40 scale-150" />
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl relative z-10 text-indigo-600">
              <Cpu className="w-8 h-8 animate-spin" />
            </div>
          </div>
          <h3 className="font-display font-bold text-slate-800 mt-6 text-base tracking-tight">Consulting Google Gemini 3.5 Flash...</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm leading-relaxed mx-auto">
            Correlating on-hand stock parameters, category groups, sourcing directories, and ledger dispatch velocities to construct optimization guidelines.
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-semibold rounded-r-xl">
          {error}
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-6">
          
          {/* Top section: Business Suggestions */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 relative overflow-hidden border border-slate-800/80 shadow-lg">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-semibold text-white text-sm">Strategic Business Suggestions</h3>
            </div>

            <div className="relative z-10 space-y-3.5">
              {insights.businessSuggestions && insights.businessSuggestions.length > 0 ? (
                insights.businessSuggestions.map((sug, idx) => (
                  <div key={idx} className="flex gap-3 text-xs leading-relaxed text-indigo-100">
                    <span className="text-emerald-400 font-bold font-mono">0{idx + 1}.</span>
                    <p className="flex-1">{sug}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-indigo-200">System registers high operational stability indexes. No action advised.</p>
              )}
            </div>

            <div className="relative z-10 pt-4 mt-4 border-t border-indigo-800/40 text-[9px] text-indigo-300 font-mono flex items-center justify-between">
              <span>Source: {insights.meta?.generatedBy || "Local System Analyser"}</span>
              <span>Updated: {new Date(insights.meta?.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* Grid section: Replenishments & Forecast matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Restocking prioritized plan */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-50 mb-4">
                  <div>
                    <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                      <ShieldAlert className="w-4.5 h-4.5 text-indigo-600" />
                      <span>Sourcing Replenishment Matrix</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Prioritized acquisitions planning</p>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full font-mono">
                    {insights.restockingRecommendations?.length || 0} priority records
                  </span>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {insights.restockingRecommendations && insights.restockingRecommendations.length > 0 ? (
                    insights.restockingRecommendations.map((rec) => {
                      const isCritical = rec.priority === "CRITICAL";
                      const isHigh = rec.priority === "HIGH";
                      return (
                        <div 
                          key={rec.id} 
                          className={`p-4 border rounded-2xl transition-all ${
                            isCritical 
                              ? "bg-red-50/50 border-red-200/50" 
                              : isHigh 
                              ? "bg-amber-50/40 border-amber-200/50" 
                              : "bg-slate-50/50 border-slate-200/50"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{rec.name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                SKU: <span className="font-semibold text-slate-600">{rec.sku}</span> • On-Hand: <span className="font-bold">{rec.currentStock}</span> (Safeguard min: {rec.minQuantity})
                              </p>
                            </div>

                            <span className={`text-[9px] font-extrabold font-mono px-2 py-0.5 rounded uppercase ${
                              isCritical 
                                ? "bg-red-500 text-white animate-pulse" 
                                : isHigh 
                                ? "bg-amber-500 text-white" 
                                : "bg-indigo-100 text-indigo-700"
                            }`}>
                              {rec.priority}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-normal mt-2 italic font-sans">
                            {rec.recommendation}
                          </p>

                          <div className="mt-3.5 pt-2 border-t border-slate-100/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>Sourcing: <span className="font-bold text-slate-600">{rec.supplierName}</span></span>
                            <span>Vendor Lead: <span className="font-bold text-slate-600">{rec.leadTimeDays} days</span></span>
                          </div>

                          {rec.id !== "all" && products.some(p => p.id === rec.id) && (
                            <div className="mt-3 text-right">
                              <button
                                onClick={() => {
                                  onTriggerRestock(rec.id);
                                }}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-xs cursor-pointer select-none"
                              >
                                Trigger Sourcing Order
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      ✨ Sourcing lanes clear. All SKU replenishment queues are empty.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Demand forecasting table */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-50 mb-4">
                  <div>
                    <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                      <TrendingUp className="w-4.5 h-4.5 text-indigo-600" />
                      <span>Expected Demand Forecasting</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">30-day projection profiles</p>
                  </div>
                </div>

                <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                  {insights.forecasts && insights.forecasts.length > 0 ? (
                    insights.forecasts.map((f, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">{f.name}</h4>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                            SKU ref: <span className="font-semibold text-slate-600">{f.sku}</span> • Confidence Rate: <span className="text-emerald-600 font-bold">{f.confidenceRate}%</span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                            {f.nextMonthExpectedQty} units
                          </span>
                          <span className="block text-[9px] text-slate-400 mt-1 font-sans font-semibold text-rose-500 uppercase tracking-tight">
                            {f.trendState}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No demand predictions cataloged.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
