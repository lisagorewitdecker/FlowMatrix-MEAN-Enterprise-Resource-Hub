import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import projectRoutes from '../routes/project.routes';

const app = express();
app.use(express.json());
app.use('/api/projects', projectRoutes);

let mongoServer: MongoMemoryServer;
const accessToken = jwt.sign({ userId: 'user-id', role: 'Contributor' }, process.env.JWT_ACCESS_SECRET || 'access_secret');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({ binary: { version: '7.0.24' } });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5_000 });
}, 60_000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}, 60_000);

describe('Project API Endpoints', () => {
  it('should fetch an empty list of projects initially', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });
});
