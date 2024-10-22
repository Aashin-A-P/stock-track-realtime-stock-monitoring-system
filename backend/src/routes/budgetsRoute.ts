import { Router } from "express";
import budgets from "../data/budgets.json";

const router = Router();

// endpoints for budgets
router.get("/", (req, res) => {
  res.json(budgets);
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  const budget = budgets.find((budget) => budget.budget_id === Number(id));
  if (!budget) {
    res.status(404).send("Budget Not found!");
  }
  res.json(budget);
});

router.post("/", (req, res) => {
  const budget = req.body;
  console.log(budget);
  if (!budget) {
    res.status(404).send("Budget Not found!");
  }
  budgets.push(budget);
  res.status(201).json(budget);
});

router.put("/:id", (req, res) => {
  const id = req.params.id;
  const updateBudget = req.body;
  console.log(updateBudget);
  if (!updateBudget) {
    res.status(404).send("Budget Not found!");
  }

  const oldBudget = budgets.find((budget) => budget.budget_id === Number(id));

  Object.assign(oldBudget, updateBudget);

  res.status(201).json(oldBudget);
});

export default router;
