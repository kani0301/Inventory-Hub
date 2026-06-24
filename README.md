# AcuStock - Professional Enterprise Inventory Suite

A premium, production-ready enterprise-grade stock resource management dashboard powered by **React**, **Express / Node.js**, and **Google Gemini 3.5 Flash** for advanced planning intelligence.

---

## 🚀 Key Features

*   **🛡️ Multi-tier Authentication**: Registration, validated Login forms, dynamic profile role adjustments, and secure user sessions backed by a JSON transactional ledger.
*   **📦 Inventory Control**: Enterprise-grade product catalogs featuring detailed spec drawers, unique item SKU validators, warehouse aisle locator maps, and safety reserve limit indicators.
*   **📊 Stock Ledgers**: Granular transaction histories logging Stock-In increments and Stock-Out dispatches with clear invoice/reason auditors and printable timelines.
*   **🏢 Suppliers Directory**: Evaluation directories containing rating metrics, direct mail/phone shortcuts, and specific supplier-sourced items counters.
*   **📈 Interactive Analytics**: Harmonious multi-color telemetry dashboards (powered by `Chart.js`) illustrating product category percentages, stock-on-hand comparison rails, and monthly traffic flow charts.
*   **📁 Report Center**: On-demand download center compiling validated `.csv` spreadsheets for valuations, profit lists, and logs, alongside optimized browser print PDF styles.
*   **🧠 Gemini AI Advisor**: Core neural analytics pipeline leveraging Google Gemini 3.5 Flash server-side variables to analyze stocks and return demand forecasting curves, prioritized restocking recommendations, and capital optimizations. Includes an advanced rule-based simulation engine fallback in offline mode.
*   **🧹 Maintenance Controls**: Dedicated administration controls in the Profile tab allowing users to either reset the database to a completely blank slate for entering fresh records or instantly inject high-quality demo seed records for immediate testing.

---

## 🎨 Visual Identity (Serenity Theme)

*   **Background Canvas**: Rendered in a soothing `bg-serenity-gradient`, utilizing soft, low-contrast gradients that enhance eye comfort over long monitoring periods.
*   **Typography**: Clean **Inter** for general UI clarity paired with **Space Grotesk** display headings and **JetBrains Mono** for serial coordinates and stock-on-hand measurements.
*   **Responsive Modals**: Uses a custom, secure confirmation modal dialog system for all destructive or database-altering actions (such as product deletions, supplier removals, or database wipes).

---

## 🛠️ Technologies Used

### Frontend
*   **React 19 & TypeScript**: Component architectures ensuring robust type-safeguards.
*   **Tailwind CSS v4 & Lucide Icons**: Responsive layout grid styled with spacious padding and elegant, clear typography.
*   **Chart.js & React-Chartjs-2**: Responsive, beautiful vector charts representing complex multi-axis datasets.

### Backend
*   **Express & Node.js**: Modular REST API endpoint routing.
*   **Esbuild & tsx**: Bundling server-side code to native CommonJS (`dist/server.cjs`) for ultra-low latency and low-overhead cold starts.
*   **Google GenAI SDK (`@google/genai`)**: Next-generation Gemini 3.5 Flash model orchestration.

---

## 📦 Project Structure

```text
├── db.json                 # Transactional JSON-based local database
├── server.ts               # Custom Express server entry-point and AI pipelines
├── vite.config.ts          # Vite asset configurations
├── package.json            # Dynamic NPM definitions & custom full-stack scripts
├── src/
│   ├── types.ts            # Core data model interfaces
│   ├── main.tsx            # DOM mounting controller
│   ├── index.css           # Tailwind v4 directives & typography sheets
│   ├── App.tsx             # State orchestrator & API data synchronizer
│   └── components/         # Modular feature-set blocks
│       ├── AuthView.tsx        # Registration, Login controls
│       ├── Sidebar.tsx         # Left panel drawer controls
│       ├── DashboardView.tsx   # Aggregated analytics graphs
│       ├── ProductsView.tsx    # Inventory items listings & SKU additions
│       ├── SuppliersView.tsx   # Suppliers index directories
│       ├── MovementsView.tsx   # Timestamps ledger table list
│       ├── AiInsightsView.tsx  # Gemini models outputs display
│       ├── ProfileView.tsx     # Session configs and db operations
│       └── ConfirmModal.tsx    # Custom safe modal confirmation boxes
```

---

## ⚙️ Installation & Run Steps

### 1. Configure Secrets & Environment Variables
Create a `.env` file in the root directory and specify your Gemini API key:
```env
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY_HERE"
```
*If left unset, the server will automatically fall back to an advanced, rule-based simulated intelligence pipeline so full dashboard planning features remain functional.*

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch the App (Development Mode)
```bash
npm run dev
```
The application dev-server binds to Port `3000` on host `0.0.0.0` securely for standard network tunnel routing. Open your browser and navigate to `http://localhost:3000`.

### 4. Build & Start (Production Mode)
```bash
npm run build
npm start
```

### 5. Access Credentials (Demo Users)
If you wish to bypass sign-on screens immediately with pre-configured accounts, use:
*   **Username**: `admin`
*   **Password**: `password123`

---

## 🔮 Future Enhancements
*   Adding OAuth2 federated log-ins with external corporate identity providers.
*   Customizing physical warehouse bar-code scanners inside Product specification sheets using device camera permissions.
*   Real-time multi-location warehouse inventories consolidation over multi-node microservices.

---

## 👨‍💻 Author
Developed and maintained under professional enterprise design directives. Built for robust, scalable stock logistics.
