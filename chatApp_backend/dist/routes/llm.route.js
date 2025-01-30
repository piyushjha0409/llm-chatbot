"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const llmController_1 = require("../controllers/llmController");
const router = (0, express_1.Router)();
router.post('/', llmController_1.getLLMResponse);
exports.default = router;
