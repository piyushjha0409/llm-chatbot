import { Request, Response } from "express";
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

export const getLLMResponse = async (req: Request, res: Response): Promise<any> => {
    try {
        const { prompt } = req.body;
        const model = await genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });

        if (!prompt) {
            return res.status(400).json({ error: "User message is required." });
        }

        const response = await model.generateContent(prompt);
        const llmResponse = response.response.text();

        res.status(200).json({ message: llmResponse, prompt });
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