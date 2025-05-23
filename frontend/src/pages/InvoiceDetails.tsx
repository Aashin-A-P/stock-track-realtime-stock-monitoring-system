// src/pages/InvoiceDetailsPage.tsx (or your preferred path)
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { convertProductData, fetchMetadata } from "../utils";
import InvoiceCard from "../components/InvoiceCard";
import ProductCard from "../components/ProductCard";
import { Product, RangeMapping } from "../types";

const InvoiceDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { id: invoiceIdFromParams } = useParams<{ id: string }>();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const defaultProduct: Product = {
    pageNo: "",
    volNo: "",
    serialNo: "",
    productVolPageSerial: "",
    productName: "",
    productDescription: "",
    transferLetter: "",
    category: "",
    quantity: 0,
    Status: "",
    remark: "",
    price: 0,
    productImage: "",
    locationRangeMappings: [],
    gstInputType: "fixed",
    gstInputValue: 0,
    gstAmount: 0,
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [Statuses, setStatuses] = useState<string[]>([]);
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceId: invoiceIdFromParams ? parseInt(invoiceIdFromParams) : 0,
    invoiceNo: "",
    invoiceDate: "",
    PODate: "",
    totalAmount: 0,
    fromAddress: "",
    toAddress: "",
    invoiceImage: "",
    budgetName: "",
    budgetId: 0,
  });

  const [budgets, setBudgets] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState({
    locationName: "",
    staffIncharge: "",
  });
  const [newStatus, setNewStatus] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const invoiceTotalPrice = Number(invoiceDetails.totalAmount) || 0;
  const productTotalPrice = products.reduce((acc, product) => {
    const unitPriceWithGst =
      (parseFloat(product.price.toString()) || 0) +
      (parseFloat(product.gstAmount.toString()) || 0);
    const quantity = parseInt(product.quantity.toString(), 10) || 0;
    return acc + unitPriceWithGst * quantity;
  }, 0);

  const isEquals = initialLoadComplete
    ? Math.abs(invoiceTotalPrice - productTotalPrice) < 0.01
    : true;

  const handleProductChange = (index: number, field: string, value: any) => {
    const updatedProducts = [...products];
    const productToUpdate = { ...updatedProducts[index] };

    switch (field) {
      case "price":
        productToUpdate.price = parseFloat(value) || 0;
        break;
      case "quantity":
        productToUpdate.quantity = parseInt(value, 10) || 0;
        break;
      case "gstInputType":
        productToUpdate.gstInputType = value as "percentage" | "fixed";
        break;
      case "gstInputValue":
        productToUpdate.gstInputValue = parseFloat(value) || 0;
        break;
      case "locationRangeMappings":
        productToUpdate.locationRangeMappings = value as RangeMapping[];
        break;
      default:
        (productToUpdate as any)[field] = value;
        break;
    }

    if (["price", "gstInputType", "gstInputValue"].includes(field)) {
      if (productToUpdate.gstInputType === "percentage") {
        productToUpdate.gstAmount =
          (productToUpdate.price * productToUpdate.gstInputValue) / 100;
      } else {
        productToUpdate.gstAmount = productToUpdate.gstInputValue;
      }
    }

    if (
      ["pageNo", "volNo", "quantity"].includes(field) &&
      productToUpdate.quantity > 0
    ) {
      productToUpdate.productVolPageSerial = `${
        productToUpdate.volNo || "N/A"
      }-${productToUpdate.pageNo || "N/A"}-[1-${
        productToUpdate.quantity || "N/A"
      }]`;
    } else if (field === "serialNo") {
      productToUpdate.productVolPageSerial =
        // if individual serial no matters more than range for a single quantity item
        `${productToUpdate.volNo || "N/A"}-${productToUpdate.pageNo || "N/A"}-${
          productToUpdate.serialNo || "N/A"
        }`;
    }

    updatedProducts[index] = productToUpdate;
    setProducts(updatedProducts);
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const getFetchedHeaders = () => ({
    // Use a function to get fresh token
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token") || "",
  });

  const addNewLocationForProduct = async (
    productIndex: number,
    mappingIndex: number
  ) => {
    if (!newLocation.locationName.trim() || !newLocation.staffIncharge.trim()) {
      toast.error("New location name and staff incharge cannot be empty.");
      return;
    }
    try {
      const res = await fetch(baseUrl + "/stock/location/add", {
        method: "POST",
        headers: getFetchedHeaders(),
        body: JSON.stringify(newLocation),
      });
      if (!res.ok) throw new Error(`Error adding location: ${res.statusText}`);

      const addedLocationName = newLocation.locationName;
      setLocations((prev) => [...prev, addedLocationName].sort());
      toast.success("Location added successfully!");

      const updatedProducts = [...products];
      const productToUpdate = { ...updatedProducts[productIndex] };
      const mappings = [...(productToUpdate.locationRangeMappings || [])];
      if (mappings[mappingIndex]) {
        mappings[mappingIndex] = {
          ...mappings[mappingIndex],
          location: addedLocationName,
        };
        productToUpdate.locationRangeMappings = mappings;
        updatedProducts[productIndex] = productToUpdate;
        setProducts(updatedProducts);
      }
      setNewLocation({ locationName: "", staffIncharge: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to add location");
    }
  };

  const addNewStatusForProduct = async (productIndex: number) => {
    if (!newStatus.trim()) {
      toast.error("New status description cannot be empty.");
      return;
    }
    try {
      const res = await fetch(baseUrl + "/stock/status/add", {
        method: "POST",
        headers: getFetchedHeaders(),
        body: JSON.stringify({ statusDescription: newStatus }),
      });
      if (!res.ok) throw new Error(`Error adding status: ${res.statusText}`);

      const addedStatus = newStatus;
      setStatuses((prev) => [...prev, addedStatus].sort());
      toast.success("Status added successfully!");

      const updatedProducts = products.map((p, idx) =>
        idx === productIndex ? { ...p, Status: addedStatus } : p
      );
      setProducts(updatedProducts);
      setNewStatus("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add status");
    }
  };

  const addNewCategoryForProduct = async (productIndex: number) => {
    if (!newCategory.trim()) {
      toast.error("New category name cannot be empty.");
      return;
    }
    try {
      const res = await fetch(baseUrl + "/stock/category/add", {
        method: "POST",
        headers: getFetchedHeaders(),
        body: JSON.stringify({ categoryName: newCategory }),
      });
      if (!res.ok) throw new Error(`Error adding category: ${res.statusText}`);

      const addedCategory = newCategory;
      setCategories((prev) => [...prev, addedCategory].sort());
      toast.success("Category added successfully!");

      const updatedProducts = products.map((p, idx) =>
        idx === productIndex ? { ...p, category: addedCategory } : p
      );
      setProducts(updatedProducts);
      setNewCategory("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add category");
    }
  };

  useEffect(() => {
    if (!invoiceIdFromParams) {
      toast.error("Invoice ID is missing.");
      navigate("/invoices"); // Or some other appropriate page
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = getFetchedHeaders();
        // Fetch Invoice Details
        const invoiceRes = await fetch(
          `${baseUrl}/stock/invoice/${invoiceIdFromParams}`,
          { headers }
        );
        if (!invoiceRes.ok)
          throw new Error(
            `Error fetching Invoice: ${invoiceRes.statusText} (${invoiceRes.status})`
          );
        const fetchedInvoiceData = await invoiceRes.json();

        // Fetch associated Budget Name if budgetId is present
        let budgetName = "";
        if (fetchedInvoiceData.invoice.budgetId) {
          const budgetMetaRes = await fetch(
            `${baseUrl}/funds/${fetchedInvoiceData.invoice.budgetId}`,
            { headers }
          );
          if (budgetMetaRes.ok) {
            const budgetMetaData = await budgetMetaRes.json();
            budgetName = budgetMetaData.budget?.budgetName || "";
          } else {
            console.warn(
              `Could not fetch budget details for budgetId: ${fetchedInvoiceData.invoice.budgetId}`
            );
          }
        }

        setInvoiceDetails({
          ...fetchedInvoiceData.invoice,
          invoiceDate:
            fetchedInvoiceData.invoice.invoiceDate?.split("T")[0] || "", // Format date
          PODate: fetchedInvoiceData.invoice.PODate?.split("T")[0] || "", // Format date
          budgetName: budgetName, // Set fetched budget name
        });

        // Fetch Products for this invoice
        const productUrl = `${baseUrl}/stock/details?page=1&pageSize=-1&column=invoice_id&query=${invoiceIdFromParams}`;
        const productRes = await fetch(productUrl, { headers });
        if (!productRes.ok)
          throw new Error(
            `Error fetching Products: ${productRes.statusText} (${productRes.status})`
          );
        const rawProductData = await productRes.json();

        // Convert raw product data to UI product structure
        // This function needs to handle grouping, GST fields, and locationRangeMappings
        const uiProducts = await convertProductData(
          rawProductData.products,
          baseUrl,
          headers
        );
        setProducts(uiProducts);

        // Fetch metadata for dropdowns
        const [budgetListRes, locationListRes, statusListRes, categoryListRes] =
          await Promise.all([
            fetch(baseUrl + "/funds", { headers }),
            fetch(baseUrl + "/stock/locations", { headers }),
            fetch(baseUrl + "/stock/status", { headers }),
            fetch(baseUrl + "/stock/category", { headers }),
          ]);

        if (!budgetListRes.ok) throw new Error("Failed to fetch budgets");
        const budgetListData = await budgetListRes.json();
        setBudgets(
          budgetListData.budgets
            .map((b: { budgetName: string }) => b.budgetName)
            .sort()
        );

        if (!locationListRes.ok) throw new Error("Failed to fetch locations");
        const locationListData = await locationListRes.json();
        setLocations(
          locationListData.locations
            .map((loc: { locationName: string }) => loc.locationName)
            .sort()
        );

        if (!statusListRes.ok) throw new Error("Failed to fetch statuses");
        const statusListData = await statusListRes.json();
        setStatuses(
          statusListData.statuses
            .map((s: { statusDescription: string }) => s.statusDescription)
            .sort()
        );

        if (!categoryListRes.ok) throw new Error("Failed to fetch categories");
        const categoryListData = await categoryListRes.json();
        setCategories(
          categoryListData.categories
            .map((c: { categoryName: string }) => c.categoryName)
            .sort()
        );

        setInitialLoadComplete(true);
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        toast.error(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [invoiceIdFromParams, baseUrl, navigate]); // Removed token from deps as getFetchedHeaders handles it

  const handleInvoiceChange = (field: string, value: string | number) => {
    setInvoiceDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialLoadComplete) {
      toast.warn("Data is still loading. Please wait.");
      return;
    }
    setLoading(true);
    const headers = getFetchedHeaders();

    // Validations (similar to AddProduct)
    if (!invoiceDetails.invoiceNo.trim()) {
      toast.error("Invoice Number is required");
      setLoading(false);
      return;
    }
    if (
      invoiceDetails.PODate &&
      invoiceDetails.invoiceDate &&
      new Date(invoiceDetails.PODate) > new Date(invoiceDetails.invoiceDate)
    ) {
      toast.error("Purchase Order Date must be before or same as Invoice Date");
      setLoading(false);
      return;
    }
    if (!invoiceDetails.budgetName) {
      toast.error("Budget Name is required");
      setLoading(false);
      return;
    }
    if (products.length === 0 && invoiceDetails.totalAmount > 0) {
      // Allow empty products if amount is 0 (e.g. correcting an empty invoice)
      toast.error(
        "Please add at least one product if invoice amount is greater than zero."
      );
      setLoading(false);
      return;
    }
    if (!isEquals) {
      toast.error(
        "Invoice total amount does not match the sum of product total prices. Please check."
      );
      setLoading(false);
      return;
    }
    // Product specific validations (copied and adapted from AddProduct, ensure consistency)
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productLabel = `Product ${i + 1} (${
        product.productName || "Unnamed"
      })`;

      if (!product.productName.trim()) {
        toast.error(`Product name is required for ${productLabel}.`);
        setLoading(false);
        return;
      }
      if (!product.volNo.trim()) {
        toast.error(`Volume Number is required for ${productLabel}.`);
        setLoading(false);
        return;
      }
      if (!product.pageNo.trim()) {
        toast.error(`Page Number is required for ${productLabel}.`);
        setLoading(false);
        return;
      }
      if (!product.category) {
        toast.error(`Category is required for ${productLabel}.`);
        setLoading(false);
        return;
      }
      if (!product.Status) {
        toast.error(`Status is required for ${productLabel}.`);
        setLoading(false);
        return;
      }
      if (product.quantity <= 0) {
        toast.error(`Quantity for ${productLabel} must be greater than 0.`);
        setLoading(false);
        return;
      }
    }

    try {
      const budgetMeta = await fetchMetadata(
        baseUrl,
        "funds/search",
        invoiceDetails.budgetName,
        headers
      );
      if (
        !budgetMeta ||
        !budgetMeta.budgets ||
        budgetMeta.budgets.length === 0
      ) {
        toast.error("Budget not found or invalid budget data.");
        setLoading(false);
        return;
      }
      const budgetId = budgetMeta.budgets[0].budgetId;

      const updatedInvoicePayload = {
        ...invoiceDetails,
        invoiceDate: invoiceDetails.invoiceDate || null, 
        PODate: invoiceDetails.PODate || null,
        totalAmount: invoiceDetails.totalAmount.toString(),
        budgetId: budgetId,
      };
      delete (updatedInvoicePayload as any).budgetName;

      const invoiceUpdateRes = await fetch(
        `${baseUrl}/stock/invoice/update/${invoiceIdFromParams}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(updatedInvoicePayload),
        }
      );
      if (!invoiceUpdateRes.ok) {
        const errorData = await invoiceUpdateRes.text();
        throw new Error(`Failed to update invoice: ${errorData}`);
      }
      toast.success("Invoice details updated successfully!");

      const deleteProductsRes = await fetch(
        `${baseUrl}/stock/products/by-invoice/${invoiceIdFromParams}`,
        {
          method: "DELETE",
          headers,
        }
      );
      if (!deleteProductsRes.ok) {
        if (deleteProductsRes.status !== 404) {
          const errorData = await deleteProductsRes.text();
          console.warn(
            `Could not delete existing products (or no products to delete): ${errorData}`
          );
        }
      } else {
        console.log("Existing products for invoice cleared.");
      }

      for (const product of products) {
        const [statusMeta, categoryMeta] = await Promise.all([
          fetchMetadata(
            baseUrl,
            "stock/status/search",
            product.Status,
            headers
          ),
          fetchMetadata(
            baseUrl,
            "stock/category/search",
            product.category,
            headers
          ),
        ]);
        if (!statusMeta || !statusMeta.statusId)
          throw new Error(`Status metadata error for: ${product.Status}`);
        if (!categoryMeta || !categoryMeta.categoryId)
          throw new Error(`Category metadata error for: ${product.category}`);

        for (const mapping of product.locationRangeMappings!) {
          const locationMeta = await fetchMetadata(
            baseUrl,
            "stock/location/search",
            mapping.location,
            headers
          );
          if (!locationMeta || !locationMeta.locationId)
            throw new Error(`Location metadata error for: ${mapping.location}`);

          const unitNumbers = parseRange(mapping.range);
          const productAddPromises = unitNumbers.map(async (unitNo) => {
            const individualProductVolPageSerial = `${product.volNo}-${product.pageNo}-${unitNo}`;
            const singleProductData = {
              productVolPageSerial: individualProductVolPageSerial,
              productName: product.productName,
              productDescription: product.productDescription,
              locationId: locationMeta.locationId,
              statusId: statusMeta.statusId,
              gstAmount: product.gstAmount,
              productImage: product.productImage,
              invoiceId: parseInt(invoiceIdFromParams!),
              categoryId: categoryMeta.categoryId,
              productPrice: product.price,
              transferLetter: product.transferLetter,
              remarks: product.remark,
              budgetId: budgetId,
            };
            const res = await fetch(`${baseUrl}/stock/add`, {
              // Add to existing invoice
              method: "POST",
              headers,
              body: JSON.stringify(singleProductData),
            });
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(
                `Failed to add product unit ${individualProductVolPageSerial}: ${errorText}`
              );
            }
            return res.json();
          });
          await Promise.all(productAddPromises);
        }
      }
      toast.success("Products updated/re-added successfully!");
      navigate("/invoices");
    } catch (err: any) {
      console.error("Transaction failed overall:", err);
      toast.error(`An error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const parseRange = (rangeStr: string): number[] => {
    const result: number[] = [];
    if (!rangeStr || typeof rangeStr !== "string") return result;
    const parts = rangeStr.split(",").map((part) => part.trim());
    parts.forEach((part) => {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-").map((s) => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) result.push(i);
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num)) result.push(num);
      }
    });
    return result;
  };

  const handleCloseProduct = (index: number) => {
    confirmAlert({
      title: "Confirm to remove",
      message:
        "Are you sure you want to remove this product from the list? This will be saved on submit.",
      buttons: [
        {
          label: "Yes",
          onClick: () =>
            setProducts(products.filter((_, i: number) => i !== index)),
        },
        { label: "No" },
      ],
    });
  };

  if (loading && !initialLoadComplete) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 my-10 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Loading Invoice Details...
          </h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-gray-100 rounded-lg shadow-md my-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Edit Invoice & Products
        </h2>
        <form onSubmit={handleSubmit}>
          <InvoiceCard
            handleInvoiceChange={handleInvoiceChange}
            invoiceDetails={invoiceDetails}
            budgets={budgets}
          />

          {products.map((product, index) => (
            <ProductCard
              key={product.productVolPageSerial || index} // Use a more stable key if available from convertProductData
              index={index}
              product={product}
              categories={categories}
              locations={locations}
              Statuses={Statuses}
              newCategory={newCategory}
              newLocation={newLocation}
              newStatus={newStatus}
              handleProductChange={handleProductChange}
              addNewCategory={addNewCategoryForProduct}
              addNewLocation={addNewLocationForProduct}
              addNewStatus={addNewStatusForProduct}
              setNewCategory={setNewCategory}
              setNewLocation={setNewLocation}
              setNewStatus={setNewStatus}
              handleClose={handleCloseProduct}
            />
          ))}

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
            <button
              type="button"
              onClick={() => setProducts([...products, { ...defaultProduct }])}
              className="bg-gray-700 text-white px-4 py-2 rounded shadow hover:bg-black transition-all duration-200 w-full sm:w-auto"
              title="Add another product to this invoice"
            >
              Add Product to List
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="p-2 rounded-lg shadow-md text-gray-800 font-semibold text-sm bg-white">
                Invoice Total: ₹{Number(invoiceTotalPrice).toFixed(2)}
              </div>
              <div
                className={`p-2 rounded-lg shadow-md text-white font-semibold text-sm ${
                  isEquals ? "bg-green-600" : "bg-red-600"
                }`}
              >
                Products Total: ₹{productTotalPrice.toFixed(2)}{" "}
                {isEquals ? "✅ Matches" : "❌ Mismatch"}
              </div>
            </div>

            <button
              type="submit"
              className={`bg-blue-600 text-white px-6 py-2.5 rounded shadow hover:bg-blue-700 transition-all duration-200 w-full sm:w-auto ${
                loading || !initialLoadComplete
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              title="Save changes to this invoice and its products"
              disabled={loading || !initialLoadComplete || !isEquals}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default InvoiceDetailsPage;
