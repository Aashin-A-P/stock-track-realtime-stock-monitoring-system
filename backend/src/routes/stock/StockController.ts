import { Request, Response } from "express";
import { db } from "../../db";
import { productsTable } from "../../db/schemas/productsSchema";
import { sql, eq, inArray, count, ilike } from "drizzle-orm";
import { invoiceTable } from "../../db/schemas/invoicesSchema";
import { locationTable } from "../../db/schemas/locationsSchema";
import { statusTable } from "../../db/schemas/statusSchema";
import { categoriesTable } from "../../db/schemas/categoriesSchema";
import { budgetsTable } from "../../db/schemas/budgetsSchema";
import { and, gte, lte } from "drizzle-orm";
import { categoryWiseBudgetsTable } from "../../db/schemas/categoryWiseBudgetsSchema";

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
      budgetId,
    } = req.cleanBody;

    if (
      !productVolPageSerial ||
      !productName ||
      !gstAmount ||
      !categoryId ||
      !invoiceId ||
      !productPrice ||
      !budgetId
    ) {
      return res.status(400).send("All fields are required");
    }

    // Use a transaction
    await db.transaction(async (trx) => {
      const [newProduct] = await trx
        .insert(productsTable)
        .values({
          productVolPageSerial,
          productName,
          productDescription: productDescription || "",
          locationId,
          statusId,
          gstAmount,
          productImage: productImage || null,
          invoiceId,
          categoryId,
          productPrice: productPrice.toString(),
          transferLetter: transferLetter || null,
          remarks: remarks || "",
        })
        .returning();

      await trx.insert(categoryWiseBudgetsTable).values({
        budgetId,
        categoryId,
        amount: (Number(productPrice) + Number(gstAmount)).toString()
      });

      // If execution reaches here, transaction will be committed.
      res
        .status(201)
        .json({ message: "Stock added successfully", product: newProduct });
    });
  } catch (error) {
    console.error("Failed to add Stock:", error);
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return res
        .status(409)
        .send(
          "Failed to add stock: An item with this identifier (e.g., Volume/Page/Serial) may already exist."
        );
    }
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
    // console.log(column);
    if (!columnType) {
      return res.status(400).send("Invalid column name");
    }

    // Convert query to the appropriate type if needed
    let typedQuery: any = query;
    if (columnType === "integer") {
      typedQuery = parseInt(query as string, 10);
      if (isNaN(typedQuery)) {
        return res
          .status(400)
          .send("Query must be a valid integer for this column");
      }
    } else if (columnType === "decimal") {
      typedQuery = parseFloat(query as string);
      if (isNaN(typedQuery)) {
        return res
          .status(400)
          .send("Query must be a valid decimal for this column");
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

    if (deletedStock.length > 0) {
      req.logMessages = [
        `Stock with id ${productId} deleted. Deleted Data: ${JSON.stringify(
          deletedStock
        )}`,
      ];
    } else {
      req.logMessages = [
       `Stock with id ${productId} deletion processed. Data returned: ${JSON.stringify(deletedStock)}`
      ];
    }
    res.status(200).send("Stock deleted successfully");
  } catch (error) {
    console.error(error);
    // For failure of operation (e.g., DB error)
    req.logMessages = [
      `Failed to delete stock with id ${productsTable.productId}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    ];
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

    if (updatedStock.length > 0) {
      req.logMessages = [
        `Stock with id ${productId} updated. Old data: ${JSON.stringify(
          oldStockData
        )}. New data: ${JSON.stringify(updatedStock)}`,
      ];
    } else {
      // Similar to delete, if update affects 0 rows.
      req.logMessages = [
        `Attempted to update stock with id ${productId}, but it was not found or no changes made.`,
      ];
    }
    res
      .status(200)
      .json({ message: "Stock updated successfully", stock: updatedStock });
  } catch (error) {
    console.error(error);
    const { productId } = req.params; // ensure productId is available for log
    req.logMessages = [
      `Failed to update stock with id ${productId || "unknown"}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    ];
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

export const handleInvoiceWithProducts = async (
  req: Request,
  res: Response
) => {
  await db.transaction(
    async (transaction) => {
      try {
        const {
          invoiceDetails,
          products,
        }: { invoiceDetails: any; products: Product[] } = req.body;

        const {
          fromAddress,
          toAddress,
          totalAmount,
          PODate,
          invoiceDate,
          invoiceImage,
        } = invoiceDetails;

        if (
          !fromAddress ||
          !toAddress ||
          !totalAmount ||
          !PODate ||
          !invoiceDate
        ) {
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
        const uniqueStatus = [
          ...new Set(products.map((p) => p.statusDescription)),
        ];
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
        const locationMap = Object.fromEntries(
          locations.map((l) => [l.locationName, l])
        );
        const statusMap = Object.fromEntries(
          status.map((s) => [s.statusDescription, s])
        );
        const categoryMap = Object.fromEntries(
          categories.map((c) => [c.categoryName, c])
        );

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
            gst: invoiceDetails.gstAmount, // This was 'gst', assuming it maps to gstAmount in productsTable
            productImage: product.productImage,
            transferLetter: product.transferLetter,
            invoiceId,
            categoryId: categoryMap[product.category].categoryId,
            productPrice: product.productPrice.toString(),
            remarks: product.remarks, // Added remarks from Product interface
          }))
        );

        // Batch insert products
        await transaction.insert(productsTable).values(productData);

        res
          .status(201)
          .json({
            message: "Invoice and products added successfully",
            invoiceId,
          });
      } catch (error) {
        console.error(error);
        res.status(500).send("Failed to process the request");
      }
    },
    {
      isolationLevel: "read committed",
      accessMode: "read write",
      deferrable: true,
    }
  );
};

