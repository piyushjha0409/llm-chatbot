import express from "express";
import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import bodyParser from "body-parser";

// Initialize Prisma Client
import { prisma } from "./lib/dbClient";

// Import Routes
import authRoutes from "./routes/auth.route";
import chatRoutes from "./routes/chat.route";
import llmRoute from "./routes/llm.route";

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/llm", llmRoute);

// Health Check Route
app.get("/", (req, res) => {
    res.status(200).send("Server is running...");
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    try {
        console.log(`Server is running on http://localhost:${PORT}`);
        // Test database connection
        await prisma.$connect();
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
});
