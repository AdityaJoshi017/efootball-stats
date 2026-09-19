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
};
