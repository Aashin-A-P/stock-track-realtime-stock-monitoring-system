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

export const getAllYearPieChartAnalysis = async (
  req: Request,
  res: Response
) => {
  try {
    // Fetch total amount allocated for each budget
    const budgetsData = await db
      .select({
        budget_id: budgetsTable.budgetId,
        budget_name: budgetsTable.budgetName,
        total_amount: budgetsTable.amount,
      })
      .from(budgetsTable)
      .groupBy(budgetsTable.budgetId, budgetsTable.budgetName); // Grouping ensures we get one row per budget_id

    if (!budgetsData || budgetsData.length === 0) {
      return res.status(404).json({ error: "No budget data found" });
    }

    // Fetch total amount spent for each budget (across all time)
    const totalSpentData = await db
      .select({
        budget_id: categoryWiseBudgetsTable.budgetId,
        total_spent:
          sql<number>`sum(${categoryWiseBudgetsTable.amount})`.mapWith(Number),
      })
      .from(categoryWiseBudgetsTable)
      .groupBy(categoryWiseBudgetsTable.budgetId);

    // Fetch category-wise spending data for each budget (across all time)
    const categorySpentData = await db
      .select({
        budget_id: categoryWiseBudgetsTable.budgetId,
        category: categoriesTable.categoryName,
        spent: sql<number>`sum(${categoryWiseBudgetsTable.amount})`.mapWith(
          Number
        ),
      })
      .from(categoryWiseBudgetsTable)
      .leftJoin(
        categoriesTable,
        eq(categoryWiseBudgetsTable.categoryId, categoriesTable.categoryId)
      )
      .groupBy(categoryWiseBudgetsTable.budgetId, categoriesTable.categoryName);

    // Fetch monthly spending data for each budget across ALL years
    const allYearsMonthlySpentData = await db
      .select({
        budget_id: categoryWiseBudgetsTable.budgetId,
        month:
          sql<number>`EXTRACT(MONTH FROM ${categoryWiseBudgetsTable.createdAt})`.mapWith(
            Number
          ),
        total_spent_for_month:
          sql<number>`sum(${categoryWiseBudgetsTable.amount})`.mapWith(Number),
      })
      .from(categoryWiseBudgetsTable)
      // No YEAR filter, so it sums for each month across all years
      .groupBy(
        categoryWiseBudgetsTable.budgetId,
        sql`EXTRACT(MONTH FROM ${categoryWiseBudgetsTable.createdAt})`
      );

    // Construct response data
    const responseData = budgetsData.map((budget) => {
      const totalSpent =
        totalSpentData.find((spent) => spent.budget_id === budget.budget_id)
          ?.total_spent || 0;
      const categorySpent = categorySpentData
        .filter((spent) => spent.budget_id === budget.budget_id)
        .map((cs) => ({
          category: cs.category || "Uncategorized",
          spent: cs.spent,
        }));

      // Initialize an array for 12 months of spending
      const monthlySpentArray = Array(12).fill(0);

      // Populate monthlySpentArray for the current budget
      allYearsMonthlySpentData
        .filter((spent) => spent.budget_id === budget.budget_id)
        .forEach((monthlyRecord) => {
          // monthlyRecord.month is 1-indexed (e.g., 1 for Jan, 12 for Dec)
          const monthIndex = monthlyRecord.month - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlySpentArray[monthIndex] +=
              monthlyRecord.total_spent_for_month || 0;
          }
        });

      return {
        budgetName: budget.budget_name,
        totalBudget: Number(budget.total_amount), 
        totalSpent,
        monthlySpent: monthlySpentArray,
        categorySpent,
      };
    });

    res.json(responseData);
  } catch (error) {
    console.error("Error in getAllYearPieChartAnalysis:", error);
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

