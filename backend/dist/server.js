"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Must be at the very top!
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
async function startServer() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is required.');
    }
    const port = Number(process.env.PORT ?? '5000');
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('PORT must be an integer between 1 and 65535.');
    }
    await mongoose_1.default.connect(mongoUri);
    const server = (0, app_1.createApp)().listen(port);
    await new Promise((resolve, reject) => {
        server.once('listening', resolve).once('error', reject);
    });
    return server;
}
if (require.main === module) {
    void startServer().catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
    });
}
