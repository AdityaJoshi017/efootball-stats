"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const requireAdmin = (req, res, next) => {
    const token = req.headers['x-admin-token'] ||
        req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Admin token required' });
    }
    if (token !== ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Invalid admin token' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
