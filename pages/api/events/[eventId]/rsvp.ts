import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { eventId } = req.query;
    const { status, notes } = req.body;

    if (!eventId || !status || typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['going', 'maybe', 'not-going'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const client = await clientPromise;
    const db = client.db();

    // Update or create RSVP
    const result = await db.collection('events').updateOne(
      { _id: new ObjectId(eventId) },
      {
        $set: {
          [`rsvps.${session.user.email}`]: {
            status,
            notes: notes || '',
            updatedAt: new Date(),
          },
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get updated event data
    const updatedEvent = await db.collection('events').findOne(
      { _id: new ObjectId(eventId) },
      { projection: { rsvps: 1 } }
    );

    return res.status(200).json({ 
      message: 'RSVP updated successfully',
      rsvps: updatedEvent?.rsvps || {} 
    });
  } catch (error) {
    console.error('RSVP Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 