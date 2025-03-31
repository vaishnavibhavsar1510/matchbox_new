import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['GET', 'POST'].includes(req.method || '')) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication using NextAuth session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db();

    if (req.method === 'GET') {
      // Get all events, sorted by date
      const events = await db.collection('events')
        .find({})
        .sort({ date: 1 })
        .toArray();

      // Transform the events to ensure consistent format
      const formattedEvents = events.map(event => ({
        _id: event._id.toString(),
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        maxAttendees: event.maxAttendees || event.maxParticipants,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt || event.createdAt,
        rsvps: event.rsvps || {},
        interests: event.interests || [],
      }));

      return res.status(200).json(formattedEvents);
    }

    if (req.method === 'POST') {
      const { title, description, date, location, maxParticipants, interests } = req.body;

      // Validate required fields
      if (!title || !date || !location || !maxParticipants) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create the event
      const event = {
        title,
        description,
        date,
        location,
        maxAttendees: parseInt(maxParticipants),
        maxParticipants: parseInt(maxParticipants), // Keep for backward compatibility
        createdBy: {
          email: session.user.email,
          name: session.user.name || '',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rsvps: {},
        interests: interests || [],
      };

      const result = await db.collection('events').insertOne(event);

      if (!result.insertedId) {
        throw new Error('Failed to create event');
      }

      // Return the created event
      return res.status(201).json({
        ...event,
        _id: result.insertedId.toString(),
      });
    }
  } catch (error) {
    console.error('Events API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 