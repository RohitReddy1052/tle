# ProcureGuard — AI-Assisted Public Procurement Anomaly Detection & Investigation Platform

> **Hackathon Theme**: Peace, Justice and Strong Institutions (SDG 16)  
> ProcureGuard assists government oversight bodies and public auditors in identifying high-risk procurement activity requiring human investigation (unusual bidding patterns, sole-bidder trends, price anomalies, vendor rotation rings, and corporate director/address linkages) **without ever automatically labeling any entity as "corrupt"**. Everything is framed transparently as *"flagged for review"* with statistical peer benchmark evidence.

---

## Key Features

1. **Category-Based Peer Benchmark Scoring (No Global False Positives)**
   - Calculates z-scores, medians, and Interquartile Ranges (IQR) relative strictly to tenders in the same procurement category.
2. **Transparent AI Explainability Cards**
   - Zero black-box scores. Every flagged case provides plain-language reasons (e.g., *"Awarded price is +2.8 Z-scores above category benchmark median"*).
3. **Interactive Vendor Relationship Subgraph**
   - Built with `Graphology` and `react-force-graph-2d`. Detects shared registered addresses, shared key directors, and high-frequency co-bidding pairs.
4. **Embedded Synthetic Anomaly Patterns**
   - Seeded with realistic data (~50 vendors, ~200 tenders, ~500 bids, ~150 contracts) containing 4 pre-configured anomaly scenarios for immediate live evaluation:
     - **Medical Supplies Bid Rotation Ring**: 3 vendors alternating winning awards at inflated prices.
     - **IT Infrastructure Sole-Bidder Concentration**: Single vendor repeatedly winning without competition near 99.8% estimated value.
     - **Civil Construction Shared Director & Address Cluster**: 3 co-bidders sharing office location and director.
     - **Heavy Machinery Price Inflation Cluster**: Tight bid clustering +42% above peer benchmark.
5. **Auditor Determination Feedback Loop**
   - Investigators can mark cases as *"Confirmed Anomaly Risk"*, *"Verified Normal (False Positive)"*, or *"Needs More Data"*.
6. **Live Model Calibration & Weight Tuning**
   - Dynamic weight sliders allow auditors to adjust scoring parameters and view the priority queue re-rank in real time.

---

## Tech Stack

- **Backend**: Node.js, Express, Mongoose, MongoDB (Supports MongoDB Atlas, Local MongoDB, and automatic `MongoMemoryServer` zero-config fallback)
- **Graph Engine**: `Graphology` + `graphology-communities-louvain`
- **Statistics**: `simple-statistics`
- **Frontend**: React (JavaScript JSX), Vite, Tailwind CSS, Recharts, `react-force-graph-2d`, Lucide Icons

---

## Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm

### 1. Start Backend API & Seed Database

```bash
cd backend
npm install
npm run seed     # Seeds synthetic data with embedded anomaly patterns
npm start        # Launches Express backend on http://localhost:5000
```

*Note: If no local MongoDB server is running, backend automatically boots an in-memory MongoDB instance (`MongoMemoryServer`) so the demo works out-of-the-box with zero database setup required!*

### 2. Start Frontend Application

```bash
cd frontend
npm install
npm run dev      # Launches Vite dev server on http://localhost:3000
```

Open `http://localhost:3000` in your web browser.

---

## Demo Flow Recommendations for Judges

1. **Overview Dashboard (`/`)**: View summary stats, total value at risk, category risk heatmap, and click one of the 4 **Synthetic Anomaly Showcase Cards**.
2. **Investigation Queue (`/cases`)**: Filter by category, risk level, or auditor verdict. Notice the transparent trigger badges inline.
3. **Case Detail View (`/cases/:id`)**:
   - Review transparent *"Why Flagged"* reason cards.
   - Inspect the **Recharts Bid Amount vs. Benchmark** plot.
   - Interact with the **Force-Directed Vendor Relationship Graph** showing shared directors/addresses.
   - Click **Record Auditor Determination** to test auditor feedback submission.
4. **Vendor Profile (`/vendors/:id`)**: View ego-network graph, corporate details, tax ID, and historical contract win rates.
5. **Model Calibration (`/settings`)**: Adjust scoring weight sliders and click **Save & Live Recalculate Queue** to observe priority queue re-ranking in real time!
