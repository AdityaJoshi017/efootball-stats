import { Match, Player } from '../models';

// Computation of derived stats from an array of matches
export function computeStatsFromMatches(matches: Match[]) {
  const validMatches = matches.filter(m => (m.minutesPlayed ?? 0) > 0);
  const apps = validMatches.length;
  const minutes = validMatches.reduce((sum, m) => sum + (m.minutesPlayed ?? 0), 0);
  const goals = validMatches.reduce((sum, m) => sum + (m.goals ?? 0), 0);
  const assists = validMatches.reduce((sum, m) => sum + (m.assists ?? 0), 0);

  const gPlusA = goals + assists;
  const gPm = minutes > 0 ? (goals / minutes * 90) : 0;
  const aPm = minutes > 0 ? (assists / minutes * 90) : 0;
  const gAPm = minutes > 0 ? ((goals + assists) / minutes * 90) : 0;

  return {
    apps,
    minutes,
    goals,
    assists,
    gPlusA,
    gPm: parseFloat(gPm.toFixed(6)),
    aPm: parseFloat(aPm.toFixed(6)),
    gAPm: parseFloat(gAPm.toFixed(6)),
  };
}

// Computation of derived stats from aggregate fields (apps, goal, assists)
export function computeStatsFromAggregates(player: Player) {
  const apps = player.apps ?? 0;
  const goals = player.goal ?? 0;
  const assists = player.assists ?? 0;
  
  const gPlusA = goals + assists;
  const gPm = apps > 0 ? (goals / apps) : 0;
  const aPm = apps > 0 ? (assists / apps) : 0;
  const gAPm = apps > 0 ? ((goals + assists) / apps) : 0;

  return {
    apps,
    goals,
    assists,
    gPlusA,
    gPm: parseFloat(gPm.toFixed(6)),
    aPm: parseFloat(aPm.toFixed(6)),
    gAPm: parseFloat(gAPm.toFixed(6)),
  };
}
