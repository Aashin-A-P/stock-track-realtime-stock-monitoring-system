import { Request, Response } from "express";
import { db } from "../../db";
import { productsTable } from "../../db/schemas/productsSchema";
import { sql, eq, inArray, count, ilike } from "drizzle-orm";
import { invoiceTable } from "../../db/schemas/invoicesSchema";
import { locationTable } from "../../db/schemas/locationsSchema";
import { statusTable } from "../../db/schemas/statusSchema";
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
  statusDescription: string;
  price: number;
  productImage?: string;
  productPrice: number;
  transferLetter?: string;
  remarks: string;
}

export const addStock = async (req: Request, res: Response) => {
  try {
    const {
      productVolPageSerial,
      productName,
      productDescription,
      locationId,
      statusId,
      gstAmount,
      productImage,
      invoiceId,
      categoryId,
      productPrice,
      transferLetter,
      remarks,
    } = req.cleanBody;

    if (
      !productVolPageSerial ||
      !productName ||
      !gstAmount ||
      !categoryId ||
      !invoiceId ||
      !productPrice 
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
        statusId,
        gstAmount,
        productImage,
        invoiceId,
        categoryId,
        productPrice,
        transferLetter,
        remarks,
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
      status_id: "integer",
      GST_amount: "decimal",
      product_image: "string",
      transfer_letter: "string",
      invoice_id: "integer",
      category_id: "integer",
      product_price: "integer",
      remarks: "string",
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
      productVolPageSerial,
      productName,
      productDescription,
      locationId,
      statusId,
      gstAmount,
      productImage,
      transferLetter,
      invoiceId,
      categoryId,
      productPrice,
      remarks,
      
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
        productVolPageSerial,
        productName,
        productDescription,
        locationId,
        statusId,
        gstAmount,
        productImage,
        invoiceId,
        categoryId,
        transferLetter,
        productPrice,
        remarks,
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
        totalAmount,
        PODate,
        invoiceDate,
        invoiceImage,
      } = invoiceDetails;

      if (!fromAddress || !toAddress || !totalAmount || !PODate || !invoiceDate) {
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
          totalAmount,
          PODate,
          invoiceDate,
          invoiceImage,
        })
        .returning();
      const invoiceId = newInvoice.invoiceId;

      // Batch fetch metadata
      const uniqueLocations = [...new Set(products.map((p) => p.location))];
      const uniqueStatus = [...new Set(products.map((p) => p.statusDescription))];
      const uniqueCategories = [...new Set(products.map((p) => p.category))];

      const locations = await transaction
        .select()
        .from(locationTable)
        .where(inArray(locationTable.locationName, uniqueLocations));
      const status = await transaction
        .select()
        .from(statusTable)
        .where(inArray(statusTable.statusDescription, uniqueStatus));
      const categories = await transaction
        .select()
        .from(categoriesTable)
        .where(inArray(categoriesTable.categoryName, uniqueCategories));

      // Create mapping for metadata
      const locationMap = Object.fromEntries(locations.map((l) => [l.locationName, l]));
      const statusMap = Object.fromEntries(status.map((s) => [s.statusDescription, s]));
      const categoryMap = Object.fromEntries(categories.map((c) => [c.categoryName, c]));

      // Validate metadata
      const invalidMetadata = products.find(
        (p) =>
          !locationMap[p.location] ||
          !statusMap[p.statusDescription] ||
          !categoryMap[p.category]
      );
      if (invalidMetadata) {
        throw new Error("Invalid location, status, or category");
      }

      // Prepare product data for batch insert
      const productData = products.flatMap((product) =>
        Array.from({ length: product.quantity }, () => ({
          productVolPageSerial: product.productVolPageSerial,
          productName: product.productName,
          productDescription: product.productDescription,
          locationId: locationMap[product.location].locationId,
          statusId: statusMap[product.statusDescription].statusId,
          gst: invoiceDetails.gstAmount,
          productImage: product.productImage,
          transferLetter: product.transferLetter,
          invoiceId,
          categoryId: categoryMap[product.category].categoryId,
          productPrice: product.productPrice, 
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
      status_id: "integer",
      status_description: "string",
      gst: "decimal",
      product_image: "string",
      invoice_id: "integer",
      invoice_no:"string" ,
      category_id: "integer",
      category_name: "string",
      remarks: "string",
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
      .leftJoin(statusTable, eq(productsTable.statusId, statusTable.statusId))
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
        statusDescription: statusTable.statusDescription,
        categoryName: categoriesTable.categoryName,
        fromAddress: invoiceTable.fromAddress,
        toAddress: invoiceTable.toAddress,
        TotalAmount: invoiceTable.totalAmount,
        gstAmount: productsTable.gstAmount,
        PODate:invoiceTable.PODate,
        invoiceDate: invoiceTable.invoiceDate,
        invoiceNo: invoiceTable.invoiceNo,
        remarks: productsTable.remarks,
      })
      .from(productsTable)
      .leftJoin(locationTable, eq(productsTable.locationId, locationTable.locationId))
      .leftJoin(statusTable, eq(productsTable.statusId, statusTable.statusId))
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
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    console.log("productId", productId);

    if (!productId) {
      return res.status(400).send("Product ID is required");
    }

    // Perform the query with necessary fields
    const product = await db
      .select()
      .from(productsTable)
      .leftJoin(locationTable, eq(productsTable.locationId, locationTable.locationId))
      .leftJoin(statusTable, eq(productsTable.statusId, statusTable.statusId))
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.categoryId))
      .leftJoin(invoiceTable, eq(productsTable.invoiceId, invoiceTable.invoiceId))
      .where(sql`${productsTable.productId} = ${Number(productId)}`);

    if (!product.length) {
      return res.status(404).send("Product not found");
    }

    console.log("Product", JSON.stringify(product, null, 2));
    

    // Separate the product data and invoice data into two objects
    const productData = {
      productId: product[0].ProductsTable.productId,
      productVolPageSerial: product[0].ProductsTable.productVolPageSerial,
      productName: product[0].ProductsTable.productName,
      productDescription: product[0].ProductsTable.productDescription,
      productImage: product[0].ProductsTable.productImage,
      transferLetter:product[0].ProductsTable.transferLetter,
      productPrice: product[0].ProductsTable.productPrice,  // Include productPrice
      gstAmount: product[0].ProductsTable.gstAmount,  // Include GST Amount
      locationName: product[0].LocationTable?.locationName,  // Location Name
      categoryName: product[0].CategoriesTable?.categoryName,  // Category Name
      status: product[0].StatusTable?.statusDescription,  
      remarks: product[0].ProductsTable.remarks,
    };

    const invoiceData = {
      invoiceId: product[0].InvoiceTable?.invoiceId,
      invoiceNo: product[0].InvoiceTable?.invoiceNo,
      fromAddress: product[0].InvoiceTable?.fromAddress,
      toAddress: product[0].InvoiceTable?.toAddress,
      totalAmount: product[0].InvoiceTable?.totalAmount,
      PODate: product[0].InvoiceTable?.PODate,
      invoiceDate: product[0].InvoiceTable?.invoiceDate,
      invoiceImage: product[0].InvoiceTable?.invoiceImage,
    };

    // Return both the product and invoice data
    res.status(200).json({
      product: productData,
      invoice: invoiceData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch product");
  }
};
