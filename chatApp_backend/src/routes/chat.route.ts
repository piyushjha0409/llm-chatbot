// src/routes/chatRoutes.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import authenticateJWT from '../middleware';

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

        res.status(201).json({"conversation": conversation});
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId', authenticateJWT, async (req: Request, res: Response): Promise<any> => {
    try {
        const { conversation_id } = req.params;
        const userId = req.headers['user-id'] as string;
        // Verify user has access to this conversation
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                userId: userId,
                conversationId: conversation_id
            }
        });

        if (!participant) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversation_id
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

        res.status(201).json({"messages": messages});
        return;
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
        return;
    }
});

// Send a message in a conversation
router.post('/conversations/:conversationid', authenticateJWT, async (req: Request, res: Response): Promise<any> => {
    try {
        const { conversation_id } = req.params;
        const { content } = req.body;
        const userId = req.headers['user-id'] as string;

        // Verify user has access to this conversation
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                userId: userId,
                conversationId: conversation_id
            }
        });

        console.log("1")
        if (!participant) {
            return res.status(403).json({ error: 'Access denied' });
        }

        console.log("2")

        const message = await prisma.message.create({
            data: {
                content,
                conversationId: conversation_id,
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

        console.log("2")
        // Update conversation's updatedAt timestamp
        await prisma.conversation.update({
            where: { id: conversation_id },
            data: { updatedAt: new Date() }
        });

        res.status(201).json({"message": message});
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Delete a conversation
router.delete('/conversations/:conversationId', authenticateJWT, async (req: Request, res: Response): Promise<any> => {
    try {
        const { conversation_id } = req.params;
        const userId = getUserIdFromHeaders(req);

        // Verify user has access to this conversation
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                userId: userId,
                conversationId: conversation_id
            }
        });

        if (!participant) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Delete the conversation and all related messages
        await prisma.conversation.delete({
            where: { id: conversation_id }
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
        const { conversation_id } = req.params;
        const { title } = req.body;
        const userId = getUserIdFromHeaders(req);

        // Verify user has access to this conversation
        const participant = await prisma.conversationParticipant.findFirst({
            where: {
                userId: userId,
                conversationId: conversation_id
            }
        });

        if (!participant) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updatedConversation = await prisma.conversation.update({
            where: { id: conversation_id },
            data: { title }
        });

        res.status(201).json({"updatedConversation": updatedConversation});
    } catch (error) {
        console.error('Error updating conversation:', error);
        res.status(500).json({ error: 'Failed to update conversation' });
    }
});

export default router;