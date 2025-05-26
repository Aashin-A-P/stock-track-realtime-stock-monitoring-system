import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { convertProductData, fetchMetadata } from "../utils";
import InvoiceCard from "../components/InvoiceCard";
import ProductCard from "../components/ProductCard";
import { Product, RangeMapping, FetchErrorResponse } from "../types";

const InvoiceDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const authTokenFromContext  = useAuth().token || localStorage.getItem("token");
  const { id: invoiceIdFromParams } = useParams<{ id: string }>();

  useEffect(() => {
    if (!authTokenFromContext) {
      toast.error("You must be logged in to access this page.");
      navigate("/login");
    }
  }, [authTokenFromContext, navigate]);

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

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Consistent header generation
  const apiHeadersForFetchMetadata = useMemo(() => {
    const headers: Record<string, string> = {};
    if (authTokenFromContext) {
      headers["Authorization"] = `${authTokenFromContext}`;
    }
    return headers;
  }, [authTokenFromContext]);

  const getDirectFetchHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authTokenFromContext) {
      headers["Authorization"] = `${authTokenFromContext}`;
    }
    return headers;
  }, [authTokenFromContext]);

  // Centralized API error handler
  const handleApiError = useCallback(
    (error: any, contextMessage: string = "An operation failed") => {
      console.error(contextMessage, error);
      if (error && typeof error === "object" && "message" in error) {
        const err = error as FetchErrorResponse;
        toast.error(err.message || contextMessage);
        if (err.isAuthError || err.status === 401) {
          toast.info("Session expired or invalid. Redirecting to login.");
          navigate("/login");
        } else if (err.isAccessDenied) {
          toast.warn(
            "Access Denied: You don't have permission for this action."
          );
        }
      } else if (typeof error === "string") {
        toast.error(error);
      } else {
        toast.error(
          `${contextMessage}: ${error?.toString() || "Unknown error"}`
        );
      }
    },
    [navigate]
  );

  // Helper for parsing API error responses from direct fetch calls
  const parseDirectFetchError = async (
    response: Response,
    defaultMessage: string
  ): Promise<FetchErrorResponse> => {
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
    if (response.status === 403)
      finalMessage = `Access Denied: ${errorMessageFromServer}`;
    else if (response.status === 401)
      finalMessage = `Authentication Failed: ${errorMessageFromServer}`;

    return {
      status: response.status,
      message: finalMessage,
      body: errorBody,
      isAccessDenied: response.status === 403,
      isAuthError: response.status === 401,
    };
  };

  useEffect(() => {
    if (!invoiceIdFromParams) {
      toast.error("Invoice ID is missing.");
      navigate(-1); // Go back to previous page
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setInitialLoadComplete(false);
      try {
        // Fetch Invoice Details
        const fetchedInvoiceData = await fetchMetadata(
          baseUrl,
          "stock/invoice/id",
          invoiceIdFromParams,
          apiHeadersForFetchMetadata
        );
        if (!fetchedInvoiceData || !fetchedInvoiceData.invoice) {
          throw new Error("Invoice data not found or invalid response.");
        }

        let budgetName = "";
        if (fetchedInvoiceData.invoice.budgetId) {
          try {
            const budgetMetaData = await fetchMetadata(
              baseUrl,
              "funds/id",
              fetchedInvoiceData.invoice.budgetId,
              apiHeadersForFetchMetadata
            );
            budgetName = budgetMetaData?.budget?.budgetName || "";
          } catch (budgetError) {
            console.warn(
              `Could not fetch budget details for budgetId: ${fetchedInvoiceData.invoice.budgetId}`,
              budgetError
            );
          }
        }

        setInvoiceDetails({
          ...fetchedInvoiceData.invoice,
          invoiceDate:
            fetchedInvoiceData.invoice.invoiceDate?.split("T")[0] || "",
          PODate: fetchedInvoiceData.invoice.PODate?.split("T")[0] || "",
          budgetName: budgetName,
        });

        // Fetch Products for this invoice using full query string as key
        const productQuery = `?page=1&pageSize=-1&column=invoice_id&query=${invoiceIdFromParams}`;
        const rawProductData = await fetch(`${baseUrl}/stock/details${productQuery}`, {
          method: "GET",
          headers: getDirectFetchHeaders(),
        }).then((res) => {
          if (!res.ok) {
            throw new Error(
              `Failed to fetch products for invoice ${invoiceIdFromParams}`
            );
          }
          return res.json();
        })

        if (!rawProductData || !rawProductData.products) {
          console.warn(
            "No products found for this invoice or invalid product data structure."
          );
          setProducts([]); 
        } else {
          const uiProducts = await convertProductData(rawProductData.products);
          setProducts(uiProducts);
        }

        // Fetch metadata for dropdowns
        const [
          budgetListData,
          locationListData,
          statusListData,
          categoryListData,
        ] = await Promise.all([
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

        if (budgetListData?.budgets)
          setBudgets(
            budgetListData.budgets
              .map((b: { budgetName: string }) => b.budgetName)
              .sort()
          );
        if (locationListData?.locations)
          setLocations(
            locationListData.locations
              .map((loc: { locationName: string }) => loc.locationName)
              .sort()
          );
        if (statusListData?.statuses)
          setStatuses(
            statusListData.statuses
              .map((s: { statusDescription: string }) => s.statusDescription)
              .sort()
          );
        if (categoryListData?.categories)
          setCategories(
            categoryListData.categories
              .map((c: { categoryName: string }) => c.categoryName)
              .sort()
          );

        setInitialLoadComplete(true);
      } catch (error: any) {
        handleApiError(error, "Failed to load invoice data");
      } finally {
        setLoading(false);
      }
    };
    if (authTokenFromContext) {
      fetchData();
    }
  }, [
    invoiceIdFromParams,
    baseUrl,
    authTokenFromContext,
    navigate,
    handleApiError,
    apiHeadersForFetchMetadata,
  ]);

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
      productToUpdate.productVolPageSerial = `${
        productToUpdate.volNo || "N/A"
      }-${productToUpdate.pageNo || "N/A"}-${
        productToUpdate.serialNo || "N/A"
      }`;
    }

    updatedProducts[index] = productToUpdate;
    setProducts(updatedProducts);
  };

  const handleInvoiceChange = (field: string, value: string | number) => {
    setInvoiceDetails((prev) => ({ ...prev, [field]: value }));
  };

  // --- addNewLocation/Status/CategoryForProduct (POST requests, use direct fetch) ---
  const addNewItemGeneric = async (
    endpoint: string,
    payload: object,
    itemName: string,
    setItemsState: React.Dispatch<React.SetStateAction<string[]>>,
    resetInputState?: () => void,
    updateProductState?: (addedItemName: string) => void
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: getDirectFetchHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await parseDirectFetchError(
          res,
          `Error adding ${itemName}`
        );
        throw error;
      }

      const addedItemName =
        (payload as any).locationName ||
        (payload as any).statusDescription ||
        (payload as any).categoryName;
      setItemsState((prev) => [...prev, addedItemName].sort());
      toast.success(`${itemName} added successfully!`);
      if (updateProductState) updateProductState(addedItemName);
      if (resetInputState) resetInputState();
    } catch (error: any) {
      handleApiError(error, `Failed to add ${itemName}`);
    } finally {
      setLoading(false);
    }
  };

  const addNewLocationForProduct = (
    productIndex: number,
    mappingIndex: number
  ) => {
    if (!newLocation.locationName.trim() || !newLocation.staffIncharge.trim()) {
      toast.error("New location name and staff incharge cannot be empty.");
      return;
    }
    addNewItemGeneric(
      "/stock/location/add",
      newLocation,
      "Location",
      setLocations,
      () => setNewLocation({ locationName: "", staffIncharge: "" }),
      (addedLocationName) => {
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
      }
    );
  };

  const addNewStatusForProduct = (productIndex: number) => {
    if (!newStatus.trim()) {
      toast.error("New status description cannot be empty.");
      return;
    }
    addNewItemGeneric(
      "/stock/status/add",
      { statusDescription: newStatus },
      "Status",
      setStatuses,
      () => setNewStatus(""),
      (addedStatus) => {
        const updatedProducts = products.map((p, idx) =>
          idx === productIndex ? { ...p, Status: addedStatus } : p
        );
        setProducts(updatedProducts);
      }
    );
  };

  const addNewCategoryForProduct = (productIndex: number) => {
    if (!newCategory.trim()) {
      toast.error("New category name cannot be empty.");
      return;
    }
    addNewItemGeneric(
      "/stock/category/add",
      { categoryName: newCategory },
      "Category",
      setCategories,
      () => setNewCategory(""),
      (addedCategory) => {
        const updatedProducts = products.map((p, idx) =>
          idx === productIndex ? { ...p, category: addedCategory } : p
        );
        setProducts(updatedProducts);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialLoadComplete) {
      toast.warn("Data is still loading.");
      return;
    }
    if (!invoiceDetails.invoiceNo.trim()) {
      toast.error("Invoice Number is required");
      return;
    }
    if (!invoiceDetails.budgetName) {
      toast.error("Budget Name is required");
      return;
    }
    if (!isEquals) {
      toast.error("Invoice total does not match products total.");
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

    setLoading(true);
    try {
      const budgetMeta = await fetchMetadata(
        baseUrl,
        "funds/search",
        invoiceDetails.budgetName,
        apiHeadersForFetchMetadata
      );
      if (!budgetMeta?.budgets?.[0]?.budgetId)
        throw new Error("Budget not found or invalid.");
      const budgetId = budgetMeta.budgets[0].budgetId;

      const updatedInvoicePayload = {
        ...invoiceDetails,
        invoiceDate: invoiceDetails.invoiceDate || null,
        PODate: invoiceDetails.PODate || null,
        totalAmount: invoiceDetails.totalAmount.toString(),
        budgetId: budgetId,
      };
      delete (updatedInvoicePayload as any).budgetName; // budgetName is for UI only

      const invoiceUpdateRes = await fetch(
        `${baseUrl}/stock/invoice/${invoiceIdFromParams}`,
        {
          method: "PUT",
          headers: getDirectFetchHeaders(),
          body: JSON.stringify(updatedInvoicePayload),
        }
      );
      if (!invoiceUpdateRes.ok)
        throw await parseDirectFetchError(
          invoiceUpdateRes,
          "Failed to update invoice"
        );
      toast.success("Invoice details updated!");

      // Re-sync products: Delete all existing for this invoice, then add current ones
      const deleteProductsRes = await fetch(
        `${baseUrl}/stock/products/by-invoice/${invoiceIdFromParams}`,
        {
          method: "DELETE",
          headers: getDirectFetchHeaders(),
        }
      );
      // 404 is okay if no products existed. Other errors are problematic.
      if (!deleteProductsRes.ok && deleteProductsRes.status !== 404) {
        throw await parseDirectFetchError(
          deleteProductsRes,
          "Failed to clear existing products"
        );
      }
      console.log(
        deleteProductsRes.status === 404
          ? "No existing products to clear."
          : "Existing products cleared."
      );

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
          throw new Error(`Status ID error: ${product.Status}`);
        if (!categoryMeta?.categoryId)
          throw new Error(`Category ID error: ${product.category}`);

        for (const mapping of product.locationRangeMappings!) {
          const locationMeta = await fetchMetadata(
            baseUrl,
            "stock/location/search",
            mapping.location,
            apiHeadersForFetchMetadata
          );
          if (!locationMeta?.locationId)
            throw new Error(`Location ID error: ${mapping.location}`);

          const unitNumbers = parseRange(mapping.range);
          const productAddPromises = unitNumbers.map(async (unitNo) => {
            const singleProductData = {
              productVolPageSerial: `${product.volNo}-${product.pageNo}-${unitNo}`,
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
            const addProdRes = await fetch(`${baseUrl}/stock/${product.productId}`, {
              method: "PUT",
              headers: getDirectFetchHeaders(),
              body: JSON.stringify(singleProductData),
            });
            if (!addProdRes.ok)
              throw await parseDirectFetchError(
                addProdRes,
                `Failed to add product ${singleProductData.productVolPageSerial}`
              );
            return addProdRes.json();
          });
          await Promise.all(productAddPromises);
        }
      }
      toast.success("Products updated/re-added successfully!");
      navigate(-1); // Go back to previous page after successful save
    } catch (error: any) {
      handleApiError(error, "Failed to save changes");
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
        "Are you sure you want to remove this product from the list? Changes will be saved on submit.",
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
        <form onSubmit={handleSubmit} noValidate>
          <InvoiceCard
            handleInvoiceChange={handleInvoiceChange}
            invoiceDetails={invoiceDetails}
            budgets={budgets}
          />
          {products.map((product, index) => (
            <ProductCard
              key={product.productVolPageSerial || index} // Prefer a stable unique ID
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
                loading || !initialLoadComplete || !isEquals
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
