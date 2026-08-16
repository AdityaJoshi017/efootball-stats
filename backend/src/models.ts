import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db';

// Helper function to generate card slug (with timestamp for uniqueness)
export function generateCardSlug(name: string, team: string, position: string, age: number, cardType: string): string {
  const normalizedName = name.toLowerCase().replace(/\s+/g, '-');
  const normalizedTeam = team.toLowerCase().replace(/\s+/g, '-');
  const normalizedPosition = position.toLowerCase();
  const normalizedCardType = cardType.toLowerCase().replace(/\s+/g, '-');
  const timestamp = Date.now();
  return `${normalizedName}-${normalizedTeam}-${normalizedPosition}-${age}-${normalizedCardType}-${timestamp}`;
}

// Helper function to generate display name
export function generateDisplayName(name: string, team: string, position: string, cardType: string): string {
  const formattedName = name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  return `${formattedName} (${team}, ${position}, ${cardType})`;
}

// Player DB model (basic fields + aggregates). Derived stats are calculated from aggregates or matches.
export class Player extends Model {
  public id!: number;
  public name!: string;
  public team!: string;
  public position!: string;
  public age!: number;
  public cardType!: string;
  public cardSlug!: string; // Unique identifier for each card (e.g., "lionel-messi-barcelona-cf-34-epic-big-time")
  public displayName!: string; // Display name with card details (e.g., "Lionel Messi (Barcelona, CF, Epic Big Time)")
  public apps!: number; // appearances
  public goal!: number; // total goals
  public assists!: number; // total assists
  public image?: string; // image path or URL
  public account_id!: number; // account identifier (1, 2, 3, etc.)
  public ovr_rating?: number; // overall rating from game (1-120)
  
  // Virtual fields for camelCase compatibility
  get accountId(): number {
    return this.account_id;
  }
  set accountId(value: number) {
    this.account_id = value;
  }
  
  get ovrRating(): number | undefined {
    return this.ovr_rating;
  }
  set ovrRating(value: number | undefined) {
    this.ovr_rating = value;
  }
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Player.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    team: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'N/A',
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cardType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cardSlug: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true removed to allow multiple versions of same player card
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apps: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    goal: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    assists: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    account_id: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      field: 'account_id'
    },
    ovr_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 120
      },
      field: 'ovr_rating'
    },
  },
  {
    sequelize,
    modelName: 'Player',
    tableName: 'players',
  }
);

// Match model for per-match performance data
export class Match extends Model {
  public id!: number;
  public playerId!: number;
  public matchDate!: Date;
  public minutesPlayed!: number;
  public goals!: number;
  public assists!: number;
  public shots?: number;
  public passesCompleted?: number;
  public passesAttempted?: number;
  public xG?: number; // expected goals
  public xA?: number; // expected assists
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Match.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Player,
        key: 'id',
      },
    },
    matchDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    minutesPlayed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    goals: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    assists: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    shots: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    passesCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    passesAttempted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    xG: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    xA: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Match',
    tableName: 'matches',
  }
);

// Define relationships
Player.hasMany(Match, { foreignKey: 'playerId', as: 'matches' });
Match.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });
