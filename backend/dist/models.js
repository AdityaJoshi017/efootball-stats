"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match = exports.Player = void 0;
exports.generateCardSlug = generateCardSlug;
exports.generateDisplayName = generateDisplayName;
const sequelize_1 = require("sequelize");
const db_1 = require("./db");
// Helper function to generate card slug (with timestamp for uniqueness)
function generateCardSlug(name, team, position, age, cardType) {
    const normalizedName = name.toLowerCase().replace(/\s+/g, '-');
    const normalizedTeam = team.toLowerCase().replace(/\s+/g, '-');
    const normalizedPosition = position.toLowerCase();
    const normalizedCardType = cardType.toLowerCase().replace(/\s+/g, '-');
    const timestamp = Date.now();
    return `${normalizedName}-${normalizedTeam}-${normalizedPosition}-${age}-${normalizedCardType}-${timestamp}`;
}
// Helper function to generate display name
function generateDisplayName(name, team, position, cardType) {
    const formattedName = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    return `${formattedName} (${team}, ${position}, ${cardType})`;
}
// Player DB model (basic fields + aggregates). Derived stats are calculated from aggregates or matches.
class Player extends sequelize_1.Model {
    // Virtual fields for camelCase compatibility
    get accountId() {
        return this.account_id;
    }
    set accountId(value) {
        this.account_id = value;
    }
    get ovrRating() {
        return this.ovr_rating;
    }
    set ovrRating(value) {
        this.ovr_rating = value;
    }
}
exports.Player = Player;
Player.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    team: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'N/A',
    },
    position: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    age: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    cardType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    cardSlug: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        // unique: true removed to allow multiple versions of same player card
    },
    displayName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    apps: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    goal: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    assists: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    account_id: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
        field: 'account_id'
    },
    ovr_rating: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 120
        },
        field: 'ovr_rating'
    },
}, {
    sequelize: db_1.sequelize,
    modelName: 'Player',
    tableName: 'players',
});
// Match model for per-match performance data
class Match extends sequelize_1.Model {
}
exports.Match = Match;
Match.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    playerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Player,
            key: 'id',
        },
    },
    matchDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    minutesPlayed: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    goals: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    assists: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    shots: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    passesCompleted: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    passesAttempted: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    xG: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0,
    },
    xA: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0,
    },
}, {
    sequelize: db_1.sequelize,
    modelName: 'Match',
    tableName: 'matches',
});
// Define relationships
Player.hasMany(Match, { foreignKey: 'playerId', as: 'matches' });
Match.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });
