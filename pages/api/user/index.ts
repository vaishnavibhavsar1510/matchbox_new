import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get session for all requests
  const session = await getSession({ req });

  // Verify authentication for all requests except POST (registration)
  if (req.method !== 'POST' && !session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db("matchbox");
      const users = db.collection("users");

      const user = await users.findOne({ email: session?.user?.email });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove sensitive data
      const { password, ...userData } = user;
      res.status(200).json(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Error fetching user' });
    }
  } else if (req.method === 'POST') {
    try {
      const client = await clientPromise;
      const db = client.db("matchbox");
      const users = db.collection("users");

      const userData = req.body;
      const result = await users.insertOne(userData);

      // Remove sensitive data
      const { password, ...returnData } = userData;
      res.status(201).json({ id: result.insertedId, ...returnData });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Error creating user' });
    }
  } else if (req.method === 'PUT') {
    try {
      const client = await clientPromise;
      const db = client.db("matchbox");
      const users = db.collection("users");

      if (!session?.user?.email) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { email, password, ...updateData } = req.body;

      // Don't allow updating email or password through this endpoint
      if (email || password) {
        return res.status(400).json({ error: 'Cannot update email or password through this endpoint' });
      }

      // Validate required fields
      if (!updateData) {
        return res.status(400).json({ error: 'No update data provided' });
      }

      const result = await users.updateOne(
        { email: session.user.email },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (result.modifiedCount === 0) {
        return res.status(400).json({ error: 'No changes were made to the user data' });
      }

      const updatedUser = await users.findOne({ email: session.user.email });

      if (!updatedUser) {
        return res.status(404).json({ error: 'Failed to retrieve updated user data' });
      }

      // Remove sensitive data
      const { password: _, ...userData } = updatedUser;
      return res.status(200).json(userData);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Error updating user' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 