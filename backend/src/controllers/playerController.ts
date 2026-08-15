import { Request, Response } from 'express';
import { Player, Match, generateCardSlug, generateDisplayName } from '../models';
import { computeStatsFromMatches, computeStatsFromAggregates } from '../utils/stats';

// List all players with computed stats
export async function listPlayers(req: Request, res: Response) {
  try {
    const players = await Player.findAll({
      include: [{ model: Match, as: 'matches' }],
    });

    const playersWithStats = players.map(player => {
      const matches = (player as any).matches || [];
      const stats = matches.length > 0 
        ? computeStatsFromMatches(matches)
        : computeStatsFromAggregates(player);

      const playerData = player.toJSON();
      
      // If image is a relative path, convert to full URL using frontend URL
      let fullImageUrl = playerData.image;
      if (fullImageUrl && fullImageUrl.startsWith('/') && !fullImageUrl.startsWith('/uploads/')) {
        const frontendUrl = process.env.CORS_ORIGIN || 'https://efootball-stats-six.vercel.app';
        fullImageUrl = `${frontendUrl}${fullImageUrl}`;
      }

      return {
        ...playerData,
        image: fullImageUrl,
        stats,
      };
    });

    res.json(playersWithStats);
  } catch (error) {
    console.error('Error listing players:', error);
    res.status(500).json({ error: 'Failed to retrieve players' });
  }
}

// Get single player with matches and computed stats
export async function getPlayer(req: Request, res: Response) {
  try {
    const player = await Player.findByPk(req.params.id, {
      include: [{ model: Match, as: 'matches' }],
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const matches = (player as any).matches || [];
    const stats = matches.length > 0 
      ? computeStatsFromMatches(matches)
      : computeStatsFromAggregates(player);

    const playerData = player.toJSON();
    
    // If image is a relative path, convert to full URL using frontend URL
    let fullImageUrl = playerData.image;
    if (fullImageUrl && fullImageUrl.startsWith('/') && !fullImageUrl.startsWith('/uploads/')) {
      const frontendUrl = process.env.CORS_ORIGIN || 'https://efootball-stats-six.vercel.app';
      fullImageUrl = `${frontendUrl}${fullImageUrl}`;
    }

    res.json({
      player: {
        ...playerData,
        image: fullImageUrl,
      },
      matches,
      stats,
    });
  } catch (error) {
    console.error('Error getting player:', error);
    res.status(500).json({ error: 'Failed to retrieve player' });
  }
}

// Create player (admin only)
export async function createPlayer(req: Request, res: Response) {
  try {
    const { name, team, position, age, cardType, apps, goal, assists, imageUrl } = req.body;
    const image = imageUrl || undefined;

    // Generate unique identifiers
    const cardSlug = generateCardSlug(
      name,
      team || 'N/A',
      position || 'Unknown',
      parseInt(age),
      cardType
    );
    const displayName = generateDisplayName(
      name,
      team || 'N/A',
      position || 'Unknown',
      cardType
    );

    const player = await Player.create({
      name,
      team: team || 'N/A',
      position,
      age: parseInt(age),
      cardType,
      cardSlug,
      displayName,
      apps: parseInt(apps) || 0,
      goal: parseInt(goal) || 0,
      assists: parseInt(assists) || 0,
      image,
    });

    const stats = computeStatsFromAggregates(player);
    const playerData = player.toJSON();
    
    // If image is a relative path, convert to full URL using frontend URL
    let fullImageUrl = playerData.image;
    if (fullImageUrl && fullImageUrl.startsWith('/') && !fullImageUrl.startsWith('/uploads/')) {
      const frontendUrl = process.env.CORS_ORIGIN || 'https://efootball-stats-six.vercel.app';
      fullImageUrl = `${frontendUrl}${fullImageUrl}`;
    }

    res.status(201).json({
      player: {
        ...playerData,
        image: fullImageUrl,
      },
      stats,
    });
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({ error: 'Failed to create player' });
  }
}

// Update player (admin only)
export async function updatePlayer(req: Request, res: Response) {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const { name, team, position, age, cardType, apps, goal, assists, imageUrl } = req.body;
    const image = imageUrl !== undefined ? imageUrl : player.image;

    // Update identifiers if core fields changed
    const updatedName = name || player.name;
    const updatedTeam = team !== undefined ? team : player.team;
    const updatedPosition = position !== undefined ? position : player.position;
    const updatedAge = age !== undefined ? parseInt(age) : player.age;
    const updatedCardType = cardType || player.cardType;

    const cardSlug = generateCardSlug(
      updatedName,
      updatedTeam,
      updatedPosition,
      updatedAge,
      updatedCardType
    );
    const displayName = generateDisplayName(
      updatedName,
      updatedTeam,
      updatedPosition,
      updatedCardType
    );

    await player.update({
      name: updatedName,
      team: updatedTeam,
      position: updatedPosition,
      age: updatedAge,
      cardType: updatedCardType,
      cardSlug,
      displayName,
      apps: apps !== undefined ? parseInt(apps) : player.apps,
      goal: goal !== undefined ? parseInt(goal) : player.goal,
      assists: assists !== undefined ? parseInt(assists) : player.assists,
      image,
    });

    const stats = computeStatsFromAggregates(player);
    const playerData = player.toJSON();
    
    // If image is a relative path, convert to full URL using frontend URL
    let fullImageUrl = playerData.image;
    if (fullImageUrl && fullImageUrl.startsWith('/') && !fullImageUrl.startsWith('/uploads/')) {
      const frontendUrl = process.env.CORS_ORIGIN || 'https://efootball-stats-six.vercel.app';
      fullImageUrl = `${frontendUrl}${fullImageUrl}`;
    }

    res.json({
      player: {
        ...playerData,
        image: fullImageUrl,
      },
      stats,
    });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
}

// Delete player (admin only)
export async function deletePlayer(req: Request, res: Response) {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Delete associated matches
    await Match.destroy({ where: { playerId: player.id } });
    
    // Delete player
    await player.destroy();

    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
}
