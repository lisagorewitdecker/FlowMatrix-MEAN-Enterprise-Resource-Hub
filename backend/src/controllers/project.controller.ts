import type { Request, Response } from 'express';
import type { QueryFilter } from 'mongoose';
import type { IProject } from '../models/Project.model';
import * as projectService from '../services/project.service';
import { activityEmitter } from '../routes/activity.routes';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status;
    const query = (status ? { status } : {}) as QueryFilter<IProject>;
    const { projects, total } = await projectService.getProjects(query, page, limit);

    res.status(200).json({
      success: true,
      data: projects,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const savedProject = await projectService.createProject(req.body);
    activityEmitter.emit('projectActivity', {
      type: 'PROJECT_CREATED',
      title: savedProject.title,
      timestamp: new Date()
    });
    res.status(201).json({ success: true, data: savedProject });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid Project Data', error });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// Added controller handler:
export const updateProjectStatus = async (req: Request, res: Response): Promise<void> => {
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

    activityEmitter.emit('projectActivity', {
      type: 'PROJECT_STATUS_UPDATED',
      title: updated.title,
      status: updated.status,
      timestamp: new Date()
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating status.', error });
  }
};
