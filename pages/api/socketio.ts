import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO } from '../../types/next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    console.log('New Socket.io server...');
    // adapt Next's net Server to http Server
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/socket.io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });
    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socket.on('rsvpUpdated', (data) => {
        // Broadcast the update to all connected clients except sender
        socket.broadcast.emit('eventUpdated', data);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });
  }

  res.end();
} 