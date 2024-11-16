import express, { json, urlencoded, Router } from "express";
import cors from "cors";

import authRouter from "./routes/auth/index";
import dashboardRouter from "./routes/dashboard";
import userManagement from "./routes/userManagement"
import addPrivilege  from "./routes/privileges";
const app = express();
const port = process.env.PORT;


app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome To Stock Management MIT IT");
});

app.use("/auth", authRouter);

app.use("/dashboard", dashboardRouter);

app.use("/usermanagement",userManagement)
app.use("/privileges", addPrivilege);

app.listen(port, () => {
  console.log(`Server listening on  ${process.env.SERVER_URL}:${port}`);
});
