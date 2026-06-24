import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_PATH = path.join(process.cwd(), "db.json");

// Local DB Helpers
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Create with default state if file doesn't exist
      const defaultState = { users: [], sessions: [], suppliers: [], products: [], movements: [], aiInsightsCache: [] };
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultState, null, 2), "utf8");
      return defaultState;
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading db.json", err);
    return { users: [], sessions: [], suppliers: [], products: [], movements: [], aiInsightsCache: [] };
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing db.json", err);
  }
}

// Generate unique readable ID helper
const generateId = (prefix: string) => `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;

// Auth Middleware Helper
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }
  const token = authHeader.split(" ")[1];
  const db = readDb();
  const session = db.sessions.find((s: any) => s.token === token);
  if (!session) {
    return res.status(401).json({ error: "Invalid session token" });
  }
  const user = db.users.find((u: any) => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: "User profile not found" });
  }
  (req as any).user = user;
  (req as any).sessionToken = token;
  next();
}

// ================= AUTH ENPOINTS =================

app.post("/api/auth/register", (req, res) => {
  const { username, password, name, email } = req.body;
  
  if (!username || !password || !name || !email) {
    return res.status(400).json({ error: "All profile fields are required" });
  }

  const db = readDb();
  const existingUser = db.users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "Username is already taken" });
  }

  const newUser = {
    id: generateId("u"),
    username,
    password, // Plain for prototype persistence, with hash style string in mind
    name,
    email,
    role: "Manager",
    avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&w=150&q=80`
  };

  db.users.push(newUser);
  writeDb(db);

  // Auto-login on successful registration
  const token = `token-${Math.floor(Math.random() * 1000000000)}`;
  db.sessions.push({
    token,
    userId: newUser.id,
    createdAt: new Date().toISOString()
  });
  writeDb(db);

  res.status(201).json({ token, user: newUser });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const db = readDb();
  const user = db.users.find(
    (u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password credentials" });
  }

  const token = `token-${Math.floor(Math.random() * 1000000000)}`;
  db.sessions.push({
    token,
    userId: user.id,
    createdAt: new Date().toISOString()
  });
  writeDb(db);

  res.json({ token, user });
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const db = readDb();
    db.sessions = db.sessions.filter((s: any) => s.token !== token);
    writeDb(db);
  }
  res.json({ success: true });
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json((req as any).user);
});

