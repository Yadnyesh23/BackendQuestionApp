import express from "express";
import {
    getAllQuestions,
    getQuestionById,
    getQuestionFilters
} from "../controllers/questions.controller.js";

const router = express.Router();

router.get("/questions", getAllQuestions);
router.get("/questions/:id", getQuestionById);
router.get("/questions/filters", getQuestionFilters);

export default router;