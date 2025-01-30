"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const middleware_1 = __importDefault(require("../middleware"));
const dbClient_1 = require("../lib/dbClient");
const router = (0, express_1.Router)();
// Get all conversations for a user
router.get("/conversations", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.headers["user-id"];
        if (!userId) {
            return res.status(400).json({ error: "User ID is required in headers" });
        }
        const conversations = yield dbClient_1.prisma.conversation.findMany({
            where: {
                userId: userId,
            },
            include: {
                messages: {
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
    }
    catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
}));
// Create a new conversation
router.post("/conversations", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.headers["user-id"];
        const { title } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required in headers" });
        }
        if (!title || typeof title !== "string") {
            return res.status(400).json({ error: "Valid title is required" });
        }
        const conversation = yield dbClient_1.prisma.conversation.create({
            data: {
                title,
                userId,
            },
        });
        console.log(`New conversation created with ID: ${conversation.id}`);
        res.status(201).json(conversation);
    }
    catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({ error: "Failed to create conversation" });
    }
}));
// Get messages for a specific conversation
router.get("/conversations/:conversationId", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        const userId = req.headers["user-id"];
        // Verify user has access to this conversation
        const participant = yield dbClient_1.prisma.conversation.findFirst({
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
        const messages = yield dbClient_1.prisma.message.findMany({
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
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
        return;
    }
}));
// Send a message in a conversation
router.post("/conversations/:conversationId", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        const userId = req.headers["user-id"];
        const { content } = req.body;
        console.log(req.body);
        const cleanConversationId = conversationId.replace("conversationId=", "");
        console.log("Incoming request to send message:", {
            conversationId,
            content,
            userId,
        });
        // Verify user has access to this conversation
        const participant = yield dbClient_1.prisma.conversation.findFirst({
            where: {
                id: cleanConversationId,
                userId: userId,
            },
        });
        if (!participant) {
            console.warn(`Access denied for userId: ${userId} to conversationId: ${conversationId}`);
            return res.status(403).json({ error: "Access denied" });
        }
        // Validate conversation exists
        const conversation = yield dbClient_1.prisma.conversation.findUnique({
            where: { id: cleanConversationId },
        });
        if (!conversation) {
            console.warn(`Conversation not found for conversationId: ${conversationId}`);
            return res.status(404).json({ error: "Conversation not found" });
        }
        const message = yield dbClient_1.prisma.message.createMany({
            data: content.map((msg) => ({
                content: msg.content,
                senderId: userId,
                conversationId: cleanConversationId,
                senderType: msg.senderType,
            })),
        });
        console.log("Message created successfully:", message);
        // Update conversation's updatedAt timestamp
        const update = yield dbClient_1.prisma.conversation.update({
            where: { id: cleanConversationId },
            data: { updatedAt: new Date() },
        });
        if (!update) {
            console.warn(`Failed to update conversation for conversationId: ${conversationId}`);
            res.status(400).json({ error: "Failed to update conversation" });
        }
        res.status(201).json({ messages: [message] });
    }
    catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
}));
// Delete a conversation
router.delete("/conversations/:conversationId", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        const userId = req.headers["user-id"];
        const cleanConversationId = conversationId.replace("conversationId=", "");
        // Verify user has access to this conversation
        const participant = yield dbClient_1.prisma.user.findFirst({
            where: {
                id: userId,
                conversations: {
                    some: {
                        id: new mongodb_1.ObjectId(conversationId).toString(),
                    },
                },
            },
        });
        if (!participant) {
            return res.status(403).json({ error: "Access denied" });
        }
        // Delete the conversation and all related messages
        yield dbClient_1.prisma.conversation.delete({
            where: { id: cleanConversationId },
        });
        res.status(201).json({ message: "Conversation deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting conversation:", error);
        res.status(500).json({ error: "Failed to delete conversation" });
    }
}));
// Update conversation title
router.patch("/conversations/:conversationId", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        const { title } = req.body;
        const userId = req.headers["user-id"];
        const cleanConversationId = conversationId.replace("conversationId=", "");
        // Verify user has access to this conversation
        const participant = yield dbClient_1.prisma.user.findFirst({
            where: {
                id: userId,
                conversations: {
                    some: {
                        id: new mongodb_1.ObjectId(conversationId).toString(),
                    },
                },
            },
        });
        if (!participant) {
            return res.status(403).json({ error: "Access denied" });
        }
        const updatedConversation = yield dbClient_1.prisma.conversation.update({
            where: { id: cleanConversationId },
            data: { title },
        });
        res.status(201).json({ updatedConversation: updatedConversation });
    }
    catch (error) {
        console.error("Error updating conversation:", error);
        res.status(500).json({ error: "Failed to update conversation" });
    }
}));
exports.default = router;
