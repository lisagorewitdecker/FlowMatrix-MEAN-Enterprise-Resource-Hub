"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectStatus = exports.deleteProject = exports.createProject = exports.getProjects = void 0;
const projectService = __importStar(require("../services/project.service"));
const activity_routes_1 = require("../routes/activity.routes");
const getProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const status = req.query.status;
        const query = (status ? { status } : {});
        const { projects, total } = await projectService.getProjects(query, page, limit);
        res.status(200).json({
            success: true,
            data: projects,
            pagination: { total, page, pages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};
exports.getProjects = getProjects;
const createProject = async (req, res) => {
    try {
        const savedProject = await projectService.createProject(req.body);
        activity_routes_1.activityEmitter.emit('projectActivity', {
            type: 'PROJECT_CREATED',
            title: savedProject.title,
            timestamp: new Date()
        });
        res.status(201).json({ success: true, data: savedProject });
    }
    catch (error) {
        res.status(400).json({ success: false, message: 'Invalid Project Data', error });
    }
};
exports.createProject = createProject;
const deleteProject = async (req, res) => {
    try {
        const projectId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!projectId) {
            res.status(400).json({ success: false, message: 'Invalid project ID' });
            return;
        }
        const deletedProject = await projectService.deleteProject(projectId);
        if (!deletedProject) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
        }
        res.status(200).json({ success: true, data: deletedProject });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};
exports.deleteProject = deleteProject;
// Added controller handler:
const updateProjectStatus = async (req, res) => {
    try {
        const projectId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { status } = req.body;
        const validStatuses = ['Planning', 'Active', 'Completed', 'On-Hold'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status value.' });
            return;
        }
        const updated = await projectService.updateProjectStatus(projectId, status);
        if (!updated) {
            res.status(404).json({ success: false, message: 'Project not found.' });
            return;
        }
        activity_routes_1.activityEmitter.emit('projectActivity', {
            type: 'PROJECT_STATUS_UPDATED',
            title: updated.title,
            status: updated.status,
            timestamp: new Date()
        });
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error updating status.', error });
    }
};
exports.updateProjectStatus = updateProjectStatus;
