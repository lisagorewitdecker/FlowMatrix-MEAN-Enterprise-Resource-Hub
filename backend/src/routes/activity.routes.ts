import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { EventEmitter } from 'events';

export const activityEmitter = new EventEmitter();
const router = Router();

// SSE Endpoint for clients to listen to live events
router.get('/stream', verifyToken, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connection success heartbeat
  res.write(`data: ${JSON.stringify({ message: 'Connected to live stream' })}\n\n`);

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  activityEmitter.on('projectActivity', sendEvent);

  // Clean up listener when client disconnects
  req.on('close', () => {
    activityEmitter.off('projectActivity', sendEvent);
    res.end();
  });
});

export default router;
