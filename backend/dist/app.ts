"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const activity_routes_1 = __importDefault(require("./routes/activity.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes")); // <-- 1. Import
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200', credentials: true }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/projects', project_routes_1.default);
    app.use('/api/activity', activity_routes_1.default);
    app.use('/api/analytics', analytics_routes_1.default); // <-- 2. Mount route
    return app;
}
