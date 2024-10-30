import express, { json, urlencoded, Router } from "express";

import authRouter from "./routes/auth/index";

const app = express();
const port = process.env.PORT;

app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome To Stock Management MIT IT");
});

app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`Server listening on  ${process.env.SERVER_URL}:${port}`);
});
