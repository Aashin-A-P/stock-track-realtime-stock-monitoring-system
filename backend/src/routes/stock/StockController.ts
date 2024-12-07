import { Request, Response } from "express";
import { db } from "../../db";
import { productsTable } from "../../db/schemas/productsSchema";
import { sql, eq, inArray, count, ilike } from "drizzle-orm";
import { invoiceTable } from "../../db/schemas/invoicesSchema";
import { locationTable } from "../../db/schemas/locationsSchema";
import { remarksTable } from "../../db/schemas/remarksSchema";
import { categoriesTable } from "../../db/schemas/categoriesSchema";

interface Product {
  pageNo: string;
  volNo: string;
  serialNo: string;
  productVolPageSerial: string;
  productName: string;
  productDescription: string;
  category: string;
  quantity: number;
  location: string;
  remarks: string;
  price: number;
  productImage?: string;
}

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
      
    req.logMessages =
      ["Stock with id " + newProduct.productId + " added successfully"];
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

    req.logMessages =
      ["Stock with id " +
      productId +
      " deleted. " +
      "\nDeleted Data : " +
      deletedStock];
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

    req.logMessages =
      ["Stock with id " +
      productId +
      " updated. \nold data: " +
      oldStockData +
      " \nnew data: " +
      updatedStock];
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

export const handleInvoiceWithProducts = async (req: Request, res: Response) => {
  await db.transaction(async (transaction) => {
    try {
      const { invoiceDetails, products }: { invoiceDetails: any, products : Product[]} = req.body;

      const {
        fromAddress,
        toAddress,
        actualAmount,
        gstAmount,
        invoiceDate,
        invoiceImage,
      } = invoiceDetails;

      if (!fromAddress || !toAddress || !actualAmount || !gstAmount || !invoiceDate) {
        return res
          .status(400)
          .send("All invoice fields except invoiceImage are required");
      }

      // Add invoice
      const [newInvoice] = await transaction
        .insert(invoiceTable)
        .values({
          fromAddress,
          toAddress,
          actualAmount,
          gstAmount,
          invoiceDate,
          invoiceImage,
        })
        .returning();
      const invoiceId = newInvoice.invoiceId;

      // Batch fetch metadata
      const uniqueLocations = [...new Set(products.map((p) => p.location))];
      const uniqueRemarks = [...new Set(products.map((p) => p.remarks))];
      const uniqueCategories = [...new Set(products.map((p) => p.category))];

      const locations = await transaction
        .select()
        .from(locationTable)
        .where(inArray(locationTable.locationName, uniqueLocations));
      const remarks = await transaction
        .select()
        .from(remarksTable)
        .where(inArray(remarksTable.remark, uniqueRemarks));
      const categories = await transaction
        .select()
        .from(categoriesTable)
        .where(inArray(categoriesTable.categoryName, uniqueCategories));

      // Create mapping for metadata
      const locationMap = Object.fromEntries(locations.map((l) => [l.locationName, l]));
      const remarkMap = Object.fromEntries(remarks.map((r) => [r.remark, r]));
      const categoryMap = Object.fromEntries(categories.map((c) => [c.categoryName, c]));

      // Validate metadata
      const invalidMetadata = products.find(
        (p) =>
          !locationMap[p.location] ||
          !remarkMap[p.remarks] ||
          !categoryMap[p.category]
      );
      if (invalidMetadata) {
        throw new Error("Invalid location, remark, or category");
      }

      // Prepare product data for batch insert
      const productData = products.flatMap((product) =>
        Array.from({ length: product.quantity }, () => ({
          productVolPageSerial: product.productVolPageSerial,
          productName: product.productName,
          productDescription: product.productDescription,
          locationId: locationMap[product.location].locationId,
          remarkId: remarkMap[product.remarks].remarkId,
          gst: invoiceDetails.gstAmount,
          productImage: product.productImage,
          invoiceId,
          categoryId: categoryMap[product.category].categoryId,
        }))
      );

      // Batch insert products
      await transaction.insert(productsTable).values(productData);

      res
        .status(201)
        .json({ message: "Invoice and products added successfully", invoiceId });
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to process the request");
    }
  }, {
    isolationLevel: "read committed",
    accessMode: "read write",
    deferrable: true,
  });
};

export const getPaginatedProducts = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, query, column } = req.query;

    if (!page || !pageSize) {
      return res.status(400).send("Page and pageSize are required");
    }
    if (!column) {
      return res.status(400).send("Column is required");
    }

    // column name -> schema types
    const columnTypes: Record<string, string> = {
      product_id: "integer",
      product_vol_page_serial: "string",
      product_name: "string",
      product_description: "string",
      location_id: "integer",
      location_name: "string",
      remark_id: "integer",
      remark: "string",
      gst: "decimal",
      product_image: "string",
      invoice_id: "integer",
      category_id: "integer",
      category_name: "string",
    };

    const columnType = columnTypes[column as string];

    if (!columnType) {
      return res.status(400).send("Invalid column name");
    }
    
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

    const offset = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

    let whereClause = sql`true`;

    if (query && query !== "") {
      whereClause = columnType === "string"
        ? sql`${sql.identifier(column as string)} ILIKE ${"%" + typedQuery + "%"}`
        : sql`${sql.identifier(column as string)} = ${typedQuery}`;
    }

    const totalRecordsQuery = await db
      .select({ count: count() })
      .from(productsTable)
      .leftJoin(locationTable, eq(productsTable.locationId, locationTable.locationId))
      .leftJoin(remarksTable, eq(productsTable.remarkId, remarksTable.remarkId))
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.categoryId))
      .leftJoin(invoiceTable, eq(productsTable.invoiceId, invoiceTable.invoiceId))
      .where(whereClause);

    const totalRecords = totalRecordsQuery[0].count;

    // Get paginated products with filtering applied
    const products = await db
      .select({
        productId: productsTable.productId,
        productName: productsTable.productName,
        productDescription: productsTable.productDescription,
        productImage: productsTable.productImage,
        locationName: locationTable.locationName,
        remark: remarksTable.remark,
        categoryName: categoriesTable.categoryName,
        fromAddress: invoiceTable.fromAddress,
        toAddress: invoiceTable.toAddress,
        actualAmount: invoiceTable.actualAmount,
        gstAmount: invoiceTable.gstAmount,
        invoiceDate: invoiceTable.invoiceDate,
      })
      .from(productsTable)
      .leftJoin(locationTable, eq(productsTable.locationId, locationTable.locationId))
      .leftJoin(remarksTable, eq(productsTable.remarkId, remarksTable.remarkId))
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.categoryId))
      .leftJoin(invoiceTable, eq(productsTable.invoiceId, invoiceTable.invoiceId))
      .where(whereClause)
      .limit(parseInt(pageSize as string, 10))
      .offset(offset);

    // Return products and pagination data
    res.status(200).json({
      products,
      totalRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch products");
  }
};

