import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Eye, 
  AlertTriangle,
  ArrowUpDown,
  MoreVertical,
  MinusCircle,
  PlusCircle,
  X,
  Boxes,
  MapPin,
  TrendingDown,
  ChevronDown
} from "lucide-react";
import { Product, Supplier } from "../types";
import ConfirmModal from "./ConfirmModal";

interface ProductsViewProps {
  products: Product[];
  suppliers: Supplier[];
  onAddProduct: (productData: any) => Promise<any>;
  onEditProduct: (id: string, productData: any) => Promise<any>;
  onDeleteProduct: (id: string) => Promise<any>;
  onAdjustStock: (productId: string, type: "IN" | "OUT", quantity: number, reason: string) => Promise<any>;
}

export default function ProductsView({ 
  products, 
  suppliers, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct,
  onAdjustStock
}: ProductsViewProps) {
  
  // Search and Filter State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stockStatus, setStockStatus] = useState("All"); // All, Low, Out
  const [sortBy, setSortBy] = useState("name"); // name, sku, quantity, price

  // UI state for forms/drawers
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"ADD" | "EDIT">("ADD");

  // Adjustment overlay State
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustType, setAdjustType] = useState<"IN" | "OUT">("IN");
  const [adjustReason, setAdjustReason] = useState("");

  // Product Form Input bindings
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [quantity, setQuantity] = useState(1);
  const [minQuantity, setMinQuantity] = useState(10);
  const [price, setPrice] = useState(0.0);
  const [cost, setCost] = useState(0.0);
  const [supplierId, setSupplierId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [formError, setFormError] = useState("");
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  // Category listing helper
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // Map Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          p.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    
    let matchesStock = true;
    if (stockStatus === "Low") {
      matchesStock = p.quantity <= p.minQuantity;
    } else if (stockStatus === "Out") {
      matchesStock = p.quantity === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "sku") return a.sku.localeCompare(b.sku);
    if (sortBy === "quantity") return b.quantity - a.quantity;
    if (sortBy === "price") return b.price - a.price;
    return 0;
  });

  const handleOpenAddForm = () => {
    setFormMode("ADD");
    setName("");
    setSku("");
    setCategory("Electronics");
    setQuantity(1);
    setMinQuantity(10);
    setPrice(0.0);
    setCost(0.0);
    setSupplierId(suppliers[0]?.id || "");
    setImageUrl("");
    setDescription("");
    setLocation("Aisle 1, Rack A");
    setFormError("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (p: Product) => {
    setFormMode("EDIT");
    setActiveProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setQuantity(p.quantity);
    setMinQuantity(p.minQuantity);
    setPrice(p.price);
    setCost(p.cost);
    setSupplierId(p.supplierId);
    setImageUrl(p.imageUrl);
    setDescription(p.description);
    setLocation(p.location);
    setFormError("");
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name || !sku || !category || !supplierId) {
      setFormError("All required product fields must be filled!");
      return;
    }

    const payload = {
      name,
      sku,
      category,
      quantity,
      minQuantity,
      price,
      cost,
      supplierId,
      imageUrl,
      description,
      location
    };

    try {
      if (formMode === "ADD") {
        await onAddProduct(payload);
      } else if (formMode === "EDIT" && activeProduct) {
        await onEditProduct(activeProduct.id, payload);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to persist product record.");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteProductId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteProductId) {
      try {
        await onDeleteProduct(deleteProductId);
        setIsDetailOpen(false);
      } catch (err: any) {
        alert(err.message || "Failed to delete product record");
      } finally {
        setDeleteProductId(null);
      }
    }
  };

  const handleOpenAdjust = (p: Product, type: "IN" | "OUT") => {
    setActiveProduct(p);
    setAdjustType(type);
    setAdjustQty(1);
    setAdjustReason(type === "IN" ? "Restock Ingestion" : "Order Dispatch Release");
    setIsAdjustOpen(true);
  };

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    try {
      await onAdjustStock(activeProduct.id, adjustType, adjustQty, adjustReason);
      setIsAdjustOpen(false);
    } catch (err: any) {
      alert(err.message || "Insufficient on-hand stock coordinates!");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight">Inventory Products</h1>
          <p className="text-slate-500 text-sm">Add, audit, modify, and adjust real-time business commodities.</p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product SKU</span>
        </button>
      </div>

      {/* Database Search Filter Rails */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3 items-center">
        
        {/* Keyword Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by product SKU, name, or aisle location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
          />
        </div>

        {/* Category Filtration */}
        <div className="w-full md:w-48">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs appearance-none py-2.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat} Group</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Stock status warnings selection */}
        <div className="w-full md:w-48">
          <div className="relative">
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full text-xs appearance-none py-2.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Levels</option>
              <option value="Low">Low Stock Warnings</option>
              <option value="Out">Out of Stock</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Sorting selection */}
        <div className="w-full md:w-44">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs appearance-none py-2.5 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="sku">Sort by SKU</option>
              <option value="quantity">Stock Amount</option>
              <option value="price">Retails Value</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Main Grid Inventory Displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(p => {
            const isLow = p.quantity <= p.minQuantity;
            const supplier = suppliers.find(s => s.id === p.supplierId);
            return (
              <div 
                key={p.id} 
                className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-indigo-100 p-4.5 flex flex-col justify-between transition-all group scale-100 hover:scale-[1.01]"
              >
                <div>
                  
                  {/* Top image & status alert */}
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100/50">
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      className="w-full h-full object-cover filter saturate-110"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Status badge */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                      <span className="bg-slate-900/80 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-xs">
                        {p.category}
                      </span>
                      {isLow && (
                        <span className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>LOW STOCK</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-slate-900/60 text-white font-mono text-xs font-semibold px-2 py-0.5 rounded-lg backdrop-blur-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{p.location}</span>
                    </div>
                  </div>

                  {/* Core details */}
                  <div className="mt-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-display font-bold text-slate-900 text-sm group-hover:text-indigo-600 truncate transition-colors">
                        {p.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>SKU:</span>
                      <span className="font-semibold text-slate-600">{p.sku}</span>
                    </div>

                    {/* Stock level count progress line */}
                    <div className="mt-4 bg-slate-100 h-2 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${isLow ? "bg-amber-500" : "bg-emerald-500"}`} 
                        style={{ width: `${Math.min((p.quantity / (p.minQuantity * 2)) * 100, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-[10px] text-slate-400 font-mono font-medium">
                        On-Hand: <span className={`font-bold ${isLow ? "text-amber-500" : "text-slate-700"}`}>{p.quantity}</span> / Min: {p.minQuantity}
                      </span>
                      <span className="text-xs font-extrabold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        ${p.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Lower interaction controls */}
                <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between gap-1">
                  
                  {/* Detailed view */}
                  <button
                    onClick={() => {
                      setActiveProduct(p);
                      setIsDetailOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Stock OUT */}
                    <button
                      onClick={() => handleOpenAdjust(p, "OUT")}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all cursor-pointer"
                      title="Stock OUT adjustment"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                    {/* Stock IN */}
                    <button
                      onClick={() => handleOpenAdjust(p, "IN")}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all cursor-pointer"
                      title="Stock IN adjustment"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                    {/* Edit properties */}
                    <button
                      onClick={() => handleOpenEditForm(p)}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all cursor-pointer"
                      title="Edit Product properties"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {/* Delete Product */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id);
                      }}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all cursor-pointer"
                      title="Permanently Delete SKU"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="md:col-span-3 py-16 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
            <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>No products match your current filters.</p>
          </div>
        )}
      </div>

      {/* ================= MODAL DRAWER 1: VIEW DETAILS ================= */}
      {isDetailOpen && activeProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-lg leading-tight uppercase">
                Product Specifications
              </span>
              <button 
                onClick={() => setIsDetailOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-5">
                <img 
                  src={activeProduct.imageUrl} 
                  alt={activeProduct.name} 
                  className="w-full sm:w-48 h-48 object-cover rounded-2xl bg-slate-150 border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                
                <div className="flex-1 space-y-2">
                  <h2 className="font-display font-bold text-slate-900 text-lg leading-snug">{activeProduct.name}</h2>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Category</span>
                      <span className="font-semibold text-slate-700">{activeProduct.category}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl font-mono">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wide">SKU Ref</span>
                      <span className="gradient-text font-bold">{activeProduct.sku}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl font-mono">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wide">On Hand</span>
                      <span className={`font-bold ${activeProduct.quantity <= activeProduct.minQuantity ? "text-amber-500" : "text-emerald-600"}`}>{activeProduct.quantity} count</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl font-mono">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Min safety</span>
                      <span className="font-semibold text-slate-700">{activeProduct.minQuantity}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Warehouse Aisle</span>
                      <span className="font-semibold text-slate-700">{activeProduct.location}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="p-4 bg-slate-50 rounded-2xl grid grid-cols-3 gap-4 text-center font-mono">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Unit Cost</span>
                  <span className="text-sm font-bold text-slate-700">${activeProduct.cost.toFixed(2)}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Unit Price</span>
                  <span className="text-sm font-bold text-indigo-600">${activeProduct.price.toFixed(2)}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase">Gross Profit</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {activeProduct.price > 0 ? (((activeProduct.price - activeProduct.cost) / activeProduct.price) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="block uppercase tracking-wider text-[10px] text-slate-400 font-bold">Item Description</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-50 border-dashed">
                  {activeProduct.description || "No descriptions configured for this database inventory product SKU."}
                </p>
              </div>

              {/* Associated Supplier */}
              <div className="text-xs pt-2">
                <span className="block uppercase tracking-wider text-[10px] text-slate-400 font-bold mb-2">Prime Sourcing Supplier</span>
                {suppliers.find(s => s.id === activeProduct.supplierId) ? (
                  (() => {
                    const supp = suppliers.find(s => s.id === activeProduct.supplierId)!;
                    return (
                      <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{supp.name}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">{supp.contactPerson} • {supp.email}</p>
                        </div>
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg font-mono">
                          ⭐ {supp.rating.toFixed(1)}
                        </span>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-slate-400 tracking-tight italic">Warning: No valid supplier associated with this product SKU.</p>
                )}
              </div>

            </div>

            <div className="p-6 border-t border-slate-50 bg-slate-50 flex items-center justify-between rounded-b-3xl">
              <button
                onClick={() => handleDelete(activeProduct.id)}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Product Record</span>
              </button>
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  handleOpenEditForm(activeProduct);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Modify SKU Elements
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL FORM 2: ADD / EDIT PRODUCT ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-display font-extrabold text-slate-800 tracking-tight">
                {formMode === "ADD" ? "Create New Product SKU" : "Modify Specifications Structure"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-medium rounded-r-lg">
                  {formError}
                </div>
              )}

              {/* Grid 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ultra Fast Charge Controller"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Unique SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SEN-LAS-102"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                    disabled={formMode === "EDIT"}
                  />
                </div>
              </div>

              {/* Grid 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category Group *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electronics, Apparel, Furniture"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Aisle Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Aisle 4, Shelf C"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock Supplier *</label>
                  <select
                    value={supplierId}
                    required
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">Select Primary Supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 3: Qty and Min */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock Qty Current *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                    disabled={formMode === "EDIT"} // Direct adjust inside products cards instead!
                  />
                  {formMode === "EDIT" && (
                    <p className="text-[10px] text-slate-400 mt-0.5">Please use direct +/- Adjustment panel on lists to change quantity records.</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Minimum Safety Reserve *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="10"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Grid 4: Costs and Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Acquisition Cost USD *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    placeholder="e.g. 15.50"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Retail Selling Price USD *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    placeholder="e.g. 45.00"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Other parameters */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Display Image URL</label>
                <input
                  type="url"
                  placeholder="e.g. https://images.unsplash.com/photo-X"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Item Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide precise sizing, features, or operational usage guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-md"
                >
                  Save Specification
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL DRAWER 3: SYSTEM STOCK ADJUSTMENT ================= */}
      {isAdjustOpen && activeProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 p-6">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-display font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                  <span>Stock Ledger Adjustment</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Change actual stock level for SKU: {activeProduct.sku}</p>
              </div>
              <button 
                onClick={() => setIsAdjustOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-4 text-xs flex items-center gap-3">
              <img 
                src={activeProduct.imageUrl} 
                alt="" 
                className="w-10 h-10 object-cover rounded-lg bg-slate-100"
              />
              <div>
                <p className="font-bold text-slate-800">{activeProduct.name}</p>
                <p className="text-slate-500 text-[10px] font-mono">Current on-hand storage: <span className="font-bold text-indigo-600">{activeProduct.quantity}</span> units</p>
              </div>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4">
              
              {/* Type Switch */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Adjustment Action Direction</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType("IN");
                      setAdjustReason("Restock Ingestion");
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${adjustType === "IN" ? "bg-emerald-500 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200"}`}
                  >
                    STOCK IN (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType("OUT");
                      setAdjustReason("Order Dispatch Release");
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${adjustType === "OUT" ? "bg-red-500 text-white shadow-xs" : "text-slate-600 hover:bg-slate-200"}`}
                  >
                    STOCK OUT (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Transaction Qty *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reason / Reference *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Invoice #4092, Supplier Intake ID"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsAdjustOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-bold rounded-xl cursor-pointer shadow-md ${adjustType === "IN" ? "bg-emerald-600 hover:bg-emerald-700 font-semibold" : "bg-red-600 hover:bg-red-700 font-semibold"}`}
                >
                  Post to Ledger
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Enterprise Ledger Safeguarded Confirmation Dialog */}
      <ConfirmModal
        isOpen={deleteProductId !== null}
        title="Confirm Product Deletion"
        description="Are you absolutely certain you want to permanently delete this inventory product SKU? This will remove all associated telemetry charts and transaction log entries from the database ledger."
        confirmText="Permanently Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteProductId(null)}
      />

    </div>
  );
}
