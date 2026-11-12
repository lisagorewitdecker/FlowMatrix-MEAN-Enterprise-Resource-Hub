"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !roles.includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Access Denied: You do not have the required permissions for this action.'
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
