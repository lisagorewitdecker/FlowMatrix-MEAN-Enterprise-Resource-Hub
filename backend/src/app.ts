import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import activityRoutes from './routes/activity.routes';
import analyticsRoutes from './routes/analytics.routes';

export function createApp() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
      credentials: true
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // Swagger Documentation (safely checks file presence so missing docs won't crash backend)
  const candidatePaths = [
    path.join(__dirname, '../src/docs/swagger.yaml'),
    path.join(__dirname, './docs/swagger.yaml'),
    path.join(process.cwd(), 'src/docs/swagger.yaml')
  ];

  const swaggerFile = candidatePaths.find((p) => fs.existsSync(p));

  if (swaggerFile) {
    try {
      const swaggerDocument = YAML.load(swaggerFile);
      app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    } catch (err) {
      console.warn('Warning: Failed to parse swagger.yaml:', err);
    }
  }

  // Application Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/activity', activityRoutes);
  app.use('/api/analytics', analyticsRoutes);

  return app;
}
