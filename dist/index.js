"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const data_source_1 = require("./data-source");
const InitDataService_1 = __importDefault(require("./services/InitDataService"));
const errorMiddleware_1 = __importDefault(require("./middleware/errorMiddleware"));
const responseMiddleware_1 = __importDefault(require("./middleware/responseMiddleware"));
const routes_1 = require("./routes");
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json()); // Parse JSON bodies
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // Allow your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Support cookies/auth headers if needed
}));
app.use(responseMiddleware_1.default);
// Routes (prefixed with /api for consistency)
app.use("/api/auth", routes_1.authRoutes);
app.use("/api/courses", routes_1.courseRoutes);
app.use("/api/lessons", routes_1.lessonRoutes);
app.use("/api/assignments", routes_1.assignmentRoutes);
app.use("/api/tests", routes_1.testRoutes);
app.use("/api/join", routes_1.joinRoutes);
app.use("/api/submissions", routes_1.submissionRoutes);
app.use("/api/user-in-course", routes_1.userInCourseRoutes);
app.use("/api/questions", routes_1.questionRoutes);
app.use("/api/matrix", routes_1.matrixRoutes);
app.use("/api/tags", routes_1.tagRoutes);
app.use("/api/chapters", routes_1.chapterRoutes);
app.use("/api/contests", routes_1.contestRoutes);
// Error handling middleware (must be last)
app.use(errorMiddleware_1.default);
// Initialize database and start server
const PORT = process.env.PORT || 8080;
const startServer = async () => {
    try {
        await (0, data_source_1.initializeDatabase)();
        await InitDataService_1.default.getInstance().initAdminAccount();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1); // Exit with failure code
    }
};
startServer();
