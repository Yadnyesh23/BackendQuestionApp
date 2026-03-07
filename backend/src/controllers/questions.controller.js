import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from '../utils/ApiResponse.js'
import Question from "../models/question.model.js";


const getAllQuestions = asyncHandler(async (req, res) => {

    const {
        page = 1,
        limit = 10,
        search = "",
        category,
        difficulty,
        tag
    } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { core_issue: { $regex: search, $options: "i" } }
        ];
    }

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;

    const questions = await Question.find(query)
        .select("title slug core_issue category difficulty tags")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await Question.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            total,
            page: Number(page),
            limit: Number(limit),
            questions
        }, "Questions fetched successfully")
    );

});

const getQuestionById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
        throw new ApiError(404, "Question not found");
    }

    return res.status(200).json(
        new ApiResponse(200, question, "Question fetched successfully")
    );

});


const getQuestionFilters = asyncHandler(async (req, res) => {

    const categories = await Question.distinct("category");
    const difficulties = await Question.distinct("difficulty");
    const tags = await Question.distinct("tags");

    return res.status(200).json(
        new ApiResponse(200, {
            categories,
            difficulties,
            tags
        }, "Filters fetched successfully")
    );

});

export {
    getAllQuestions,
    getQuestionById,
    getQuestionFilters
};