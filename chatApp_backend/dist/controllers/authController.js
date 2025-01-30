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
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbClient_1 = require("../lib/dbClient");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
// Register a new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        // Check if the user already exists
        const existingUser = yield dbClient_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create the user
        const user = yield dbClient_1.prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).send('Internal Server Error');
        }
        else {
            console.error('Unexpected error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});
exports.register = register;
// Login a user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find the user
        const user = yield dbClient_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Compare the password
        const isValidPassword = yield bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Generate a JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
        res.cookie("userId", user.id, { httpOnly: true });
        res.cookie("token", token, { httpOnly: true });
        res.cookie("username", user.username, { httpOnly: true });
        res.status(200).json({ message: "Login successful", token, userId: user.id });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).send('Internal Server Error');
        }
        else {
            console.error('Unexpected error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});
exports.login = login;
