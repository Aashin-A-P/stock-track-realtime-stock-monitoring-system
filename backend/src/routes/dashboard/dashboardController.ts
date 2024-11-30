import { Request, Response } from "express";
import { db } from "../../db";
import { desc, eq } from "drizzle-orm";
import { budgetsTable } from "../../db/schemas/budgetsSchema";
import { sql } from "drizzle-orm";
import { categoriesTable } from "../../db/schemas/categoriesSchema";
import { categoryWiseBudgetsTable } from "../../db/schemas/categoryWiseBudgetsSchema";

export const getPieChartAnalysis = async (req: Request, res: Response) => {
    const { year }: { year?: string } = req.query;
    const monthlySpentResponseArray = [0,0,0,0,0,0,0,0,0,0,0,0];
  
    if (!year) {
      return res.status(400).json({ error: 'Year is required' });
    }
  
    try {
      // Fetch total amount allocated for the year
      const [totalBudgetData] = await db
        .select({
          budget_id: budgetsTable.budgetId,
          amount: budgetsTable.amount
        })
        .from(budgetsTable)
        .where(sql`EXTRACT(YEAR FROM ${budgetsTable.startDate}) = ${parseInt(year as string, 10)}`)
        .limit(1);

      if (!totalBudgetData) {
        return res.status(404).json({ error: 'No budget data found for the year' });
      }

      // Fetch total amount spent for the year
      const totalSpentData = await db.select({
        total_spent: sql<number>`sum(${categoryWiseBudgetsTable.amount})`
      })
      .from(categoryWiseBudgetsTable)
      .where(eq(categoryWiseBudgetsTable.budgetId, totalBudgetData.budget_id));

      if (!totalSpentData) {
        return res.status(404).json({ error: 'No spent data found for the year' });
      }

      // Fetch total amount spent for the year
      const monthlySpentData = await db.select({
        month: sql`EXTRACT(MONTH FROM ${categoryWiseBudgetsTable.createdAt})`,
        total_spent: sql<number>`sum(${categoryWiseBudgetsTable.amount})`
      })
      .from(categoryWiseBudgetsTable)
      .where(eq(categoryWiseBudgetsTable.budgetId, totalBudgetData.budget_id))
      .groupBy(sql`EXTRACT(MONTH FROM ${categoryWiseBudgetsTable.createdAt})`);

      if (!totalSpentData) {
        return res.status(404).json({ error: 'No spent data found for the year' });
      }
      monthlySpentData.forEach((data) => {
        monthlySpentResponseArray[Number(data.month)] = data.total_spent;
      });

      // Fetch category-wise amount spent for the year
      const categorySpentData = await db
        .select({
          category: categoriesTable.categoryName,
          spent: sql<number>`sum(${categoryWiseBudgetsTable.amount})`,
        })
        .from(categoryWiseBudgetsTable)
        .leftJoin(categoriesTable, eq(categoryWiseBudgetsTable.categoryId, categoriesTable.categoryId))
        .leftJoin(budgetsTable, eq(categoryWiseBudgetsTable.budgetId, budgetsTable.budgetId))
        .where(sql`EXTRACT(YEAR FROM ${budgetsTable.startDate}) = ${parseInt(year as string, 10)}`)
        .groupBy(categoriesTable.categoryName);
  
      // Construct response data
      const responseData = {
        totalBudget: totalBudgetData.amount,
        totalSpent: totalSpentData[0].total_spent,
        categorySpent: categorySpentData,
        monthlySpent: monthlySpentResponseArray,
      };
  
      res.json(responseData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  }

  export const getAllYearPieChartAnalysis = async (req: Request, res: Response) => {
  
    try {
      // Fetch total amount allocated for the year
      const [totalBudgetData] = await db
        .select({
          total_amount: sql<number>`sum(${budgetsTable.amount})`
        })
        .from(budgetsTable);

      if (!totalBudgetData) {
        return res.status(404).json({ error: 'No budget data found for the year' });
      }

      // Fetch total amount spent for the year
      const totalSpentData = await db.select({
        total_spent: sql<number>`sum(${categoryWiseBudgetsTable.amount})`
      })
      .from(categoryWiseBudgetsTable);

      if (!totalSpentData) {
        return res.status(404).json({ error: 'No spent data found for the year' });
      }

      // Fetch category-wise amount spent for the year
      const categorySpentData = await db
        .select({
          category: categoriesTable.categoryName,
          spent: sql<number>`sum(${categoryWiseBudgetsTable.amount})`,
        })
        .from(categoryWiseBudgetsTable)
        .leftJoin(categoriesTable, eq(categoryWiseBudgetsTable.categoryId, categoriesTable.categoryId))
        .leftJoin(budgetsTable, eq(categoryWiseBudgetsTable.budgetId, budgetsTable.budgetId))
        .groupBy(categoriesTable.categoryName);
  
      // Construct response data
      const responseData = {
        totalBudget: totalBudgetData.total_amount,
        totalSpent: totalSpentData[0].total_spent,
        categorySpent: categorySpentData,
      };
  
      res.json(responseData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  }


  export const getAllYears = async (req: Request, res: Response) => {
    try {
      const years = await db
        .select({
          extractedYear: sql<number>`EXTRACT(YEAR FROM ${budgetsTable.startDate})`
        })
        .from(budgetsTable)
        .groupBy(sql`EXTRACT(YEAR FROM ${budgetsTable.startDate})`)
        .orderBy(sql`EXTRACT(YEAR FROM ${budgetsTable.startDate})`);
  
      if (!years || years.length === 0) {
        return res.status(404).json({ error: "No years found in the budgets table" });
      }
  
      // Map the result to an array of years
      const yearList = years.map((row) => row.extractedYear);
  
      res.json({ years: yearList });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  };

