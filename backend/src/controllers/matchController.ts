import { Request, Response } from 'express';
import { Match, Player } from '../models';
import { computeStatsFromMatches } from '../utils/stats';

// Add match to player (admin only)
export async function addMatch(req: Request, res: Response) {
  try {
    const { matchDate, minutesPlayed, goals, assists, shots, passesCompleted, passesAttempted, xG, xA } = req.body;
    const playerId = parseInt(req.params.id);

    const player = await Player.findByPk(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const match = await Match.create({
      playerId,
      matchDate: new Date(matchDate),
      minutesPlayed: parseInt(minutesPlayed) || 0,
      goals: parseInt(goals) || 0,
      assists: parseInt(assists) || 0,
      shots: shots ? parseInt(shots) : 0,
      passesCompleted: passesCompleted ? parseInt(passesCompleted) : 0,
      passesAttempted: passesAttempted ? parseInt(passesAttempted) : 0,
      xG: xG ? parseFloat(xG) : 0,
      xA: xA ? parseFloat(xA) : 0,
    });

    // Get all matches for this player and compute stats
    const allMatches = await Match.findAll({ where: { playerId } });
    const stats = computeStatsFromMatches(allMatches);

    res.status(201).json({
      match: match.toJSON(),
      stats,
    });
  } catch (error) {
    console.error('Error adding match:', error);
    res.status(500).json({ error: 'Failed to add match' });
  }
}

// Update match (admin only)
export async function updateMatch(req: Request, res: Response) {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const { matchDate, minutesPlayed, goals, assists, shots, passesCompleted, passesAttempted, xG, xA } = req.body;

    await match.update({
      matchDate: matchDate ? new Date(matchDate) : match.matchDate,
      minutesPlayed: minutesPlayed !== undefined ? parseInt(minutesPlayed) : match.minutesPlayed,
      goals: goals !== undefined ? parseInt(goals) : match.goals,
      assists: assists !== undefined ? parseInt(assists) : match.assists,
      shots: shots !== undefined ? parseInt(shots) : match.shots,
      passesCompleted: passesCompleted !== undefined ? parseInt(passesCompleted) : match.passesCompleted,
      passesAttempted: passesAttempted !== undefined ? parseInt(passesAttempted) : match.passesAttempted,
      xG: xG !== undefined ? parseFloat(xG) : match.xG,
      xA: xA !== undefined ? parseFloat(xA) : match.xA,
    });

    // Recompute stats for the player
    const allMatches = await Match.findAll({ where: { playerId: match.playerId } });
    const stats = computeStatsFromMatches(allMatches);

    res.json({
      match: match.toJSON(),
      stats,
    });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
}

// Delete match (admin only)
export async function deleteMatch(req: Request, res: Response) {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const playerId = match.playerId;
    await match.destroy();

    // Recompute stats for the player
    const allMatches = await Match.findAll({ where: { playerId } });
    const stats = computeStatsFromMatches(allMatches);

    res.json({
      message: 'Match deleted successfully',
      stats,
    });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Failed to delete match' });
  }
}

// Get all matches for a player
export async function getPlayerMatches(req: Request, res: Response) {
  try {
    const playerId = parseInt(req.params.id);
    const matches = await Match.findAll({
      where: { playerId },
      order: [['matchDate', 'DESC']],
    });

    res.json(matches);
  } catch (error) {
    console.error('Error getting player matches:', error);
    res.status(500).json({ error: 'Failed to retrieve matches' });
  }
}
