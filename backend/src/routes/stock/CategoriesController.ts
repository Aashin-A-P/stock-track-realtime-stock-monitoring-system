import { Request, Response } from "express";
import { db } from "../../db/index";
import { categoriesTable } from "../../db/schemas/categoriesSchema";
import { eq } from "drizzle-orm";

// Add Category
export const addCategory = async (req: Request, res: Response) => {
  try {
    const { categoryName } = req.cleanBody;

    if (!categoryName) {
      return res.status(400).send("Category name is required");
    }

    const [newCategory] = await db
      .insert(categoriesTable)
      .values({ categoryName })
      .returning();

    req.logMessage = `Category ${categoryName} added successfully`;

    res.status(201).json({
      message: "Category added successfully",
      category: newCategory,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(400).send("Category name must be unique");
    } else {
      console.error(error);
      res.status(500).send("Failed to add category");
    }
  }
};

// Show Category by ID
export const showCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.categoryId, Number(id)))
      .limit(1);

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.status(200).json({ category });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve category");
  }
};

// Show All Categories
export const showCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await db.select().from(categoriesTable);

    res.status(200).json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve categories");
  }
};

// Update Category by ID
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { categoryName } = req.cleanBody;

    if (!categoryName) {
      return res.status(400).send("Category name is required");
    }

    const [updatedCategory] = await db
      .update(categoriesTable)
      .set({ categoryName })
      .where(eq(categoriesTable.categoryId, Number(id)))
      .returning();

    if (!updatedCategory) {
      return res.status(404).send("Category not found");
    }

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to update category");
  }
};

// Delete Category by ID
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedCategory = await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.categoryId, Number(id)))
      .returning();

    if (!deletedCategory) {
      return res.status(404).send("Category not found");
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete category");
  }
};
