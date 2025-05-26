import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { uploadImageAndGetURL, fetchMetadata } from "../utils";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-toastify";
import { FetchErrorResponse } from "../types";

// Data types as returned by your backend
type Product = {
  productId: number;
  productVolPageSerial: string;
  productName: string;
  productDescription: string;
  transferLetter?: string;
  gstAmount: string;
  productImage: string;
  locationName: string;
  categoryName: string;
  remarks: string;
  status: string;
  productPrice: number;
  invoiceId: number;
};

type Invoice = {
  invoiceId: number;
  invoiceNo: string;
  fromAddress: string;
  toAddress: string;
  totalAmount: string;
  PODate?: string;
  invoiceDate: string;
  invoiceImage: string;
  budgetName?: string;
};

type LocationOption = { locationId: number; locationName: string };
type StatusOption = { statusId: number; statusDescription: string };
type CategoryOption = { categoryId: number; categoryName: string };

type EditProduct = {
  productId: number;
  productVolPageSerial: string;
  productName: string;
  productDescription: string;
  transferLetter?: string;
  gstAmount: string;
  productImage: string;
  locationId: number;
  categoryId: number;
  statusId: number;
  remarks: string;
  productPrice: string;
  invoiceId: number;
};

const formatAmount = (amount: number) => (
  <span className="text-blue-600 font-semibold">₹ {amount.toFixed(2)}</span>
);

