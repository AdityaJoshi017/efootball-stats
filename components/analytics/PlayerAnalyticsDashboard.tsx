'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Cell } from 'recharts';
import { Player } from "../../lib/players-data";
import { AdvancedPlayerMetrics, analyzePerformanceTrend, getAdvancedMetrics } from "@/lib/analytics/advanced-metrics";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Target, Zap, Activity, BarChart as BarChartIcon } from 'lucide-react';

// Color palette
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#1e293b',
  text: '#f8fafc',
  grid: '#334155'
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
        <p className="font-semibold">{label}</p>
        <p className="text-sm">{payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

interface PlayerAnalyticsDashboardProps {
  players: Player[];
  selectedPlayer: Player;
}

export function PlayerAnalyticsDashboard({ players, selectedPlayer }: PlayerAnalyticsDashboardProps) {
  // Ensure selectedPlayer has all required fields with defaults
  const playerWithDefaults = {
    ...selectedPlayer,
    xG90: selectedPlayer.xG90 ?? 0,
    xA90: selectedPlayer.xA90 ?? 0,
    dribbles: selectedPlayer.dribbles ?? 0,
    keyPasses: selectedPlayer.keyPasses ?? 0,
    defensiveActions: selectedPlayer.defensiveActions ?? 0,
    progressivePasses: selectedPlayer.progressivePasses ?? 0,
    shotCreatingActions: selectedPlayer.shotCreatingActions ?? 0,
    goalCreatingActions: selectedPlayer.goalCreatingActions ?? 0,
  };

  const advancedMetrics = getAdvancedMetrics([playerWithDefaults])[playerWithDefaults.name.toLowerCase()] || {};
  const trendAnalysis = analyzePerformanceTrend(playerWithDefaults);
  
  // Prepare data for charts with proper null checks
  const radarData = [
    { subject: 'Goals', A: Number(advancedMetrics?.xG90 || 0) * 20, fullMark: 10 },
    { subject: 'Assists', A: Number(advancedMetrics?.xA90 || 0) * 20, fullMark: 10 },
    { subject: 'Dribbles', A: Number(advancedMetrics?.dribbles || 0) * 1.5, fullMark: 10 },
    { subject: 'Key Passes', A: Number(advancedMetrics?.keyPasses || 0) * 2, fullMark: 10 },
    { subject: 'Defense', A: Number(advancedMetrics?.defensiveActions || 0), fullMark: 10 },
    { subject: 'Consistency', A: Number(trendAnalysis.consistency) * 10, fullMark: 10 },
  ];

  const formData = trendAnalysis.lastFiveMatches.map((score, index) => ({
    match: `Match ${index + 1}`,
    rating: score,
  }));

  // Comparison data (top 5 players in same position)
  const positionPeers = players
    .filter(p => p.position === selectedPlayer.position && p.id !== selectedPlayer.id)
    .slice(0, 5);
  
  const comparisonData = [selectedPlayer, ...positionPeers].map(player => {
    const metrics = getAdvancedMetrics([player])[player.name.toLowerCase()];
    return {
      name: player.name,
      xG90: metrics.xG90,
      xA90: metrics.xA90,
      xGPlusA90: metrics.xGPlusA90,
    };
  });

  return (
    <div className="space-y-4 p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Expected Goals</CardTitle>
              <p className="text-xs text-muted-foreground/70">Per 90 minutes</p>
            </div>
            <div className="p-2 rounded-full bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{advancedMetrics.xG90.toFixed(2)}</span>
              <span className="text-sm text-success flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" />
                12.5%
              </span>
            </div>
            <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                style={{ width: `${Math.min(advancedMetrics.xG90 * 20, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Expected Assists</CardTitle>
              <p className="text-xs text-muted-foreground/70">Per 90 minutes</p>
            </div>
            <div className="p-2 rounded-full bg-secondary/10">
              <Zap className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{advancedMetrics.xA90.toFixed(2)}</span>
              <span className="text-sm text-success flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" />
                8.3%
              </span>
            </div>
            <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-secondary to-secondary/70 rounded-full"
                style={{ width: `${Math.min(advancedMetrics.xA90 * 25, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Form & Consistency</CardTitle>
              <p className="text-xs text-muted-foreground/70">Last 5 matches</p>
            </div>
            <div className="p-2 rounded-full bg-warning/10">
              <Activity className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{Number(trendAnalysis.averageForm).toFixed(1)}</span>
              <span className={`text-sm flex items-center ${trendAnalysis.trend === 'improving' ? 'text-success' : 'text-destructive'}`}>
                {trendAnalysis.trend === 'improving' ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {((Number(trendAnalysis.averageForm) - Number(trendAnalysis.lastFiveMatches[0])) / Number(trendAnalysis.lastFiveMatches[0]) * 100).toFixed(1)}%
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 mr-1" />
                    {((Number(trendAnalysis.lastFiveMatches[0]) - Number(trendAnalysis.averageForm)) / Number(trendAnalysis.lastFiveMatches[0]) * 100).toFixed(1)}%
                  </>
                )}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {Array(5).fill(0).map((_, i) => (
                <div 
                  key={i}
                  className="h-2 min-w-[40px] sm:flex-1 bg-muted rounded-full overflow-hidden"
                >
                  <div 
                    className="h-full bg-gradient-to-b from-warning to-warning/70 rounded-full"
                    style={{ width: '100%', height: `${(trendAnalysis.lastFiveMatches[i] / 10) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto pb-2 -mx-2 sm:mx-0">
          <TabsList className="inline-flex w-auto min-w-full px-1 bg-muted/50 p-1 rounded-lg h-auto">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-2 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="form" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-2 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
            >
              Form
            </TabsTrigger>
            <TabsTrigger 
              value="comparison" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-2 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
            >
              Comparison
            </TabsTrigger>
            <TabsTrigger 
              value="advanced" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md py-2 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
            >
              Advanced
            </TabsTrigger>
          </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-border/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Player Attributes</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Performance across key metrics (scaled 1-10)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto py-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                  <div className="w-3 h-3 rounded-full bg-primary/80"></div>
                  <span>{selectedPlayer.name}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[400px]">
                <div className="h-[300px] sm:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      cx="50%" 
                      cy="50%" 
                      outerRadius="70%" 
                      data={radarData}
                      margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                    >
                      <PolarGrid stroke={COLORS.grid} />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: COLORS.text, fontSize: 12 }}
                        tickLine={false}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 10]} 
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name={selectedPlayer.name}
                        dataKey="A"
                        stroke={COLORS.primary}
                        fill={COLORS.primary}
                        fillOpacity={0.3}
                        strokeWidth={2}
                        dot={{
                          fill: COLORS.primary,
                          stroke: '#fff',
                          strokeWidth: 2,
                          r: 4
                        }}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        cursor={false}
                      />
                      <Legend 
                        iconType="circle"
                        wrapperStyle={{
                          paddingTop: '20px',
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '16px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-2">Key Strengths</h4>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {trendAnalysis.strengths.slice(0, 3).map((strength, i) => (
                    <span key={i} className="px-2 py-1 bg-muted rounded-md text-xs sm:text-sm">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <div className="h-[300px] sm:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="match" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        name="Match Rating"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison">
          <Card className="bg-card/50 backdrop-blur-sm border-border/20 shadow-lg">
            <CardHeader className="border-b border-border/20 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <CardTitle className="text-base sm:text-xl">Position Analysis</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {selectedPlayer.name} vs other {selectedPlayer.position}s
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm bg-muted/50 p-2 rounded-md">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#8884d8] mr-1"></div>
                    <span className="hidden xs:inline">xG/90</span>
                    <span className="xs:hidden">xG</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#82ca9d] mr-1 ml-2"></div>
                    <span className="hidden xs:inline">xA/90</span>
                    <span className="xs:hidden">xA</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="h-[300px] sm:h-[400px] -mx-2 sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    margin={{
                      top: 10,
                      right: 8,
                      left: -10,
                      bottom: 40, // more space for labels
                    }}
                    barGap={8}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => {
                        if (typeof window !== "undefined" && window.innerWidth < 640) {
                          return value
                            .split(" ")
                            .map((n: string) => n[0])
                            .join(".");
                        }
                        return value;
                      }}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      width={24}
                      tickCount={5}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.75rem',
                        padding: '0.5rem',
                      }}
                      formatter={(value, name) => [value, name === 'xG90' ? 'xG/90' : 'xA/90']}
                      labelFormatter={(label) => `Player: ${label}`}
                    />
                    <Bar 
                      dataKey="xG90" 
                      name="xG/90" 
                      fill="#8884d8" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar 
                      dataKey="xA90" 
                      name="xA/90" 
                      fill="#82ca9d" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 px-2 sm:px-0">
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                  Comparing <span className="font-medium">{selectedPlayer.name}</span> with other {selectedPlayer.position}s in the league
                </p>
                <div className="mt-2 flex justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="inline-flex items-center text-xs bg-muted/50 px-2 py-1 rounded">
                    <div className="w-2 h-2 rounded-full bg-[#8884d8] mr-1"></div>
                    xG/90: {selectedPlayer.xG90?.toFixed(2) || 'N/A'}
                  </span>
                  <span className="inline-flex items-center text-xs bg-muted/50 px-2 py-1 rounded">
                    <div className="w-2 h-2 rounded-full bg-[#82ca9d] mr-1"></div>
                    xA/90: {selectedPlayer.xA90?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="hidden sm:block">
                  <h4 className="text-sm font-medium mb-1">Reliability</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-purple-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (advancedMetrics.consistency || 0) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {advancedMetrics.consistency ? `${(advancedMetrics.consistency * 100).toFixed(0)}% consistency` : 'N/A'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Shot Conversion</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (advancedMetrics.shotConversion || 0) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {advancedMetrics.shotConversion ? `${advancedMetrics.shotConversion}% of shots result in goals` : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Progressive Passes</h4>
                  <p className="text-lg">{(advancedMetrics.progressivePasses || 0).toFixed(1)} <span className="text-sm text-muted-foreground">per 90</span></p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Dribble Success</h4>
                  <p className="text-lg">{(advancedMetrics.dribbles || 0).toFixed(1)} <span className="text-sm text-muted-foreground">successful dribbles per 90</span></p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Defensive Actions</h4>
                  <p className="text-lg">{(advancedMetrics.defensiveActions || 0).toFixed(1)} <span className="text-sm text-muted-foreground">tackles + interceptions per 90</span></p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Form Trend</h4>
                    <p className="text-sm text-muted-foreground">
                      {trendAnalysis.trend === 'improving' ? '📈 Improving' : 
                       trendAnalysis.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Consistency</h4>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${parseFloat(trendAnalysis.consistency) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {parseFloat(trendAnalysis.consistency) > 0.8 ? 'Highly consistent' : 
                       parseFloat(trendAnalysis.consistency) > 0.6 ? 'Moderately consistent' : 'Inconsistent'} performance
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Last 5 Matches</h4>
                    <div className="flex gap-1 sm:gap-2 overflow-x-auto py-2 -mx-2 px-2 sm:mx-0 sm:px-0">
                      {trendAnalysis.lastFiveMatches.map((rating, i) => (
                        <div 
                          key={i}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs sm:text-sm font-medium
                            ${rating >= 8 ? 'bg-green-500' : 
                              rating >= 6 ? 'bg-blue-500' : 
                              'bg-yellow-500'}`}
                        >
                          {rating.toFixed(1)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
