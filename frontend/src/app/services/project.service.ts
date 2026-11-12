import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type ProjectStatus = 'Planning' | 'Active' | 'Completed' | 'On-Hold';

export interface Project {
  _id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  owner: string;
  team: string[];
  budget: number;
  deadline: string;
}

export interface ProjectListResponse {
  success: boolean;
  data: Project[];
  pagination: { total: number; page: number; pages: number };
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export interface ProjectQuery {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/projects';

  getProjects(query: ProjectQuery = {}): Observable<ProjectListResponse> {
    let params = new HttpParams();

    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.limit !== undefined) params = params.set('limit', query.limit);
    if (query.status) params = params.set('status', query.status);

    return this.http.get<ProjectListResponse>(this.apiUrl, { params });
  }

  createProject(project: Omit<Project, '_id' | 'status' | 'team'> & Partial<Pick<Project, 'status' | 'team'>>): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.apiUrl, project);
  }

  updateStatus(projectId: string, status: ProjectStatus): Observable<ProjectResponse> {
    return this.http.patch<ProjectResponse>(`${this.apiUrl}/${projectId}/status`, { status });
  }
}
