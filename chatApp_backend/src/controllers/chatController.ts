import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fetch chats for a user
export const getChats = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find chats for the user
    const chats = await prisma.chat.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, userMessage, botMessage } = req.body;

    if (!userId || !userMessage || !botMessage) {
      return res.status(400).json({ error: "User ID and message are required" });
    }

    // Create a new chat message
    const chat = await prisma.chat.create({
      data: {
        userMessage: userMessage,
        botMessage: botMessage,
        createdAt: new Date(),
        userId: userId,
      },
    });

    return res.status(201).json(chat);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      return res.status(500).send('Internal Server Error');
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).send('Internal Server Error');
    }
  }
};
