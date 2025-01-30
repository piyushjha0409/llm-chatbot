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
exports.getLLMResponse = void 0;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const getLLMResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prompt } = req.body;
        const model = yield genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });
        if (!prompt) {
            return res.status(400).json({ error: "User message is required." });
        }
        const response = yield model.generateContent(prompt);
        const llmResponse = response.response.text();
        res.status(200).json({ message: llmResponse, prompt });
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
exports.getLLMResponse = getLLMResponse;
