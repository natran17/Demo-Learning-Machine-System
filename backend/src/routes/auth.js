import express from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create user (store password as plain text for prototype)
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password, // Plain text, no hashing
        name,
        role,
      })
      .returning();

    res.json({ user: newUser });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check password (simple comparison)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

export default router;