# LoanFlow – Supabase & Production Deployment Blueprint

This guide details how to deploy **LoanFlow** to production with a real **Supabase PostgreSQL** database, live backend API, and a Vercel-hosted frontend.

---

## 1. Supabase Cloud Database Setup (5 Minutes)

### Step 1.1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create an organization / project (e.g. `loanflow-prod`).
2. Choose your closest region (e.g., `ap-south-1` Mumbai, `us-east-1` N. Virginia, `eu-central-1` Frankfurt).
3. Set a strong database password and copy it.

### Step 1.2: Retrieve Connection String
In your Supabase Dashboard:
1. Navigate to **Project Settings** (gear icon) → **Database**.
2. Scroll to **Connection string** and select **URI**.
3. Choose **Transaction Pooler** (recommended for production auto-scaling):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   *Note: LoanFlow automatically handles connection poolers on port `6543` and configures `statement_cache_size=0` and SSL mode.*

### Step 1.3: Apply Schema & Enable Real-Time
1. Open the **SQL Editor** in your Supabase dashboard.
2. Open [supabase_schema.sql](file:///c:/TechnicalTask1/supabase_schema.sql) in this repository.
3. Paste the contents into the Supabase SQL Editor and click **Run**.
4. All 13 tables, indexes, constraints, and the `supabase_realtime` publication will be created instantly.

### Step 1.4: Seed Production Demo Data (Optional)
To populate initial banks (HDFC, ICICI, SBI), schemes, and test employees into your Supabase database:
```bash
# In your local terminal:
export DATABASE_URL="postgresql+asyncpg://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
python -m app.db.seed
```

---

## 2. Backend API Deployment (Render / Railway / Docker)

### Option A: Deploy to Render (Recommended Free/Standard)
1. Fork or push this repository to GitHub.
2. In [https://dashboard.render.com](https://dashboard.render.com), click **New +** → **Blueprint**.
3. Select your repository. Render will automatically detect [render.yaml](file:///c:/TechnicalTask1/render.yaml).
4. Fill in the environment variables:
   - `DATABASE_URL`: Your Supabase pooler connection URI.
   - `SECRET_KEY`: A secure 64-character hex string (generated automatically or via `openssl rand -hex 32`).
   - `BACKEND_CORS_ORIGINS`: `["https://your-frontend.vercel.app", "http://localhost:5173"]`
5. Click **Apply**. Render will build and deploy the FastAPI server with automated health checks at `/api/v1/health`.

### Option B: Deploy with Docker on Any Cloud VPS (AWS, DigitalOcean, Hetzner)
```bash
# Clone repository
git clone https://github.com/your-org/loanflow.git
cd loanflow

# Configure .env with your Supabase credentials
cp .env.example .env
nano .env

# Launch production containers
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 3. Frontend Deployment (Vercel)

### Step 3.1: Import to Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Select your repository.
3. Set **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.

### Step 3.2: Configure Environment Variables
Add the following in Vercel project settings:
```
VITE_API_URL=https://your-api.onrender.com/api/v1
```

### Step 3.3: Deploy
Click **Deploy**. Vercel will build and publish your high-performance React 18 SPA with automated SSL and edge caching. The included [frontend/vercel.json](file:///c:/TechnicalTask1/frontend/vercel.json) handles SPA routing so deep URLs (`/admin/leads`, `/staff/calls`, `/admin-mobile`) resolve cleanly.

---

## 4. Managing Real Users & Production Operations

### Creating Real Call Centre Agents
1. Log in to the Admin Portal (`/admin` or `/admin-mobile`) as `admin@loanflow.demo`.
2. Navigate to **Employees** → Click **Add Agent**.
3. Enter the agent's full name, corporate email, phone number, and custom daily call target (defaults to 100).
4. The agent can immediately log in at `/login` with their credentials.

### Morning Lead Distribution Flow
1. Navigate to **Leads CRM** → Click **Import CSV** to ingest fresh lead batches.
2. Navigate to **Lead Distribution**:
   - Choose **Equal Split** or **Round Robin**.
   - Select the shift's active agents.
   - Click **Execute Distribution**.
3. Agents' portals immediately update with their daily assigned leads.

### 100-Call Daily Target Execution
- As agents dial and log customer calls, the progress ring updates in real time.
- If a call outcome is marked as `interested`, the lead status automatically shifts to *Interested*.
- If marked as `follow_up_required`, a callback reminder is automatically scheduled into the follow-up queue.
- Underwriting documents uploaded by agents appear instantly in the Admin KYC queue for verification.