app.put("/api/auth/profile", authenticate, (req, res) => {
  const { name, email, avatar, role } = req.body;
  const db = readDb();
  const userIndex = db.users.findIndex((u: any) => u.id === (req as any).user.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  if (name) db.users[userIndex].name = name;
  if (email) db.users[userIndex].email = email;
  if (avatar) db.users[userIndex].avatar = avatar;
  if (role) db.users[userIndex].role = role;

  writeDb(db);
  res.json(db.users[userIndex]);
});

// ================= PRODUCT ENDPOINTS =================

app.get("/api/products", (req, res) => {
  const db = readDb();
  res.json(db.products);
});

app.post("/api/products", authenticate, (req, res) => {
  const { name, sku, category, quantity, minQuantity, price, cost, supplierId, imageUrl, description, location } = req.body;
  
  if (!name || !sku || !category || quantity === undefined || price === undefined || cost === undefined || !supplierId) {
    return res.status(400).json({ error: "Missing required core product fields" });
  }

  const db = readDb();
  
  // SKU unique check
  if (db.products.some((p: any) => p.sku.toLowerCase() === sku.toLowerCase())) {
    return res.status(400).json({ error: "SKU key exists already" });
  }

  const newProduct = {
    id: generateId("p"),
    name,
    sku,
    category,
    quantity: Number(quantity),
    minQuantity: Number(minQuantity || 10),
    price: Number(price),
    cost: Number(cost),
    supplierId,
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=300&q=80",
    description: description || "",
    location: location || "Default Warehouse"
  };

  db.products.push(newProduct);
  
  // Generate initial stock IN movement record
  const movement = {
    id: generateId("m"),
    productId: newProduct.id,
    type: "IN",
    quantity: newProduct.quantity,
    reason: "Initial Product Intake Setup",
    userId: (req as any).user.id,
    date: new Date().toISOString()
  };
  db.movements.push(movement);

  writeDb(db);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { name, sku, category, quantity, minQuantity, price, cost, supplierId, imageUrl, description, location } = req.body;

  const db = readDb();
  const productIdx = db.products.findIndex((p: any) => p.id === id);
  if (productIdx === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  // SKU duplicate safety
  if (sku && sku.toLowerCase() !== db.products[productIdx].sku.toLowerCase()) {
    if (db.products.some((p: any) => p.sku.toLowerCase() === sku.toLowerCase())) {
      return res.status(400).json({ error: "Another product already uses this SKU code" });
    }
  }

  const oldQty = db.products[productIdx].quantity;
  const newQty = quantity !== undefined ? Number(quantity) : oldQty;

  const updatedProduct = {
    ...db.products[productIdx],
    name: name || db.products[productIdx].name,
    sku: sku || db.products[productIdx].sku,
    category: category || db.products[productIdx].category,
    quantity: newQty,
    minQuantity: minQuantity !== undefined ? Number(minQuantity) : db.products[productIdx].minQuantity,
    price: price !== undefined ? Number(price) : db.products[productIdx].price,
    cost: cost !== undefined ? Number(cost) : db.products[productIdx].cost,
    supplierId: supplierId || db.products[productIdx].supplierId,
    imageUrl: imageUrl || db.products[productIdx].imageUrl,
    description: description !== undefined ? description : db.products[productIdx].description,
    location: location || db.products[productIdx].location
  };

  db.products[productIdx] = updatedProduct;

  // If quantity was altered directly, record a stock adjustments movement
  if (newQty !== oldQty) {
    const diff = newQty - oldQty;
    const movement = {
      id: generateId("m"),
      productId: id,
      type: diff > 0 ? "IN" : "OUT",
      quantity: Math.abs(diff),
      reason: `Direct Stock Adjustment Adjustment (${diff > 0 ? "+" : ""}${diff})`,
      userId: (req as any).user.id,
      date: new Date().toISOString()
    };
    db.movements.push(movement);
  }

  writeDb(db);
  res.json(updatedProduct);
});

app.delete("/api/products/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const productExists = db.products.some((p: any) => p.id === id);
  if (!productExists) {
    return res.status(404).json({ error: "Product not found" });
  }

  db.products = db.products.filter((p: any) => p.id !== id);
  // Also clean up movements to prevent orphan records, or keep them for audit
  db.movements = db.movements.filter((m: any) => m.productId !== id);

  writeDb(db);
  res.json({ success: true, message: "Product successfully deleted" });
});

// ================= SUPPLIER ENDPOINTS =================

app.get("/api/suppliers", (req, res) => {
  const db = readDb();
  res.json(db.suppliers);
});

app.post("/api/suppliers", authenticate, (req, res) => {
  const { name, contactPerson, email, phone, address, categoriesSupplied, rating } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Supplier name and email are required" });
  }

  const db = readDb();
  const newSupplier = {
    id: generateId("s"),
    name,
    contactPerson: contactPerson || "",
    email,
    phone: phone || "",
    address: address || "",
    categoriesSupplied: categoriesSupplied || [],
    rating: Number(rating || 5.0)
  };

  db.suppliers.push(newSupplier);
  writeDb(db);
  res.status(201).json(newSupplier);
});

app.put("/api/suppliers/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { name, contactPerson, email, phone, address, categoriesSupplied, rating } = req.body;

  const db = readDb();
  const supplierIdx = db.suppliers.findIndex((s: any) => s.id === id);
  if (supplierIdx === -1) {
    return res.status(404).json({ error: "Supplier not found" });
  }

  db.suppliers[supplierIdx] = {
    ...db.suppliers[supplierIdx],
    name: name || db.suppliers[supplierIdx].name,
    contactPerson: contactPerson !== undefined ? contactPerson : db.suppliers[supplierIdx].contactPerson,
    email: email || db.suppliers[supplierIdx].email,
    phone: phone !== undefined ? phone : db.suppliers[supplierIdx].phone,
    address: address !== undefined ? address : db.suppliers[supplierIdx].address,
    categoriesSupplied: categoriesSupplied || db.suppliers[supplierIdx].categoriesSupplied,
    rating: rating !== undefined ? Number(rating) : db.suppliers[supplierIdx].rating
  };

  writeDb(db);
  res.json(db.suppliers[supplierIdx]);
});

app.delete("/api/suppliers/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.suppliers.findIndex((s: any) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Supplier not found" });
  }

  db.suppliers.splice(index, 1);
  writeDb(db);
  res.json({ success: true, message: "Supplier deleted successfully" });
});

// ================= STOCK MOVEMENT ENDPOINTS =================

