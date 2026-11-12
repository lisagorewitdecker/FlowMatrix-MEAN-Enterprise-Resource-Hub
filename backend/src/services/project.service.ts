import type { QueryFilter } from 'mongoose';
import { Project, type IProject } from '../models/Project.model';

export async function getProjects(query: QueryFilter<IProject>, page: number, limit: number) {
  const projects = await Project.find(query)
    .populate('owner', 'name email')
    .populate('team', 'name email')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await Project.countDocuments(query);

  return { projects, total };
}

export async function createProject(data: Record<string, unknown>) {
  return new Project(data).save();
}

export async function deleteProject(projectId: string) {
  return Project.findByIdAndDelete(projectId);
}

// Added for Kanban status changes:
export async function updateProjectStatus(projectId: string, status: string) {
  return Project.findByIdAndUpdate(
    projectId,
    { status },
    { new: true, runValidators: true }
  ).populate('owner', 'name email');
}
