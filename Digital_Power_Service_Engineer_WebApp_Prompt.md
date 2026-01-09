# Digital Power Service Engineer WebApp - Development Prompt

## Project Overview

Build a **Power BI-style analytics dashboard** for Digital Power Service Engineers to track, analyze, and visualize service call data. The application should transform the existing Excel-based task management system into a modern, interactive web application with real-time statistics and rich visualizations.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router) |
| **Backend** | Next.js API Routes / Supabase Edge Functions |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Charts** | Recharts / Chart.js / Tremor |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State** | React Query (TanStack Query) |

---

## Database Schema (Supabase)

### Core Tables

```sql
-- Organizations / Companies
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buildings within organizations
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engineers
CREATE TABLE engineers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  employee_code TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Types (CCTV, Домофон, Orvibo, etc.)
CREATE TABLE system_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  icon TEXT,
  color TEXT
);

-- Call Types
CREATE TABLE call_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  priority INTEGER DEFAULT 0
);

-- Task Status
CREATE TABLE task_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_en TEXT,
  color TEXT,
  sort_order INTEGER
);

-- Main Service Tasks Table
CREATE TABLE service_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  building_id UUID REFERENCES buildings(id),
  assigned_engineer_id UUID REFERENCES engineers(id),
  status_id UUID REFERENCES task_statuses(id),
  call_type_id UUID REFERENCES call_types(id),
  system_type_id UUID REFERENCES system_types(id),
  
  -- Core fields
  description TEXT,
  engineering_comment TEXT,
  akt_number INTEGER,
  
  -- Timestamps
  received_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Calculated fields (via trigger or view)
  resolution_days INTEGER GENERATED ALWAYS AS (
    CASE WHEN completed_at IS NOT NULL 
    THEN EXTRACT(DAY FROM completed_at - received_at)::INTEGER 
    ELSE NULL END
  ) STORED
);

-- Multi-engineer assignments (for tasks with multiple engineers)
CREATE TABLE task_engineers (
  task_id UUID REFERENCES service_tasks(id) ON DELETE CASCADE,
  engineer_id UUID REFERENCES engineers(id),
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (task_id, engineer_id)
);

-- Indexes for performance
CREATE INDEX idx_tasks_received_at ON service_tasks(received_at);
CREATE INDEX idx_tasks_status ON service_tasks(status_id);
CREATE INDEX idx_tasks_engineer ON service_tasks(assigned_engineer_id);
CREATE INDEX idx_tasks_organization ON service_tasks(organization_id);
CREATE INDEX idx_tasks_system_type ON service_tasks(system_type_id);
```

### Views for Analytics

```sql
-- Monthly statistics view
CREATE VIEW monthly_stats AS
SELECT 
  DATE_TRUNC('month', received_at) as month,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE status_id = (SELECT id FROM task_statuses WHERE name = 'Completed')) as completed,
  COUNT(*) FILTER (WHERE status_id = (SELECT id FROM task_statuses WHERE name = 'In progress')) as in_progress,
  COUNT(*) FILTER (WHERE status_id = (SELECT id FROM task_statuses WHERE name = 'Not started')) as not_started,
  AVG(resolution_days) FILTER (WHERE resolution_days IS NOT NULL) as avg_resolution_days
FROM service_tasks
GROUP BY DATE_TRUNC('month', received_at)
ORDER BY month;

-- Engineer performance view
CREATE VIEW engineer_performance AS
SELECT 
  e.id,
  e.full_name,
  COUNT(st.id) as total_tasks,
  COUNT(st.id) FILTER (WHERE ts.name = 'Completed') as completed_tasks,
  ROUND(AVG(st.resolution_days) FILTER (WHERE st.resolution_days IS NOT NULL), 1) as avg_resolution_days,
  COUNT(st.id) FILTER (WHERE st.resolution_days <= 1) as same_day_completions
FROM engineers e
LEFT JOIN service_tasks st ON e.id = st.assigned_engineer_id
LEFT JOIN task_statuses ts ON st.status_id = ts.id
GROUP BY e.id, e.full_name;

-- System type distribution
CREATE VIEW system_type_stats AS
SELECT 
  syt.name as system_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE ts.name = 'Completed') as completed,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM service_tasks st
JOIN system_types syt ON st.system_type_id = syt.id
JOIN task_statuses ts ON st.status_id = ts.id
GROUP BY syt.name;
```

