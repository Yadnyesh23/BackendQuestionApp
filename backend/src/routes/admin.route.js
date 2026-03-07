import express from "express";
import {
    getAllQuestionsToAdmin,
    createQuestions,
    updateQuestions,
    deleteQuestions
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/admin/questions", getAllQuestionsToAdmin);
router.post("/admin/questions", createQuestions);
router.patch("/admin/questions/:id", updateQuestions);
router.delete("/admin/questions/:id", deleteQuestions);

export default router;