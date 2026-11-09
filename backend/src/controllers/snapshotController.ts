import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { PlayerStatSnapshot, Player } from '../models';

// Compute per-app ratios from raw totals
function computeRatios(goals: number, assists: number, apps: number) {
  const gAp = goals + assists;
  return {
    goals,
    assists,
    apps,
    gPlusA: gAp,
    gPm: apps > 0 ? goals / apps : 0,
    aPm: apps > 0 ? assists / apps : 0,
    gAPm: apps > 0 ? gAp / apps : 0,
  };
}

// Record a full point-in-time stat snapshot (all 3 stats) after an update event
export async function recordStatSnapshot(
  playerId: number,
  goals: number,
  assists: number,
  apps: number,
  updatedBy: string = 'system',
  updateSource: 'manual' | 'bulk_script' | 'form' = 'manual',
  ovr?: number | null
) {
  try {
    const snapshot = await PlayerStatSnapshot.create({
      playerId,
      snapshotDate: new Date(),
      goals,
      assists,
      apps,
      ovr: ovr ?? null,
      updatedBy,
      updateSource,
    });
    console.log(`✅ Recorded stat snapshot for player ${playerId}: G${goals} A${assists} AP${apps}`);
    return snapshot;
  } catch (error) {
    console.error('❌ Error recording stat snapshot:', error);
    return null;
  }
}

// Create a snapshot for a player (manual endpoint)
export async function createSnapshot(req: Request, res: Response) {
  try {
    const { playerId } = req.params;

    const player = await Player.findByPk(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const snapshot = await recordStatSnapshot(
      parseInt(playerId),
      player.goal,
      player.assists,
      player.apps,
      'admin',
      'manual',
      player.ovr_rating
    );

    res.status(201).json(snapshot);
  } catch (error) {
    console.error('Error creating snapshot:', error);
    res.status(500).json({ error: 'Failed to create snapshot' });
  }
}

// Get all snapshots for a player
export async function getPlayerSnapshots(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    const { limit } = req.query;

    const snapshots = await PlayerStatSnapshot.findAll({
      where: { playerId: parseInt(playerId) },
      include: [{ model: Player, as: 'player', attributes: ['id', 'name', 'team'] }],
      order: [['snapshotDate', 'DESC']],
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(snapshots);
  } catch (error) {
    console.error('Error getting player snapshots:', error);
    res.status(500).json({ error: 'Failed to retrieve snapshots' });
  }
}

// Get stat history series for a player (with per-app ratios), oldest first
// GET /api/players/:id/stats-history?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function getPlayerStatsHistory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    const player = await Player.findByPk(id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const whereClause: any = { playerId: parseInt(id) };
    if (from || to) {
      whereClause.snapshotDate = {};
      if (from) whereClause.snapshotDate[Op.gte] = new Date(from as string);
      if (to) {
        const toDate = new Date(to as string);
        toDate.setHours(23, 59, 59, 999);
        whereClause.snapshotDate[Op.lte] = toDate;
      }
    }

    const snapshots = await PlayerStatSnapshot.findAll({
      where: whereClause,
      order: [['snapshotDate', 'ASC'], ['id', 'ASC']],
    });

    const points = snapshots.map((s) => {
      const data = s.toJSON();
      return {
        date: data.snapshotDate,
        ...computeRatios(data.goals, data.assists, data.apps),
        ovr: data.ovr ?? null,
        updatedBy: data.updatedBy,
        updateSource: data.updateSource,
      };
    });

    res.json({ playerId: player.id, points });
  } catch (error) {
    console.error('Error getting player stats history:', error);
    res.status(500).json({ error: 'Failed to retrieve stats history' });
  }
}

