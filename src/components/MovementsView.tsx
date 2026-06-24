import React, { useState } from "react";
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  X, 
  FileText, 
  Calendar,
  Layers,
  ChevronDown
} from "lucide-react";
import { Movement, Product } from "../types";

interface MovementsViewProps {
  movements: Movement[];
  products: Product[];
}

export default function MovementsView({ movements, products }: MovementsViewProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All"); // All, IN, OUT
  const [productFilter, setProductFilter] = useState("All"); // All, product-id

  // Compile unique products found inside movements lists
  const activeMovementProducts = Array.from(new Set(movements.map(m => m.productId)))
    .map(id => products.find(p => p.id === id))
    .filter(p => p !== undefined) as Product[];

  const filteredMovements = movements.filter(m => {
    const p = products.find(prod => prod.id === m.productId);
    const pName = p ? p.name.toLowerCase() : "";
    const pSku = p ? p.sku.toLowerCase() : "";
    const mReason = m.reason.toLowerCase();

    const matchesSearch = pName.includes(search.toLowerCase()) || 
                          pSku.includes(search.toLowerCase()) || 
                          mReason.includes(search.toLowerCase());

    const matchesType = typeFilter === "All" || m.type === typeFilter;
    
    const matchesProduct = productFilter === "All" || m.productId === productFilter;

    return matchesSearch && matchesType && matchesProduct;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight">Stock Movement Ledger</h1>
        <p className="text-slate-500 text-sm">Review full granular audit history logs for intake, dispatch, and physical adjustments.</p>
      </div>

      {/* Sifting Rails */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3 items-center">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search movements by product name, SKU, or invoice references..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
          />
        </div>

        {/* Action Type */}
        <div className="w-full md:w-44">
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs appearance-none py-2.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Actions</option>
              <option value="IN">Intake (IN)</option>
              <option value="OUT">Release (OUT)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Specific Product Target */}
        <div className="w-full md:w-56 col-span-2">
          <div className="relative">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full text-xs appearance-none py-2.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer text-ellipsis truncate"
            >
              <option value="All">Filter by: All Products</option>
              {activeMovementProducts.map(p => (
                <option key={p.id} value={p.id}>{p.sku} - {p.name.substring(0, 20)}...</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Audit Table Listing */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-5">Movement Reference</th>
                <th className="py-4 px-4">Commodity Product</th>
                <th className="py-4 px-4">Action Type</th>
                <th className="py-4 px-4 text-right">Quantity transacted</th>
                <th className="py-4 px-4">Ledger Reason</th>
                <th className="py-4 px-5">Timestamp UTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 text-xs">
              {filteredMovements.length > 0 ? (
                [...filteredMovements].reverse().map((m) => {
                  const associatedProduct = products.find(p => p.id === m.productId);
                  const isIncoming = m.type === "IN";
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Movement Reference ID */}
                      <td className="py-3 px-5 font-mono text-slate-400">
                        {m.id}
                      </td>

                      {/* Product details */}
                      <td className="py-3 px-4">
                        {associatedProduct ? (
                          <div className="flex items-center gap-3">
                            <img 
                              src={associatedProduct.imageUrl} 
                              alt="" 
                              className="w-8 h-8 rounded-lg object-cover bg-slate-100 border border-slate-200/50"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 leading-tight block truncate max-w-[200px]">
                                {associatedProduct.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                                SKU: {associatedProduct.sku}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Target product SKU removed</span>
                        )}
                      </td>

                      {/* Movement Direction Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold leading-none ${isIncoming ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                          {isIncoming ? (
                            <>
                              <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                              <span>STOCK IN</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                              <span>STOCK OUT</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Movement Quantity */}
                      <td className="py-3 px-4 text-right font-mono font-extrabold pr-8">
                        <span className={isIncoming ? "text-emerald-600" : "text-red-500"}>
                          {isIncoming ? "+" : "-"}{m.quantity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal font-sans ml-1">qty</span>
                      </td>

                      {/* Document Reason */}
                      <td className="py-3 px-4 text-slate-600 max-w-[220px] truncate leading-tight">
                        {m.reason}
                      </td>

                      {/* Date Stamp */}
                      <td className="py-3 px-5 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                        {new Date(m.date).toLocaleString()}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No movement transaction ledgers match filtered tags.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
