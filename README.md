# InternMatch — Personalized Internship Discovery Platform

> "Build a platform that helps students discover internships based on their skills, course, location, and interests."

InternMatch is a responsive, student-centric web platform engineered to help students discover high-compatibility internship opportunities, understand their exact match breakdown, identify skill gaps, verify opportunity legitimacy, and track their applications from submission to offer.

Developed for hackathons and production deployment with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase PostgreSQL**.

---

## 🌟 Key Features

1. **Deterministic, Transparent Matching Engine**:
   - Calculates a mathematically normalized compatibility score between 0 and 100%.
   - **No Black-Box AI Claims**: Every match provides a component-by-component explanation of why an opportunity was recommended.
   - Formula:
     $$\text{Score} = 0.50 \times \text{Skills} + 0.20 \times \text{Course} + 0.15 \times \text{Location/Mode} + 0.15 \times \text{Interests}$$

2. **Mandatory Eligibility Verification (Separated from Score)**:
   - Evaluates mandatory non-negotiables: **Eligible Degree**, **Eligible Branch**, and **Eligible Academic Year**.
   - If a student does not meet a mandatory requirement, the status explicitly reads **"Not eligible under the listed requirements"** with the exact conflict explained.
   - If fields in the profile are missing, the status explicitly reads **"Eligibility unknown"** rather than making false assumptions.

3. **Actionable Skill Gap Analysis**:
   - Categorizes skills into **Matching Skills**, **Missing Mandatory Skills**, and **Missing Preferred Skills**.
   - Generates curated learning topics and concrete preparation tasks for missing skills.
   - Honest disclaimer: completing learning tasks develops competencies, but does not guarantee hiring or override eligibility restrictions.

4. **Student Profile Customization**:
   - Student persona manager with full editing for: Name, Degree, Branch, Academic Year, Skills with Proficiency (Beginner, Intermediate, Advanced), Target Career Interests, Work Mode preferences (Remote, Hybrid, On-site), and Minimum Stipend expectations.

5. **Application Tracker Pipeline**:
   - Private student tracker supporting full status progression: `Saved`, `Planning to Apply`, `Applied`, `Interview`, `Offer`, `Rejected`, `Withdrawn`.
   - Records application dates, scheduled interview dates, pending follow-ups, and interview notes.

6. **Opportunity Curation & Administration**:
   - Admin portal for adding, editing, publishing, expiring, and verifying opportunities.
   - Displays source verification badge, verified timestamp, and original application link.
   - CSV Batch Import and Template export for bulk opportunity ingestion.

7. **Hackathon Demo Persona Switcher**:
   - Top banner provides instant 1-click persona switching to demonstrate how the matching engine adapts recommendations:
     - **Priya Sharma** (3rd Year B.Tech CS • React & TypeScript Frontend)
     - **Aarav Patel** (2nd Year B.Sc Data Science • Python, SQL & ML)
     - **Platform Admin** (Administrator access for verifying & publishing)

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on v24.16.0)
- **npm**: v9+ (tested on v11.13.0)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone <your-repo-url>
cd interships
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Run Unit Tests
Run the Vitest test suite verifying all 10 matching rules and eligibility constraints:
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 📐 Matching Engine Architecture

The platform computes compatibility using a multi-factor deterministic algorithm:

| Component | Weight | Criteria Evaluated |
|---|---|---|
| **Skill Match** | **50%** | Required skills (80% weight) + Preferred skills (20% weight), normalized with proficiency level |
| **Course & Academic** | **20%** | Degree and Branch alignment with employer constraints |
| **Location & Work Mode** | **15%** | Remote vs On-site vs Hybrid match and preferred city preferences |
| **Interests & Target Roles**| **15%** | Student career interests matched against role title, description, and department |

```typescript
const overallScore = Math.round(
  0.50 * skillScore +
  0.20 * courseScore +
  0.15 * locationScore +
  0.15 * interestScore
);
```

---

## 🗄️ Database Schema & Supabase Setup

InternMatch works immediately offline with local persistence. To connect your cloud Supabase database:

1. Create a project at [Supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the migration script:
   - File path: `supabase/migrations/20261014_init_internmatch.sql`
3. Copy your project URL and anonymous public key to `.env`:
   ```bash
   cp .env.example .env
   ```
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Restart `npm run dev`. The top banner will automatically indicate **"Supabase: Connected"**.

### Security & Row Level Security (RLS)
- **Profiles**: Students can only view and update their own profiles. Role escalation to `admin` is prevented at the database policy level.
- **Internships**: Published opportunities are publicly readable. Only users with `role = 'admin'` can insert, update, delete, or verify records.
- **Applications & Saved**: Strictly scoped to the authenticated `user_id`. No user can view another student's private notes or applications.

---

## 🧪 Automated Test Suite (10 Passed Tests)

All 10 required algorithmic tests are implemented in `src/__tests__/matching.test.ts`:
1. Exact skill match produces a higher skill score than a weak match.
2. Missing skills are explained correctly in skill-gap analysis.
3. Mandatory eligibility failures (Degree, Branch, Academic Year) are detected.
4. Unknown eligibility is not treated as confirmed eligibility when fields are missing.
5. Match scores remain strictly between 0 and 100 under all conditions.
6. Missing or partial profile fields do not cause crashes (safe defaults).
7. Identical inputs produce deterministic, reproducible scores.
8. Expired internships are detected and excluded from active discovery.
9. Deadline sorting correctly orders upcoming deadlines.
10. Remote and location preferences are evaluated consistently.

---

## 📋 Hackathon Demonstration Walkthrough

Follow this 5-minute scenario to showcase the full platform capabilities to judges:

1. **Examine Priya's Recommendations**:
   - The platform defaults to **Priya Sharma** (3rd Year CS, Frontend).
   - In **Discover Internships**, notice how *TechFlow Solutions (Frontend React Developer Intern)* ranks #1 with **96% Match** and all mandatory skills checked.
2. **Inspect Match Breakdown & Skill Gap**:
   - Click *View Match Breakdown* on an opportunity.
   - Review the component breakdown bar, transparent formula, and recommended learning topics with actionable preparation tasks.
3. **Save and Apply**:
   - Click the bookmark icon to save the opportunity.
   - Click *Apply on Official Portal* — notice it routes to the actual careers link with a clear external disclaimer.
   - Switch status to **"Applied"** and add a note.
4. **Inspect Application Tracker**:
   - Navigate to **Application Tracker**. See the updated stage, dates, and private notes.
5. **Switch Persona to Aarav**:
   - Click **Aarav (DS 2nd Yr • AI)** on the top banner.
   - Notice the discovery list instantly updates: *NeuroMetrics Labs (Data Science & Applied ML Intern)* now ranks #1, and frontend listings drop in score!
6. **Admin Verification & Ingestion**:
   - Click **Admin** on the top banner and navigate to **Admin Portal**.
   - Toggle verification status on any opportunity, add a new opening, or test the CSV template export/import.

---

## ⚖️ License
Released under the MIT License for educational, hackathon, and open-source use.