---

## Data Migration Script

```typescript
// scripts/migrate-excel-to-supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const COLUMN_MAPPING = {
  'Байгууллагын нэр': 'organization_name',
  'Байр': 'building_name',
  'Төлөв': 'status',
  'Шалтгаан': 'description',
  'Томилогдсон инженер': 'assigned_engineer',
  'Дуудлага хүлээн авсан огноо': 'received_at',
  'Дууссан огноо': 'completed_at',
  'Engineering Comment': 'engineering_comment',
  'Дуудлагын төрөл': 'call_type',
  'Системийн төрөл': 'system_type',
  'АКТ': 'akt_number'
};

const STATUS_MAPPING = {
  'Completed': 'Completed',
  'Not started': 'Not started',
  'In progress': 'In progress'
};

// Parse engineer string like "Ganbileg Bayanjargal [DP];#57"
function parseEngineer(str: string) {
  if (!str) return null;
  const match = str.match(/^(.+?)\s*\[.*?\];#(\d+)/);
  return match ? { name: match[1].trim(), code: match[2] } : { name: str, code: null };
}

async function migrate() {
  // Implementation details...
}
```

---

## API Endpoints

### RESTful API Structure

```
/api/
├── tasks/
│   ├── GET    /                    # List all tasks (paginated)
│   ├── POST   /                    # Create new task
│   ├── GET    /:id                 # Get single task
│   ├── PUT    /:id                 # Update task
│   └── DELETE /:id                 # Delete task
│
├── engineers/
│   ├── GET    /                    # List all engineers
│   ├── GET    /:id/performance     # Engineer performance stats
│   └── GET    /:id/tasks           # Engineer's tasks
│
├── organizations/
│   ├── GET    /                    # List organizations
│   └── GET    /:id/stats           # Organization statistics
│
├── analytics/
│   ├── GET    /overview            # Dashboard overview stats
│   ├── GET    /monthly             # Monthly trends
│   ├── GET    /engineer-ranking    # Engineer leaderboard
│   ├── GET    /system-distribution # System type breakdown
│   ├── GET    /resolution-time     # Resolution time analysis
│   └── GET    /building-heatmap    # Building activity heatmap
│
└── export/
    ├── GET    /excel               # Export to Excel
    └── GET    /pdf                 # Export report to PDF
```

### Query Parameters

```typescript
interface TaskQueryParams {
  // Pagination
  page?: number;
  limit?: number;
  
  // Filters
  status?: 'Completed' | 'In progress' | 'Not started';
  engineer_id?: string;
  organization_id?: string;
  system_type?: string;
  call_type?: string;
  
  // Date range
  from_date?: string; // ISO date
  to_date?: string;
  
  // Search
  search?: string;
  
  // Sorting
  sort_by?: 'received_at' | 'completed_at' | 'organization' | 'engineer';
  sort_order?: 'asc' | 'desc';
}
```

---

## Frontend Pages & Components

### Page Structure

```
/app
├── page.tsx                        # Dashboard Home
├── tasks/
│   ├── page.tsx                    # Tasks List (with filters)
│   ├── [id]/page.tsx               # Task Detail
│   └── new/page.tsx                # Create Task
├── engineers/
│   ├── page.tsx                    # Engineers Overview
│   └── [id]/page.tsx               # Engineer Profile & Stats
├── organizations/
│   ├── page.tsx                    # Organizations List
│   └── [id]/page.tsx               # Organization Detail
├── analytics/
│   ├── page.tsx                    # Full Analytics Dashboard
│   ├── trends/page.tsx             # Trend Analysis
│   └── reports/page.tsx            # Generate Reports
└── settings/
    └── page.tsx                    # App Settings
```

### Dashboard Widgets (Power BI Style)

