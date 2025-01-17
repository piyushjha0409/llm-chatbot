import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Environment Variables
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Register a new user
export const register = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({ message: "User registered successfully" });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).send('Internal Server Error');
        } else {
            console.error('Unexpected error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
};

// Login a user
export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        // Find the user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Compare the password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

        res.cookie("userId", user.id, { httpOnly: true });
        res.cookie("token", token, { httpOnly: true });
        res.cookie("username", user.username, { httpOnly: true });
        res.status(200).json({ message: "Login successful", token, userId: user.id });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).send('Internal Server Error');
        } else {
            console.error('Unexpected error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
};
