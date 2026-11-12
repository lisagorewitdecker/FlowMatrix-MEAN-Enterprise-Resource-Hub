"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityEmitter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const events_1 = require("events");
exports.activityEmitter = new events_1.EventEmitter();
const router = (0, express_1.Router)();
// SSE Endpoint for clients to listen to live events
router.get('/stream', auth_middleware_1.verifyToken, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    // Send initial connection success heartbeat
    res.write(`data: ${JSON.stringify({ message: 'Connected to live stream' })}\n\n`);
    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    exports.activityEmitter.on('projectActivity', sendEvent);
    // Clean up listener when client disconnects
    req.on('close', () => {
        exports.activityEmitter.off('projectActivity', sendEvent);
        res.end();
    });
});
exports.default = router;
