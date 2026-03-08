import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000

// Routes
import questionRoutes from './routes/questions.route.js'

app.use("/api", questionRoutes);

// Connect DB
connectDB()

// Server
app.listen(PORT , () => {
    console.log(`Server listening on port : http://localhost:${PORT}`)
})