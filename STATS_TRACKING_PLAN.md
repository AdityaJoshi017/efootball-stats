# Stats Update Tracking System - Implementation Plan

## 🎯 Overview
Implement a comprehensive stats update tracking system that combines database audit trails, snapshot comparisons, and visual charts for goals, assists, and matches (apps) updates.

## 🗄️ Part 1: Database Schema (Option 1)

### 1.1 Create `player_stat_updates` Table
- id (primary key, auto-increment)
- player_id (foreign key to players table)
- stat_type (enum: 'goals', 'assists', 'apps')
- old_value (integer)
- new_value (integer)
- updated_at (timestamp)
- updated_by (string - user who made the update)
- update_source (string: 'manual', 'bulk_script', 'form')

### 1.2 Backend Implementation
- File: backend/src/models.ts - Add PlayerStatUpdate Sequelize model
- File: backend/src/controllers/updateController.ts - Create update controller
- API Endpoints:
  - GET /api/stat-updates/:playerId - Get update history for a player
  - GET /api/stat-updates - Get all update history (with filters)
  - POST /api/stat-updates - Log a stat update
- Middleware: Auto-log stat updates when player stats are modified

## 📸 Part 2: Snapshot System (Option 2)

### 2.1 Create `player_stat_snapshots` Table
- id (primary key, auto-increment)
- player_id (foreign key)
- snapshot_date (timestamp)
- goals (integer)
- assists (integer)
- apps (integer)
- created_at (timestamp)

### 2.2 Backend Implementation
- File: backend/src/models.ts - Add PlayerStatSnapshot Sequelize model
- File: backend/src/controllers/snapshotController.ts - Create snapshot controller
- API Endpoints:
  - POST /api/snapshots/:playerId - Create a snapshot
  - GET /api/snapshots/:playerId - Get snapshots for a player
  - GET /api/snapshots/:playerId/compare - Compare current vs previous snapshot

### 2.3 Auto-Snapshot Trigger
- Create a database trigger or middleware hook
- Automatically create snapshot before any stat update
- Store both old and new values for comparison

## 📊 Part 3: Activity Log + Charts (Option 3)

### 3.1 Frontend Activity Log Page
- Route: /stats-history or /activity-log
- Features:
  - Table showing all stat updates with filters
  - Filter by player, stat type, date range
  - Show before/after values comparison
  - Sort by date, player, or stat type

### 3.2 Chart Implementation
- Library: Recharts (already in use)
- Chart Types:
  - Line Chart: Stat progression over time for a player
  - Bar Chart: Side-by-side comparison of stats before/after
  - Area Chart: Cumulative stats progression
- File: app/stats-history/page.tsx

### 3.3 Player Detail Page Enhancement
- Route: /players/[id]/page.tsx
- Add to existing page:
  - "Stats History" tab or section
  - Show last updated date
  - Show previous stats vs current stats
  - Mini chart showing recent updates

## 🔧 Part 4: Integration Points

### 4.1 Backend Integration
- Modify backend/src/controllers/playerController.ts:
  - updatePlayer() function: Log update to player_stat_updates
  - Auto-create snapshot before update
  - Record who made the update (user from auth token or "system" for scripts)

- Modify backend/scripts/bulk-update-*.ts scripts:
  - Add logging to player_stat_updates table
  - Set update_source to "bulk_script"
  - Set updated_by to "system"

### 4.2 Frontend Integration
- Modify app/stats-update/page.tsx:
  - After successful update, log to player_stat_updates
  - Refresh activity log data

- Modify app/admin/add-player/page.tsx:
  - When creating player, log initial stats as first snapshot

## 📱 Part 5: User Interface

### 5.1 Stats History Page Structure
/app/stats-history/
├── page.tsx (main page)
├── components/
│   ├── ActivityLogTable.tsx (table of updates)
│   ├── StatProgressChart.tsx (line chart)
│   ├── ComparisonCard.tsx (before/after comparison)
│   └── UpdateFilters.tsx (filter controls)

### 5.2 Page Features
- Activity Log Table:
  - Columns: Date, Player, Stat, Old Value, New Value, Change, Source
  - Sortable by all columns
  - Filter by player, stat type, date range
  - Pagination

- Stat Progress Chart:
  - Line chart showing stat progression over time
  - Multiple lines for different stats (goals, assists, apps)
  - Hover tooltips showing exact values
  - Date range selector

- Comparison Card:
  - Show current stats vs previous stats
  - Highlight changes (green for increase, red for decrease)
  - Show % change calculation

### 5.3 Player Detail Page Enhancement
- Add "Stats History" section below existing stats
- Show: "Last Updated: [date]"
- Mini table: "Previous | Current | Change"
- Click "View Full History" → redirect to /stats-history?playerId=X

## 🎨 Part 6: Data Models & Types

### 6.1 TypeScript Types
interface StatUpdate {
  id: number;
  playerId: number;
  playerName: string;
  statType: 'goals' | 'assists' | 'apps';
  oldValue: number;
  newValue: number;
  change: number;
  percentChange: number;
  updatedAt: string;
  updatedBy: string;
  updateSource: 'manual' | 'bulk_script' | 'form';
}

interface StatSnapshot {
  id: number;
  playerId: number;
  snapshotDate: string;
  goals: number;
  assists: number;
  apps: number;
  createdAt: string;
}

## 📅 Part 7: Implementation Order

### Phase 1: Backend Foundation
1. Add Sequelize models for PlayerStatUpdate and PlayerStatSnapshot
2. Create migration script to add tables
3. Create update controller and snapshot controller
4. Implement API endpoints
5. Add logging to existing updatePlayer function

### Phase 2: Frontend Foundation
1. Create stats history page structure
2. Create reusable chart components
3. Create activity log table component
4. Implement filter controls
5. Add TypeScript types

### Phase 3: Integration
1. Integrate logging into existing update functions
2. Add auto-snapshot triggers
3. Connect to existing stats-update page
4. Add stats history section to player detail page

### Phase 4: UI Polish
1. Add responsive design
2. Add loading states
3. Add error handling
4. Add empty states
5. Add tooltips and legends for charts

## 🔍 Part 8: Sample Data Flow

### Example User Journey:
1. User updates Erling Haaland's goals from 100 to 150
2. System automatically:
   - Creates snapshot: {goals: 100, assists: 30, apps: 120}
   - Logs update: {stat_type: 'goals', old: 100, new: 150, updated_by: 'user'}
3. User navigates to /stats-history
4. Sees:
   - Activity log table showing the update
   - Line chart showing goals progression over time
   - Comparison card: "Goals: 100 → 150 (+50, +50%)"
5. User navigates to /players/[id]
6. Sees:
   - "Last Updated: [date]"
   - "Previous: 100 goals | Current: 150 goals"

## 🎯 Part 9: Success Criteria

### 9.1 Functional Requirements
- All stat updates are logged automatically
- Snapshots are created before updates
- Activity log page shows all updates
- Charts display stat progression correctly
- Player detail page shows last update info
- Filters work for player, stat type, date range
- Bulk updates are logged as "bulk_script"

### 9.2 Technical Requirements
- Database tables created with proper relationships
- API endpoints follow REST conventions
- TypeScript types are properly defined
- Charts are responsive and interactive
- Performance is acceptable for large datasets

## 🚀 Part 10: Estimated Effort

- Phase 1 (Backend): 4-6 hours
- Phase 2 (Frontend Foundation): 3-4 hours
- Phase 3 (Integration): 2-3 hours
- Phase 4 (UI Polish): 2-3 hours
- Testing & Debugging: 2-3 hours

Total Estimated: 13-19 hours
