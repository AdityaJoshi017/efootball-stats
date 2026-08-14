"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// For local development
if (require.main === module) {
    const PORT = process.env.PORT || 8000;
    const startServer = async () => {
        try {
            // Connect to database
            await (0, db_1.connectDB)();
            // Sync database models (create tables if they don't exist)
            await db_1.sequelize.sync();
            console.log('Database synchronized successfully.');
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
}
// For Vercel serverless deployment
exports.default = async (req, res) => {
    // Initialize database connection for each request
    await (0, db_1.connectDB)();
    await db_1.sequelize.sync();
    // Handle the request with Express app
    return (0, app_1.app)(req, res);
};
