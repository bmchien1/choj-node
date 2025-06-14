import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { initializeDatabase } from "./data-source";
import InitDataService from "./services/InitDataService";
import errorMiddleware from "./middleware/errorMiddleware";
import responseMiddleware from "./middleware/responseMiddleware";
import { chapterRoutes,authRoutes, courseRoutes, testRoutes, joinRoutes, submissionRoutes, userInCourseRoutes, questionRoutes, lessonRoutes, assignmentRoutes, matrixRoutes, tagRoutes, contestRoutes } from "./routes";

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(
  cors({
    origin: "http://localhost:3000", // Allow your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Support cookies/auth headers if needed
  })
);
app.use(responseMiddleware);

// Routes (prefixed with /api for consistency)
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/join", joinRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/user-in-course", userInCourseRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/matrix", matrixRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/contests", contestRoutes);
// Error handling middleware (must be last)
app.use(errorMiddleware);

// Initialize database and start server
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await initializeDatabase();
    await InitDataService.getInstance().initAdminAccount();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit with failure code
  }
};

startServer();