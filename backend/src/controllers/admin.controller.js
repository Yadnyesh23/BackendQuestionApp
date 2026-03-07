import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from '../utils/ApiResponse.js'
import Question from "../models/question.model.js";

const getAllQuestionsToAdmin = asyncHandler(async (req, res) => {

    const questions = await Question.find()
        .select("title slug category difficulty createdAt updatedAt")
        .sort({ createdAt: -1 });

    if (!questions || questions.length === 0) {
        throw new ApiError(404, "No questions found");
    }

    return res.status(200).json(
        new ApiResponse(200, questions, "Questions fetched successfully")
    );

});

const createQuestions = asyncHandler(async (req, res) => {

    const {
        title,
        slug,
        context,
        core_issue,
        scenario,
        category,
        difficulty,
        tags,
        phases
    } = req.body;

    if (!title || !slug || !scenario) {
        throw new ApiError(400, "Title, slug and scenario are required");
    }

    const existingQuestion = await Question.findOne({ slug });

    if (existingQuestion) {
        throw new ApiError(409, "Question with this slug already exists");
    }

    const question = await Question.create({
        title,
        slug,
        context,
        core_issue,
        scenario,
        category,
        difficulty,
        tags,
        phases
    });

    return res.status(201).json(
        new ApiResponse(201, question, "Question created successfully")
    );

});

const updateQuestions = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedQuestion, "Question updated successfully")
    );

});

const deleteQuestions = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    await Question.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Question deleted successfully")
    );

});

export {
    getAllQuestionsToAdmin,
    createQuestions,
    updateQuestions,
    deleteQuestions
};