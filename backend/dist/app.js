"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./middleware/auth");
const playerController = __importStar(require("./controllers/playerController"));
const matchController = __importStar(require("./controllers/matchController"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 8000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://efootball-stats-six.vercel.app'],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        hasDatabase: !!process.env.DATABASE_URL || !!process.env.POSTGRES_URL
    });
});
// Simple test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});
// Public routes
app.get('/api/players', playerController.listPlayers);
app.get('/api/players/:id', playerController.getPlayer);
app.get('/api/players/:id/matches', matchController.getPlayerMatches);
// Admin-protected routes (using image URLs instead of file uploads)
app.post('/api/players', auth_1.requireAdmin, playerController.createPlayer);
app.put('/api/players/:id', auth_1.requireAdmin, playerController.updatePlayer);
app.delete('/api/players/:id', auth_1.requireAdmin, playerController.deletePlayer);
app.post('/api/players/:id/matches', auth_1.requireAdmin, matchController.addMatch);
app.put('/api/matches/:id', auth_1.requireAdmin, matchController.updateMatch);
app.delete('/api/matches/:id', auth_1.requireAdmin, matchController.deleteMatch);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
