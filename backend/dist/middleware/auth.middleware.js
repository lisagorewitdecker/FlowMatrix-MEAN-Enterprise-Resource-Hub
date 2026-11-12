"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
        return;
    }
    const token = authHeader.slice('Bearer '.length);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret');
        req.user = decoded;
        next();
    }
    catch (error) {
        const status = error instanceof jsonwebtoken_1.default.TokenExpiredError ? 401 : 403;
        res.status(status).json({ success: false, message: 'Invalid or Expired Access Token' });
    }
};
exports.verifyToken = verifyToken;