```typescript
// Key Performance Indicators (KPIs)
interface DashboardKPIs {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;        // percentage
  avgResolutionDays: number;
  pendingTasks: number;
  todaysTasks: number;
  thisMonthTasks: number;
}

// Widget Components to Build:
const widgets = [
  'KPICards',                    // Big number cards at top
  'TaskStatusPieChart',          // Completed/In Progress/Not Started
  'MonthlyTrendLineChart',       // Tasks over time
  'EngineerBarChart',            // Tasks per engineer
  'SystemTypeDonutChart',        // Distribution by system type
  'ResolutionTimeHistogram',     // Days to resolve distribution
  'OrganizationTreemap',         // Task volume by organization
  'BuildingHeatmap',             // Activity by building
  'CallTypeBreakdown',           // User calls vs SOH calls
  'RecentTasksTable',            // Latest tasks with status
  'EngineerLeaderboard',         // Top performers
  'OverdueTasksAlert',           // Tasks pending too long
];
```

---

## Chart Specifications

### 1. Overview KPI Cards
```typescript
// Display: 6 cards in a row
const kpiConfig = [
  { label: 'Нийт дуудлага', value: 2580, icon: 'Phone', color: 'blue' },
  { label: 'Дууссан', value: 2377, icon: 'CheckCircle', color: 'green' },
  { label: 'Хүлээгдэж буй', value: 102, icon: 'Clock', color: 'yellow' },
  { label: 'Явагдаж буй', value: 98, icon: 'Loader', color: 'purple' },
  { label: 'Дундаж хугацаа', value: '1 өдөр', icon: 'Calendar', color: 'cyan' },
  { label: 'Гүйцэтгэл', value: '92.2%', icon: 'TrendingUp', color: 'emerald' },
];
```

### 2. Monthly Trend Chart
```typescript
// Line + Bar combo chart
const monthlyData = [
  { month: '2025-01', total: 215, completed: 198, completion_rate: 92.1 },
  { month: '2025-02', total: 145, completed: 140, completion_rate: 96.5 },
  // ... more months
];
```

### 3. Engineer Performance Chart
```typescript
// Horizontal bar chart with multiple metrics
const engineerData = [
  { 
    name: 'Ganbileg B.', 
    total: 951, 
    completed: 920, 
    avg_days: 0.8,
    same_day: 780 
  },
  // ... more engineers
];
```

### 4. System Type Distribution
```typescript
// Donut chart
const systemData = [
  { type: 'Домофон систем', count: 1914, percentage: 76.0, color: '#3b82f6' },
  { type: 'Orvibo', count: 179, percentage: 7.1, color: '#10b981' },
  { type: 'CCTV', count: 143, percentage: 5.7, color: '#f59e0b' },
  { type: 'FAS', count: 103, percentage: 4.1, color: '#ef4444' },
  { type: 'ACS', count: 95, percentage: 3.8, color: '#8b5cf6' },
  { type: 'Зогсоолын систем', count: 79, percentage: 3.1, color: '#06b6d4' },
];
```

### 5. Organization Breakdown
```typescript
// Treemap or stacked bar
const orgData = [
  { name: 'Хүннү 3-р ээлж', tasks: 1125, percentage: 43.6 },
  { name: 'Сансар garden', tasks: 486, percentage: 18.8 },
  { name: 'Хүннү Плас', tasks: 288, percentage: 11.2 },
  { name: 'Хүннү 2-р ээлж', tasks: 286, percentage: 11.1 },
  // ... others grouped as "Бусад"
];
```

---

## Key Features to Implement

### 1. Real-time Dashboard
- Auto-refresh every 30 seconds
- WebSocket for live task updates
- Notification bell for new/updated tasks

### 2. Advanced Filtering
- Multi-select filters (organization, engineer, system type)
- Date range picker with presets (Today, This Week, This Month, Custom)
- Quick search across all fields
- Save filter presets

### 3. Drill-down Capabilities
- Click chart segment → filtered table view
- Click engineer → profile with all their stats
- Click organization → building breakdown

### 4. Export & Reports
- Export filtered data to Excel
- Generate PDF reports with charts
- Scheduled email reports