// Get a player's stats as of a specific date (latest snapshot on or before that date)
// GET /api/players/:id/stats-as-of?date=YYYY-MM-DD
export async function getPlayerStatsAsOf(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const player = await Player.findByPk(id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const asOf = date ? new Date(date as string) : new Date();
    if (date) {
      // Include the whole day when only a date (no time) is provided
      if (!/\d{1,2}:\d{2}/.test(date as string)) {
        asOf.setHours(23, 59, 59, 999);
      }
    }

    const snapshot = await PlayerStatSnapshot.findOne({
      where: {
        playerId: parseInt(id),
        snapshotDate: { [Op.lte]: asOf },
      },
      order: [['snapshotDate', 'DESC'], ['id', 'DESC']],
    });

    if (!snapshot) {
      // No snapshot on or before the date — fall back to earliest snapshot if it's after,
      // otherwise report no data
      const earliest = await PlayerStatSnapshot.findOne({
        where: { playerId: parseInt(id) },
        order: [['snapshotDate', 'ASC'], ['id', 'ASC']],
      });

      if (!earliest) {
        // Player has no snapshots at all — return current values flagged as current
        return res.json({
          hasData: true,
          source: 'current',
          asOf: asOf.toISOString(),
          ovr: player.ovr_rating ?? null,
          ...computeRatios(player.goal, player.assists, player.apps),
        });
      }

      return res.json({
        hasData: false,
        message: 'No stats recorded on or before this date',
        earliestSnapshotDate: earliest.snapshotDate,
      });
    }

    const data = snapshot.toJSON();
    res.json({
      hasData: true,
      source: 'snapshot',
      asOf: asOf.toISOString(),
      snapshotDate: data.snapshotDate,
      ovr: data.ovr ?? null,
      updatedBy: data.updatedBy,
      updateSource: data.updateSource,
      ...computeRatios(data.goals, data.assists, data.apps),
    });
  } catch (error) {
    console.error('Error getting stats as of date:', error);
    res.status(500).json({ error: 'Failed to retrieve stats as of date' });
  }
}

// Compare current stats vs previous snapshot
export async function compareSnapshot(req: Request, res: Response) {
  try {
    const { playerId } = req.params;

    const player = await Player.findByPk(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Get the two most recent snapshots. The latest snapshot usually equals current
    // state (recorded post-update); the previous one is the pre-update baseline.
    const snapshots = await PlayerStatSnapshot.findAll({
      where: { playerId: parseInt(playerId) },
      order: [['snapshotDate', 'DESC'], ['id', 'DESC']],
      limit: 2,
    });

    const current = {
      goals: player.goal,
      assists: player.assists,
      apps: player.apps,
    };

    let baseline = snapshots[0] ? snapshots[0].toJSON() : null;
    const latestMatchesCurrent = baseline &&
      baseline.goals === current.goals &&
      baseline.assists === current.assists &&
      baseline.apps === current.apps;

    if (latestMatchesCurrent) {
      // Latest snapshot is just the current state — use the previous one as baseline
      baseline = snapshots[1] ? snapshots[1].toJSON() : null;
    }

    if (!baseline) {
      return res.json({
        hasPreviousSnapshot: false,
        current,
        message: 'No previous snapshot found',
      });
    }

    const previous = {
      goals: baseline.goals,
      assists: baseline.assists,
      apps: baseline.apps,
    };

    const changes = {
      goals: current.goals - previous.goals,
      assists: current.assists - previous.assists,
      apps: current.apps - previous.apps,
    };

    const percentChanges = {
      goals: previous.goals !== 0 ? ((changes.goals / previous.goals) * 100).toFixed(2) : (current.goals > 0 ? '100' : '0'),
      assists: previous.assists !== 0 ? ((changes.assists / previous.assists) * 100).toFixed(2) : (current.assists > 0 ? '100' : '0'),
      apps: previous.apps !== 0 ? ((changes.apps / previous.apps) * 100).toFixed(2) : (current.apps > 0 ? '100' : '0'),
    };

    res.json({
      hasPreviousSnapshot: true,
      current,
      previous,
      changes,
      percentChanges: {
        goals: parseFloat(percentChanges.goals),
        assists: parseFloat(percentChanges.assists),
        apps: parseFloat(percentChanges.apps),
      },
      lastSnapshotDate: baseline.snapshotDate,
    });
  } catch (error) {
    console.error('Error comparing snapshot:', error);
    res.status(500).json({ error: 'Failed to compare snapshot' });
  }
}
