# Frontend Integration Guide

This guide shows how to integrate the efootball-stats backend API with your Next.js frontend.

## Configuration

Create a new file `lib/api.ts` in your frontend:

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-secret-token-change-in-production';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Helper function for admin API calls
async function adminApiCall(endpoint: string, options: RequestInit = {}) {
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'x-admin-token': ADMIN_TOKEN,
    },
  });
}

// Public API functions
export const api = {
  // Get all players
  getPlayers: () => apiCall('/api/players'),
  
  // Get single player
  getPlayer: (id: number) => apiCall(`/api/players/${id}`),
  
  // Get player matches
  getPlayerMatches: (id: number) => apiCall(`/api/players/${id}/matches`),
  
  // Health check
  healthCheck: () => apiCall('/health'),
};

// Admin API functions
export const adminApi = {
  // Create player
  createPlayer: async (playerData: any, imageFile?: File) => {
    if (imageFile) {
      // Multipart form data for image upload
      const formData = new FormData();
      Object.keys(playerData).forEach(key => {
        formData.append(key, playerData[key]);
      });
      formData.append('image', imageFile);

      const response = await fetch(`${API_BASE_URL}/api/players`, {
        method: 'POST',
        headers: {
          'x-admin-token': ADMIN_TOKEN,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to create player: ${response.statusText}`);
      }

      return response.json();
    } else {
      // JSON request without image
      return adminApiCall('/api/players', {
        method: 'POST',
        body: JSON.stringify(playerData),
      });
    }
  },
  
  // Update player
  updatePlayer: async (id: number, playerData: any, imageFile?: File) => {
    if (imageFile) {
      const formData = new FormData();
      Object.keys(playerData).forEach(key => {
        formData.append(key, playerData[key]);
      });
      formData.append('image', imageFile);

      const response = await fetch(`${API_BASE_URL}/api/players/${id}`, {
        method: 'PUT',
        headers: {
          'x-admin-token': ADMIN_TOKEN,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to update player: ${response.statusText}`);
      }

      return response.json();
    } else {
      return adminApiCall(`/api/players/${id}`, {
        method: 'PUT',
        body: JSON.stringify(playerData),
      });
    }
  },
  
  // Delete player
  deletePlayer: (id: number) => adminApiCall(`/api/players/${id}`, {
    method: 'DELETE',
  }),
  
  // Add match
  addMatch: (playerId: number, matchData: any) => 
    adminApiCall(`/api/players/${playerId}/matches`, {
      method: 'POST',
      body: JSON.stringify(matchData),
    }),
  
  // Update match
  updateMatch: (matchId: number, matchData: any) =>
    adminApiCall(`/api/matches/${matchId}`, {
      method: 'PUT',
      body: JSON.stringify(matchData),
    }),
  
  // Delete match
  deleteMatch: (matchId: number) => adminApiCall(`/api/matches/${matchId}`, {
    method: 'DELETE',
  }),
};
```

## Environment Variables

Add to your frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ADMIN_TOKEN=dev-secret-token-change-in-production
```

## Usage Examples

### Fetching Players

```typescript
// In your component or page
import { api } from '@/lib/api';

export default async function PlayersPage() {
  const players = await api.getPlayers();
  
  return (
    <div>
      <h1>Players</h1>
      {players.map((player: any) => (
        <div key={player.id}>
          <h2>{player.name}</h2>
          <p>Team: {player.team}</p>
          <p>Goals per match: {player.stats.gPm}</p>
          <p>Assists per match: {player.stats.aPm}</p>
          <p>G+A per match: {player.stats.gAPm}</p>
        </div>
      ))}
    </div>
  );
}
```

### Add Player Form Component

```typescript
// components/AddPlayerForm.tsx
'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/api';

export default function AddPlayerForm() {
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    position: '',
    age: '',
    cardType: '',
    apps: '',
    goal: '',
    assists: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const playerData = {
        ...formData,
        age: parseInt(formData.age),
        apps: parseInt(formData.apps) || 0,
        goal: parseInt(formData.goal) || 0,
        assists: parseInt(formData.assists) || 0,
      };

      const result = await adminApi.createPlayer(playerData, imageFile || undefined);
      
      console.log('Player created:', result);
      alert('Player created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        team: '',
        position: '',
        age: '',
        cardType: '',
        apps: '',
        goal: '',
        assists: '',
      });
      setImageFile(null);
    } catch (err) {
      setError('Failed to create player. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2>Add New Player</h2>
      
      {error && <div className="error">{error}</div>}
      
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label>Team:</label>
        <input
          type="text"
          name="team"
          value={formData.team}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label>Position:</label>
        <select
          name="position"
          value={formData.position}
          onChange={handleChange}
        >
          <option value="">Select position</option>
          <option value="CF">CF (Center Forward)</option>
          <option value="SS">SS (Second Striker)</option>
          <option value="AMF">AMF (Attacking Midfielder)</option>
          <option value="CMF">CMF (Central Midfielder)</option>
          <option value="DMF">DMF (Defensive Midfielder)</option>
          <option value="LWF">LWF (Left Winger)</option>
          <option value="RWF">RWF (Right Winger)</option>
          <option value="CB">CB (Center Back)</option>
          <option value="LB">LB (Left Back)</option>
          <option value="RB">RB (Right Back)</option>
          <option value="GK">GK (Goalkeeper)</option>
        </select>
      </div>
      
      <div>
        <label>Age:</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label>Card Type:</label>
        <select
          name="cardType"
          value={formData.cardType}
          onChange={handleChange}
          required
        >
          <option value="">Select card type</option>
          <option value="epic">Epic</option>
          <option value="epic-big time">Epic Big Time</option>
          <option value="legendary">Legendary</option>
          <option value="show-time">Show Time</option>
          <option value="highlight">Highlight</option>
          <option value="featured">Featured</option>
          <option value="potw">Player of the Week</option>
        </select>
      </div>
      
      <div>
        <label>Appearances:</label>
        <input
          type="number"
          name="apps"
          value={formData.apps}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label>Goals:</label>
        <input
          type="number"
          name="goal"
          value={formData.goal}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label>Assists:</label>
        <input
          type="number"
          name="assists"
          value={formData.assists}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label>Player Image:</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Add Player'}
      </button>
    </form>
  );
}
```

### Displaying Auto-Calculated Stats

```typescript
// components/PlayerStats.tsx
interface PlayerStatsProps {
  stats: {
    gPlusA: number;
    gPm: number;
    aPm: number;
    gAPm: number;
    xG90: number;
    xA90: number;
    dribbles: number;
    keyPasses: number;
  };
}

export default function PlayerStats({ stats }: PlayerStatsProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Goals + Assists</h3>
        <p className="stat-value">{stats.gPlusA}</p>
      </div>
      
      <div className="stat-card">
        <h3>Goals per Match</h3>
        <p className="stat-value">{stats.gPm.toFixed(3)}</p>
      </div>
      
      <div className="stat-card">
        <h3>Assists per Match</h3>
        <p className="stat-value">{stats.aPm.toFixed(3)}</p>
      </div>
      
      <div className="stat-card">
        <h3>G+A per Match</h3>
        <p className="stat-value">{stats.gAPm.toFixed(3)}</p>
      </div>
      
      <div className="stat-card">
        <h3>xG90</h3>
        <p className="stat-value">{stats.xG90.toFixed(3)}</p>
      </div>
      
      <div className="stat-card">
        <h3>xA90</h3>
        <p className="stat-value">{stats.xA90.toFixed(3)}</p>
      </div>
      
      <div className="stat-card">
        <h3>Dribbles</h3>
        <p className="stat-value">{stats.dribbles}</p>
      </div>
      
      <div className="stat-card">
        <h3>Key Passes</h3>
        <p className="stat-value">{stats.keyPasses}</p>
      </div>
    </div>
  );
}
```

### Updating Existing Player Data

```typescript
// components/UpdatePlayerForm.tsx
'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/api';

export default function UpdatePlayerForm({ player }: { player: any }) {
  const [formData, setFormData] = useState({
    name: player.name,
    team: player.team,
    position: player.position,
    age: player.age,
    cardType: player.cardType,
    apps: player.apps,
    goal: player.goal,
    assists: player.assists,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const playerData = {
        ...formData,
        age: parseInt(formData.age),
        apps: parseInt(formData.apps),
        goal: parseInt(formData.goal),
        assists: parseInt(formData.assists),
      };

      const result = await adminApi.updatePlayer(player.id, playerData, imageFile || undefined);
      
      console.log('Player updated:', result);
      alert('Player updated successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to update player');
    } finally {
      setLoading(false);
    }
  };

  // Similar form structure as AddPlayerForm
  // ...
}
```

## Server-Side Integration

For server-side rendering in Next.js:

```typescript
// app/players/page.tsx
import { api } from '@/lib/api';

export default async function PlayersPage() {
  const players = await api.getPlayers();
  
  return (
    <div>
      <h1>All Players</h1>
      {players.map((player: any) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}
```

## Error Handling

```typescript
// lib/api.ts (enhanced version)
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || 
        `API call failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}
