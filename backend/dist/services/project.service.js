"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjects = getProjects;
exports.createProject = createProject;
exports.deleteProject = deleteProject;
exports.updateProjectStatus = updateProjectStatus;
const Project_model_1 = require("../models/Project.model");
async function getProjects(query, page, limit) {
    const projects = await Project_model_1.Project.find(query)
        .populate('owner', 'name email')
        .populate('team', 'name email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
    const total = await Project_model_1.Project.countDocuments(query);
    return { projects, total };
}
async function createProject(data) {
    return new Project_model_1.Project(data).save();
}
async function deleteProject(projectId) {
    return Project_model_1.Project.findByIdAndDelete(projectId);
}
// Added for Kanban status changes:
async function updateProjectStatus(projectId, status) {
    return Project_model_1.Project.findByIdAndUpdate(projectId, { status }, { new: true, runValidators: true }).populate('owner', 'name email');
}
