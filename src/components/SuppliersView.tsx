import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  X,
  Users,
  Tags,
  Briefcase
} from "lucide-react";
import { Supplier, Product } from "../types";
import ConfirmModal from "./ConfirmModal";

interface SuppliersViewProps {
  suppliers: Supplier[];
  products: Product[];
  onAddSupplier: (supplierData: any) => Promise<any>;
  onEditSupplier: (id: string, supplierData: any) => Promise<any>;
  onDeleteSupplier: (id: string) => Promise<any>;
}

export default function SuppliersView({ 
  suppliers, 
  products, 
  onAddSupplier, 
  onEditSupplier, 
  onDeleteSupplier 
}: SuppliersViewProps) {
  
  const [search, setSearch] = useState("");
  
  // UI States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"ADD" | "EDIT">("ADD");
  const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(null);

  // Form Inputs
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [rating, setRating] = useState(5.0);
  const [categoriesInput, setCategoriesInput] = useState(""); // Comma separated

  const [formError, setFormError] = useState("");
  const [deleteSupplierId, setDeleteSupplierId] = useState<string | null>(null);
  const [deleteSupplierName, setDeleteSupplierName] = useState("");
  const [deleteSupplierWarn, setDeleteSupplierWarn] = useState("");

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase()) ||
    s.categoriesSupplied.some(cat => cat.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAddForm = () => {
    setFormMode("ADD");
    setName("");
    setContactPerson("");
    setEmail("");
    setPhone("");
    setAddress("");
    setRating(5.0);
    setCategoriesInput("");
    setFormError("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (s: Supplier) => {
    setFormMode("EDIT");
    setActiveSupplier(s);
    setName(s.name);
    setContactPerson(s.contactPerson);
    setEmail(s.email);
    setPhone(s.phone);
    setAddress(s.address);
    setRating(s.rating);
    setCategoriesInput(s.categoriesSupplied.join(", "));
    setFormError("");
    setIsFormOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name || !email) {
      setFormError("Supplier company name and business email are required elements.");
      return;
    }

    const categoriesArray = categoriesInput
      .split(",")
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0);

    const payload = {
      name,
      contactPerson,
      email,
      phone,
      address,
      rating: Number(rating || 5.0),
      categoriesSupplied: categoriesArray
    };

    try {
      if (formMode === "ADD") {
        await onAddSupplier(payload);
      } else if (formMode === "EDIT" && activeSupplier) {
        await onEditSupplier(activeSupplier.id, payload);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to persist supplier record details.");
    }
  };

  const handleDeleteSupplier = (id: string, name: string) => {
    // Check if supplier is currently linked to any active products to prevent orphaned links
    const boundCount = products.filter(p => p.supplierId === id).length;
    let warnPrefix = "";
    if (boundCount > 0) {
      warnPrefix = `WARNING: This supplier is currently associated with ${boundCount} active inventory product SKU${boundCount !== 1 ? 's' : ''}! Deleting it will create empty associations. `;
    }
    setDeleteSupplierWarn(warnPrefix);
    setDeleteSupplierName(name);
    setDeleteSupplierId(id);
  };

  const handleConfirmDeleteSupplier = async () => {
    if (deleteSupplierId) {
      try {
        await onDeleteSupplier(deleteSupplierId);
      } catch (err: any) {
        alert(err.message || "Failed to remove supplier profile");
      } finally {
        setDeleteSupplierId(null);
        setDeleteSupplierName("");
        setDeleteSupplierWarn("");
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight">Suppliers Directory</h1>
          <p className="text-slate-500 text-sm">Register, audit, and evaluate primary wholesale sourcing partners.</p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sourcing Supplier</span>
        </button>
      </div>

      {/* Supplier Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search suppliers by name, point-of-contact, supplied category, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Suppliers Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map(s => {
            // Count active products sourced by this supplier
            const sourcedCount = products.filter(p => p.supplierId === s.id).length;
            return (
              <div 
                key={s.id} 
                className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 hover:border-indigo-100 flex flex-col justify-between transition-all scale-100 hover:scale-[1.005]"
              >
                <div>
                  
                  {/* Title block */}
                  <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-50">
                    <div className="min-w-0">
                      <h3 className="font-display font-extrabold text-slate-900 text-md leading-tight truncate">
                        {s.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Sourcing point-of-contact: </span>
                        <span className="font-bold text-slate-600">{s.contactPerson || "Not Assigned"}</span>
                      </p>
                    </div>

                    {/* Sourcing rating evaluation score */}
                    <div className="flex items-center gap-1 px-2.1 py-1 bg-amber-50 rounded-lg text-amber-700 text-xs font-mono font-bold border border-amber-200/50">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                      <span>{s.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Sourcing details rows */}
                  <div className="mt-4 space-y-2.5 text-xs">
                    
                    <a 
                      href={`mailto:${s.email}`}
                      className="flex items-center gap-2.5 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <span className="p-1.5 bg-slate-50 rounded-lg text-slate-400 shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate">{s.email}</span>
                    </a>

                    <a 
                      href={`tel:${s.phone}`}
                      className="flex items-center gap-2.5 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <span className="p-1.5 bg-slate-50 rounded-lg text-slate-400 shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </span>
                      <span>{s.phone || "No direct telephone line entered"}</span>
                    </a>

                    <div className="flex items-start gap-2.5 text-slate-500">
                      <span className="p-1.5 bg-slate-50 rounded-lg text-slate-400 shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                      </span>
                      <span className="leading-snug">{s.address || "No office address registered"}</span>
                    </div>

                  </div>

                  {/* Categories supplied tags */}
                  <div className="mt-4.5 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase mb-2">
                      <Tags className="w-3.5 h-3.5" />
                      <span>Supplied Categories</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {s.categoriesSupplied && s.categoriesSupplied.length > 0 ? (
                        s.categoriesSupplied.map((cat, idx) => (
                          <span 
                            key={idx} 
                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200/40"
                          >
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] italic text-slate-400">No category groups classified.</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Sourcing evaluation controls footer */}
                <div className="mt-5.5 pt-4.5 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 font-semibold">
                    Actively Sourcing: <span className="font-bold text-indigo-600">{sourcedCount} products</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditForm(s)}
                      className="p-1.5 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 rounded-lg transition-all cursor-pointer"
                      title="Edit Supplier Specifications"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(s.id, s.name)}
                      className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-all cursor-pointer"
                      title="De-register supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="md:col-span-2 py-16 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>No sourcing suppliers matches search tags.</p>
          </div>
        )}
      </div>

      {/* ================= MODAL FORM: ADD / EDIT SUPPLIER ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-display font-extrabold text-slate-800 tracking-tight">
                {formMode === "ADD" ? "Register Sourcing Supplier" : "Modify Supplier Catalog Details"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-medium rounded-r-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Supplier Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Semiconductors Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Point-of-Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Marcus Thorne"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sourcing Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    placeholder="4.5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Business Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="m.thorne@acme-semis.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Telephone Contact Line</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Supplied Categories (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Electronics, Raw Materials, Packaging"
                  value={categoriesInput}
                  onChange={(e) => setCategoriesInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Corporate Office Address</label>
                <input
                  type="text"
                  placeholder="88 Quarry Road, Austin, TX 78701"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  Persist Supplier
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Secured Delete Supplier verification */}
      <ConfirmModal
        isOpen={deleteSupplierId !== null}
        title="Confirm Sourcing Supplier De-registration"
        description={`${deleteSupplierWarn}Are you absolutely certain you want to permanently delete sourcing supplier "${deleteSupplierName}" from the enterprise database registry?`}
        confirmText="Remove Supplier Profile"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDeleteSupplier}
        onCancel={() => {
          setDeleteSupplierId(null);
          setDeleteSupplierName("");
          setDeleteSupplierWarn("");
        }}
      />

    </div>
  );
}
