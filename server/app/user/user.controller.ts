import { Request, Response } from 'express';
import prisma from '../prisma_client.ts';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserPermissionsUpdateField, UserUpdateField } from '../validations/userSchema.ts';
import { env } from '../common/setupEnv.ts';

//  '/api/user/update/:userId',

export const getUsers = async (_: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const validatedInput = UserUpdateField.parse(req.body);
    // allows partial accept of record name, email, password
    let updateData: Partial<Record<UserUpdateField, string>> = {};

    // encrypt if the field is password
    if (validatedInput.field === 'password') {
      const saltRounds = 10;
      const securedPassword = await bcrypt.hash(validatedInput.value, saltRounds);
      updateData['password'] = securedPassword;
    } else {
      updateData[validatedInput.field] = validatedInput.value;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // get the new updated user detail to make jwt token
    const updatedUser = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    // make new jwt token
    const newToken: string = jwt.sign(
      {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        canPostEvents: updatedUser.canPostEvents,
        isAdmin: updatedUser.isAdmin,
      },
      env.JWT_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ success: true, token: newToken });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};


export const updateUserPermissions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userIdToUpdate = req.body.user.id;

    const validatedInput = UserPermissionsUpdateField.parse(req.body);
    let updateData: Partial<Record<keyof UserPermissionsUpdateField, boolean>> = {};
    updateData.isAdmin = validatedInput.isAdmin;
    updateData.canPostEvents = validatedInput.canPostEvents;



    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // get the new updated user detail to make jwt token
    const updatedUser = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (userId === userIdToUpdate) {
      const newToken: string = jwt.sign(
        {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          canPostEvents: updatedUser.canPostEvents,
          isAdmin: updatedUser.isAdmin,
        },
        env.JWT_TOKEN_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({ success: true, token: newToken });
    }
    return res.json({ success: true });

  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};