### 5. Mobile Responsive
- Swipeable chart carousels on mobile
- Collapsible sidebar navigation
- Touch-friendly filters

---

## Sample Data from Excel Analysis

```typescript
// Reference data extracted from Task2026.xlsx
const referenceData = {
  totalRecords: 2580,
  dateRange: {
    from: '2024-12-20',
    to: '2026-01-05'
  },
  
  statusDistribution: {
    'Completed': 2377,      // 92.1%
    'Not started': 102,     // 4.0%
    'In progress': 98       // 3.8%
  },
  
  topOrganizations: [
    { name: 'Хүннү 3-р ээлж', count: 1125 },
    { name: 'Сансар garden', count: 486 },
    { name: 'Хүннү Плас', count: 288 },
    { name: 'Хүннү 2-р ээлж', count: 286 },
    { name: 'Хүннү стандарт', count: 96 }
  ],
  
  topEngineers: [
    { name: 'Ganbileg Bayanjargal', code: '57', tasks: 951 },
    { name: 'Enkhbayar Enkhbold', code: '65', tasks: 242 },
    { name: 'Dulguun Batjargal', code: '78', tasks: 233 },
    { name: 'Jargal Gurbadam', code: '82', tasks: 226 },
    { name: 'Khuslen Ganbold', code: '66', tasks: 189 }
  ],
  
  systemTypes: [
    { name: 'Домофон систем', count: 1914 },
    { name: 'Orvibo', count: 179 },
    { name: 'CCTV', count: 143 },
    { name: 'FAS', count: 103 },
    { name: 'ACS', count: 95 },
    { name: 'Зогсоолын систем', count: 79 },
    { name: 'PAS', count: 4 }
  ],
  
  callTypes: [
    { name: 'Хэрэглэгчийн дуудлага', count: 2276 },
    { name: 'Бусад', count: 139 },
    { name: 'СӨХ-ийн дуудлага', count: 135 }
  ],
  
  avgResolutionDays: 18.98,
  medianResolutionDays: 1
};
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Supabase project and schema
- [ ] Create data migration script
- [ ] Implement basic CRUD API routes
- [ ] Set up authentication

### Phase 2: Core Dashboard (Week 3-4)
- [ ] Build KPI cards component
- [ ] Implement main charts (trend, status, engineer)
- [ ] Create tasks table with pagination
- [ ] Add basic filtering

### Phase 3: Advanced Analytics (Week 5-6)
- [ ] Build drill-down functionality
- [ ] Add organization/building analysis pages
- [ ] Implement engineer performance profiles
- [ ] Create comparison features

### Phase 4: Polish & Features (Week 7-8)
- [ ] Add export functionality (Excel, PDF)
- [ ] Implement real-time updates
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] User settings & preferences

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Recommended Libraries

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.300.0",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "zod": "^3.22.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@shadcn/ui": "latest"
  }
}
```

---

## Quick Start Commands

```bash
# Create Next.js project
npx create-next-app@latest dp-service-dashboard --typescript --tailwind --app

# Install dependencies
cd dp-service-dashboard
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query recharts date-fns lucide-react xlsx zod zustand

# Add shadcn/ui
npx shadcn@latest init
npx shadcn@latest add card chart table button input select badge

# Run development server
npm run dev
```

---

## Notes for Development

1. **Bilingual Support**: The original data uses Mongolian (Cyrillic). Consider:
   - Store original Mongolian text
   - Add English translations where needed
   - Implement i18n for UI elements

2. **Date Handling**: 
   - All dates should be stored in UTC
   - Display in local timezone (Mongolia UTC+8)
   - Use `date-fns` for formatting

3. **Performance**:
   - Use server-side pagination for large datasets
   - Implement caching for analytics queries
   - Consider materialized views for complex aggregations

4. **Security**:
   - Row Level Security (RLS) in Supabase
   - Role-based access (Admin, Engineer, Viewer)
   - Audit log for data changes

---

*This prompt document provides a complete blueprint for building your Digital Power Service Engineer dashboard. Start with Phase 1 and iterate!*
