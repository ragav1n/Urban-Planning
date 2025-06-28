# Urban Planning

This is an integrated, intelligent platform for **urban regulation compliance**, **grievance handling**, and **zonal planning** — built for the future of city development and municipal governance. It streamlines the interaction between citizens, urban planners, and regulatory frameworks using AI and modern web technologies.

---

## 🔧 Key Modules & Features

### 1️⃣ **Regulation Checker**
- 🧠 **Purpose**: Allows users (builders, architects) to verify if their construction proposal complies with **BBMP Building Bye-Laws**.
- 📥 **User Inputs**:
  - Plot area, road width, type of building
  - FAR, number of floors, setback distances, height, etc.
- ⚙️ **How It Works**:
  - Parses inputs against BBMP rules
  - Evaluates each rule (FAR, height, coverage, ventilation, parking, etc.)
  - Explain violations and suggest modifications
- 📄 **Outputs**:
  - Human-readable compliance report
  - Downloadable PDF with pass/fail statuses and recommendations

---

### 2️⃣ **Grievance Uploading System**
- 🗣️ **Purpose**: Enables citizens to lodge complaints related to land use violations or unauthorized construction.
- 📤 **Features**:
  - Form for entering details of the grievance (type, description, location)
  - Image upload for photographic evidence
  - GPS/geolocation tagging (optional future feature)
- 🛠️ **Planned Backend**:
  - Stores grievance in Supabase or equivalent DB
  - Admin dashboard for BBMP officials to view and act on submissions

---

### 3️⃣ **Zonal Optimisation Tool**
- 🗺️ **Purpose**: Helps urban planners identify optimal zoning based on **land-use patterns** and **infrastructure density**.
- 📊 **What It Uses**:
  - Land-use datasets from **BDA/BMRDA maps**
  - Demographic and development data (planned)
- 🧠 **How It Works**:
  - Applies clustering and zoning algorithms to suggest re-categorization
  - Visual output via map overlays (planned)
  - Helps improve **equitable land distribution** and **urban decongestion**

---

### 4️⃣ **Slum Redevelopment Analysis**
🎯 **Purpose**: Provides data-driven insights for systematic slum redevelopment planning and community rehabilitation strategies.
📊 **Features**:
    - Interactive ward-wise slum mapping with population density visualization
    - AI-powered redevelopment feasibility analysis and cost estimation
    - Community engagement tools and grievance tracking
    - Progress monitoring with real-time project dashboards
🔧 **How It Works**:
    - Analyzes demographic and infrastructure data for targeted slum areas
    - Generates redevelopment recommendations based on community needs
    - Provides compliance checking against government housing schemes
    - Offers mobile-responsive interface for field workers and residents
📈 **Outputs**:
    - Comprehensive redevelopment reports with timeline and budget estimates
    - Community impact assessments and stakeholder engagement metrics

### 5️⃣ **User-Facing Web Application**
- 🖥️ Built using **Next.js 14 + TypeScript**
- 🎨 Styled with **Tailwind CSS**
- 🔐 Authenticated using **Supabase**
- 🤖 Smart logic via **OpenAI API**
- 📄 Exports compliance output as PDF

---

## 📦 Tech Stack

|     Tech          |                Role                    |
|-------------------|----------------------------------------|
| Next.js           | Frontend & API routes (App Router)     |
| Tailwind CSS      | UI design and layout                   |
| TypeScript        | Code quality and safety                |
| Supabase          | Authentication and backend             |
| Machine Learning  | AI-based reasoning & explanation       |
| PDFGen            | Report export (planned)                |

---

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/urban-planning-app.git
cd urban-planning-app
npm install
```

Create a .env.local file:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_key
OPENAI_API_KEY=your_openai_key
```

Run the dev server:
```bash
npm run dev
```
Open http://localhost:3000 to explore the app.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.
