import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  id: String,
  title: String,
  logic: String,
  description: String
});

/* ---------- Phase 3 Architecture Schemas ---------- */

const archItemSchema = new mongoose.Schema({
  id: String,
  desc: String
});

const archSectionSchema = new mongoose.Schema({
  key: String,
  label: String,
  desc: String,
  items: [archItemSchema]
});

/* ---------- Main Question Schema ---------- */

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    slug: {
      type: String,
      required: true,
      unique: true
    },

    context: String,

    core_issue: String,

    scenario: String,

    category: String,

    difficulty: String,

    tags: [String],

    phases: {
      phase1: {
        question: String,
        options: [optionSchema]
      },

      phase2: {
        A: [optionSchema],
        B: [optionSchema],
        C: [optionSchema],
        D: [optionSchema]
      },

      phase3: {
        title: String,
        description: String,
        archSections: [archSectionSchema]
      },

      phase4: {
        instruction: String
      },

      phase5: {
        intent: String,
        context: String,
        weak_signals: [String],
        recommended_solution: [String],
        followup_questions: [String]
      }
    }
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;