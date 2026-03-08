import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../src/models/question.model.js";
import questions from "./questions.js";

dotenv.config();

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Question.deleteMany({});
    console.log("🗑 Cleared existing questions");

    // Add unique `id` to each question to satisfy unique index
    const questionsWithId = questions.map((q, idx) => ({
      ...q,
      id: idx + 1, // simple numeric unique id
    }));

    await Question.insertMany(questionsWithId);
    console.log(`✅ Inserted ${questionsWithId.length} questions`);

    mongoose.connection.close();
    console.log("🔒 Connection closed");
  } catch (error) {
    console.error("❌ Error seeding questions:", error);
    mongoose.connection.close();
  }
};

seedQuestions();