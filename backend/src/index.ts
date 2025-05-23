import express, { json, urlencoded } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Route Imports
import authRouter from "./routes/auth/index";
import dashboardRouter from "./routes/dashboard";
import userManagementRouter from "./routes/userManagement";
import privilegeRouter from "./routes/privileges";
import stockRouter from "./routes/stock";
import uploadRouter from "./routes/uploads";
import logsRouter from "./routes/logs";
import fundRouter from "./routes/funds";
import reportStateRouter from "./routes/settingsRoutes"

const app = express();
const port = process.env.PORT;

// Predefined Middlewares
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());


// Base Route
app.get("/", (req, res) => {
  res.send("Welcome To Stock Management MIT IT");
});

// Route Middleware
app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);
app.use("/usermanagement", userManagementRouter);
app.use("/privileges", privilegeRouter);
app.use("/stock", stockRouter);
app.use("/upload", uploadRouter);
app.use("/logs", logsRouter);
app.use("/funds", fundRouter);
app.use("/settings", reportStateRouter)

// Start Server
app.listen(port, () => {
  console.log(`Server listening on ${process.env.SERVER_URL}:${port}`);
});
