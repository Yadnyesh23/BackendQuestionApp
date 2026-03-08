import express from "express";
import {
    getAllQuestions,
    getQuestionById,
} from "../controllers/questions.controller.js";

const router = express.Router();

router.get("/questions", getAllQuestions);
router.get("/questions/:id", getQuestionById);

export default router;