import { Request, Response } from "express";
import { db } from "../../db";
import { productsTable } from "../../db/schemas/productsSchema";
import { sql } from "drizzle-orm";

export const addStock = async (req: Request, res: Response) => {
  try {
    const {
      productVolPageSerial,
      productName,
      productDescription,
      locationId,
      remarkId,
      gst,
      productImage,
      invoiceId,
      categoryId,
    } = req.cleanBody;

    if (
      !productVolPageSerial ||
      !productName ||
      !gst ||
      !categoryId ||
      !invoiceId
    ) {
      return res.status(400).send("All fields are required");
    }

    const [newProduct] = await db
      .insert(productsTable)
      .values({
        productVolPageSerial,
        productName,
        productDescription,
        locationId,
        remarkId,
        gst,
        productImage,
        invoiceId,
        categoryId,
      })
      .returning();
      
    req.logMessage =
      "Stock with id " + newProduct.productId + " added successfully";
    res
      .status(201)
      .json({ message: "Stock added successfully", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add Stock");
  }
};

export const searchStock = async (req: Request, res: Response) => {
  try {
    const { query, column } = req.query;

    // Validate query and column
    if (!query || !column) {
      return res.status(400).send("Query and column are required");
    }

    // Map column names to their types from the schema
    const columnTypes: Record<string, string> = {
      product_id: "integer",
      product_vol_page_serial: "string",
      product_name: "string",
      product_description: "string",
      location_id: "integer",
      remark_id: "integer",
      gst: "decimal",
      product_image: "string",
      invoice_id: "integer",
      category_id: "integer",
    };

    const columnType = columnTypes[column as string];

    if (!columnType) {
      return res.status(400).send("Invalid column name");
    }

    // Convert query to the appropriate type if needed
    let typedQuery: any = query;
    if (columnType === "integer") {
      typedQuery = parseInt(query as string, 10);
      if (isNaN(typedQuery)) {
        return res.status(400).send("Query must be a valid integer for this column");
      }
    } else if (columnType === "decimal") {
      typedQuery = parseFloat(query as string);
      if (isNaN(typedQuery)) {
        return res.status(400).send("Query must be a valid decimal for this column");
      }
    }

    // Dynamically build and execute the SQL query
    const stocks = await db
      .select()
      .from(productsTable)
      .where(
        columnType === "string"
          ? sql`${sql.identifier(column as string)} ILIKE ${"%" + query + "%"}`
          : sql`${sql.identifier(column as string)} = ${typedQuery}`
      );

    res.status(200).json(stocks);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to search stock");
  }
};

export const deleteStock = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).send("Product ID is required");
    }

    const deletedStock = await db
      .delete(productsTable)
      .where(sql`${productsTable.productId} = ${Number(productId)}`)
      .returning();

    req.logMessage =
      "Stock with id " +
      productId +
      " deleted. " +
      "\nDeleted Data : " +
      deletedStock;
    res.status(200).send("Stock deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete stock");
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const {
      productName,
      productDescription,
      locationId,
      remarkId,
      gst,
      productImage,
      invoiceId,
      categoryId,
    } = req.cleanBody;

    if (!productId) {
      return res.status(400).send("Product ID is required");
    }

    const oldStockData = await db
      .select()
      .from(productsTable)
      .where(sql`${productsTable.productId} = ${Number(productId)}`);

    const updatedStock = await db
      .update(productsTable)
      .set({
        productName,
        productDescription,
        locationId,
        remarkId,
        gst,
        productImage,
        invoiceId,
        categoryId,
      })
      .where(sql`${productsTable.productId} = ${Number(productId)}`)
      .returning();

    req.logMessage =
      "Stock with id " +
      productId +
      " updated. \nold data: " +
      oldStockData +
      " \nnew data: " +
      updatedStock;
    res
      .status(200)
      .json({ message: "Stock updated successfully", stock: updatedStock });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to update stock");
  }
};

export const getAllStock = async (_req: Request, res: Response) => {
  try {
    const stocks = await db.select().from(productsTable);

    res.status(200).json({ stocks });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to retrieve stocks");
  }
};