app.get("/api/movements", (req, res) => {
  const db = readDb();
  res.json(db.movements);
});

app.post("/api/movements", authenticate, (req, res) => {
  const { productId, type, quantity, reason } = req.body;
  if (!productId || !type || !quantity || quantity <= 0) {
    return res.status(400).json({ error: "Product ID, movement type (IN/OUT), and valid positive quantity are required" });
  }

  if (type !== "IN" && type !== "OUT") {
    return res.status(400).json({ error: "Type must be either IN or OUT" });
  }

  const db = readDb();
  const productIdx = db.products.findIndex((p: any) => p.id === productId);
  if (productIdx === -1) {
    return res.status(404).json({ error: "Associated product profile not found" });
  }

  const currentQty = db.products[productIdx].quantity;
  const qtyNum = Number(quantity);

  if (type === "OUT" && currentQty < qtyNum) {
    return res.status(400).json({ error: `Insufficient stock inventory. Available stock: ${currentQty}, Requested: ${qtyNum}` });
  }

  // Adjust stock
  const nextQty = type === "IN" ? currentQty + qtyNum : currentQty - qtyNum;
  db.products[productIdx].quantity = nextQty;

  const movementRecord = {
    id: generateId("m"),
    productId,
    type,
    quantity: qtyNum,
    reason: reason || (type === "IN" ? "Restock Ingestion" : "Order Dispatch Release"),
    userId: (req as any).user.id,
    date: new Date().toISOString()
  };

  db.movements.push(movementRecord);
  writeDb(db);

  res.status(201).json({
    movement: movementRecord,
    product: db.products[productIdx]
  });
});

// ================= SYSTEM DATA MAINTENANCE ENDPOINTS =================

app.post("/api/system/reset", authenticate, (req, res) => {
  const db = readDb();
  db.products = [];
  db.suppliers = [];
  db.movements = [];
  db.aiInsightsCache = [];
  writeDb(db);
  res.json({ success: true, message: "System database successfully wiped empty." });
});

app.post("/api/system/seed", authenticate, (req, res) => {
  const db = readDb();
  
  // Seed suppliers
  db.suppliers = [
    {
      id: "s-101",
      name: "Apex Electronics Corp",
      contactPerson: "Sarah Jenkins",
      email: "sjenkins@apex-corp.com",
      phone: "+1 (555) 019-2834",
      address: "452 Industrial Parkway, San Jose, CA 95110",
      categoriesSupplied: ["Electronics", "Sensors", "Displays"],
      rating: 4.8
    },
    {
      id: "s-102",
      name: "Global Materials Group",
      contactPerson: "Marcus Thorne",
      email: "m.thorne@globalmaterials.org",
      phone: "+1 (555) 014-9982",
      address: "88 Quarry Rd, Austin, TX 78701",
      categoriesSupplied: ["Hardware", "Raw Materials"],
      rating: 4.2
    },
    {
      id: "s-103",
      name: "Starlight Textiles LLC",
      contactPerson: "Elena Rostova",
      email: "elena.r@starlightapparel.net",
      phone: "+1 (555) 012-7855",
      address: "1009 Fashion Ave, Suite 400, New York, NY 10018",
      categoriesSupplied: ["Apparel", "Packaging"],
      rating: 4.5
    }
  ];

  // Seed products
  db.products = [
    {
      id: "p-101",
      name: "Ultra-HD Quantum OLED Panel 55\"",
      sku: "DSP-OLED-55Q",
      category: "Electronics",
      quantity: 14,
      minQuantity: 20,
      price: 899.99,
      cost: 550,
      supplierId: "s-101",
      imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=300&q=80",
      description: "55-inch OLED display panel with high dynamic range and quantum dot color enhancement. Flagship grade.",
      location: "Aisle 4, Shelf C"
    },
    {
      id: "p-102",
      name: "High-Precision Laser Distance Sensor",
      sku: "SEN-LAS-004",
      category: "Electronics",
      quantity: 120,
      minQuantity: 30,
      price: 45.50,
      cost: 22,
      supplierId: "s-101",
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80",
      description: "ToF distance sensor with millimetric accuracy up to 10 meters and Serial/I2C communication support.",
      location: "Aisle 2, Bin E-12"
    },
    {
      id: "p-103",
      name: "Tempered Carbon Steel Anchor Bolts (M12)",
      sku: "HRD-BOLT-M12",
      category: "Hardware",
      quantity: 250,
      minQuantity: 100,
      price: 1.25,
      cost: 0.45,
      supplierId: "s-102",
      imageUrl: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=300&q=80",
      description: "Heavy-duty Grade 10.9 steel anchor bolts, hot-dip galvanized for optimal corrosion resistance.",
      location: "Aisle 9, Rack A"
    }
  ];

  // Seed movements
  db.movements = [
    {
      id: "m-101",
      productId: "p-101",
      type: "IN",
      quantity: 14,
      reason: "Initial Product Intake Setup",
      userId: (req as any).user.id,
      date: new Date().toISOString()
    },
    {
      id: "m-102",
      productId: "p-102",
      type: "IN",
      quantity: 120,
      reason: "Initial Product Intake Setup",
      userId: (req as any).user.id,
      date: new Date().toISOString()
    },
    {
      id: "m-103",
      productId: "p-103",
      type: "IN",
      quantity: 250,
      reason: "Initial Product Intake Setup",
      userId: (req as any).user.id,
      date: new Date().toISOString()
    }
  ];
  
  db.aiInsightsCache = [];
  writeDb(db);
  res.json({ success: true, message: "System database successfully restored with demo records." });
});

