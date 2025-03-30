import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../utils/mongodb';
import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { NextApiResponseServerIO } from '../../../types/next';
import { ObjectId, UpdateResult } from 'mongodb';

interface Message {
  _id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface Chat {
  _id: ObjectId;
  participants: string[];
  messages: Message[];
  createdAt: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  const client = await clientPromise;
  const db = client.db("matchbox");
  const chats = db.collection<Chat>("chats");

  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-chat', (chatId: string) => {
        console.log(`Client ${socket.id} joined chat:`, chatId);
        socket.join(chatId);
      });

      socket.on('leave-chat', (chatId: string) => {
        console.log(`Client ${socket.id} left chat:`, chatId);
        socket.leave(chatId);
      });

      socket.on('send-message', async (data: { chatId: string; message: string; sender: string }) => {
        console.log('Message received:', data);
        const { chatId, message, sender } = data;
        
        try {
          const newMessage: Message = {
            _id: Date.now().toString(),
            sender,
            content: message,
            timestamp: new Date(),
          };

          // Store message in database
          const result = await chats.updateOne(
            { _id: new ObjectId(chatId) },
            { $push: { messages: newMessage } }
          );

          if (result.modifiedCount === 0) {
            console.error('Failed to store message in database');
            return;
          }

          // Broadcast message to chat room
          io.to(chatId).emit('new-message', newMessage);
        } catch (error) {
          console.error('Error storing message:', error);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { participants, message } = req.body;
        const sender = participants[0]; // The first participant is the sender
        
        // Create new chat or get existing one
        let chat = await chats.findOne({
          participants: { $all: participants },
        });

        if (chat) {
          // If message is provided, add it to existing chat
          if (message) {
            const newMessage: Message = {
              _id: new ObjectId().toString(),
              sender,
              content: message,
              timestamp: new Date(),
            };

            await chats.updateOne(
              { _id: chat._id },
              { 
                $push: { messages: newMessage },
                $set: { updatedAt: new Date() }
              }
            );

            // Get updated chat
            const updatedChat = await chats.findOne({ _id: chat._id });
            if (!updatedChat) {
              throw new Error('Failed to retrieve updated chat');
            }
            
            // Broadcast message through socket
            if (res.socket.server.io) {
              res.socket.server.io.to(updatedChat._id.toString()).emit('new-message', newMessage);
            }

            return res.status(200).json(updatedChat);
          }

          return res.status(200).json(chat);
        }

        // Create new chat
        const newChat: Omit<Chat, '_id'> = {
          participants,
          messages: message ? [{
            _id: new ObjectId().toString(),
            sender,
            content: message,
            timestamp: new Date()
          }] : [],
          createdAt: new Date(),
        };

        const result = await chats.insertOne(newChat as Chat);
        const createdChat = { ...newChat, _id: result.insertedId };

        // If message was included, broadcast it through socket
        if (message && res.socket.server.io) {
          res.socket.server.io.to(result.insertedId.toString()).emit('new-message', newChat.messages[0]);
        }

        res.status(201).json(createdChat);
      } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: 'Error creating chat' });
      }
      break;

    case 'GET':
      try {
        const { userId } = req.query;
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        const userChats = await chats.find({
          participants: userId,
        }).toArray();

        // Sort messages by timestamp for each chat
        const sortedChats = userChats.map(chat => ({
          ...chat,
          messages: chat.messages?.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ) || []
        }));

        res.status(200).json(sortedChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Error fetching chats' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 