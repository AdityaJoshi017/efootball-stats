"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPlayers = listPlayers;
exports.getPlayer = getPlayer;
exports.createPlayer = createPlayer;
exports.updatePlayer = updatePlayer;
exports.deletePlayer = deletePlayer;
const models_1 = require("../models");
const stats_1 = require("../utils/stats");
// List all players with computed stats
async function listPlayers(req, res) {
    try {
        const players = await models_1.Player.findAll({
            include: [{ model: models_1.Match, as: 'matches' }],
        });
        const playersWithStats = players.map(player => {
            const matches = player.matches || [];
            const stats = matches.length > 0
                ? (0, stats_1.computeStatsFromMatches)(matches)
                : (0, stats_1.computeStatsFromAggregates)(player);
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
    }
    catch (error) {
        console.error('Error listing players:', error);
        res.status(500).json({ error: 'Failed to retrieve players' });
    }
}
// Get single player with matches and computed stats
async function getPlayer(req, res) {
    try {
        const player = await models_1.Player.findByPk(req.params.id, {
            include: [{ model: models_1.Match, as: 'matches' }],
        });
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        const matches = player.matches || [];
        const stats = matches.length > 0
            ? (0, stats_1.computeStatsFromMatches)(matches)
            : (0, stats_1.computeStatsFromAggregates)(player);
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
    }
    catch (error) {
        console.error('Error getting player:', error);
        res.status(500).json({ error: 'Failed to retrieve player' });
    }
}
// Create player (admin only)
async function createPlayer(req, res) {
    try {
        const { name, team, position, age, cardType, apps, goal, assists, imageUrl } = req.body;
        // If no image URL provided, use placeholder or Cloudinary
        let image = imageUrl || undefined;
        // Generate unique identifiers
        const cardSlug = (0, models_1.generateCardSlug)(name, team || 'N/A', position || 'Unknown', parseInt(age), cardType);
        const displayName = (0, models_1.generateDisplayName)(name, team || 'N/A', position || 'Unknown', cardType);
        const player = await models_1.Player.create({
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
        // If no image was provided, set placeholder that suggests ID-based naming
        if (!image) {
            const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200&bold=true`;
            await player.update({ image: placeholderUrl });
        }
        const stats = (0, stats_1.computeStatsFromAggregates)(player);
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
    }
    catch (error) {
        console.error('Error creating player:', error);
        res.status(500).json({ error: 'Failed to create player' });
    }
}
// Update player (admin only)
async function updatePlayer(req, res) {
    try {
        const player = await models_1.Player.findByPk(req.params.id);
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        const { name, team, position, age, cardType, apps, goal, assists, imageUrl } = req.body;
        // Handle image: use provided URL, existing image, or placeholder
        let image;
        if (imageUrl !== undefined) {
            image = imageUrl;
        }
        else if (player.image) {
            image = player.image;
        }
        else {
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
        const cardSlug = (0, models_1.generateCardSlug)(updatedName, updatedTeam, updatedPosition, updatedAge, updatedCardType);
        const displayName = (0, models_1.generateDisplayName)(updatedName, updatedTeam, updatedPosition, updatedCardType);
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
        const stats = (0, stats_1.computeStatsFromAggregates)(player);
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
    }
    catch (error) {
        console.error('Error updating player:', error);
        res.status(500).json({ error: 'Failed to update player' });
    }
}
// Delete player (admin only)
async function deletePlayer(req, res) {
    try {
        const player = await models_1.Player.findByPk(req.params.id);
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        // Delete associated matches
        await models_1.Match.destroy({ where: { playerId: player.id } });
        // Delete player
        await player.destroy();
        res.json({ message: 'Player deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ error: 'Failed to delete player' });
    }
}
