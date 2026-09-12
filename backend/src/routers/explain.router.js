import { Router } from 'express';
import { explainLine } from '../controllers/explain.controller.js';

const router = Router();

router.post('/', explainLine);

export default router;