export const getPaginatedProducts = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, query, column } = req.query;

    // Validate required query parameters
    if (!page || !pageSize) {
      return res.status(400).send("Page and pageSize are required");
    }

    if (!column) {
      return res.status(400).send("Column is required");
    }

    // Mapping of column names to their expected data types
    const columnTypes: Record<string, string> = {
      product_vol_page_serial: "string",
      product_name: "string",
      product_description: "string",
      category_name: "string",
      location_name: "string",
      status_description: "string",
      invoice_date: "string",
      invoice_no: "string",
      po_date: "string",
      from_address: "string",
      to_address: "string",
      remarks: "string",
      invoice_id:"number",
    };

    const columnType = columnTypes[column as string]; // columnType is declared but not used after this.
    // The whereClause logic below does not use columnType.
    // console.log(column,columnType);
    if (!columnType) {
      return res.status(400).send("Invalid column name");
    }

    // Calculate the offset for pagination
    const offset =
      (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

    // Map search keys to fully qualified table columns.
    const columnMapping: Record<string, any> = {
      product_vol_page_serial: productsTable.productVolPageSerial,
      product_name: productsTable.productName,
      product_description: productsTable.productDescription,
      category_name: categoriesTable.categoryName,
      location_name: locationTable.locationName,
      status_description: statusTable.statusDescription,
      invoice_date: invoiceTable.invoiceDate,
      invoice_no: invoiceTable.invoiceNo,
      po_date: invoiceTable.PODate,
      from_address: invoiceTable.fromAddress,
      to_address: invoiceTable.toAddress,
      remarks: productsTable.remarks,
      invoice_id: productsTable.invoiceId,
    };

    const columnRef = columnMapping[column as string];
    if (!columnRef) {
      return res.status(400).send("Invalid column name");
    }

    // Build the WHERE clause for filtering
    let whereClause = sql`true`;
if (query && query !== "") {
  if (columnType === "string") {
    whereClause = sql`${columnRef} ILIKE ${"%" + query + "%"}`;
  } else if (columnType === "number") {
    whereClause = sql`${columnRef} = ${query}`;
  } else {
    return res.status(400).send("Unsupported column type for filtering");
  }
}


    // Get the total number of records matching the filter
    const totalRecordsQuery = await db
      .select({ count: count() })
      .from(productsTable)
      .leftJoin(
        locationTable,
        eq(productsTable.locationId, locationTable.locationId)
      )
      .leftJoin(statusTable, eq(productsTable.statusId, statusTable.statusId))
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.categoryId)
      )
      .leftJoin(
        invoiceTable,
        eq(productsTable.invoiceId, invoiceTable.invoiceId)
      )
      .where(whereClause);

    const totalRecords = totalRecordsQuery[0].count;

    // Retrieve the paginated products with the necessary joins and filtering applied
    const products = await db
      .select({
        productId: productsTable.productId,
        productVolPageSerial: productsTable.productVolPageSerial,
        productName: productsTable.productName,
        productDescription: productsTable.productDescription,
        productImage: productsTable.productImage,
        locationName: locationTable.locationName,
        statusDescription: statusTable.statusDescription,
        categoryName: categoriesTable.categoryName,
        fromAddress: invoiceTable.fromAddress,
        toAddress: invoiceTable.toAddress,
        actualAmount: productsTable.productPrice,
        gstAmount: productsTable.gstAmount,
        PODate: invoiceTable.PODate,
        invoiceDate: invoiceTable.invoiceDate,
        invoiceNo: invoiceTable.invoiceNo,
        remarks: productsTable.remarks,
      })
      .from(productsTable)
      .leftJoin(
        locationTable,
        eq(productsTable.locationId, locationTable.locationId)
      )
      .leftJoin(statusTable, eq(productsTable.statusId, statusTable.statusId))
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.categoryId)
      )
      .leftJoin(
        invoiceTable,
        eq(productsTable.invoiceId, invoiceTable.invoiceId)
      )
      .where(whereClause)
      // Corrected logic would be: pageSize === '-1' ? totalRecords : parseInt(pageSize as string, 10)
      .limit(pageSize == "-1" ? parseInt(pageSize as string, 10) : totalRecords)
      .offset(offset);

    // Return the products and the total record count as JSON
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

    if (!productId) {
      return res.status(400).send("Product ID is required");
    }

    // Perform the query with necessary fields
    const product = await db
      .select()
      .from(productsTable)
      .leftJoin(
        locationTable,
        eq(productsTable.locationId, locationTable.locationId)
      )
      .leftJoin(statusTable, eq(productsTable.statusId, statusTable.statusId))
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.categoryId)
      )
      .leftJoin(
        invoiceTable,
        eq(productsTable.invoiceId, invoiceTable.invoiceId)
      )
      .leftJoin(budgetsTable, eq(invoiceTable.budgetId, budgetsTable.budgetId))
      .where(sql`${productsTable.productId} = ${Number(productId)}`);

    if (!product.length) {
      return res.status(404).send("Product not found");
    }

    // Separate the product data and invoice data into two objects
    const productData = {
      productId: product[0].ProductsTable.productId,
      productVolPageSerial: product[0].ProductsTable.productVolPageSerial,
      productName: product[0].ProductsTable.productName,
      productDescription: product[0].ProductsTable.productDescription,
      productImage: product[0].ProductsTable.productImage,
      transferLetter: product[0].ProductsTable.transferLetter,
      productPrice: product[0].ProductsTable.productPrice,
      gstAmount: product[0].ProductsTable.gstAmount,
      locationName: product[0].LocationTable?.locationName,
      categoryName: product[0].CategoriesTable?.categoryName,
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
      budgetName: product[0].BudgetsTable?.budgetName,
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

// Define a type for the raw data fetched from the database
interface RawReportDataItem {
  budgetName: string | null;
  categoryName: string | null;
  invoiceNo: string | null;
  fromAddress: string | null;
  toAddress: string | null;
  purchaseOrderDate: string | null; // Assuming string date from DB
  invoiceDate: string | null; // Assuming string date from DB
  stockName: string | null;
  stockDescription: string | null;
  location: string | null;
  staff: string | null;
  stockId: string | null;
  productImage: string | null;
  transferLetter: string | null;
  basePrice: string | null; // Comes as string from DB usually
  gstAmount: string | null; // Comes as string from DB usually
  price: string; // This will be (basePrice + gstAmount) per item, as string
  status: string | null;
  remarks: string | null;
  quantity: string; // This will be '1' per item, as string
}

// Define a type for the processed/grouped report data
interface ProcessedReportDataItem {
  budgetName: string | null;
  categoryName: string | null;
  invoiceNo: string | null;
  fromAddress: string | null;
  toAddress: string | null;
  purchaseOrderDate: string | null;
  invoiceDate: string | null;
  stockName: string | null;
  stockDescription: string | null;
  locations: string[];
  staffs: string[];
  usage: string[];
  stockId: string | null; // Will take one from the group
  productImage: string | null;
  transferLetter: string | null;
  basePrice: string | null;
  gstAmount: string | null;
  price: string; // Sum of all item prices in the group
  status: string | null;
  remarks: string | null;
  quantity: string; // Sum of all item quantities in the group
}

export const getReportData = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let whereCondition;

    if (startDate && endDate) {
      whereCondition = and(
        gte(budgetsTable.startDate, startDate as string),
        lte(budgetsTable.endDate, endDate as string)
      );
    }

    const rawReportData: RawReportDataItem[] = await db
      .select({
        budgetName: budgetsTable.budgetName,
        categoryName: categoriesTable.categoryName,
        invoiceNo: invoiceTable.invoiceNo,
        fromAddress: invoiceTable.fromAddress,
        toAddress: invoiceTable.toAddress,
        purchaseOrderDate: invoiceTable.PODate,
        invoiceDate: invoiceTable.invoiceDate,
        stockName: productsTable.productName,
        stockDescription: productsTable.productDescription,
        location: locationTable.locationName,
        staff: locationTable.staffIncharge,
        stockId: (productsTable.productVolPageSerial),
        productImage: productsTable.productImage,
        transferLetter: productsTable.transferLetter,
        basePrice: productsTable.productPrice,
        gstAmount: productsTable.gstAmount,
        price: sql<string>`(${productsTable.productPrice} + ${productsTable.gstAmount})`,
        status: statusTable.statusDescription,
        remarks: productsTable.remarks,
        quantity: sql<string>`1`,
      })
      .from(productsTable)
      .leftJoin(
        locationTable,
        eq(productsTable.locationId, locationTable.locationId)
      )
      .leftJoin(statusTable, eq(productsTable.statusId, statusTable.statusId))
      .leftJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.categoryId)
      )
      .leftJoin(
        invoiceTable,
        eq(productsTable.invoiceId, invoiceTable.invoiceId)
      )
      .leftJoin(budgetsTable, eq(invoiceTable.budgetId, budgetsTable.budgetId))
      .where(whereCondition)
      .groupBy(
        budgetsTable.budgetName,
        categoriesTable.categoryName,
        invoiceTable.invoiceNo,
        invoiceTable.fromAddress,
        invoiceTable.toAddress,
        invoiceTable.PODate,
        invoiceTable.invoiceDate,
        productsTable.productName,
        productsTable.productDescription,
        locationTable.locationName,
        locationTable.staffIncharge,
        productsTable.productImage,
        productsTable.transferLetter,
        statusTable.statusDescription,
        productsTable.remarks,
        productsTable.productVolPageSerial,
        productsTable.productPrice,
        productsTable.gstAmount
      );

    // Merge all items that share same grouping key (excluding stockId, location, staff)
    const groupedData: Record<string, any> = {};

    rawReportData.forEach((item) => {
      const groupKey = [
        item.budgetName,
        item.categoryName,
        item.invoiceNo,
        item.fromAddress,
        item.toAddress,
        item.purchaseOrderDate,
        item.invoiceDate,
        item.stockName,
        item.stockDescription,
        item.productImage,
        item.transferLetter,
        item.basePrice,
        item.gstAmount,
        item.status,
        item.remarks,
      ]
        .map((val) => (val === null ? "NULL" : val))
        .join("||");

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          budgetName: item.budgetName,
          categoryName: item.categoryName,
          invoiceNo: item.invoiceNo,
          fromAddress: item.fromAddress,
          toAddress: item.toAddress,
          purchaseOrderDate: item.purchaseOrderDate,
          invoiceDate: item.invoiceDate,
          stockName: item.stockName,
          stockDescription: item.stockDescription,
          productImage: item.productImage,
          transferLetter: item.transferLetter,
          basePrice: item.basePrice,
          gstAmount: item.gstAmount,
          status: item.status,
          remarks: item.remarks,
          locations: new Set<string>(),
          staffs: new Set<string>(),
          usageMap: new Map<string, number>(),
          stockIds: new Set<string>(),
          price: 0,
          quantity: 0,
        };
      }

      const group = groupedData[groupKey];

      if (item.location) group.locations.add(item.location);
      if (item.staff) group.staffs.add(item.staff);
      if (item.stockId) group.stockIds.add(item.stockId);

      const usageKey = `${item.location || "N/A"} - ${item.staff || "N/A"}`;
      group.usageMap.set(usageKey, (group.usageMap.get(usageKey) || 0) + 1);

      group.price += parseFloat(item.price || "0");
      group.quantity += parseInt(item.quantity || "0", 10);
    });

    const finalReportData = Object.values(groupedData).map((group) => {
      return {
        budgetName: group.budgetName,
        categoryName: group.categoryName,
        invoiceNo: group.invoiceNo,
        fromAddress: group.fromAddress,
        toAddress: group.toAddress,
        purchaseOrderDate: group.purchaseOrderDate,
        invoiceDate: group.invoiceDate,
        stockName: group.stockName,
        stockDescription: group.stockDescription,
        productImage: group.productImage,
        transferLetter: group.transferLetter,
        basePrice: group.basePrice,
        gstAmount: group.gstAmount,
        status: group.status,
        remarks: group.remarks,
        locations: Array.from(group.locations),
        staffs: Array.from(group.staffs),
        usage: Array.from(group.usageMap.entries() as [string, number][])
        .map(([key, count]) => `${key} - count: ${count}`),
        stockId: Array.from(group.stockIds)[0] || null,
        price: group.price.toString(),
        quantity: group.quantity.toString(),
      };
    });

    res.status(200).json(finalReportData);
  } catch (error) {
    console.error("Error in getReportData:", error);
    res.status(500).send("Failed to fetch report data");
  }
};