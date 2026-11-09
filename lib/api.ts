// API client for efootball-stats backend
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
      'Content-Type': 'application/json',
      ...options.headers,
      'x-admin-token': ADMIN_TOKEN,
    },
  });
}

// Types
export interface Player {
  id: number;
  name: string;
  team: string;
  position: string;
  age: number;
  cardType: string;
  cardSlug: string;
  displayName: string;
  ovrRating?: number | null;
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

export interface StatUpdate {
  id: number;
  playerId: number;
  statType: 'goals' | 'assists' | 'apps';
  oldValue: number;
  newValue: number;
  change: number;
  percentChange: number;
  updatedBy: string;
  updateSource: 'manual' | 'bulk_script' | 'form';
  createdAt: string;
  updatedAt: string;
  player?: {
    id: number;
    name: string;
    team: string;
  };
}

export interface StatSnapshot {
  id: number;
  playerId: number;
  snapshotDate: string;
  goals: number;
  assists: number;
  apps: number;
  createdAt: string;
  updatedAt: string;
  player?: {
    id: number;
    name: string;
    team: string;
  };
}

export interface StatsHistoryPoint {
  date: string;
  goals: number;
  assists: number;
  apps: number;
  gPlusA: number;
  gPm: number;
  aPm: number;
  gAPm: number;
  ovr?: number | null;
  updatedBy: string;
  updateSource: string;
}

export interface StatsHistoryResponse {
  playerId: number;
  points: StatsHistoryPoint[];
}

export interface StatsAsOfResult {
  hasData: boolean;
  source?: 'snapshot' | 'current';
  asOf?: string;
  snapshotDate?: string;
  goals?: number;
  assists?: number;
  apps?: number;
  gPlusA?: number;
  gPm?: number;
  aPm?: number;
  gAPm?: number;
  ovr?: number | null;
  updatedBy?: string;
  updateSource?: string;
  message?: string;
  earliestSnapshotDate?: string;
}

export interface SnapshotComparison {
  hasPreviousSnapshot: boolean;
  current: {
    goals: number;
    assists: number;
    apps: number;
  };
  previous?: {
    goals: number;
    assists: number;
    apps: number;
  };
  changes?: {
    goals: number;
    assists: number;
    apps: number;
  };
  percentChanges?: {
    goals: number;
    assists: number;
    apps: number;
  };
  lastSnapshotDate?: string;
  message?: string;
}

// Public API functions
export const api = {
  // Get all players
  getPlayers: (): Promise<PlayerWithStats[]> => apiCall('/api/players'),

  // Get single player
  getPlayer: (id: number): Promise<{ player: Player; matches: Match[]; stats: PlayerStats }> =>
    apiCall(`/api/players/${id}`),

  // Get player matches
  getPlayerMatches: (id: number): Promise<Match[]> =>
    apiCall(`/api/players/${id}/matches`),

  // Get all stat updates
  getAllStatUpdates: (params?: {
    playerId?: number;
    statType?: string;
    updateSource?: string;
    limit?: number;
    offset?: number;
  }): Promise<StatUpdate[]> => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiCall(`/api/stat-updates${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get stat updates for a specific player
  getPlayerStatUpdates: (playerId: number, params?: {
    statType?: string;
    limit?: number;
  }): Promise<StatUpdate[]> => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiCall(`/api/stat-updates/${playerId}${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get snapshots for a player
  getPlayerSnapshots: (playerId: number, params?: {
    limit?: number;
  }): Promise<StatSnapshot[]> => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiCall(`/api/snapshots/${playerId}${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get stat history series (totals + per-app ratios) for a player
  getPlayerStatsHistory: (playerId: number, params?: {
    from?: string;
    to?: string;
  }): Promise<StatsHistoryResponse> => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiCall(`/api/players/${playerId}/stats-history${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get a player's stats as of a specific date
  getPlayerStatsAsOf: (playerId: number, date?: string): Promise<StatsAsOfResult> => {
    const queryParams = date ? `?date=${encodeURIComponent(date)}` : '';
    return apiCall(`/api/players/${playerId}/stats-as-of${queryParams}`);
  },

  // Compare current stats vs previous snapshot
  compareSnapshot: (playerId: number): Promise<SnapshotComparison> =>
    apiCall(`/api/snapshots/${playerId}/compare`),

  // Health check
  healthCheck: () => apiCall('/health'),
};

// Admin API functions
export const adminApi = {
  // Create player
  createPlayer: async (playerData: {
    name: string;
    team: string;
    position: string;
    age: number;
    cardType: string;
    ovrRating?: number | null;
    apps: number;
    goal: number;
    assists: number;
    imageUrl?: string;
  }) => {
    // Transform imageUrl to image for backend compatibility
    const data = playerData.imageUrl ? { ...playerData, image: playerData.imageUrl } : playerData;
    
    const response = await fetch(`${API_BASE_URL}/api/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_TOKEN,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create player: ${response.statusText}`);
    }

    return response.json();
  },
  
  // Update player
  updatePlayer: async (id: number, playerData: {
    name?: string;
    team?: string;
    position?: string;
    age?: number;
    cardType?: string;
    apps?: number;
    goal?: number;
    assists?: number;
    ovrRating?: number | null;
    imageUrl?: string;
  }) => {
    // Transform imageUrl to image for backend compatibility
    const data = playerData.imageUrl ? { ...playerData, image: playerData.imageUrl } : playerData;
    
    return adminApiCall(`/api/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Delete player
  deletePlayer: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/players/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-token': ADMIN_TOKEN,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete player: ${response.statusText}`);
    }

    return response.json();
  },
  
  // Add match
  addMatch: (playerId: number, matchData: {
    matchDate: string;
    minutesPlayed: number;
    goals: number;
    assists: number;
    shots?: number;
    passesCompleted?: number;
    passesAttempted?: number;
    xG?: number;
    xA?: number;
  }) => 
    adminApiCall(`/api/players/${playerId}/matches`, {
      method: 'POST',
      body: JSON.stringify(matchData),
    }),
  
  // Update match
  updateMatch: (matchId: number, matchData: {
    matchDate?: string;
    minutesPlayed?: number;
    goals?: number;
    assists?: number;
    shots?: number;
    passesCompleted?: number;
    passesAttempted?: number;
    xG?: number;
    xA?: number;
  }) =>
    adminApiCall(`/api/matches/${matchId}`, {
      method: 'PUT',
      body: JSON.stringify(matchData),
    }),
  
  // Delete match
  deleteMatch: (matchId: number) =>
    adminApiCall(`/api/matches/${matchId}`, {
      method: 'DELETE',
    }),

  // Create snapshot for a player
  createSnapshot: (playerId: number) =>
    adminApiCall(`/api/snapshots/${playerId}`, {
      method: 'POST',
    }),

  // Log a stat update
  logStatUpdate: (data: {
    playerId: number;
    statType: 'goals' | 'assists' | 'apps';
    oldValue: number;
    newValue: number;
    updatedBy?: string;
    updateSource?: 'manual' | 'bulk_script' | 'form';
  }) =>
    adminApiCall('/api/stat-updates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
