import { Request, Response } from 'express';
import { Player, Match, generateCardSlug, generateDisplayName } from '../models';
import { computeStatsFromMatches, computeStatsFromAggregates } from '../utils/stats';
import { autoLogStatUpdate } from './updateController';
import { recordStatSnapshot } from './snapshotController';

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
        ovrRating: playerData.ovr_rating,
        accountId: playerData.account_id,
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
        ovrRating: playerData.ovr_rating,
        accountId: playerData.account_id,
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
    const { name, team, position, age, cardType, ovrRating, apps, goal, assists, imageUrl } = req.body;
    
    // If no image URL provided, use placeholder or Cloudinary
    let image = imageUrl || undefined;

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
      ovr_rating: ovrRating ? parseInt(ovrRating) : null,
      apps: parseInt(apps) || 0,
      goal: parseInt(goal) || 0,
      assists: parseInt(assists) || 0,
      image,
    });

    // If no image was provided, set placeholder that suggests ID-based naming
    if (!image) {
      const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200&bold=true`;
      await player.update({ image: placeholderUrl });
    }

    // Record baseline snapshot so stat history starts at player creation
    await recordStatSnapshot(player.id, player.goal, player.assists, player.apps, 'admin', 'form', player.ovr_rating);

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

    const { name, team, position, age, cardType, apps, goal, assists, imageUrl, ovrRating } = req.body;

    // Store old values for logging
    const oldApps = player.apps;
    const oldGoal = player.goal;
    const oldAssists = player.assists;

    // Handle image: use provided URL, existing image, or placeholder
    let image;
    if (imageUrl !== undefined) {
      image = imageUrl;
    } else if (player.image) {
      image = player.image;
    } else {
      // Generate placeholder with player name if no image exists
      const playerName = name || player.name;
      image = `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}&background=random&size=200&bold=true`;
    }

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
      ovr_rating: ovrRating !== undefined ? (ovrRating === null ? null : parseInt(ovrRating)) : player.ovr_rating,
      image,
    });

    // Log stat changes if they changed
    const newApps = player.apps;
    const newGoal = player.goal;
    const newAssists = player.assists;

    if (newApps !== oldApps) {
      await autoLogStatUpdate(player.id, 'apps', oldApps, newApps, 'admin', 'form');
    }
    if (newGoal !== oldGoal) {
      await autoLogStatUpdate(player.id, 'goals', oldGoal, newGoal, 'admin', 'form');
    }
    if (newAssists !== oldAssists) {
      await autoLogStatUpdate(player.id, 'assists', oldAssists, newAssists, 'admin', 'form');
    }

    // Record a full point-in-time snapshot (all 3 stats + OVR) after the update
    await recordStatSnapshot(player.id, newGoal, newAssists, newApps, 'admin', 'form', player.ovr_rating);

    // Fetch fresh data from database to ensure we get updated values
    const updatedPlayer = await Player.findByPk(req.params.id);
    if (!updatedPlayer) {
      return res.status(404).json({ error: 'Player not found after update' });
    }

    const stats = computeStatsFromAggregates(updatedPlayer);
    const playerData = updatedPlayer.toJSON();

    // Debug logging to check updated values
    console.log('Updated player data:', {
      apps: playerData.apps,
      goal: playerData.goal,
      assists: playerData.assists,
      inputValues: { apps, goal, assists }
    });

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
