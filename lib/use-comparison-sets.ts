import { useState, useEffect } from 'react';

export interface ComparisonSet {
  id: string;
  name: string;
  playerIds: number[];
  createdAt: number;
  updatedAt: number;
  isPreset?: boolean;
}

const STORAGE_KEY = 'comparisonSets';

export const useComparisonSets = () => {
  const [sets, setSets] = useState<ComparisonSet[]>([]);

  // Load sets from localStorage on mount
  useEffect(() => {
    const savedSets = localStorage.getItem(STORAGE_KEY);
    if (savedSets) {
      try {
        const parsed = JSON.parse(savedSets);
        if (Array.isArray(parsed)) {
          setSets(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved comparison sets', e);
      }
    }
  }, []);

  // Save sets to localStorage whenever they change
  useEffect(() => {
    if (sets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [sets]);

  const saveSet = (name: string, playerIds: number[], isPreset = false) => {
    const newSet: ComparisonSet = {
      id: isPreset ? `preset-${name.toLowerCase().replace(/\s+/g, '-')}` : Date.now().toString(),
      name,
      playerIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPreset
    };

    setSets(prev => {
      // If updating existing preset, replace it
      const existingIndex = prev.findIndex(set => set.id === newSet.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newSet;
        return updated;
      }
      return [...prev, newSet];
    });
    return newSet;
  };

  const updateSet = (id: string, updates: Partial<ComparisonSet>) => {
    setSets(prev =>
      prev.map(set =>
        set.id === id
          ? { ...set, ...updates, updatedAt: Date.now() }
          : set
      )
    );
  };

  const deleteSet = (id: string) => {
    setSets(prev => prev.filter(set => set.id !== id));
  };

  const getPresetSets = (players: any[]): ComparisonSet[] => {
    if (!players.length) return [];

    // Helper to find player ID by name (case-insensitive partial match)
    const findPlayerId = (name: string) => {
      const normalized = name.toLowerCase().trim();
      const player = players.find(p => 
        p.name.toLowerCase().includes(normalized)
      );
      return player?.id;
    };

    // Epic CFs preset with exact player names
    const epicCFs = [
      { name: "Gabriel Batistuta" },
      { name: "Fernando Torres" },
      { name: "Ruud van Nistelrooy" },
      { name: "David Villa" }
    ].map(p => findPlayerId(p.name)).filter(Boolean) as number[];

    // CF/SS presets
    const cfPlayers = [...players.filter(p => ['CF', 'SS'].includes(p.position))];
    const topScorers = cfPlayers
      .sort((a, b) => b.gPm - a.gPm)
      .slice(0, 4)
      .map(p => p.id);

    // Playmakers (AMF/CMF)
    const playmakers = players
      .filter(p => ['AMF', 'CMF'].includes(p.position))
      .sort((a, b) => b.aPm - a.aPm)
      .slice(0, 4)
      .map(p => p.id);

    // Wingers (LWF/RWF)
    const wingers = players
      .filter(p => ['LWF', 'RWF'].includes(p.position))
      .sort((a, b) => b.gAPm - a.gAPm)
      .slice(0, 4)
      .map(p => p.id);

    return [
      {
        id: 'preset-epic-cfs',
        name: 'Epic CFs (Legends)',
        playerIds: epicCFs.length > 0 ? epicCFs : topScorers,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPreset: true
      },
      {
        id: 'preset-cf',
        name: 'Top CF/SS (Current)',
        playerIds: topScorers,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPreset: true
      },
      {
        id: 'preset-playmakers',
        name: 'Best Playmakers',
        playerIds: playmakers,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPreset: true
      },
      {
        id: 'preset-wingers',
        name: 'Top Wingers',
        playerIds: wingers,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPreset: true
      },
    ];
  };

  return {
    sets,
    saveSet,
    updateSet,
    deleteSet,
    getPresetSets,
  };
};
