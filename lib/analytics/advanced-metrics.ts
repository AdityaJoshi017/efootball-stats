import { Player, playersData } from "@/lib/players-data"

export interface AdvancedPlayerMetrics {
  name: string;
  xG: number;  // Expected Goals
  xA: number;  // Expected Assists
  xG90: number;  // xG per 90 minutes
  xA90: number;  // xA per 90 minutes
  xGPlusA90: number;  // xG + xA per 90
  shotConversion: number;  // Goals per shot
  keyPasses: number;  // Key passes per 90
  progressivePasses: number;  // Progressive passes per 90
  dribbles: number;  // Successful dribbles per 90
  defensiveActions: number;  // Tackles + interceptions per 90
  form: number[];  // Form over last 5 matches (1-10 scale)
  consistency: number;  // Consistency rating (0-1)
}

// Estimated minutes per appearance (for per-90 stats)
const MINUTES_PER_APPEARANCE = 80; // Estimate

// Generate random advanced metrics for demonstration
// In a real app, this would come from a data source
function generateAdvancedMetrics(player: Player): AdvancedPlayerMetrics {
  // Base values influenced by player position
  const isForward = ['CF', 'SS', 'LWF', 'RWF'].includes(player.position);
  const isMidfielder = ['AMF', 'CMF', 'LMF', 'RMF'].includes(player.position);
  
  // Generate realistic metrics based on position and performance
  const xG = player.gPm * (0.8 + Math.random() * 0.4); // xG close to actual goals
  const xA = player.aPm * (0.7 + Math.random() * 0.6); // xA with more variance
  
  // Calculate per 90 metrics
  const xG90 = (xG / player.apps) * (90 / MINUTES_PER_APPEARANCE);
  const xA90 = (xA / player.apps) * (90 / MINUTES_PER_APPEARANCE);
  
  // Generate form (last 5 matches)
  const form = Array(5).fill(0).map(() => 
    Math.min(10, Math.max(1, Math.round((player.gAPm * 4) + (Math.random() * 4) - 2)))
  );
  
  // Calculate consistency (standard deviation of form, inverted and normalized)
  const avgForm = form.reduce((a, b) => a + b, 0) / form.length;
  const variance = form.reduce((a, b) => a + Math.pow(b - avgForm, 2), 0) / form.length;
  const consistency = Math.max(0, 1 - (Math.sqrt(variance) / 3)); // Normalize to 0-1

  return {
    name: player.name,
    xG,
    xA,
    xG90,
    xA90,
    xGPlusA90: xG90 + xA90,
    shotConversion: player.gPm > 0 ? parseFloat((player.gPm / (player.gPm * 3 + Math.random() * 2)).toFixed(2)) : 0,
    keyPasses: isMidfielder ? (1.5 + Math.random() * 2) : (0.5 + Math.random() * 1.5),
    progressivePasses: isMidfielder ? (5 + Math.random() * 8) : (2 + Math.random() * 6),
    dribbles: isForward ? (2 + Math.random() * 4) : (0.5 + Math.random() * 2),
    defensiveActions: isMidfielder ? (1.5 + Math.random() * 3) : (isForward ? 0.5 + Math.random() : 2 + Math.random() * 4),
    form,
    consistency
  };
}

export function getAdvancedMetrics(players: Player[]): Record<string, AdvancedPlayerMetrics> {
  const metrics: Record<string, AdvancedPlayerMetrics> = {};
  
  for (const player of players) {
    metrics[player.name.toLowerCase()] = generateAdvancedMetrics(player);
  }
  
  return metrics;
}

export function getPlayerComparison(players: Player[], metrics: string[] = ['xG90', 'xA90', 'xGPlusA90']) {
  const advancedMetrics = getAdvancedMetrics(players);
  
  return players.map(player => ({
    name: player.name,
    position: player.position,
    team: player.team,
    metrics: metrics.reduce((acc, metric) => ({
      ...acc,
      [metric]: advancedMetrics[player.name.toLowerCase()]?.[metric as keyof AdvancedPlayerMetrics] || 0
    }), {})
  }));
}

// Performance trend analysis
export function analyzePerformanceTrend(player: Player) {
  const metrics = generateAdvancedMetrics(player);
  const form = metrics.form;
  const avgForm = form.reduce((a, b) => a + b, 0) / form.length;
  
  // Simple trend analysis
  const lastFive = form.slice(-5);
  const firstHalf = lastFive.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const secondHalf = lastFive.slice(3).reduce((a, b) => a + b, 0) / 2;
  
  let trend: 'improving' | 'declining' | 'stable';
  if (secondHalf > firstHalf + 1) trend = 'improving';
  else if (secondHalf < firstHalf - 1) trend = 'declining';
  else trend = 'stable';
  
  return {
    averageForm: avgForm.toFixed(1),
    consistency: (metrics.consistency * 100).toFixed(0) + '%',
    trend,
    lastFiveMatches: form,
    strengths: getPlayerStrengths(metrics, player.position)
  };
}

function getPlayerStrengths(metrics: AdvancedPlayerMetrics, position: string): string[] {
  const strengths: string[] = [];
  
  if (metrics.xG90 > 0.4) strengths.push('Clinical Finishing');
  if (metrics.xA90 > 0.3) strengths.push('Playmaking');
  if (metrics.dribbles > 3) strengths.push('Dribbling');
  if (metrics.defensiveActions > 2) strengths.push('Defensive Workrate');
  if (metrics.consistency > 0.8) strengths.push('Consistent Performer');
  
  // Position-specific strengths
  if (['CF', 'SS', 'LWF', 'RWF'].includes(position) && metrics.xG90 > 0.5) {
    strengths.push('Clinical Finisher');
  }
  
  if (['AMF', 'CMF'].includes(position) && metrics.xA90 > 0.4) {
    strengths.push('Creative Midfielder');
  }
  
  if (['LB', 'RB', 'CB'].includes(position) && metrics.defensiveActions > 3) {
    strengths.push('Defensive Rock');
  }
  
  return strengths.length > 0 ? strengths : ['Well-rounded Player'];
}
