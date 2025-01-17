import express from "express";
import { getChats, sendMessage } from "../controllers/chatController";

const router = express.Router();

router.get("/", getChats);
router.post("/", sendMessage);

export default router;