// ================= SMART GEMINI AI FORECAST & REORDER RECOMMENDATIONS =================

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "acustock-server",
          }
        }
      });
    }
  }
  return aiClient;
}

// Global intelligent fallback mock forecasting generator
function getRuleBasedAIInsights(products: any[], suppliers: any[], movements: any[]) {
  const optimizationList: string[] = [];
  const forecastingTrend: any[] = [];
  const restockPlan: any[] = [];

  // 1. Intelligent restock reasoning
  products.forEach(p => {
    const isLow = p.quantity <= p.minQuantity;
    const ratio = p.quantity / (p.minQuantity || 1);
    const supplier = suppliers.find(s => s.id === p.supplierId) || { name: "Unknown Supplier" };
    
    let priority: "CRITICAL" | "HIGH" | "MEDIUM" | "STABLE" = "STABLE";
    let recommendation = "Maintain current stock levels.";
    let predictedDemand = "Steady";

    if (p.quantity === 0) {
      priority = "CRITICAL";
      recommendation = `Stock is completely empty! Reorder at least ${p.minQuantity * 2} units immediately from ${supplier.name}.`;
      predictedDemand = "High (Backlogged)";
    } else if (isLow) {
      priority = "HIGH";
      recommendation = `Stock level (${p.quantity}) has fallen below critical safety threshold of ${p.minQuantity}. Reorder ${p.minQuantity * 1.5} units from ${supplier.name}.`;
      predictedDemand = "Increasing";
    } else if (ratio < 1.4) {
      priority = "MEDIUM";
      recommendation = `Approaching stock warning threshold within 7-14 days. Draft requisition of ${p.minQuantity} units active.`;
      predictedDemand = "Moderate";
    }

    if (priority !== "STABLE") {
      restockPlan.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        currentStock: p.quantity,
        minQuantity: p.minQuantity,
        priority,
        recommendation,
        supplierName: supplier.name,
        leadTimeDays: Math.floor(Math.random() * 5) + 3
      });
    }

    // Generate dynamic forecast points
    const baseDemand = Math.floor(p.price > 500 ? 5 : 25);
    forecastingTrend.push({
      id: p.id,
      name: p.name,
      sku: p.sku,
      currentDailyDemand: baseDemand,
      nextMonthExpectedQty: Math.floor(baseDemand * 1.15) + (isLow ? 8 : 2),
      confidenceRate: 85 + Math.floor(Math.random() * 10),
      trendState: isLow ? "Spike Potential" : "Consistent Growth"
    });
  });

  // 2. High-level optimizations
  const totalVal = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const totalCost = products.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
  const avgMargin = totalVal > 0 ? ((totalVal - totalCost) / totalVal * 100).toFixed(1) : "0";

  optimizationList.push(`Your overall inventory has an estimated retail value of $${totalVal.toLocaleString()} with average margins of ${avgMargin}%.`);
  const lowCount = products.filter(p => p.quantity <= p.minQuantity).length;
  if (lowCount > 0) {
    optimizationList.push(`Action Needed: ${lowCount} products are below safe reorder parameters, risking supply chain failure if unexpected demand peaks.`);
  } else {
    optimizationList.push(`Supply chains look stable: No critical item shortage detected across major aisles.`);
  }
  
  if (products.some(p => p.quantity > p.minQuantity * 5)) {
    const overstocked = products.find(p => p.quantity > p.minQuantity * 5);
    optimizationList.push(`Capital efficiency advisor: ${overstocked?.name} looks overstocked (${overstocked?.quantity} units) relative to safety thresholds. Advise temporary stock-take hold to free business liquidity.`);
  }

  return {
    forecasts: forecastingTrend,
    restockingRecommendations: restockPlan.length > 0 ? restockPlan : [
      { id: "all", name: "All Products Balanced", sku: "-", currentStock: 100, minQuantity: 10, priority: "STABLE", recommendation: "Incentivize standard customer promotions. No bulk supply acquisitions needed today.", supplierName: "N/A", leadTimeDays: 0 }
    ],
    businessSuggestions: optimizationList,
    meta: {
      generatedBy: "System Smart Logic Pipeline (Dynamic Offline Simulation Engine)",
      timestamp: new Date().toISOString()
    }
  };
}

