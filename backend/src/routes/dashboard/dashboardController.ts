import { Request, Response } from "express";
import { db } from "../../db";
import { desc, eq } from "drizzle-orm";
import { budgetsTable } from "../../db/schemas/budgetsSchema";
import { sql } from "drizzle-orm";
import { categoriesTable } from "../../db/schemas/categoriesSchema";
import { categoryWiseBudgetsTable } from "../../db/schemas/categoryWiseBudgetsSchema";
import { invoiceTable } from "../../db/schemas/invoicesSchema";

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
        year: sql<number>`EXTRACT(YEAR FROM ${budgetsTable.startDate})`,
        total_amount: sql<number>`sum(${budgetsTable.amount})`
      })
      .from(budgetsTable)
      .groupBy(budgetsTable.budgetId, budgetsTable.budgetName, sql`EXTRACT(YEAR FROM ${budgetsTable.startDate})`);

    if (!budgetsData || budgetsData.length === 0) {
      return res.status(404).json({ error: 'No budget data found' });
    }

    // Fetch total amount spent for each budget per year
    const totalSpentData = await db
      .select({
        budget_id: invoiceTable.budgetId,
        year: sql<number>`EXTRACT(YEAR FROM ${invoiceTable.invoiceDate})`,
        total_spent: sql<number>`sum(${invoiceTable.totalAmount})`
      })
      .from(invoiceTable)
      .groupBy(
        invoiceTable.budgetId,
        sql`EXTRACT(YEAR FROM ${invoiceTable.invoiceDate})`
      );
    // Fetch category-wise spending data for each budget per year
    const categorySpentData = await db
      .select({
        budget_id: categoryWiseBudgetsTable.budgetId,
        year: sql<number>`EXTRACT(YEAR FROM ${categoryWiseBudgetsTable.createdAt})`,
        category: categoriesTable.categoryName,
        spent: sql<number>`sum(${categoryWiseBudgetsTable.amount})`,
      })
      .from(categoryWiseBudgetsTable)
      .leftJoin(categoriesTable, eq(categoryWiseBudgetsTable.categoryId, categoriesTable.categoryId))
      .leftJoin(budgetsTable, eq(categoryWiseBudgetsTable.budgetId, budgetsTable.budgetId))
      .groupBy(
        categoryWiseBudgetsTable.budgetId, 
        categoriesTable.categoryName, 
        sql`EXTRACT(YEAR FROM ${categoryWiseBudgetsTable.createdAt})`
      );

    // Construct response data
    const responseData = budgetsData.map(budget => {
      const totalSpent = totalSpentData.find(
        spent => spent.budget_id === budget.budget_id
      )?.total_spent || 0;
    
      const categorySpent = categorySpentData.filter(
        spent => spent.budget_id === budget.budget_id && spent.year === budget.year
      );
    
      return {
        budgetName: budget.budget_name,
        year: budget.year,
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
    const years = await db
      .select({
        extractedYear: sql<number>`EXTRACT(YEAR FROM ${budgetsTable.startDate})`
      })
      .from(budgetsTable)
      .groupBy(sql`EXTRACT(YEAR FROM ${budgetsTable.startDate})`)
      .orderBy(desc(sql`EXTRACT(YEAR FROM ${budgetsTable.startDate})`));

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

