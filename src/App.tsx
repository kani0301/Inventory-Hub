import React, { useState, useEffect } from "react";
import { Loader2, ServerOff } from "lucide-react";

import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import ProductsView from "./components/ProductsView";
import SuppliersView from "./components/SuppliersView";
import MovementsView from "./components/MovementsView";
import AiInsightsView from "./components/AiInsightsView";
import ReportsView from "./components/ReportsView";
import ProfileView from "./components/ProfileView";
import AuthView from "./components/AuthView";

import { Product, Supplier, Movement } from "./types";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  
  // App Core States
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [appLoading, setAppLoading] = useState(true);
  const [serverError, setServerError] = useState(false);

  // Authenticate and load on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("inventory_token");
      if (!savedToken) {
        setAppLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setToken(savedToken);
          setUser(userData);
        } else {
          localStorage.removeItem("inventory_token");
        }
      } catch (err) {
        console.error("Auth check crash", err);
        setServerError(true);
      } finally {
        setAppLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sync data fetch if authenticated
  const fetchAllData = async (activeToken: string) => {
    try {
      const authHeaders = { Authorization: `Bearer ${activeToken}` };
      
      const [resProducts, resSuppliers, resMovements] = await Promise.all([
        fetch("/api/products", { headers: authHeaders }),
        fetch("/api/suppliers", { headers: authHeaders }),
        fetch("/api/movements", { headers: authHeaders }),
      ]);

      if (resProducts.ok && resSuppliers.ok && resMovements.ok) {
        setProducts(await resProducts.json());
        setSuppliers(await resSuppliers.json());
        setMovements(await resMovements.json());
      }
    } catch (err) {
      console.error("Data ingestion failed", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData(token);
    }
  }, [token]);

  // Auth Operations
  const handleAuthSuccess = (savedToken: string, loggedUser: any) => {
    setToken(savedToken);
    setUser(loggedUser);
    setCurrentTab("dashboard");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      // Passive clearance on exceptions
    }
    localStorage.removeItem("inventory_token");
    sessionStorage.removeItem("acu_ai_insights");
    setToken(null);
    setUser(null);
    setProducts([]);
    setSuppliers([]);
    setMovements([]);
    setCurrentTab("dashboard");
  };

  const handleUpdateProfile = async (profileData: any) => {
    const response = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to update profile record");
    }
    const updated = await response.json();
    setUser(updated);
    return updated;
  };

  // Product Operations
  const handleAddProduct = async (productData: any) => {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to catalog product");
    }
    if (token) await fetchAllData(token);
  };

  const handleEditProduct = async (id: string, productData: any) => {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to update specifications");
    }
    if (token) await fetchAllData(token);
  };

  const handleDeleteProduct = async (id: string) => {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to delete product category");
    }
    if (token) await fetchAllData(token);
  };

  // Supplier Operations
  const handleAddSupplier = async (supplierData: any) => {
    const response = await fetch("/api/suppliers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(supplierData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to log supplier record");
    }
    if (token) await fetchAllData(token);
  };

  const handleEditSupplier = async (id: string, supplierData: any) => {
    const response = await fetch(`/api/suppliers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(supplierData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to update supplier profile");
    }
    if (token) await fetchAllData(token);
  };

  const handleDeleteSupplier = async (id: string) => {
    const response = await fetch(`/api/suppliers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to delete supplier");
    }
    if (token) await fetchAllData(token);
  };

  // Stock Movement / Ledger adjustments
  const handleAdjustStock = async (productId: string, type: "IN" | "OUT", quantity: number, reason: string) => {
    const response = await fetch("/api/movements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ productId, type, quantity, reason })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Adjustment failed constraints checks");
    }
    if (token) await fetchAllData(token);
  };

  const handleResetDatabase = async () => {
    const response = await fetch("/api/system/reset", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to wipe database");
    }
    if (token) await fetchAllData(token);
  };

  const handleSeedDatabase = async () => {
    const response = await fetch("/api/system/seed", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to seed demo database");
    }
    if (token) await fetchAllData(token);
  };

  // Dynamic values
  const lowStockCount = products.filter(p => p.quantity <= p.minQuantity).length;

  if (serverError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-serenity-gradient font-sans">
        <ServerOff className="w-16 h-16 text-red-500 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-800 mt-6 md:text-2xl">Server Offline Coordinates</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm">The background Express server is booting or experiencing a port mapping error. Please wait 5 seconds and click restart dev server.</p>
      </div>
    );
  }

  if (appLoading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-serenity-gradient font-sans">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 text-xs font-semibold mt-4 tracking-wide uppercase">Initializing AcuStock Framework...</p>
      </div>
    );
  }

  // Render logins if session token is unauthenticated
  if (!token || !user) {
    return <AuthView onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-serenity-gradient flex flex-col lg:flex-row font-sans selection:bg-indigo-100">
      
      {/* Universal navigation panel */}
      <Sidebar 
        currentTab={currentTab} 
        onChangeTab={setCurrentTab} 
        user={user} 
        onLogout={handleLogout}
        lowStockCount={lowStockCount}
      />

      {/* Main content stage */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {currentTab === "dashboard" && (
          <DashboardView 
            products={products} 
            suppliers={suppliers} 
            movements={movements}
            onChangeTab={setCurrentTab}
            onQuickRestock={(productId) => {
              // Direct navigation support prefilled lists!
              setCurrentTab("products");
            }}
          />
        )}

        {currentTab === "products" && (
          <ProductsView 
            products={products}
            suppliers={suppliers}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
          />
        )}

        {currentTab === "suppliers" && (
          <SuppliersView 
            suppliers={suppliers}
            products={products}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        )}

        {currentTab === "movements" && (
          <MovementsView 
            movements={movements}
            products={products}
          />
        )}

        {currentTab === "ai" && (
          <AiInsightsView 
            products={products}
            onTriggerRestock={async (productId) => {
              // Automatically triggers a direct Stock IN restock to meet minimum safety, reasoning "AI replenishment order"!
              const p = products.find(prod => prod.id === productId);
              if (p) {
                const triggerQty = Math.max(p.minQuantity, 15);
                await handleAdjustStock(productId, "IN", triggerQty, "AI Recommendation Automated Restock");
              }
            }}
          />
        )}

        {currentTab === "reports" && (
          <ReportsView 
            products={products}
            suppliers={suppliers}
            movements={movements}
          />
        )}

        {currentTab === "profile" && (
          <ProfileView 
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onResetDb={handleResetDatabase}
            onSeedDb={handleSeedDatabase}
          />
        )}

      </main>

    </div>
  );
}
