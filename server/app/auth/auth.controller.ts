import { Request, Response } from 'express';
import prisma from '../prisma_client.ts';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { env } from '../common/setupEnv.ts';

async function doesUserExist(email: string): Promise<boolean> {
  /**
   * Check if user exists in the database
   * Potentially throws an error from Prisma
   * @param email string - email of the user
   */
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  if (user) {
    return true;
  }
  return false;
}

async function getUser(email: string) {
  /**
   * Get user from the database
   * Potentially throws an error from Prisma
   * @param email string - email of the user
   */
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  return user;
}

async function createUser(name: string, email: string, password: string) {
  /**
   * Create user in the database
   * Potentially throws an error from Prisma
   * @param name string - name of the user
   * @param email string - email of the user
   * @param password string - password of the user
   */
  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: password,
    },
  });
  return newUser;
}

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Required field missing" });
    }

    const existingUser = await doesUserExist(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser(name, email, hashPassword);

    const token: string = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        canPostEvents: newUser.canPostEvents,
        isAdmin: newUser.isAdmin,
      },
      env.JWT_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ success: true, token: token });
  } catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const user = await getUser(email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValidPassword = user.password === null ? false : await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token: string = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      canPostEvents: user.canPostEvents,
      isAdmin: user.isAdmin,
    },
    env.JWT_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

  return res.json({ success: true, token: token });
}




