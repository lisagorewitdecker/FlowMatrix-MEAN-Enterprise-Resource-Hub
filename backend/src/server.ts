import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import type { Server } from 'node:http';
import mongoose from 'mongoose';
import { createApp } from './app';

export async function startServer(): Promise<Server> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is required.');
  }

  const port = Number(process.env.PORT ?? '5000');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  await mongoose.connect(mongoUri);

  const server = createApp().listen(port);
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve).once('error', reject);
  });

  return server;
}

if (require.main === module) {
  void startServer().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
