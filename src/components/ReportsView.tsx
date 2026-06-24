import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Layers, 
  Users, 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Sparkles,
  Search,
  CheckCircle2,
  ListFilter
} from "lucide-react";
import { Product, Supplier, Movement } from "../types";

interface ReportsViewProps {
  products: Product[];
  suppliers: Supplier[];
  movements: Movement[];
}

export default function ReportsView({ products, suppliers, movements }: ReportsViewProps) {
  const [reportType, setReportType] = useState<"inventory" | "product" | "supplier" | "movement">("inventory");
  const [downloadNote, setDownloadNote] = useState("");

  const triggerDownloadNote = (message: string) => {
    setDownloadNote(message);
    setTimeout(() => {
      setDownloadNote("");
    }, 4000);
  };

  // CSV Generator Helper
  const downloadCSV = (headers: string[], rows: any[][], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" // Add UTF-8 BOM
      + [headers.join(","), ...rows.map(r => r.map(cell => {
          const str = String(cell).replace(/"/g, '""');
          return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
        }).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    triggerDownloadNote(`Successfully compiled and downloaded "${filename}" spreadsheet to your device!`);
  };

  // Report Compilation Handlers
  const handleDownloadInventory = () => {
    const headers = ["ID", "SKU Reference", "Product Name", "Category Group", "Onhand Qty", "Min Qty", "Unit Cost ($)", "Unit Price ($)", "Holding Value ($)", "Holding Cost ($)", "Location"];
    const rows = products.map(p => [
      p.id,
      p.sku,
      p.name,
      p.category,
      p.quantity,
      p.minQuantity,
      p.cost.toFixed(2),
      p.price.toFixed(2),
      (p.quantity * p.price).toFixed(2),
      (p.quantity * p.cost).toFixed(2),
      p.location
    ]);
    downloadCSV(headers, rows, "acu_inventory_report");
  };

  const handleDownloadProducts = () => {
    const headers = ["ID", "SKU", "Product Name", "Category", "UnitPrice", "UnitCost", "ProfitMargin", "WarehouseLocation", "SupplierID"];
    const rows = products.map(p => {
      const margin = p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(1) + "%" : "0%";
      return [
        p.id,
        p.sku,
        p.name,
        p.category,
        p.price.toFixed(2),
        p.cost.toFixed(2),
        margin,
        p.location,
        p.supplierId
      ];
    });
    downloadCSV(headers, rows, "acu_products_summary");
  };

  const handleDownloadSuppliers = () => {
    const headers = ["Supplier ID", "Company Name", "Representative", "Email", "Phone", "Rating (1-5)", "Categories Supplied", "Address"];
    const rows = suppliers.map(s => [
      s.id,
      s.name,
      s.contactPerson,
      s.email,
      s.phone,
      s.rating.toFixed(1),
      s.categoriesSupplied.join(" | "),
      s.address
    ]);
    downloadCSV(headers, rows, "acu_suppliers_directory");
  };

  const handleDownloadMovements = () => {
    const headers = ["Transaction ID", "Product SKU", "Product Name", "Movement Direction", "Quantity Transacted", "Date UTC", "Reason / Invoice Ref"];
    const rows = movements.map(m => {
      const p = products.find(prod => prod.id === m.productId);
      return [
        m.id,
        p ? p.sku : "UNKNOWN_SKU",
        p ? p.name : "UNKNOWN_PRODUCT",
        m.type,
        m.quantity,
        m.date,
        m.reason
      ];
    });
    downloadCSV(headers, rows, "acu_stock_ledger_history");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header and status alerts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight">System Reports Console</h1>
          <p className="text-slate-500 text-sm">Download validated financial, stocking audits, and movement snapshots.</p>
        </div>
        
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Page PDF</span>
        </button>
      </div>

      {downloadNote && (
        <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-xs rounded-r-lg font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
          <span>{downloadNote}</span>
        </div>
      )}

      {/* Selector Rails */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Inventory balance card */}
        <button
          onClick={() => setReportType("inventory")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${reportType === "inventory" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50"}`}
        >
          <Layers className="w-5 h-5 mb-2" />
          <h4 className="text-xs font-bold font-sans">Valuation Report</h4>
          <p className={`text-[10px] mt-0.5 ${reportType === "inventory" ? "text-indigo-100" : "text-slate-400"}`}>Stock value balances</p>
        </button>

        {/* Product specs card */}
        <button
          onClick={() => setReportType("product")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${reportType === "product" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50"}`}
        >
          <FileSpreadsheet className="w-5 h-5 mb-2" />
          <h4 className="text-xs font-bold font-sans">Product Summaries</h4>
          <p className={`text-[10px] mt-0.5 ${reportType === "product" ? "text-indigo-100" : "text-slate-400"}`}>Profit margin indexes</p>
        </button>

        {/* Supplier analytics card */}
        <button
          onClick={() => setReportType("supplier")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${reportType === "supplier" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50"}`}
        >
          <Users className="w-5 h-5 mb-2" />
          <h4 className="text-xs font-bold font-sans">Sourcing Directory</h4>
          <p className={`text-[10px] mt-0.5 ${reportType === "supplier" ? "text-indigo-100" : "text-slate-400"}`}>Supplier performance records</p>
        </button>

        {/* Ledger logs card */}
        <button
          onClick={() => setReportType("movement")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${reportType === "movement" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50"}`}
        >
          <History className="w-5 h-5 mb-2" />
          <h4 className="text-xs font-bold font-sans">Ledger History</h4>
          <p className={`text-[10px] mt-0.5 ${reportType === "movement" ? "text-indigo-100" : "text-slate-400"}`}> granular movement trails</p>
        </button>

      </div>

      {/* Main Preview Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 print:border-none print:shadow-none">
        
        {/* Preview headers info */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-50">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm capitalize">
              {reportType} Report - Interactive Report Preview
            </h3>
            <p className="text-[11px] text-slate-400">Review compiled data variables prior to spreadsheet compilation exports.</p>
          </div>

          <button
            onClick={() => {
              if (reportType === "inventory") handleDownloadInventory();
              if (reportType === "product") handleDownloadProducts();
              if (reportType === "supplier") handleDownloadSuppliers();
              if (reportType === "movement") handleDownloadMovements();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Spreadsheet</span>
          </button>
        </div>

        {/* Dynamically Loaded Table Content depending on current active selector tab */}
        {reportType === "inventory" && (
          <div className="space-y-4">
            
            {/* Meta summary metrics row */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono text-xs">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">Total Items count</span>
                <span className="font-bold text-slate-800">{products.reduce((acc, p) => acc + p.quantity, 0)} units</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">Active Categories</span>
                <span className="font-bold text-slate-800">{new Set(products.map(p => p.category)).size} groups</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">Total Capital Assets Costed</span>
                <span className="font-bold text-slate-800">${products.reduce((sum, p) => sum + (p.quantity * p.cost), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">Assets Valuation Retail</span>
                <span className="font-bold text-indigo-600">${products.reduce((sum, p) => sum + (p.quantity * p.price), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="py-3 px-4">SKU Code</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Qty</th>
                    <th className="py-3 px-4 text-right">Cost ($)</th>
                    <th className="py-3 px-4 text-right">Price ($)</th>
                    <th className="py-3 px-4 text-right">Valuation ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-mono text-slate-600">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/40">
                      <td className="py-2.5 px-4 font-bold text-indigo-700">{p.sku}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-700 font-medium">{p.name}</td>
                      <td className="py-2.5 px-4 font-sans text-[11px]">{p.category}</td>
                      <td className="py-2.5 px-4 text-right font-bold">{p.quantity}</td>
                      <td className="py-2.5 px-4 text-right">${p.cost.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right">${p.price.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-800">${(p.quantity * p.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === "product" && (
          <div className="space-y-4">
            
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Unit Cost</th>
                    <th className="py-3 px-4 text-right">Gross Profit</th>
                    <th className="py-3 px-4">Whse Aisle Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-sans text-slate-600">
                  {products.map(p => {
                    const margin = p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/40">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{p.sku}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-700">{p.name}</td>
                        <td className="py-2.5 px-4 text-[11px]">{p.category}</td>
                        <td className="py-2.5 px-4 text-right font-mono">${p.price.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono">${p.cost.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">{margin}% Marg.</td>
                        <td className="py-2.5 px-4 text-slate-500 font-medium italic">{p.location}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === "supplier" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Supplier Name</th>
                    <th className="py-3 px-4">Business Email</th>
                    <th className="py-3 px-4">Phone Line</th>
                    <th className="py-3 px-4">Representative</th>
                    <th className="py-3 px-4">Rating Index</th>
                    <th className="py-3 px-4">Supplied Categories</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 text-slate-600">
                  {suppliers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/40">
                      <td className="py-2.5 px-4 font-bold text-slate-800">{s.name}</td>
                      <td className="py-2.5 px-4 font-mono">{s.email}</td>
                      <td className="py-2.5 px-4 font-mono">{s.phone}</td>
                      <td className="py-2.5 px-4">{s.contactPerson}</td>
                      <td className="py-2.5 px-4 font-mono text-amber-650 font-bold">⭐ {s.rating.toFixed(1)}</td>
                      <td className="py-2.5 px-4 flex flex-wrap gap-1 max-w-[200px] overflow-hidden truncate">
                        {s.categoriesSupplied.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === "movement" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-5">Ref ID</th>
                    <th className="py-3 px-4">Commodity name</th>
                    <th className="py-3 px-4">Movement direction</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4">Date stamp UTC</th>
                    <th className="py-3 px-4">Invoice / Adjustment Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 font-sans text-slate-600">
                  {movements.slice(-15).map(m => {
                    const associatedProd = products.find(p => p.id === m.productId);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/40">
                        <td className="py-2.5 px-5 font-mono text-slate-400">{m.id}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-700">{associatedProd ? associatedProd.name : "N/A SKU Ref"}</td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${m.type === 'IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {m.type === 'IN' ? 'STOCK-IN' : 'STOCK-OUT'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold pr-8">{m.quantity}</td>
                        <td className="py-2.5 px-4 font-mono text-[10px]">{new Date(m.date).toLocaleString()}</td>
                        <td className="py-2.5 px-4 italic text-slate-500 max-w-[200px] truncate">{m.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