```

## TypeScript Types

Create `types/player.ts`:

```typescript
export interface Player {
  id: number;
  name: string;
  team: string;
  position: string;
  age: number;
  cardType: string;
  apps: number;
  goal: number;
  assists: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerStats {
  apps: number;
  goals: number;
  assists: number;
  gPlusA: number;
  gPm: number;
  aPm: number;
  gAPm: number;
  xG90: number;
  xA90: number;
  dribbles: number;
  keyPasses: number;
  defensiveActions: number;
  progressivePasses: number;
  shotCreatingActions: number;
  goalCreatingActions: number;
  passAccuracy?: number;
  shots?: number;
}

export interface PlayerWithStats extends Player {
  stats: PlayerStats;
}

export interface Match {
  id: number;
  playerId: number;
  matchDate: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  shots?: number;
  passesCompleted?: number;
  passesAttempted?: number;
  xG?: number;
  xA?: number;
  createdAt: string;
  updatedAt: string;
}
```

## Migration Strategy

To migrate from hardcoded data to API:

1. **Replace imports:**
   ```typescript
   // Old
   import { playersData } from '@/lib/players-data';
   
   // New
   import { api } from '@/lib/api';
   const players = await api.getPlayers();
   ```

2. **Update component props:**
   ```typescript
   // Old
   interface Props {
     players: Player[];
   }
   
   // New
   interface Props {
     players: PlayerWithStats[];
   }
   ```

3. **Use computed stats:**
   ```typescript
   // Old
   const gPm = player.gPm;
   
   // New
   const gPm = player.stats.gPm;
   ```

## Testing

Create a test page to verify the integration:

```typescript
// app/test-api/page.tsx
import { api } from '@/lib/api';

export default async function TestApiPage() {
  try {
    const health = await api.healthCheck();
    const players = await api.getPlayers();
    
    return (
      <div>
        <h1>API Test</h1>
        <p>Health: {health.status}</p>
        <p>Players count: {players.length}</p>
        <pre>{JSON.stringify(players[0], null, 2)}</pre>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <h1>API Test Failed</h1>
        <p>{String(error)}</p>
      </div>
    );
  }
}
```

## Next Steps

1. Create the `lib/api.ts` file
2. Add environment variables
3. Create the AddPlayerForm component
4. Update existing components to use API data
5. Test the integration
6. Deploy both frontend and backend

The backend is now ready and fully functional with automatic stat calculation. You can start integrating it with your frontend using the examples above!
