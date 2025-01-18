// src/routes/chatRoutes.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticateJWT from '../middleware';
import { ObjectId } from "mongodb";

const router = express.Router();
const prisma = new PrismaClient();


const getUserIdFromHeaders = (req: Request) => req.headers['userId'] as string;


// Get all conversations for a user
router.get('/conversations', authenticateJWT, async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.headers['user-id'] as string;
        console.log("userId :", userId)

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required in headers' });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                messages: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Create a new conversation
router.post('/conversations', authenticateJWT, async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.headers['user-id'] as string;
        const { title } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required in headers' });
        }

        if (!title || typeof title !== 'string') {
            return res.status(400).json({ error: 'Valid title is required' });
        }

        const conversation = await prisma.conversation.create({
            data: {
                title,
                participants: {
                    create: [
                        {
                            user: {
                                connect: {
                                    id: userId
                                }
                            }
                        }
                    ]
                }
            }
        });

        res.status(201).json({ "conversation": conversation });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId', authenticateJWT, async (req: Request, res: Response): Promise<any> => {
    try {
        const { conversationId } = req.params;
        const userId = req.headers['user-id'] as string;
        // Verify user has access to this conversation
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                userId: userId,
                conversationId: new ObjectId(conversationId).toString()
            }
        });

        if (!participant) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        //fnding the messages array of the conversation
        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversationId
            },
            orderBy: {
                createdAt: 'asc'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        res.status(201).json({ "messages": messages });
        return;
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
        return;
    }
});

// Send a message in a conversation
router.post('/conversations/:conversationId', authenticateJWT, async (req: Request, res: Response): Promise<any> => {
    try {
        const { conversationId } = req.params;
        const userId = req.headers['user-id'] as string;
        const { content } = req.body;

        const cleanConversationId = conversationId.replace('conversationId=', '');

        console.log("Incoming request to send message:", { conversationId, content, userId });

        // Verify user has access to this conversation
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                userId: userId,
                conversationId: new ObjectId(cleanConversationId).toString()
            }
        });

        if (!participant) {
            console.warn(`Access denied for userId: ${userId} to conversationId: ${conversationId}`);
            return res.status(403).json({ error: 'Access denied' });
        }

        // Validate conversation exists
        const conversation = await prisma.conversation.findUnique({
            where: { id: cleanConversationId }
        });

        if (!conversation) {
            console.warn(`Conversation not found for conversationId: ${conversationId}`);
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const message = await prisma.message.create({
            data: {
                content,
                conversationId: cleanConversationId,
                senderId: userId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });

        console.log("Message created successfully:", message);

        // Update conversation's updatedAt timestamp
        const update = await prisma.conversation.update({
            where: { id: cleanConversationId },
            data: { updatedAt: new Date() }
        });

        if (!update) {
            console.warn(`Failed to update conversation for conversationId: ${conversationId}`);
            res.status(400).json({ error: 'Failed to update conversation' });
        }

        res.status(201).json({ "message": message });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Delete a conversation
router.delete('/conversations/:conversationId', authenticateJWT, async (req: Request, res: Response): Promise<any> => {
    try {
        const { conversationId } = req.params;
        const userId = req.headers['user-id'] as string;

        const cleanConversationId = conversationId.replace('conversationId=', '');

        // Verify user has access to this conversation
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                userId: userId,
                conversationId: cleanConversationId
            }
        });

        if (!participant) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Delete the conversation and all related messages
        await prisma.conversation.delete({
            where: { id: cleanConversationId }
        });

        res.status(201).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
});

// Update conversation title
router.patch('/conversations/:conversationId', authenticateJWT, async (req: Request, res: Response): Promise<any> => {
    try {
        const { conversationId } = req.params;
        const { title } = req.body;
        const userId = req.headers['user-id'] as string;

        const cleanConversationId = conversationId.replace('conversationId=', '');


        // Verify user has access to this conversation
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                userId: userId,
                conversationId: cleanConversationId
            }
        });

        if (!participant) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updatedConversation = await prisma.conversation.update({
            where: { id: cleanConversationId },
            data: { title }
        });

        res.status(201).json({ "updatedConversation": updatedConversation });
    } catch (error) {
        console.error('Error updating conversation:', error);
        res.status(500).json({ error: 'Failed to update conversation' });
    }
});

export default router;