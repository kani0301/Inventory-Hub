import React from "react";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronRight,
  Boxes,
  MapPin,
  Clock,
  Sparkles
} from "lucide-react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement 
} from "chart.js";
import { Product, Supplier, Movement } from "../types";

// Register Chart.js elements
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement
);

interface DashboardViewProps {
  products: Product[];
  suppliers: Supplier[];
  movements: Movement[];
  onChangeTab: (tab: string) => void;
  onQuickRestock: (productId: string) => void;
}

export default function DashboardView({ products, suppliers, movements, onChangeTab, onQuickRestock }: DashboardViewProps) {
  
  // Calculate high-level dashboard metrics
  const totalProducts = products.length;
  
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const totalInventoryCost = products.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
  const averageMargin = totalInventoryValue > 0 
    ? ((totalInventoryValue - totalInventoryCost) / totalInventoryValue * 100) 
    : 0;

  const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);
  const lowStockCount = lowStockProducts.length;

  const totalSuppliers = suppliers.length;

  // Compile Chart 1: Harmonious Product Distribution by Category (Doughnut)
  const categoriesMap = products.reduce((acc: Record<string, number>, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const categoryLabels = Object.keys(categoriesMap);
  const categoryCounts = Object.values(categoriesMap);

  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        label: "Products",
        data: categoryCounts,
        backgroundColor: [
          "#4F46E5", // Deep indigo
          "#10B981", // Emerald green
          "#F59E0B", // Amber
          "#3B82F6", // Classic blue
          "#8B5CF6", // Purple
          "#EC4899", // Pink
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 4,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: { family: "Inter", size: 11 },
          color: "#475569",
          padding: 10,
          boxWidth: 12,
        }
      },
      tooltip: {
        titleFont: { family: "Inter" },
        bodyFont: { family: "Inter" },
      }
    }
  };

  // Compile Chart 2: Product stock vs threshold comparison (Bar)
  const topStockedProducts = [...products]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const barData = {
    labels: topStockedProducts.map(p => p.sku || p.name.substring(0, 10)),
    datasets: [
      {
        label: "On-Hand Stock",
        data: topStockedProducts.map(p => p.quantity),
        backgroundColor: "rgba(79, 70, 229, 0.85)", // Indigo
        borderRadius: 6,
      },
      {
        label: "Safety Level (Min)",
        data: topStockedProducts.map(p => p.minQuantity),
        backgroundColor: "rgba(245, 158, 11, 0.85)", // Amber
        borderRadius: 6,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { font: { family: "Inter", size: 11 }, color: "#475569" }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "Inter", size: 10 } } },
      y: { grid: { color: "#f1f5f9" }, ticks: { font: { family: "Inter", size: 10 } } }
    }
  };

  // Compile Chart 3: Stock Movements History Line (IN vs OUT) over recent 7 days
  // Group recent movements
  const recentDays = Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    })
    .reverse();

  const dayInGroup: Record<string, number> = {};
  const dayOutGroup: Record<string, number> = {};

  recentDays.forEach(day => {
    dayInGroup[day] = 0;
    dayOutGroup[day] = 0;
  });

  movements.forEach(m => {
    const day = m.date.split("T")[0];
    if (dayInGroup[day] !== undefined) {
      if (m.type === "IN") dayInGroup[day] += m.quantity;
      if (m.type === "OUT") dayOutGroup[day] += m.quantity;
    }
  });

  const lineData = {
    labels: recentDays.map(d => {
      const parts = d.split("-");
      return `${parts[1]}/${parts[2]}`;
    }),
    datasets: [
      {
        label: "Stock Incoming (Qty)",
        data: recentDays.map(day => dayInGroup[day]),
        borderColor: "#10B981", // Emerald
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#10B981",
      },
      {
        label: "Stock Outgoing (Qty)",
        data: recentDays.map(day => dayOutGroup[day]),
        borderColor: "#ef4444", // Red
        backgroundColor: "rgba(239, 68, 68, 0.05)",
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#ef4444",
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { font: { family: "Inter", size: 11 }, color: "#475569" }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "Inter", size: 10 } } },
      y: { grid: { color: "#f1f5f9" }, ticks: { font: { family: "Inter", size: 10 } } }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with smart status greetings */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight">Enterprise Overview</h1>
          <p className="text-slate-500 text-sm">Real-time inventory metrics, system operations, and automated parameters.</p>
        </div>
        <button
          onClick={() => onChangeTab("ai")}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Ask Gemini AI Assistant</span>
        </button>
      </div>

      {/* Metrics Grid Cards with exact specified multi-color premium gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Products (Indigo Gradient) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg border border-indigo-200/15">
          <div className="absolute right-3 top-3 opacity-15">
            <Package className="w-16 h-16" />
          </div>
          <span className="text-xs text-indigo-100 font-medium uppercase tracking-wider">Total Products</span>
          <div className="mt-2 font-display text-3xl font-extrabold font-mono text-white">
            {totalProducts}
          </div>
          <p className="text-[10px] text-indigo-100/80 mt-1 flex items-center gap-1">
            <span>Aggregated SKUs</span>
          </p>
        </div>

        {/* Inventory Value (Emerald Gradient) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg border border-emerald-200/15">
          <div className="absolute right-3 top-3 opacity-15">
            <TrendingUp className="w-16 h-16" />
          </div>
          <span className="text-xs text-emerald-100 font-medium uppercase tracking-wider">Valuation (Retail)</span>
          <div className="mt-2 font-display text-3xl font-extrabold font-mono text-white">
            ${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-emerald-100/80 mt-1 flex items-center gap-1">
            <span>Avg margin: </span>
            <span className="font-bold">{averageMargin.toFixed(1)}%</span>
          </p>
        </div>

        {/* Low Stock (Amber Gradient) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg border border-amber-200/15">
          <div className="absolute right-3 top-3 opacity-15">
            <AlertTriangle className="w-16 h-16" />
          </div>
          <span className="text-xs text-amber-100 font-medium uppercase tracking-wider">Low Stock SKUs</span>
          <div className="mt-2 font-display text-3xl font-extrabold font-mono text-white">
            {lowStockCount}
          </div>
          <button 
            onClick={() => onChangeTab("products")}
            className="text-[10px] text-amber-100/90 font-bold underline mt-1 block cursor-pointer hover:text-white"
          >
            {lowStockCount > 0 ? "Inspect low-stock warnings" : "Review safety parameters"}
          </button>
        </div>

        {/* Suppliers (Blue Gradient) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white shadow-lg border border-blue-200/15">
          <div className="absolute right-3 top-3 opacity-15">
            <Users className="w-16 h-16" />
          </div>
          <span className="text-xs text-blue-100 font-medium uppercase tracking-wider">Active Suppliers</span>
          <div className="mt-2 font-display text-3xl font-extrabold font-mono text-white">
            {totalSuppliers}
          </div>
          <p className="text-[10px] text-blue-100/80 mt-1">
            <span>Trusted dispatch routes</span>
          </p>
        </div>

        {/* Reports (Purple Gradient) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-2xl p-5 text-white shadow-lg border border-purple-200/15">
          <div className="absolute right-3 top-3 opacity-15">
            <Boxes className="w-16 h-16" />
          </div>
          <span className="text-xs text-purple-100 font-medium uppercase tracking-wider">Reports Console</span>
          <div className="mt-2 font-display text-2xl font-bold uppercase text-white py-1">
            Exports
          </div>
          <button
            onClick={() => onChangeTab("reports")}
            className="text-[10px] text-purple-100/90 font-bold underline mt-1 block cursor-pointer hover:text-white"
          >
            Open Download Center
          </button>
        </div>

      </div>

      {/* Interactive Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Product categories distribution chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Product Categories</h3>
            <p className="text-[11px] text-slate-400">Inventory division by product group</p>
          </div>
          <div className="h-60 mt-4 relative flex items-center justify-center">
            {categoryLabels.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <p className="text-xs text-slate-400">No products entered yet.</p>
            )}
          </div>
        </div>

        {/* Stock levels bar chart comparison */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Threshold Analysis</h3>
            <p className="text-[11px] text-slate-400">On-hand stock levels vs. safe safety thresholds</p>
          </div>
          <div className="h-60 mt-4">
            {products.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No products to analyze threshold markers.
              </div>
            )}
          </div>
        </div>

        {/* Line graph for historical inventory movements */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">Historical Movements</h3>
            <p className="text-[11px] text-slate-400">Overall Intake (IN) vs Dispatch (OUT) volumes</p>
          </div>
          <div className="h-60 mt-4">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

      </div>

      {/* Critical Stock Alerts & Recent movements layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Low Stock Warning Alerts (Left) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Low-Stock Operations Alerts</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Below critical safety reserve thresholds</p>
            </div>
            <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
              {lowStockCount} alert{lowStockCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-red-50/50 border border-red-100/50 rounded-xl transition-all hover:bg-red-50">
                  <div className="flex items-center gap-3">
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        SKU: <span className="font-semibold text-slate-600">{p.sku}</span> • Stock: <span className="text-red-600 font-bold">{p.quantity}</span> / Min: {p.minQuantity}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onQuickRestock(p.id)}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-xs cursor-pointer select-none whitespace-nowrap"
                  >
                    Quick Restock
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                ✨ Zero inventory safety anomalies. All levels balanced.
              </div>
            )}
          </div>
        </div>

        {/* Recent Ledger Transactions Timeline (Right) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
            <div>
              <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Recent Ledger Transactions</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Stock state movements audit stream</p>
            </div>
            <button 
              onClick={() => onChangeTab("movements")}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Inspect full ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
            {movements.length > 0 ? (
              [...movements].reverse().slice(0, 5).map((m) => {
                const associatedProduct = products.find(p => p.id === m.productId);
                const isIncoming = m.type === "IN";
                return (
                  <div key={m.id} className="flex justify-between items-start gap-4 p-2.5 hover:bg-slate-50 rounded-xl transition-all">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${isIncoming ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                        {isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 leading-snug truncate">
                          {associatedProduct ? associatedProduct.name : "Unknown Ref SKU"}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-sans italic truncate">
                          Reason: {m.reason}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {new Date(m.date).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-xs font-extrabold font-mono ${isIncoming ? "text-emerald-600" : "text-red-500"}`}>
                        {isIncoming ? "+" : "-"}{m.quantity}
                      </span>
                      <p className="text-[9px] text-slate-400 font-mono tracking-tighter">units</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No ledger transactions recorded yet.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
