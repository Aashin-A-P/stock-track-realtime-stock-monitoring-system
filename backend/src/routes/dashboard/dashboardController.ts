import { Request, Response } from "express";
import { db } from "../../db";
import { desc, eq } from "drizzle-orm";
import { budgetsTable } from "../../db/schemas/budgetsSchema";
import { sql } from "drizzle-orm";
import { categoriesTable } from "../../db/schemas/categoriesSchema";
import { categoryWiseBudgetsTable } from "../../db/schemas/categoryWiseBudgetsSchema";

export const getPieChartAnalysis = async (req: Request, res: Response) => {
  const { year }: { year?: string } = req.query;
  const monthlySpentResponseArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  if (!year) {
    return res.status(400).json({ error: 'Year is required' });
  }

  try {
    // Fetch total amount allocated for each budget in the year
    const budgetsData = await db
      .select({
        budget_id: budgetsTable.budgetId,
        budget_name: budgetsTable.budgetName,
        amount: budgetsTable.amount
      })
      .from(budgetsTable)
      .where(sql`EXTRACT(YEAR FROM ${budgetsTable.startDate}) = ${parseInt(year as string, 10)}`);

    if (!budgetsData || budgetsData.length === 0) {
      return res.status(404).json({ error: 'No budget data found for the year' });
    }

    // Fetch total amount spent for each budget in the year
    const totalSpentData = await db
      .select({
        budget_id: categoryWiseBudgetsTable.budgetId,
        total_spent: sql<number>`sum(${categoryWiseBudgetsTable.amount})`
      })
      .from(categoryWiseBudgetsTable)
      .where(sql`EXTRACT(YEAR FROM ${categoryWiseBudgetsTable.createdAt}) = ${parseInt(year as string, 10)}`)
      .groupBy(categoryWiseBudgetsTable.budgetId);

    // Fetch monthly spending data for each budget in the year
    const monthlySpentData = await db
      .select({
        budget_id: categoryWiseBudgetsTable.budgetId,
        month: sql`EXTRACT(MONTH FROM ${categoryWiseBudgetsTable.createdAt})`,
        total_spent: sql<number>`sum(${categoryWiseBudgetsTable.amount})`
      })
      .from(categoryWiseBudgetsTable)
      .where(sql`EXTRACT(YEAR FROM ${categoryWiseBudgetsTable.createdAt}) = ${parseInt(year as string, 10)}`)
      .groupBy(categoryWiseBudgetsTable.budgetId, sql`EXTRACT(MONTH FROM ${categoryWiseBudgetsTable.createdAt})`);

    // Fetch category-wise spending data for each budget in the year
    const categorySpentData = await db
      .select({
        budget_id: categoryWiseBudgetsTable.budgetId,
        category: categoriesTable.categoryName,
        spent: sql<number>`sum(${categoryWiseBudgetsTable.amount})`,
      })
      .from(categoryWiseBudgetsTable)
      .leftJoin(categoriesTable, eq(categoryWiseBudgetsTable.categoryId, categoriesTable.categoryId))
      .leftJoin(budgetsTable, eq(categoryWiseBudgetsTable.budgetId, budgetsTable.budgetId))
      .where(sql`EXTRACT(YEAR FROM ${budgetsTable.startDate}) = ${parseInt(year as string, 10)}`)
      .groupBy(categoryWiseBudgetsTable.budgetId, categoriesTable.categoryName);

    // Construct response data
    const responseData = budgetsData.map(budget => {
      const totalSpent = totalSpentData.find(spent => spent.budget_id === budget.budget_id)?.total_spent || 0;
      const monthlySpent = monthlySpentData
        .filter(spent => spent.budget_id === budget.budget_id)
        .reduce((acc, curr) => {
          acc[Number(curr.month) - 1] = curr.total_spent;
          return acc;
        }, [...monthlySpentResponseArray]);
      const categorySpent = categorySpentData.filter(spent => spent.budget_id === budget.budget_id);

      return {
        budgetName: budget.budget_name,
        totalBudget: budget.amount,
        totalSpent,
        monthlySpent,
        categorySpent,
      };
    });

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

export const getAllYearPieChartAnalysis = async (req: Request, res: Response) => {
  try {
    // Fetch total amount allocated for each budget
    const budgetsData = await db
      .select({
        budget_id: budgetsTable.budgetId,
        budget_name: budgetsTable.budgetName,
        total_amount: sql<number>`sum(${budgetsTable.amount})`
      })
      .from(budgetsTable)
      .groupBy(budgetsTable.budgetId, budgetsTable.budgetName);

    if (!budgetsData || budgetsData.length === 0) {
      return res.status(404).json({ error: 'No budget data found' });
    }

    // Fetch total amount spent for each budget
    const totalSpentData = await db
      .select({
        budget_id: categoryWiseBudgetsTable.budgetId,
        total_spent: sql<number>`sum(${categoryWiseBudgetsTable.amount})`
      })
      .from(categoryWiseBudgetsTable)
      .groupBy(categoryWiseBudgetsTable.budgetId);

    // Fetch category-wise spending data for each budget
    const categorySpentData = await db
      .select({
        budget_id: categoryWiseBudgetsTable.budgetId,
        category: categoriesTable.categoryName,
        spent: sql<number>`sum(${categoryWiseBudgetsTable.amount})`,
      })
      .from(categoryWiseBudgetsTable)
      .leftJoin(categoriesTable, eq(categoryWiseBudgetsTable.categoryId, categoriesTable.categoryId))
      .leftJoin(budgetsTable, eq(categoryWiseBudgetsTable.budgetId, budgetsTable.budgetId))
      .groupBy(categoryWiseBudgetsTable.budgetId, categoriesTable.categoryName);

    // Construct response data
    const responseData = budgetsData.map(budget => {
      const totalSpent = totalSpentData.find(spent => spent.budget_id === budget.budget_id)?.total_spent || 0;
      const categorySpent = categorySpentData.filter(spent => spent.budget_id === budget.budget_id);

      return {
        budgetName: budget.budget_name,
        totalBudget: budget.total_amount,
        totalSpent,
        categorySpent,
      };
    });

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

export const getAllYears = async (req: Request, res: Response) => {
  try {
    // First get all distinct budget periods
    const budgetPeriods = await db
      .select({
        startDate: budgetsTable.startDate,
        endDate: budgetsTable.endDate
      })
      .from(budgetsTable)
      .groupBy(budgetsTable.startDate, budgetsTable.endDate)
      .orderBy(desc(budgetsTable.startDate));

    if (!budgetPeriods || budgetPeriods.length === 0) {
      return res.status(404).json({ error: "No budget periods found" });
    }

    // Process the periods into year ranges
    const yearRanges = budgetPeriods.map(period => {
      const startYear = new Date(period.startDate).getFullYear();
      const endYear = new Date(period.endDate).getFullYear();
      
      // If the period spans multiple years, return "YYYY-YYYY"
      // Otherwise just return "YYYY"
      return startYear !== endYear 
        ? `${startYear}-${endYear}`
        : `${startYear}`;
    });

    // Remove duplicates (in case multiple budgets have same year range)
    const uniqueYearRanges = [...new Set(yearRanges)];

    res.json({ years: uniqueYearRanges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve budget years" });
  }
};

