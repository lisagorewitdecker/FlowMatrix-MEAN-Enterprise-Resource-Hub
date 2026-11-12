"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const mongoose_1 = require("mongoose");
const ProjectSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Planning', 'Active', 'Completed', 'On-Hold'], default: 'Planning' },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    team: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    budget: { type: Number, required: true, min: 0 },
    deadline: { type: Date, required: true }
}, { timestamps: true });
// Indexing for performance optimization
ProjectSchema.index({ status: 1, owner: 1 });
exports.Project = (0, mongoose_1.model)('Project', ProjectSchema);