const StockDetails = () => {
  const navigate = useNavigate();
  const { stockId } = useParams<{ stockId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updatedProduct, setUpdatedProduct] = useState<EditProduct | null>(
    null
  );

  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const authTokenFromContext = localStorage.getItem("token");

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
      /* Ignored parsing error, used default */
    }

    let finalMessage = `${defaultMessage}: ${response.status} ${response.statusText}. ${errorMessageFromServer}`;
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
    const fetchOptions = async () => {
      try {
        const [locData, statusData, catData] = await Promise.all([
          fetchMetadata(
            baseURL,
            "stock/locations",
            "",
            apiHeadersForFetchMetadata
          ),
          fetchMetadata(
            baseURL,
            "stock/status",
            "",
            apiHeadersForFetchMetadata
          ),
          fetchMetadata(
            baseURL,
            "stock/category",
            "",
            apiHeadersForFetchMetadata
          ),
        ]);

        if (locData?.locations) setLocations(locData.locations);
        if (statusData?.statuses) setStatuses(statusData.statuses);
        if (catData?.categories) setCategories(catData.categories);
      } catch (error) {
        handleApiError(error, "Error fetching dropdown options");
      }
    };
    if (authTokenFromContext) fetchOptions();
  }, [
    baseURL,
    authTokenFromContext,
    handleApiError,
    apiHeadersForFetchMetadata,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (!stockId) {
        handleApiError("Stock ID is missing.", "Invalid request");
        navigate("/stocks");
        return;
      }
      setLoading(true);
      try {
        const data = await fetchMetadata(
          baseURL,
          "stock/id",
          stockId,
          apiHeadersForFetchMetadata
        );

        if (data && data.product && data.invoice) {
          setProduct(data.product);
          setInvoice({
            ...data.invoice,
            totalAmount: Number(data.invoice.totalAmount).toString(),
            budgetName: data.invoice.budgetName || "",
          });
        } else {
          throw new Error(
            "Failed to fetch stock details or data is incomplete."
          );
        }
      } catch (error) {
        handleApiError(error, "Error fetching stock details");
      } finally {
        setLoading(false);
      }
    };
    if (authTokenFromContext) fetchData();
  }, [
    stockId,
    baseURL,
    authTokenFromContext,
    handleApiError,
    navigate,
    apiHeadersForFetchMetadata,
  ]);

  const handleBack = () => {
    navigate("/stocks");
  };

  const handleImageClick = (imageUrl: string) => {
    if (!imageUrl?.trim()) {
      console.warn("No valid image URL found.");
      return;
    }
    let fullUrl = imageUrl;
    if (!imageUrl.startsWith("http")) {
      fullUrl = `${baseURL}${
        imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`
      }`;
    }
    try {
      const newWindow = window.open(fullUrl, "_blank");
      if (!newWindow) {
        toast.warn("Popup blocked or failed to open the image.");
      }
    } catch (error) {
      toast.error("Error opening image.");
      console.error("Error opening image:", error);
    }
  };

  const handleEditClick = () => {
    if (!product || !invoice) return;
    setIsEditing(true);
    setUpdatedProduct({
      productId: product.productId,
      productVolPageSerial: product.productVolPageSerial,
      productName: product.productName,
      productDescription: product.productDescription,
      transferLetter: product.transferLetter || "",
      gstAmount: product.gstAmount,
      productImage: product.productImage || "",
      locationId:
        locations.find((loc) => loc.locationName === product.locationName)
          ?.locationId ?? 0,
      categoryId:
        categories.find((cat) => cat.categoryName === product.categoryName)
          ?.categoryId ?? 0,
      statusId:
        statuses.find((s) => s.statusDescription === product.status)
          ?.statusId ?? 0,
      remarks: product.remarks,
      productPrice: product.productPrice.toString(),
      invoiceId: product.invoiceId || invoice.invoiceId,
    });
  };

  const handleProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof EditProduct
  ) => {
    if (updatedProduct) {
      const value = e.target.value;
      setUpdatedProduct({ ...updatedProduct, [field]: value });
    }
  };

  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file && updatedProduct) {
      try {
        const imageUrl = await uploadImageAndGetURL(file, e); // Assuming uploadImageAndGetURL handles toasts
        setUpdatedProduct({ ...updatedProduct, productImage: imageUrl });
      } catch (error) {
        handleApiError(error, "Error uploading product image");
      }
    }
  };

  const handleTransferLetterUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file && updatedProduct) {
      try {
        const imageUrl = await uploadImageAndGetURL(file, e); // Assuming uploadImageAndGetURL handles toasts
        setUpdatedProduct({ ...updatedProduct, transferLetter: imageUrl });
      } catch (error) {
        handleApiError(error, "Error uploading transfer letter");
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!updatedProduct || !invoice) return;
    setLoading(true);
    try {
      const productToSave = {
        ...updatedProduct,
        productPrice: Number(updatedProduct.productPrice),
        gstAmount: Number(updatedProduct.gstAmount),
        invoiceId: updatedProduct.invoiceId || invoice.invoiceId, // Ensure invoiceId is present
        productImage: updatedProduct.productImage || "",
        transferLetter: updatedProduct.transferLetter || "",
      };

      const prodRes = await fetch(
        `${baseURL}/stock/${productToSave.productId}`,
        {
          method: "PUT",
          headers: getDirectFetchHeaders(),
          body: JSON.stringify(productToSave),
        }
      );

      if (!prodRes.ok) {
        throw await parseDirectFetchError(prodRes, "Failed to update product");
      }
      // const prodData = await prodRes.json(); // Not strictly needed if only confirming success

      const updatedProductFinal: Product = {
        productId: productToSave.productId,
        productVolPageSerial: productToSave.productVolPageSerial,
        productName: productToSave.productName,
        productDescription: productToSave.productDescription,
        transferLetter: productToSave.transferLetter,
        gstAmount: productToSave.gstAmount.toString(),
        productImage: productToSave.productImage,
        locationName:
          locations.find((loc) => loc.locationId === productToSave.locationId)
            ?.locationName ||
          product?.locationName ||
          "",
        categoryName:
          categories.find((cat) => cat.categoryId === productToSave.categoryId)
            ?.categoryName ||
          product?.categoryName ||
          "",
        remarks: productToSave.remarks,
        status:
          statuses.find((s) => s.statusId === productToSave.statusId)
            ?.statusDescription ||
          product?.status ||
          "",
        productPrice: productToSave.productPrice,
        invoiceId: productToSave.invoiceId,
      };

      setProduct(updatedProductFinal);
      setIsEditing(false);
      toast.success("Product updated successfully!");
    } catch (error) {
      handleApiError(error, "Error updating stock details");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !product)
    return (
      <div className=" text-center text-blue-700">
        <LoadingSpinner />
        Loading Stock Details...
      </div>
    );
  if (!product || !invoice) {
    return (
      <>
        <Navbar />
        <div className="p-6 max-w-5xl mx-auto text-center text-red-500">
          Error: Unable to fetch stock or invoice details. Please try again or
          contact support.
          <button
            onClick={handleBack}
            className="mt-4 text-white bg-blue-600 px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </>
    );
  }

  const productDataForDisplay: EditProduct =
    isEditing && updatedProduct
      ? updatedProduct
      : {
          productId: product.productId,
          productVolPageSerial: product.productVolPageSerial,
          productName: product.productName,
          productDescription: product.productDescription,
          transferLetter: product.transferLetter,
          gstAmount: product.gstAmount,
          productImage: product.productImage,
          locationId:
            locations.find((l) => l.locationName === product.locationName)
              ?.locationId || 0,
          categoryId:
            categories.find((c) => c.categoryName === product.categoryName)
              ?.categoryId || 0,
          statusId:
            statuses.find((s) => s.statusDescription === product.status)
              ?.statusId || 0,
          remarks: product.remarks,
          productPrice: product.productPrice.toString(),
          invoiceId: product.invoiceId,
        };

  const baseAmount =
    productDataForDisplay.productPrice === ""
      ? 0
      : Number(productDataForDisplay.productPrice);
  const gst =
    productDataForDisplay.gstAmount === ""
      ? 0
      : Number(productDataForDisplay.gstAmount);
  const computedTotal = baseAmount + gst;
  const computedTotalDisplay =
    productDataForDisplay.productPrice === ""
      ? ""
      : formatAmount(computedTotal);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <button
          onClick={handleBack}
          className="text-white bg-blue-600 px-4 py-2 rounded shadow hover:bg-blue-700 mb-4"
        >
          Back
        </button>
        <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">
          Stock Details
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h3 className="text-xl font-medium text-gray-700 mb-4">
            Product Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Product ID: </label>
              <span>{productDataForDisplay.productId}</span>
            </div>
            <div>
              <label className="font-semibold">Vol/Page Serial: </label>
              <span>{productDataForDisplay.productVolPageSerial}</span>
            </div>
            <div>
              <label className="font-semibold">Product Name: </label>
              {isEditing ? (
                <input
                  type="text"
                  value={productDataForDisplay.productName}
                  onChange={(e) => handleProductChange(e, "productName")}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span>{productDataForDisplay.productName}</span>
              )}
            </div>
            <div>
              <label className="font-semibold">Description: </label>
              {isEditing ? (
                <textarea
                  value={productDataForDisplay.productDescription}
                  onChange={(e) => handleProductChange(e, "productDescription")}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span>{productDataForDisplay.productDescription}</span>
              )}
            </div>
            <div>
              <label className="font-semibold">Base Amount: </label>
              {formatAmount(Number(productDataForDisplay.productPrice))}
              {isEditing && (
                <div className={"text-sm text-gray-500 mt-1"}>
                  <Link
                    to={`/invoice/${productDataForDisplay.invoiceId}`}
                    className="text-blue-600 underline pl-2"
                  >
                    Click to edit Base Amount via invoice
                  </Link>
                </div>
              )}
            </div>
            <div>
              <label className="font-semibold">GST Amount: </label>
              {formatAmount(Number(productDataForDisplay.gstAmount))}
              {isEditing && (
                <div className={"text-sm text-gray-500 mt-1"}>
                  <Link
                    to={`/invoice/${productDataForDisplay.invoiceId}`}
                    className="text-blue-600 underline pl-2"
                  >
                    Click to edit gst amount via invoice
                  </Link>
                </div>
              )}
            </div>
            <div>
              <label className="font-semibold">Total Amount: </label>
              <span>{computedTotalDisplay}</span>
            </div>
            <div>
              <label className="font-semibold">Location: </label>
              {isEditing && updatedProduct ? (
                <select
                  value={updatedProduct.locationId}
                  onChange={(e) =>
                    setUpdatedProduct({
                      ...updatedProduct,
                      locationId: Number(e.target.value),
                    })
                  }
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.locationId} value={loc.locationId}>
                      {loc.locationName}
                    </option>
                  ))}
                </select>
              ) : (
                <span>{product.locationName}</span>
              )}
            </div>
            <div>
              <label className="font-semibold">Category: </label>
              {isEditing && updatedProduct ? (
                <select
                  value={updatedProduct.categoryId}
                  onChange={(e) =>
                    setUpdatedProduct({
                      ...updatedProduct,
                      categoryId: Number(e.target.value),
                    })
                  }
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              ) : (
                <span>{product.categoryName}</span>
              )}
            </div>
            <div>
              <label className="font-semibold">Status: </label>
              {isEditing && updatedProduct ? (
                <select
                  value={updatedProduct.statusId}
                  onChange={(e) =>
                    setUpdatedProduct({
                      ...updatedProduct,
                      statusId: Number(e.target.value),
                    })
                  }
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  {statuses.map((s) => (
                    <option key={s.statusId} value={s.statusId}>
                      {s.statusDescription}
                    </option>
                  ))}
                </select>
              ) : (
                <span>{product.status}</span>
              )}
            </div>
            <div>
              <label className="font-semibold">Remarks: </label>
              {isEditing ? (
                <textarea
                  value={productDataForDisplay.remarks}
                  onChange={(e) => handleProductChange(e, "remarks")}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span>{productDataForDisplay.remarks || "-"}</span>
              )}
            </div>
            <div>
              <label className="font-semibold">Product Image: </label>
              {isEditing ? (
                <>
                  {productDataForDisplay.productImage && (
                    <div className="mb-2">
                      <img
                        src={
                          productDataForDisplay.productImage.startsWith("http")
                            ? productDataForDisplay.productImage
                            : `${baseURL}${productDataForDisplay.productImage}`
                        }
                        alt="Product"
                        className="w-32 h-32 object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageUpload}
                    className="hidden"
                    id="productImageInput"
                  />
                  <label
                    htmlFor="productImageInput"
                    className="cursor-pointer inline-block p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {productDataForDisplay.productImage
                      ? "Change Product Image"
                      : "Upload Product Image"}
                  </label>
                </>
              ) : productDataForDisplay.productImage ? (
                <button
                  onClick={() =>
                    handleImageClick(productDataForDisplay.productImage)
                  }
                  className="text-blue-600 underline"
                >
                  View Image
                </button>
              ) : (
                <span className="text-gray-500">No Image Available</span>
              )}
            </div>
            <div>
              <label className="font-semibold">Transfer Letter: </label>
              {isEditing ? (
                <>
                  {productDataForDisplay.transferLetter && (
                    <div className="mb-2">
                      <img
                        src={
                          productDataForDisplay.transferLetter.startsWith(
                            "http"
                          )
                            ? productDataForDisplay.transferLetter
                            : `${baseURL}${productDataForDisplay.transferLetter}`
                        }
                        alt="Transfer Letter"
                        className="w-32 h-32 object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTransferLetterUpload}
                    className="hidden"
                    id="transferLetterInput"
                  />
                  <label
                    htmlFor="transferLetterInput"
                    className="cursor-pointer inline-block p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {productDataForDisplay.transferLetter
                      ? "Change Transfer Letter"
                      : "Upload Transfer Letter"}
                  </label>
                </>
              ) : productDataForDisplay.transferLetter ? (
                <button
                  onClick={() =>
                    handleImageClick(
                      productDataForDisplay?.transferLetter || ""
                    )
                  }
                  className="text-blue-600 underline"
                >
                  View Transfer Letter
                </button>
              ) : (
                <span className="text-gray-500">No Transfer Letter</span>
              )}
            </div>
          </div>
          <div className="text-center mt-6">
            {isEditing ? (
              <button
                onClick={handleSaveChanges}
                disabled={loading}
                className="text-white bg-green-600 px-6 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            ) : (
              <button
                onClick={handleEditClick}
                className="text-white bg-blue-600 px-6 py-2 rounded shadow hover:bg-blue-700"
              >
                Edit Product
              </button>
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h3 className="text-xl font-medium text-gray-700 mb-4">
            Invoice Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Invoice ID: </label>
              <span>{invoice.invoiceId}</span>
            </div>
            <div>
              <label className="font-semibold">Invoice No: </label>
              <span>{invoice.invoiceNo}</span>
            </div>
            <div>
              <label className="font-semibold">From Address: </label>
              <span>{invoice.fromAddress}</span>
            </div>
            <div>
              <label className="font-semibold">To Address: </label>
              <span>{invoice.toAddress}</span>
            </div>
            <div>
              <label className="font-semibold">Total Amount: </label>
              <span>{formatAmount(Number(invoice.totalAmount))}</span>
            </div>
            <div>
              <label className="font-semibold">PO Date: </label>
              <span>{invoice.PODate?.split("T")[0] || "-"}</span>
            </div>
            <div>
              <label className="font-semibold">Invoice Date: </label>
              <span>{invoice.invoiceDate?.split("T")[0]}</span>
            </div>
            <div>
              <label className="font-semibold">Invoice Image: </label>
              {invoice.invoiceImage ? (
                <button
                  onClick={() => handleImageClick(invoice.invoiceImage)}
                  className="text-blue-600 underline"
                >
                  View Invoice Image
                </button>
              ) : (
                <span className="text-gray-500">No Invoice Image</span>
              )}
            </div>
            <div>
              <label className="font-semibold">Fund Name: </label>
              <span>{invoice.budgetName || "-"}</span>
            </div>
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate(`/invoice/${invoice.invoiceId}`)}
              className="text-white bg-blue-600 px-6 py-2 rounded shadow hover:bg-blue-700"
            >
              Edit Invoice
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockDetails;
