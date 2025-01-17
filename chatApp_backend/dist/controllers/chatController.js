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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getChats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Fetch chats for a user
const getChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        // Find chats for the user
        const chats = yield prisma.chat.findMany({
            where: { userId: Number(userId) },
            orderBy: { createdAt: "asc" },
        });
        return res.status(200).json(chats);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});
exports.getChats = getChats;
// Send a message
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, message } = req.body;
        if (!userId || !message) {
            return res.status(400).json({ error: "User ID and message are required" });
        }
        // Create a new chat message
        const chat = yield prisma.chat.create({
            data: {
                userId: Number(userId),
                message,
            },
        });
        return res.status(201).json(chat);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            return res.status(500).send('Internal Server Error');
        }
        else {
            console.error('Unexpected error:', error);
            return res.status(500).send('Internal Server Error');
        }
    }
});
exports.sendMessage = sendMessage;
