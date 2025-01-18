import  { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";

import authenticateJWT from "../middleware";
import { prisma } from "../lib/dbClient";

const router = Router();

// Get all conversations for a user
router.get(
  "/conversations",
  authenticateJWT,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.headers["user-id"] as string;
      console.log("userId :", userId);

      if (!userId) {
        return res
          .status(400)
          .json({ error: "User ID is required in headers" });
      }

      const conversations = await prisma.conversation.findMany({
        where: {
          userId: userId as string,
        },
        include: {
          messages: {
            take: 1,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      res.status(200).json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  }
);

// Create a new conversation
router.post(
  "/conversations",
  authenticateJWT,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.headers["user-id"] as string;
      const { title } = req.body;

      if (!userId) {
        return res
          .status(400)
          .json({ error: "User ID is required in headers" });
      }

      if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "Valid title is required" });
      }

      const conversation = await prisma.conversation.create({
        data: {
          title,
          userId,
        }
      });

      res.status(201).json({
        message: "Conversation created successfully",
        conversation,
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  }
);

// Get messages for a specific conversation
router.get(
  "/conversations/:conversationId",
  authenticateJWT,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { conversationId } = req.params;
      const userId = req.headers["user-id"] as string;
      // Verify user has access to this conversation
      const participant = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: userId,
        },
        include: {
          user: true,
        },
      });

      if (!participant) {
        return res.status(403).json({ error: "Access denied" });
      }

      //fnding the messages array of the conversation
      const messages = await prisma.message.findMany({
        where: {
          conversationId: conversationId,
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return res.status(200).json({
        conversationId,
        messages: messages,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
      return;
    }
  }
);

// Send a message in a conversation
router.post(
  "/conversations/:conversationId",
  authenticateJWT,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { conversationId } = req.params;
      const userId = req.headers["user-id"] as string;
      const { content, senderType } = req.body;

      const cleanConversationId = conversationId.replace("conversationId=", "");

      console.log("Incoming request to send message:", {
        conversationId,
        content,
        userId,
      });

      // Verify user has access to this conversation
      const participant = await prisma.conversation.findFirst({
        where: {
          id: cleanConversationId,
          userId: userId,
        },
      });

      if (!participant) {
        console.warn(
          `Access denied for userId: ${userId} to conversationId: ${conversationId}`
        );
        return res.status(403).json({ error: "Access denied" });
      }

      // Validate conversation exists
      const conversation = await prisma.conversation.findUnique({
        where: { id: cleanConversationId },
      });

      if (!conversation) {
        console.warn(
          `Conversation not found for conversationId: ${conversationId}`
        );
        return res.status(404).json({ error: "Conversation not found" });
      }

      const message = await prisma.message.create({
        data: {
          content: content as string,
          conversationId: cleanConversationId,
          senderType: senderType,
          senderId: userId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      console.log("Message created successfully:", message);

      // Update conversation's updatedAt timestamp
      const update = await prisma.conversation.update({
        where: { id: cleanConversationId },
        data: { updatedAt: new Date() },
      });

      if (!update) {
        console.warn(
          `Failed to update conversation for conversationId: ${conversationId}`
        );
        res.status(400).json({ error: "Failed to update conversation" });
      }

      res.status(201).json({ messages: [message] });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  }
);

// Delete a conversation
router.delete(
  "/conversations/:conversationId",
  authenticateJWT,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { conversationId } = req.params;
      const userId = req.headers["user-id"] as string;

      const cleanConversationId = conversationId.replace("conversationId=", "");

      // Verify user has access to this conversation
      const participant = await prisma.user.findFirst({
        where: {
          id: userId,
          conversations: {
            some: {
              id: new ObjectId(conversationId).toString(),
            },
          },
        },
      });

      if (!participant) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Delete the conversation and all related messages
      await prisma.conversation.delete({
        where: { id: cleanConversationId },
      });

      res.status(201).json({ message: "Conversation deleted successfully" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  }
);

// Update conversation title
router.patch(
  "/conversations/:conversationId",
  authenticateJWT,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { conversationId } = req.params;
      const { title } = req.body;
      const userId = req.headers["user-id"] as string;

      const cleanConversationId = conversationId.replace("conversationId=", "");

      // Verify user has access to this conversation
      const participant = await prisma.user.findFirst({
        where: {
          id: userId,
          conversations: {
            some: {
              id: new ObjectId(conversationId).toString(),
            },
          },
        },
      });

      if (!participant) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updatedConversation = await prisma.conversation.update({
        where: { id: cleanConversationId },
        data: { title },
      });

      res.status(201).json({ updatedConversation: updatedConversation });
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ error: "Failed to update conversation" });
    }
  }
);

export default router;
