import { Request, Response } from 'express';
import { PlayerStatSnapshot, Player } from '../models';

// Create a snapshot for a player
export async function createSnapshot(req: Request, res: Response) {
  try {
    const { playerId } = req.params;

    const player = await Player.findByPk(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const snapshot = await PlayerStatSnapshot.create({
      playerId: parseInt(playerId),
      snapshotDate: new Date(),
      goals: player.goal,
      assists: player.assists,
      apps: player.apps,
    });

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

// Compare current stats vs previous snapshot
export async function compareSnapshot(req: Request, res: Response) {
  try {
    const { playerId } = req.params;

    const player = await Player.findByPk(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Get the most recent snapshot
    const lastSnapshot = await PlayerStatSnapshot.findOne({
      where: { playerId: parseInt(playerId) },
      order: [['snapshotDate', 'DESC']],
    });

    if (!lastSnapshot) {
      return res.json({
        hasPreviousSnapshot: false,
        current: {
          goals: player.goal,
          assists: player.assists,
          apps: player.apps,
        },
        message: 'No previous snapshot found',
      });
    }

    const snapshotData = lastSnapshot.toJSON();
    const current = {
      goals: player.goal,
      assists: player.assists,
      apps: player.apps,
    };

    const previous = {
      goals: snapshotData.goals,
      assists: snapshotData.assists,
      apps: snapshotData.apps,
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
      lastSnapshotDate: snapshotData.snapshotDate,
    });
  } catch (error) {
    console.error('Error comparing snapshot:', error);
    res.status(500).json({ error: 'Failed to compare snapshot' });
  }
}

// Helper function to auto-create snapshot before stat updates
export async function autoCreateSnapshot(playerId: number) {
  try {
    const player = await Player.findByPk(playerId);
    if (!player) {
      console.error(`❌ Player ${playerId} not found for snapshot`);
      return null;
    }

    const snapshot = await PlayerStatSnapshot.create({
      playerId,
      snapshotDate: new Date(),
      goals: player.goal,
      assists: player.assists,
      apps: player.apps,
    });

    console.log(`✅ Created snapshot for player ${playerId}`);
    return snapshot;
  } catch (error) {
    console.error('❌ Error auto-creating snapshot:', error);
    return null;
  }
}
