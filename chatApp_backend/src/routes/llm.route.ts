
const { getLLMResponse } = require('../controllers/llmController');


const router = require('express').Router();

router.post('/', getLLMResponse);


export default router;