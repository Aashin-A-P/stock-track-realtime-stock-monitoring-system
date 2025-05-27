import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchMetadata } from "../utils";
import InvoiceCard from "../components/InvoiceCard";
import ProductCard from "../components/ProductCard";
import { Product, RangeMapping, FetchErrorResponse } from "../types";

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { token: authTokenFromContext, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    // local storage check for auth token
    if (!authTokenFromContext && !localStorage.getItem("token") && !isAuthLoading) {
      toast.info("Session expired or invalid. Redirecting to login.");
      navigate("/login");
      return;
    }
  }, [authTokenFromContext]);

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
    invoiceNo: "",
    invoiceDate: "",
    PODate: "",
    totalAmount: 0,
    fromAddress: "",
    toAddress: "",
    invoiceImage: "",
    budgetName: "",
  });

  const [budgets, setBudgets] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState({
    locationName: "",
    staffIncharge: "",
  });
  const [newStatus, setNewStatus] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const invoiceTotalPrice = invoiceDetails.totalAmount;
  const productTotalPrice = products.reduce((acc, product) => {
    const unitPriceWithGst =
      (parseFloat(product.price.toString()) || 0) +
      (parseFloat(product.gstAmount.toString()) || 0);
    const quantity = parseInt(product.quantity.toString(), 10) || 0;
    return acc + unitPriceWithGst * quantity;
  }, 0);
  const isEquals = Math.abs(invoiceTotalPrice - productTotalPrice) < 0.01;

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const apiHeadersForFetchMetadata = useMemo(() => {
    const headers: Record<string, string> = {};
    if (authTokenFromContext) {
      headers["Authorization"] = `${authTokenFromContext}`;
    }
    return headers;
  }, [authTokenFromContext]);

  // Headers for direct fetch calls (POSTs)
  const getDirectFetchHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authTokenFromContext) {
      headers["Authorization"] = `${authTokenFromContext}`;
    }
    return headers;
  }, [authTokenFromContext]);

  const handleApiError = (
    error: any,
    contextMessage: string = "An operation failed"
  ) => {
    console.error(contextMessage, error);
    if (error && typeof error === "object" && "message" in error) {
      const err = error as FetchErrorResponse;
      toast.error(err.message || contextMessage);
      if (err.isAuthError || err.status === 401) {
        toast.info("Session expired or invalid. Redirecting to login.");
        navigate("/login");
      } else if (err.isAccessDenied) {
        toast.warn("Access Denied: You don't have permission for this action.");
      }
    } else if (typeof error === "string") {
      toast.error(error);
    } else {
      toast.error(`${contextMessage}: ${error?.toString() || "Unknown error"}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // For "get all" type endpoints, pass "" as key.
        // fetchMetadata handles merging apiHeadersForFetchMetadata with its defaults.
        const [budgetData, locationData, statusData, categoryData] =
          await Promise.all([
            fetchMetadata(baseUrl, "funds", "", apiHeadersForFetchMetadata),
            fetchMetadata(
              baseUrl,
              "stock/locations",
              "",
              apiHeadersForFetchMetadata
            ),
            fetchMetadata(
              baseUrl,
              "stock/status",
              "",
              apiHeadersForFetchMetadata
            ),
            fetchMetadata(
              baseUrl,
              "stock/category",
              "",
              apiHeadersForFetchMetadata
            ),
          ]);

        if (budgetData?.budgets) {
          setBudgets(
            budgetData.budgets
              .map((b: { budgetName: string }) => b.budgetName)
              .sort()
          );
        }
        if (locationData?.locations) {
          setLocations(
            locationData.locations
              .map((loc: { locationName: string }) => loc.locationName)
              .sort()
          );
        }
        if (statusData?.statuses) {
          setStatuses(
            statusData.statuses
              .map(
                (rem: { statusDescription: string }) => rem.statusDescription
              )
              .sort()
          );
        }
        if (categoryData?.categories) {
          setCategories(
            categoryData.categories
              .map((cat: { categoryName: string }) => cat.categoryName)
              .sort()
          );
        }
      } catch (error) {
        handleApiError(error, "Failed to load essential data");
      } finally {
        setLoading(false);
      }
    };

    if (authTokenFromContext) {
      fetchData();
    }
  }, [baseUrl, authTokenFromContext, navigate, apiHeadersForFetchMetadata]);

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
      ["pageNo", "volNo"].includes(field) ||
      (field === "quantity" && productToUpdate.quantity > 0)
    ) {
      productToUpdate.productVolPageSerial = `MIT/IT/Vol.No.${
        productToUpdate.volNo || "N/A"
        }/Pg.No.${productToUpdate.pageNo || "N/A"
        }/S.No.${productToUpdate.serialNo || "N/A"
      }-[1-${productToUpdate.quantity || "N/A"}]`;
    }

    updatedProducts[index] = productToUpdate;
    setProducts(updatedProducts);
  };

  const handleInvoiceChange = (field: string, value: string | number) => {
    setInvoiceDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Helper for parsing API error responses from direct fetch calls
  const parseDirectFetchError = async (
    response: Response,
    defaultMessage: string
  ) => {
    let errorBody: any = null;
    let errorMessageFromServer = defaultMessage;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        errorBody = await response.json();
        errorMessageFromServer =
          errorBody.message || errorBody.error || JSON.stringify(errorBody);
      } else {
        const text = await response.text();
        if (text.trim()) errorMessageFromServer = text;
      }
    } catch (e) {
      /* Ignore parsing error, use default */
    }

    let finalMessage = `${defaultMessage}: ${errorMessageFromServer}`;
    if (response.status === 403) {
      finalMessage = `Access Denied: ${errorMessageFromServer}`;
    } else if (response.status === 401) {
      finalMessage = `Authentication Failed: ${errorMessageFromServer}`;
    }
    return {
      status: response.status,
      message: finalMessage,
      body: errorBody,
      isAccessDenied: response.status === 403,
      isAuthError: response.status === 401,
    };
  };

  const addNewLocationForProduct = async (
    productIndex: number,
    mappingIndex: number
  ) => {
    if (!newLocation.locationName.trim() || !newLocation.staffIncharge.trim()) {
      toast.error("New location name and staff incharge cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(baseUrl + "/stock/location/add", {
        method: "POST",
        headers: getDirectFetchHeaders(),
        body: JSON.stringify(newLocation),
      });
      if (!res.ok) {
        const error = await parseDirectFetchError(res, "Error adding location");
        throw error;
      }
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
    } catch (error) {
      handleApiError(error, "Failed to add location");
    } finally {
      setLoading(false);
    }
  };

  const addNewStatusForProduct = async (productIndex: number) => {
    if (!newStatus.trim()) {
      toast.error("New status description cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(baseUrl + "/stock/status/add", {
        method: "POST",
        headers: getDirectFetchHeaders(),
        body: JSON.stringify({ statusDescription: newStatus }),
      });
      if (!res.ok) {
        const error = await parseDirectFetchError(res, "Error adding status");
        throw error;
      }
      const addedStatus = newStatus;
      setStatuses((prev) => [...prev, addedStatus].sort());
      toast.success("Status added successfully!");
      const updatedProducts = products.map((p, idx) =>
        idx === productIndex ? { ...p, Status: addedStatus } : p
      );
      setProducts(updatedProducts);
      setNewStatus("");
    } catch (error) {
      handleApiError(error, "Failed to add status");
    } finally {
      setLoading(false);
    }
  };

  const addNewCategoryForProduct = async (productIndex: number) => {
    if (!newCategory.trim()) {
      toast.error("New category name cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(baseUrl + "/stock/category/add", {
        method: "POST",
        headers: getDirectFetchHeaders(),
        body: JSON.stringify({ categoryName: newCategory }),
      });
      if (!res.ok) {
        const error = await parseDirectFetchError(res, "Error adding category");
        throw error;
      }
      const addedCategory = newCategory;
      setCategories((prev) => [...prev, addedCategory].sort());
      toast.success("Category added successfully!");
      const updatedProducts = products.map((p, idx) =>
        idx === productIndex ? { ...p, category: addedCategory } : p
      );
      setProducts(updatedProducts);
      setNewCategory("");
    } catch (error) {
      handleApiError(error, "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceDetails.invoiceNo.trim()) {
      toast.error("Invoice Number is required");
      return;
    }
    if (
      invoiceDetails.PODate &&
      invoiceDetails.invoiceDate &&
      new Date(invoiceDetails.PODate) > new Date(invoiceDetails.invoiceDate)
    ) {
      toast.error("PO Date must be before or same as Invoice Date");
      return;
    }
    if (!invoiceDetails.budgetName) {
      toast.error("Budget Name is required");
      return;
    }
    if (products.length === 0) {
      toast.error("Please add at least one product.");
      return;
    }
    if (!isEquals) {
      toast.error("Invoice total does not match products total.");
      return;
    }

    // Product specific validations (condensed)
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productLabel = `Product ${i + 1} (${
        product.productName || "Unnamed"
      })`;
      if (!product.productName.trim()) {
        toast.error(`Name is required for ${productLabel}.`);
        return;
      }
      if (!product.volNo.trim()) {
        toast.error(`Volume No. is required for ${productLabel}.`);
        return;
      }
      if (!product.pageNo.trim()) {
        toast.error(`Page No. is required for ${productLabel}.`);
        return;
      }
      if (!product.category) {
        toast.error(`Category is required for ${productLabel}.`);
        return;
      }
      if (!product.Status) {
        toast.error(`Status is required for ${productLabel}.`);
        return;
      }
      if (product.quantity <= 0) {
        toast.error(`Quantity for ${productLabel} must be > 0.`);
        return;
      }
      if (product.price < 0) {
        toast.error(`Price for ${productLabel} cannot be negative.`);
        setLoading(false);
        return;
      }
      if (product.gstInputValue < 0) {
        toast.error(`GST Value for ${productLabel} cannot be negative.`);
        setLoading(false);
        return;
      }
      if (
        !product.locationRangeMappings ||
        product.locationRangeMappings.length === 0
      ) {
        toast.error(`Location/range mapping is required for ${productLabel}.`);
        return;
      }
      const totalQuantityInMappings = product.locationRangeMappings.reduce(
        (sum, mapping) => sum + parseRange(mapping.range).length,
        0
      );
      if (totalQuantityInMappings !== product.quantity) {
        toast.error(
          `Mapped quantity (${totalQuantityInMappings}) does not match total quantity (${product.quantity}) for ${productLabel}.`
        );
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Fetch Budget ID
      const budgetMeta = await fetchMetadata(
        baseUrl,
        "funds/search",
        invoiceDetails.budgetName,
        apiHeadersForFetchMetadata
      );
      if (!budgetMeta?.budgets?.[0]?.budgetId) {
        throw new Error(
          `Budget '${invoiceDetails.budgetName}' not found or invalid data.`
        );
      }
      const budgetId = budgetMeta.budgets[0].budgetId;

      // 2. Add Invoice
      const parsedInvoiceData = {
        ...invoiceDetails,
        totalAmount: invoiceDetails.totalAmount.toString(), // Ensure string for API
        budgetId: budgetId,
      };
      const invoiceRes = await fetch(`${baseUrl}/stock/invoice/add`, {
        method: "POST",
        headers: getDirectFetchHeaders(),
        body: JSON.stringify(parsedInvoiceData),
      });
      if (!invoiceRes.ok) {
        const error = await parseDirectFetchError(
          invoiceRes,
          "Failed to add invoice"
        );
        throw error; 
      }
      const { invoice } = await invoiceRes.json();
      const invoiceId = invoice.invoiceId;

      // 3. Add Products
      for (const product of products) {
        const [statusMeta, categoryMeta] = await Promise.all([
          fetchMetadata(
            baseUrl,
            "stock/status/search",
            product.Status,
            apiHeadersForFetchMetadata
          ),
          fetchMetadata(
            baseUrl,
            "stock/category/search",
            product.category,
            apiHeadersForFetchMetadata
          ),
        ]);

        if (!statusMeta?.statusId)
          throw new Error(`Status ID not found for: ${product.Status}`);
        if (!categoryMeta?.categoryId)
          throw new Error(`Category ID not found for: ${product.category}`);

        for (const mapping of product.locationRangeMappings!) {
          const locationMeta = await fetchMetadata(
            baseUrl,
            "stock/location/search",
            mapping.location,
            apiHeadersForFetchMetadata
          );
          if (!locationMeta?.locationId)
            throw new Error(`Location ID not found for: ${mapping.location}`);

          const unitNumbers = parseRange(mapping.range);
          const productAddPromises = unitNumbers.map(async (unitNo) => {
            const individualProductVolPageSerial = `MIT/IT/Vol.No.${
              product.volNo || "N/A"
            }/Pg.No.${product.pageNo || "N/A"}/S.No.${
              product.serialNo || "N/A"
            }-[${unitNo}-${product.quantity || "N/A"}]`;
            const singleProductData = {
              productVolPageSerial: individualProductVolPageSerial,
              productName: product.productName,
              productDescription: product.productDescription,
              locationId: locationMeta.locationId,
              statusId: statusMeta.statusId,
              gstAmount: product.gstAmount,
              productImage: product.productImage,
              invoiceId: invoiceId,
              categoryId: categoryMeta.categoryId,
              productPrice: product.price,
              transferLetter: product.transferLetter,
              remarks: product.remark,
              budgetId: budgetId,
            };
            const prodRes = await fetch(`${baseUrl}/stock/add`, {
              method: "POST",
              headers: getDirectFetchHeaders(),
              body: JSON.stringify(singleProductData),
            });
            if (!prodRes.ok) {
              const error = await parseDirectFetchError(
                prodRes,
                `Failed to add product unit ${individualProductVolPageSerial}`
              );
              throw error; // This will be FetchErrorResponse-like
            }
            return prodRes.json();
          });
          await Promise.all(productAddPromises);
        }
      }

      toast.success("Products and invoice added successfully!");
      setInvoiceDetails({
        invoiceNo: "",
        invoiceDate: "",
        PODate: "",
        totalAmount: 0,
        fromAddress: "",
        toAddress: "",
        invoiceImage: "",
        budgetName: "",
      });
      setProducts([]);
      navigate("/dashboard");
    } catch (error: any) {
      handleApiError(error, "Transaction failed");
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
      title: "Confirm to delete",
      message: "Are you sure you want to delete this product?",
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

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-gray-100 rounded-lg shadow-md my-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Add New Stock / Products
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <InvoiceCard
            handleInvoiceChange={handleInvoiceChange}
            invoiceDetails={invoiceDetails}
            budgets={budgets}
          />
          {products.map((product, index) => (
            <ProductCard
              key={index} // Consider using a more stable key if products can be reordered, e.g., a unique temp ID
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
              Add Another Product
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="p-2 rounded-lg shadow-md text-gray-800 font-semibold text-sm bg-white">
                Invoice Total: ₹{invoiceTotalPrice.toFixed(2)}
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
                loading || !isEquals ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Submit the entire invoice with all products"
              disabled={loading || !isEquals}
            >
              {loading ? "Processing..." : "Submit Invoice & Products"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddProduct;
