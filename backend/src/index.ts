import express, { json, urlencoded, Router } from "express";
import budgets from "./data/budgets.json";

import budgetsRouter from "./routes/budgetsRoute";

const app = express();
const port = process.env.PORT;

app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome To Stock Management MIT IT");
});

app.use("/budgets", budgetsRouter);

app.listen(port, () => {
  console.log(`Server listening on  ${process.env.SERVER_URL}:${port}`);
});