app.post("/api/ai/analyze", async (req, res) => {
  const db = readDb();
  const products = db.products || [];
  const suppliers = db.suppliers || [];
  const movements = db.movements || [];

  const ai = getAiClient();
  
  if (!ai) {
    console.log("No GEMINI_API_KEY found or it is configured in default mock state. Falling back to dynamic offline rule-based analytic generator.");
    const offlineRep = getRuleBasedAIInsights(products, suppliers, movements);
    return res.json(offlineRep);
  }

  try {
    const promptJson = JSON.stringify({
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        quantity: p.quantity,
        minQuantity: p.minQuantity,
        price: p.price,
        cost: p.cost,
        supplierId: p.supplierId,
        location: p.location
      })),
      suppliers: suppliers.map(s => ({
        id: s.id,
        name: s.name,
        rating: s.rating,
        categoriesSupplied: s.categoriesSupplied
      })),
      recentMovements: movements.slice(-15).map(m => ({
        productId: m.productId,
        type: m.type,
        quantity: m.quantity,
        date: m.date,
        reason: m.reason
      }))
    });

    const aiPrompt = `Identify potential inventory issues, suggest stock replenishments, demand predictions, and generate intelligent enterprise business optimizations based on this inventory database state:
    ${promptJson}
    
    You MUST respond with a valid JSON document ONLY matching this exact typescript format without any other explanation, text formatting prefix, markdown symbols or outside wrappers:
    {
      "forecasts": [
        {
          "id": "product-id",
          "name": "product-name",
          "sku": "product-sku",
          "currentDailyDemand": 12,
          "nextMonthExpectedQty": 400,
          "confidenceRate": 92,
          "trendState": "Consistent Growth | Volatile Spike | Flat Demand | Decreasing Interest"
        }
      ],
      "restockingRecommendations": [
        {
          "id": "product-id",
          "name": "product-name",
          "sku": "product-sku",
          "currentStock": 14,
          "minQuantity": 20,
          "priority": "CRITICAL | HIGH | MEDIUM",
          "recommendation": "Recommend reordering X units from Supplier Y due to rapid dispatch cycles",
          "supplierName": "Supplier Name",
          "leadTimeDays": 5
        }
      ],
      "businessSuggestions": [
        "A concrete actionable string analyzing capital reallocation, space usage, or seasonal trend forecasts based on current records",
        "Another specific operational strategy recommendation regarding suppliers, rating, or categories"
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: aiPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedText = response.text || "";
    try {
      const parsedOutput = JSON.parse(parsedText.trim());
      
      // Inject meta for debugging
      parsedOutput.meta = {
        generatedBy: "Google Gemini 3.5 Flash",
        timestamp: new Date().toISOString()
      };
      
      return res.json(parsedOutput);
    } catch (parseError) {
      console.error("Gemini output wasn't clean JSON. Raw body: ", parsedText);
      const offlineRep = getRuleBasedAIInsights(products, suppliers, movements);
      offlineRep.meta.generatedBy = "System Smart Logic Pipeline (JSON Parser Fallback)";
      return res.json(offlineRep);
    }

  } catch (err: any) {
    console.error("Failed to generate content with Gemini API:", err);
    const offlineRep = getRuleBasedAIInsights(products, suppliers, movements);
    offlineRep.meta.generatedBy = `System Smart Logic Pipeline (API Handshake Error Fallback: ${err.message || 'unknown'})`;
    return res.json(offlineRep);
  }
});

// ================= DEV SERVER & PRODUCTION BIND VITE =================

async function startServer() {
  // Vite dev mode vs Production serve
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Inventory Fullstack Server actively running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
