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

    req.logMessages = [
      `Category '${newCategory.categoryName}' with ID ${newCategory.categoryId} added successfully.`,
    ];

    res.status(201).json({
      message: "Category added successfully",
      category: newCategory,
    });
  } catch (error: any) {
    const { categoryName } = req.cleanBody; 
    if (error.code === "23505") {
      // Unique violation
      req.logMessages = [
        `Attempt to add category '${categoryName}' failed due to unique constraint violation.`,
      ];
      res.status(400).send("Category name must be unique");
    } else {
      console.error(error);
      req.logMessages = [
        `Failed to add category '${categoryName}'. Error: ${
          error.message || error
        }`,
      ];
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
  const { id } = req.params; 
  const { categoryName } = req.cleanBody;
  try {
    if (!categoryName) {
      return res.status(400).send("Category name is required");
    }

    const [oldCategoryData] = await db
      .select({ oldName: categoriesTable.categoryName })
      .from(categoriesTable)
      .where(eq(categoriesTable.categoryId, Number(id)))
      .limit(1);

    const [updatedCategory] = await db
      .update(categoriesTable)
      .set({ categoryName })
      .where(eq(categoriesTable.categoryId, Number(id)))
      .returning();

    if (!updatedCategory) {
      req.logMessages = [
        `Attempted to update category with ID ${id}, but it was not found.`,
      ];
      return res.status(404).send("Category not found");
    }

    req.logMessages = [
      `Category with ID ${id} updated successfully. Old name: '${
        oldCategoryData?.oldName || "N/A"
      }', New name: '${updatedCategory.categoryName}'.`,
    ];

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "23505") {
      // Unique violation on update
      req.logMessages = [
        `Attempt to update category ID ${id} to name '${categoryName}' failed due to unique constraint violation.`,
      ];
      res.status(400).send("Category name must be unique");
    } else {
      req.logMessages = [
        `Failed to update category with ID ${id} to name '${categoryName}'. Error: ${
          error.message || error
        }`,
      ];
      res.status(500).send("Failed to update category");
    }
  }
};

// Delete Category by ID
export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params; 
  try {
    const [deletedCategory] = await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.categoryId, Number(id)))
      .returning();

    if (!deletedCategory) {
      req.logMessages = [
        `Attempted to delete category with ID ${id}, but it was not found.`,
      ];
      return res.status(404).send("Category not found");
    }

    req.logMessages = [
      `Category '${
        deletedCategory.categoryName
      }' with ID ${id} deleted successfully. Deleted Data: ${JSON.stringify(
        deletedCategory
      )}`,
    ];
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error(error);
    req.logMessages = [
      `Failed to delete category with ID ${id}. Error: ${
        error.message || error
      }`,
    ];
    res.status(500).send("Failed to delete category");
  }
};

export const searchCategory = async (req: Request, res: Response) => {
  try {
    const categoryName = req.query.query as string;

    if (!categoryName) {
      return res.status(400).send("Category name is required");
    }

    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.categoryName, categoryName))
      .limit(1);

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to search category");
  }
};
