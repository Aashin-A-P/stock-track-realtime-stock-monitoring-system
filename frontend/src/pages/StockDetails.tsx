import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { uploadImageAndGetURL } from "../utils";
import LoadingSpinner from "../components/LoadingSpinner";

// Data types as returned by your backend
type Product = {
  productId: number;
  productVolPageSerial: string;
  productName: string;
  productDescription: string;
  transferLetter?: string;
  gstAmount: string; // API returns as string
  productImage: string;
  locationName: string;
  categoryName: string;
  remarks: string;
  status: string;
  productPrice: number;
};

type Invoice = {
  invoiceId: number;
  invoiceNo: string;
  fromAddress: string;
  toAddress: string;
  totalAmount: string; // API expecting as string
  PODate?: string;
  invoiceDate: string;
  invoiceImage: string;
  budgetName?: string;
};

// Dropdown option types – adjust property names per your API
type LocationOption = { locationId: number; locationName: string };
type StatusOption = { statusId: number; statusDescription: string };
type CategoryOption = { categoryId: number; categoryName: string };

// Editing types: we use strings for numeric fields so that clearing an input leaves it empty.
type EditProduct = {
  productId: number;
  productVolPageSerial: string;
  productName: string;
  productDescription: string;
  transferLetter?: string;
  gstAmount: string; // will convert on save
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
  const [updatedProduct, setUpdatedProduct] = useState<EditProduct | null>(null);

  // Dropdown option states
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const fetchHeaders = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token") || "",
  };

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const locRes = await fetch(`${baseURL}/stock/locations`, { headers: fetchHeaders });
        const locData = await locRes.json();
        setLocations(locData.locations); // expecting objects with locationId & locationName

        const statusRes = await fetch(`${baseURL}/stock/status`, { headers: fetchHeaders });
        const statusData = await statusRes.json();
        setStatuses(statusData.statuses); // expecting objects with statusId & statusDescription

        const catRes = await fetch(`${baseURL}/stock/category`, { headers: fetchHeaders });
        const catData = await catRes.json();
        setCategories(catData.categories); // expecting objects with categoryId & categoryName

      } catch (error) {
        console.error("Error fetching dropdown options", error);
      }
    };
    fetchOptions();
  }, [baseURL]);

  // Fetch stock details from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseURL}/stock/${stockId}`, { headers: fetchHeaders });
        const data = await response.json();
        if (response.ok) {
          // console.log("Stock Details:", JSON.stringify(data, null, 2));
          setProduct(data.product);
          setInvoice({
            ...data.invoice,
            totalAmount: Number(data.invoice.totalAmount).toString(),
            budgetName: data.invoice.budgetName || "",
          });
        } else {
          console.error("Error fetching stock details:", data.message);
        }
      } catch (error) {
        console.error("Error fetching stock details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [stockId, baseURL]);

  const handleBack = () => {
    navigate("/stocks");
  };

  const handleImageClick = (imageUrl: string) => {
    if (!imageUrl.trim()) {
      console.warn("No valid image URL found.");
      return;
    }
    let fullUrl = imageUrl;
    if (!imageUrl.startsWith("http")) {
      fullUrl = `${baseURL}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
    }
    try {
      const newWindow = window.open(fullUrl, "_blank");
      if (!newWindow) {
        console.warn("Popup blocked or failed to open the image.");
      }
    } catch (error) {
      console.error("Error opening image:", error);
    }
  };

  // When entering edit mode for the product, prepopulate editing state.
  const handleEditClick = () => {
    if (!product || !invoice) return;
    setIsEditing(true);
    setUpdatedProduct({
      productId: product.productId,
      productVolPageSerial: product.productVolPageSerial,
      productName: product.productName,
      productDescription: product.productDescription,
      transferLetter: product.transferLetter || '',
      gstAmount: product.gstAmount, // remains as string; will convert on save
      productImage: product.productImage  || '',
      // Use a fallback of 0 if not found so that the API receives a valid number
      locationId: locations.find((loc) => loc.locationName === product.locationName)?.locationId ?? 0,
      categoryId: categories.find((cat) => cat.categoryName === product.categoryName)?.categoryId ?? 0,
      statusId: statuses.find((s) => s.statusDescription === product.status)?.statusId ?? 0,
      remarks: product.remarks,
      productPrice: product.productPrice.toString(),
      invoiceId: invoice.invoiceId, 
    });
  };

  // Update editing state for product fields
  const handleProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof EditProduct
  ) => {
    if (updatedProduct) {
      const value = e.target.value;
      setUpdatedProduct({ ...updatedProduct, [field]: value });
    }
  };

  // Image upload handlers
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && updatedProduct) {
      try {
        const imageUrl = await uploadImageAndGetURL(file, e);
        setUpdatedProduct({ ...updatedProduct, productImage: imageUrl });
      } catch (error) {
        console.error("Error uploading product image:", error);
      }
    }
  };

  const handleTransferLetterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && updatedProduct) {
      try {
        const imageUrl = await uploadImageAndGetURL(file, e);
        setUpdatedProduct({ ...updatedProduct, transferLetter: imageUrl });
      } catch (error) {
        console.error("Error uploading transfer letter:", error);
      }
    }
  };

  // Save product changes: convert numeric strings to numbers and merge IDs back to names
  const handleSaveChanges = async () => {
    if (!updatedProduct || !invoice) return;
    setLoading(true);
    try {
      // Convert string values to numbers using Number(…)
      const productToSave = {
        ...updatedProduct,
        productPrice: Number(updatedProduct.productPrice),
        gstAmount: Number(updatedProduct.gstAmount),
        invoiceId:invoice.invoiceId,
        productImage: updatedProduct.productImage || '', // Ensure string
        transferLetter: updatedProduct.transferLetter || '',
      };

      console.log(JSON.stringify(productToSave, null, 2));

      // Send product update
      const prodRes = await fetch(`${baseURL}/stock/${productToSave.productId}`, {
        method: "PUT",
        headers: fetchHeaders,
        body: JSON.stringify(productToSave),
      });
      const prodData = await prodRes.json();
      if (!prodRes.ok) {
        throw new Error(prodData.message || "Failed to update product");
      }

      // Merge back to full Product shape using our dropdown options
      const updatedProductFinal: Product = {
        productId: productToSave.productId,
        productVolPageSerial: productToSave.productVolPageSerial,
        productName: productToSave.productName,
        productDescription: productToSave.productDescription,
        transferLetter: productToSave.transferLetter,
        gstAmount: productToSave.gstAmount.toString(), // convert number back to string for Product type
        productImage: productToSave.productImage,
        locationName:
          locations.find((loc) => loc.locationId === productToSave.locationId)?.locationName ||
          product?.locationName ||
          "",
        categoryName:
          categories.find((cat) => cat.categoryId === productToSave.categoryId)?.categoryName ||
          product?.categoryName ||
          "",
        remarks: productToSave.remarks,
        status:
          statuses.find((s) => s.statusId === productToSave.statusId)?.statusDescription ||
          product?.status ||
          "",
        productPrice: productToSave.productPrice,
      };

      setProduct(updatedProductFinal);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating stock details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className=" text-center text-blue-700">
    <LoadingSpinner />
    Loading Stocks...
  </div>;
  if (!product || !invoice) {
    return (
      <div className="text-center text-red-500">
        Error: Unable to fetch stock or invoice details.
      </div>
    );
  }

  // For display purposes, use the inline product editing state if available.
  const productData: EditProduct =
    isEditing && updatedProduct
      ? updatedProduct
      : {
        // For display only; dropdown IDs will be determined when editing starts.
        productId: product.productId,
        productVolPageSerial: product.productVolPageSerial,
        productName: product.productName,
        productDescription: product.productDescription,
        transferLetter: product.transferLetter,
        gstAmount: product.gstAmount,
        productImage: product.productImage,
        locationId: 0,
        categoryId: 0,
        statusId: 0,
        remarks: product.remarks,
        productPrice: product.productPrice.toString(),
        invoiceId:0,
      };

  // Compute computed total amount display only if base amount is entered.
  const baseAmount = productData.productPrice === "" ? 0 : Number(productData.productPrice);
  const gst = productData.gstAmount === "" ? 0 : Number(productData.gstAmount);
  const computedTotal = baseAmount + gst;
  const computedTotalDisplay = productData.productPrice === "" ? "" : formatAmount(computedTotal);

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

        {/* Product Details Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h3 className="text-xl font-medium text-gray-700 mb-4">Product Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Read-only fields */}
            <div>
              <label className="font-semibold">Product ID: </label>
              <span>{productData.productId}</span>
            </div>
            <div>
              <label className="font-semibold">Vol/Page Serial: </label>
              <span>{productData.productVolPageSerial}</span>
            </div>
            {/* Editable text fields */}
            <div>
              <label className="font-semibold">Product Name: </label>
              {isEditing ? (
                <input
                  type="text"
                  value={productData.productName}
                  onChange={(e) => handleProductChange(e, "productName")}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span>{productData.productName}</span>
              )}
            </div>
            <div>
              <label className="font-semibold">Description: </label>
              {isEditing ? (
                <textarea
                  value={productData.productDescription}
                  onChange={(e) => handleProductChange(e, "productDescription")}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span>{productData.productDescription}</span>
              )}
            </div>
            <div>
              <label className="font-semibold">Base Amount: </label>
              {isEditing ? (
                <input
                  type="number"
                  value={productData.productPrice}
                  onChange={(e) => handleProductChange(e, "productPrice")}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                formatAmount(Number(productData.productPrice))
              )}
            </div>
            <div>
              <label className="font-semibold">GST Amount: </label>
              {isEditing ? (
                <input
                  type="number"
                  value={productData.gstAmount}
                  onChange={(e) => handleProductChange(e, "gstAmount")}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                formatAmount(Number(productData.gstAmount))
              )}
            </div>
            <div>
              <label className="font-semibold">Total Amount: </label>
              <span>{computedTotalDisplay}</span>
            </div>
            {/* Dropdown for Location */}
            <div>
              <label className="font-semibold">Location: </label>
              {isEditing ? (
                <select
                  value={updatedProduct ? updatedProduct.locationId : ""}
                  onChange={(e) =>
                    setUpdatedProduct({
                      ...updatedProduct!,
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
            {/* Dropdown for Category */}
            <div>
              <label className="font-semibold">Category: </label>
              {isEditing ? (
                <select
                  value={updatedProduct ? updatedProduct.categoryId : ""}
                  onChange={(e) =>
                    setUpdatedProduct({
                      ...updatedProduct!,
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
            {/* Dropdown for Status */}
            <div>
              <label className="font-semibold">Status: </label>
              {isEditing ? (
                <select
                  value={updatedProduct ? updatedProduct.statusId : ""}
                  onChange={(e) =>
                    setUpdatedProduct({
                      ...updatedProduct!,
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
                  value={productData.remarks}
                  onChange={(e) => handleProductChange(e, "remarks")}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span>{productData.remarks || "-"}</span>
              )}
            </div>
            {/* Product Image */}
            <div>
              <label className="font-semibold">Product Image: </label>
              {isEditing ? (
                <>
                  {productData.productImage && (
                    <div className="mb-2">
                      <img
                        src={
                          productData.productImage.startsWith("http")
                            ? productData.productImage
                            : `${baseURL}${productData.productImage}`
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
                    {productData.productImage
                      ? "Change Product Image"
                      : "Upload Product Image"}
                  </label>
                </>
              ) : productData.productImage ? (
                <button onClick={() => handleImageClick(productData.productImage)} className="text-blue-600 underline">
                  View Image
                </button>
              ) : (
                <span className="text-gray-500">No Image Available</span>
              )}
            </div>
            {/* Transfer Letter */}
            <div>
              <label className="font-semibold">Transfer Letter: </label>
              {isEditing ? (
                <>
                  {productData.transferLetter && (
                    <div className="mb-2">
                      <img
                        src={
                          productData.transferLetter.startsWith("http")
                            ? productData.transferLetter
                            : `${baseURL}${productData.transferLetter}`
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
                    {productData.transferLetter
                      ? "Change Transfer Letter"
                      : "Upload Transfer Letter"}
                  </label>
                </>
              ) : productData.transferLetter ? (
                <button onClick={() => handleImageClick(productData?.transferLetter || "")} className="text-blue-600 underline">
                  View Transfer Letter
                </button>
              ) : (
                <span className="text-gray-500">No Transfer Letter</span>
              )}
            </div>
          </div>
          {/* Product Edit/Save Button */}
          <div className="text-center">
            {isEditing ? (
              <button
                onClick={handleSaveChanges}
                className="text-white bg-green-600 px-6 py-2 rounded shadow hover:bg-green-700"
              >
                Save Changes
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

        {/* Invoice Details Section (Read-Only) */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h3 className="text-xl font-medium text-gray-700 mb-4">Invoice Details</h3>
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
              <span>{invoice.PODate || "-"}</span>
            </div>
            <div>
              <label className="font-semibold">Invoice Date: </label>
              <span>{invoice.invoiceDate}</span>
            </div>
            <div>
              <label className="font-semibold">Invoice Image: </label>
              {invoice.invoiceImage ? (
                <button onClick={() => handleImageClick(invoice.invoiceImage)} className="text-blue-600 underline">
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
