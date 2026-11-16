"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const activity_routes_1 = __importDefault(require("./routes/activity.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
function createApp() {
    const app = (0, express_1.default)();
    // Middleware
    app.use((0, cors_1.default)({
        origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
        credentials: true
    }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    // Swagger Documentation (safely checks file presence so missing docs won't crash backend)
    const candidatePaths = [
        path_1.default.join(__dirname, '../src/docs/swagger.yaml'),
        path_1.default.join(__dirname, './docs/swagger.yaml'),
        path_1.default.join(process.cwd(), 'src/docs/swagger.yaml')
    ];
    const swaggerFile = candidatePaths.find((p) => fs_1.default.existsSync(p));
    if (swaggerFile) {
        try {
            const swaggerDocument = yamljs_1.default.load(swaggerFile);
            app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
        }
        catch (err) {
            console.warn('Warning: Failed to parse swagger.yaml:', err);
        }
    }
    // Application Routes
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/projects', project_routes_1.default);
    app.use('/api/activity', activity_routes_1.default);
    app.use('/api/analytics', analytics_routes_1.default);
    return app;
}
