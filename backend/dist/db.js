"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Database configuration - supports both SQLite (local) and PostgreSQL (Vercel)
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sequelize = databaseUrl
    ? new sequelize_1.Sequelize(databaseUrl, {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : undefined,
        },
    })
    : new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage: process.env.DATABASE_PATH ?? './data.db',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
    });
exports.sequelize = sequelize;
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error; // Throw instead of exit for serverless
    }
};
exports.connectDB = connectDB;
