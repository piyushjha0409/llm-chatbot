import { Router } from "express";

import { getLLMResponse } from '../controllers/llmController';

const router = Router();

router.post('/', getLLMResponse);

export default router;