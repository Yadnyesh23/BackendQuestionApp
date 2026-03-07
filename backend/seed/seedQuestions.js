import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../models/Question.js";
import questions from "../src/data/questions.js";

dotenv.config();

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    // Clear existing data
    await Question.deleteMany();

    console.log("Old Questions Deleted");

    // Insert new questions
    await Question.insertMany(questions);

    console.log("Questions Seeded Successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedQuestions();