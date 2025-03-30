import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variable in production

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, name, birthdate, gender } = req.body;
    console.log('Registration attempt for email:', email);

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const client = await clientPromise;
    const db = client.db('matchbox');
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    console.log('User already exists:', existingUser ? 'Yes' : 'No');

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');

    // Create user with additional data
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      name,
      birthdate,
      gender,
      interests: [],
      personality: '',
      activityLevel: '',
      socialStyle: '',
      relationshipGoals: '',
      bio: '',
      location: '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('User created successfully with ID:', result.insertedId);

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and token
    res.status(201).json({
      token,
      user: {
        id: result.insertedId,
        name,
        email,
        birthdate,
        gender,
        interests: [],
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 