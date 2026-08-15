"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./db");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const PORT = process.env.PORT || 8000;
const startServer = async () => {
    try {
        // Connect to database
        await (0, db_1.connectDB)();
        // Sync database models (create tables if they don't exist)
        await db_1.sequelize.sync();
        console.log('Database synchronized successfully.');
        // Create uploads directory if it doesn't exist
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            console.log('Created uploads directory');
        }
        // Serve static files from uploads directory
        app_1.app.use('/uploads', express_1.default.static(uploadsDir));
        // Start server
        app_1.app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
