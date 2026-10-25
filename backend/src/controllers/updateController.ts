import { Request, Response } from 'express';
import { PlayerStatUpdate, Player } from '../models';

// Get update history for a specific player
export async function getPlayerStatUpdates(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    const { statType, limit } = req.query;

    const whereClause: any = { playerId };
    if (statType) {
      whereClause.statType = statType;
    }

    const updates = await PlayerStatUpdate.findAll({
      where: whereClause,
      include: [{ model: Player, as: 'player', attributes: ['id', 'name', 'team'] }],
      order: [['createdAt', 'DESC']],
      limit: limit ? parseInt(limit as string) : undefined,
    });

    // Calculate change and percent change for each update
    const updatesWithStats = updates.map(update => {
      const updateData = update.toJSON();
      const change = updateData.newValue - updateData.oldValue;
      const percentChange = updateData.oldValue !== 0
        ? ((change / updateData.oldValue) * 100).toFixed(2)
        : updateData.newValue > 0 ? '100' : '0';

      return {
        ...updateData,
        change,
        percentChange: parseFloat(percentChange),
      };
    });

    res.json(updatesWithStats);
  } catch (error) {
    console.error('Error getting player stat updates:', error);
    res.status(500).json({ error: 'Failed to retrieve stat updates' });
  }
}

// Get all update history with filters
export async function getAllStatUpdates(req: Request, res: Response) {
  try {
    const { playerId, statType, updateSource, limit, offset } = req.query;

    const whereClause: any = {};
    if (playerId) whereClause.playerId = parseInt(playerId as string);
    if (statType) whereClause.statType = statType;
    if (updateSource) whereClause.updateSource = updateSource;

    const updates = await PlayerStatUpdate.findAll({
      where: whereClause,
      include: [{ model: Player, as: 'player', attributes: ['id', 'name', 'team'] }],
      order: [['createdAt', 'DESC']],
      limit: limit ? parseInt(limit as string) : 100,
      offset: offset ? parseInt(offset as string) : 0,
    });

    // Calculate change and percent change for each update
    const updatesWithStats = updates.map(update => {
      const updateData = update.toJSON();
      const change = updateData.newValue - updateData.oldValue;
      const percentChange = updateData.oldValue !== 0
        ? ((change / updateData.oldValue) * 100).toFixed(2)
        : updateData.newValue > 0 ? '100' : '0';

      return {
        ...updateData,
        change,
        percentChange: parseFloat(percentChange),
      };
    });

    res.json(updatesWithStats);
  } catch (error) {
    console.error('Error getting all stat updates:', error);
    res.status(500).json({ error: 'Failed to retrieve stat updates' });
  }
}

// Log a stat update (can be called manually or automatically)
export async function logStatUpdate(req: Request, res: Response) {
  try {
    const { playerId, statType, oldValue, newValue, updatedBy, updateSource } = req.body;

    // Validate required fields
    if (!playerId || !statType || oldValue === undefined || newValue === undefined) {
      return res.status(400).json({ error: 'Missing required fields: playerId, statType, oldValue, newValue' });
    }

    // Validate statType
    if (!['goals', 'assists', 'apps'].includes(statType)) {
      return res.status(400).json({ error: 'Invalid statType. Must be: goals, assists, or apps' });
    }

    const update = await PlayerStatUpdate.create({
      playerId: parseInt(playerId),
      statType,
      oldValue: parseInt(oldValue),
      newValue: parseInt(newValue),
      updatedBy: updatedBy || 'system',
      updateSource: updateSource || 'manual',
    });

    const updateData = update.toJSON();
    const change = updateData.newValue - updateData.oldValue;
    const percentChange = updateData.oldValue !== 0
      ? ((change / updateData.oldValue) * 100).toFixed(2)
      : updateData.newValue > 0 ? '100' : '0';

    res.status(201).json({
      ...updateData,
      change,
      percentChange: parseFloat(percentChange),
    });
  } catch (error) {
    console.error('Error logging stat update:', error);
    res.status(500).json({ error: 'Failed to log stat update' });
  }
}

// Helper function to log stat updates automatically (used by other controllers)
export async function autoLogStatUpdate(
  playerId: number,
  statType: 'goals' | 'assists' | 'apps',
  oldValue: number,
  newValue: number,
  updatedBy: string = 'system',
  updateSource: 'manual' | 'bulk_script' | 'form' = 'manual'
) {
  try {
    await PlayerStatUpdate.create({
      playerId,
      statType,
      oldValue,
      newValue,
      updatedBy,
      updateSource,
    });
    console.log(`✅ Logged stat update: Player ${playerId}, ${statType}: ${oldValue} → ${newValue}`);
  } catch (error) {
    console.error('❌ Error auto-logging stat update:', error);
  }
}
