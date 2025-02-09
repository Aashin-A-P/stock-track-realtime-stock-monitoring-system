import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Product {
  pageNo: string;
  volNo: string;
  serialNo: string;
  productVolPageSerial: string;
  productName: string;
  productDescription: string;
  category: string;
  quantity: number;
  gstAmount: number;
  location: string;
  Status: string;
  transferLetter?: string;
  remark: string;
  price: number;
  productImage?: string;
}

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

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
    gstAmount: 0,
    location: "",
    Status: "",
    remark: "",
    price: 0,
    productImage: "",
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
  });

  const [newLocation, setNewLocation] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  // create two ref for checking the equality of the invoice total price and product total price
  const invoiceTotalPrice = invoiceDetails.totalAmount;
  const productTotalPrice = products.reduce((acc, product) => acc + (product.price + product.gstAmount) * product.quantity, 0);
  const isEquals = invoiceTotalPrice === productTotalPrice;

  const handleProductChange = (index: number, field: string, value: any) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
    };

    // Auto-calculate total price when any related field changes
    if (["price", "gstAmount", "quantity"].includes(field)) {
      const price = parseFloat(updatedProducts[index].price.toString()) || 0;
      const gst = parseFloat(updatedProducts[index].gstAmount.toString()) || 0;
      const qty = parseInt(updatedProducts[index].quantity.toString(), 10) || 0;
      updatedProducts[index].price = price;
      updatedProducts[index].gstAmount = gst;
      updatedProducts[index].quantity = qty;
    }

    if (["pageNo", "volNo", "serialNo"].includes(field)) {
      updatedProducts[index].productVolPageSerial =
        `${updatedProducts[index].volNo}-${updatedProducts[index].pageNo}-${updatedProducts[index].serialNo}`;
    }

    setProducts(updatedProducts);
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const fetchedHeaders = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token") || "",
  };

  const addNewLocation = async () => {
    try {
      const res = await fetch(baseUrl + "/stock/location/add", {
        method: "POST",
        headers: fetchedHeaders,
        body: JSON.stringify({ locationName: newLocation }),
      });
      if (!res.ok) {
        throw new Error(`Error adding location: ${res.statusText}`);
      }
      setLocations([...locations, newLocation]);
      toast.success("Location added successfully!");
      setProducts(
        products.map((product) =>
          product.location === "other"
            ? { ...product, location: newLocation }
            : product
        )
      );
      setNewLocation("");
    } catch (error) {
      toast.error("Failed to add location");
      console.error("Failed to add location:", error);
    }
  };

  const addNewStatus = async () => {
    try {
      console.log("Adding new status:", newStatus);
      const res = await fetch(baseUrl + "/stock/status/add", {
        method: "POST",
        headers: fetchedHeaders,
        body: JSON.stringify({ statusDescription: newStatus }),
      });
      if (!res.ok) {
        throw new Error(`Error adding status: ${res.statusText}`);
      }
      setStatuses([...Statuses, newStatus]);
      toast.success("Status added successfully!");
      setProducts(
        products.map((product) =>
          product.Status === "other"
            ? { ...product, Status: newStatus }
            : product
        )
      );
      setNewStatus("");
    } catch (error) {
      toast.error("Failed to add status");
      console.error("Failed to add status:", error);
    }
  };

  const addNewCategory = async () => {
    try {
      const res = await fetch(baseUrl + "/stock/category/add", {
        method: "POST",
        headers: fetchedHeaders,
        body: JSON.stringify({ categoryName: newCategory }),
      });
      if (!res.ok) {
        throw new Error(`Error adding category: ${res.statusText}`);
      }
      setCategories([...categories, newCategory]);
      toast.success("Category added successfully!");
      setProducts(
        products.map((product) =>
          product.category === "other"
            ? { ...product, category: newCategory }
            : product
        )
      );
      setNewCategory("");
    } catch (error) {
      toast.error("Failed to add category");
      console.error("Failed to add category:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch location data
        const locationRes = await fetch(baseUrl + "/stock/locations", {
          headers: fetchedHeaders,
        });
        // Check if the response is OK (status 200)
        if (!locationRes.ok) {
          throw new Error(
            `Error fetching locations: ${locationRes.statusText}`
          );
        }
        // Parse the response as JSON
        const locationData = await locationRes.json();
        const parsedLocations = locationData.locations.map(
          (loc: any) => loc.locationName
        );
        setLocations(parsedLocations);

        // Fetch Statuses data
        const statusRes = await fetch(baseUrl + "/stock/status", {
          headers: fetchedHeaders,
        });
        // Check if the response is OK (status 200)
        if (!statusRes.ok) {
          throw new Error(`Error fetching Statuses: ${statusRes.statusText}`);
        }
        // Parse the response as JSON
        const statusData: { statuses: { statusId: number, statusDescription: string }[] } = await statusRes.json();
        const parsedStatuss = statusData.statuses.map((rem) => rem.statusDescription);
        setStatuses(parsedStatuss);

        // Fetch category data
        const categoryRes = await fetch(baseUrl + "/stock/category", {
          headers: fetchedHeaders,
        });
        // Check if the response is OK (status 200)
        if (!categoryRes.ok) {
          throw new Error(`Error fetching category: ${categoryRes.statusText}`);
        }
        // Parse the response as JSON
        const categoryData: { categories: { categoryId: number, categoryName: string }[] } = await categoryRes.json();
        const parsedCategories = categoryData.categories.map(
          (cat) => cat.categoryName
        );
        setCategories(parsedCategories);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Optionally, show some UI feedback to the user (like a message)
      }
    };

    fetchData();
  }, []);

  const handleInvoiceChange = (field: string, value: any) => {
    setInvoiceDetails({ ...invoiceDetails, [field]: value });
  };

  const uploadImageAndGetURL = async (
    file: File,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", file); // Append the file to FormData
    console.log("Form Data : ", formData);
    try {
      const res = await fetch(baseUrl + "/upload", {
        method: "POST",
        headers: { Authorization: localStorage.getItem("token") as string, multipart: "form-data" },
        body: formData, // Pass FormData as body
      });

      // If the response is not ok, throw an error
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error uploading image");
      }

      // Parse response JSON
      const details = await res.json();
      // console.log("Image uploaded successfully:", details);
      const imageUrl = details.imageUrl;
      // console.log("Image URL:", imageUrl);

      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error; // Rethrow the error or handle it appropriately
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate invoice number
    if (!invoiceDetails.invoiceNo.trim()) {
      toast.error("Invoice Number is required");
      setLoading(false);
      return;
    }
    // Validate date order
    if (invoiceDetails.PODate && invoiceDetails.invoiceDate) {
      const poDate = new Date(invoiceDetails.PODate);
      const invDate = new Date(invoiceDetails.invoiceDate);
      if (poDate > invDate) {
        toast.error("Purchase Order Date must be before Invoice Date");
        setLoading(false);
        return;
      }
    }

    // Validate total amount calculation
    const calculatedTotal = products.reduce((acc, product) => {
      return acc + (product.price + product.gstAmount) * product.quantity;
    }, 0);

    if (Math.abs(calculatedTotal - invoiceDetails.totalAmount) > 0.01) {
      toast.error("Invoice amount doesn't match product totals");
      setLoading(false);
      return;
    }

    const parsedInvoiceData = {
      ...invoiceDetails,
      totalAmount: invoiceDetails.totalAmount.toString(),
    };

    try {
      // Add invoice details to the backend
      const invoiceRes = await fetch(`${baseUrl}/stock/invoice/add`, {
        method: "POST",
        headers: fetchedHeaders,
        body: JSON.stringify(parsedInvoiceData),
      });

      if (!invoiceRes.ok) {
        const errorData = await invoiceRes.json();
        console.error("Error adding invoice:", errorData);
        toast.error("Failed to add invoice");
        return;
      }

      const { invoice } = await invoiceRes.json();
      const invoiceId = invoice.invoiceId;
      console.log("Invoice added successfully, ID:", invoiceId);

      // Fetch data for locations, Statuses, and categories in parallel
      const fetchMetadata = async (endpoint: string, key: string) =>
        await fetch(`${baseUrl}/${endpoint}?query=${key}`, {
          headers: { Authorization: localStorage.getItem("token") as string },
        }).then((res) =>
          res.ok
            ? res.json()
            : Promise.reject(`Error fetching ${endpoint}: ${key}`)
        );

      // Process all products
      for (const product of products) {
        const [locationData, statusData, categoryData] = await Promise.all([
          fetchMetadata("stock/location/search", product.location),
          fetchMetadata("stock/status/search", product.Status),
          fetchMetadata("stock/category/search", product.category),
        ]);

        const productData = {
          productVolPageSerial: product.productVolPageSerial,
          productName: product.productName,
          productDescription: product.productDescription,
          locationId: locationData.locationId,
          statusId: statusData.statusId,
          productImage: product.productImage,
          invoiceId,
          categoryId: categoryData.categoryId,
          productPrice: product.price,
          gstAmount: product.gstAmount,
          remarks: product.remark,
          PODate: invoiceDetails.PODate,
          invoice_no: invoiceDetails.invoiceNo,
          transferLetter: product.transferLetter,
        };

        // Add products based on their quantity
        const productAddRequests = Array.from(
          { length: product.quantity },
          () =>
            fetch(`${baseUrl}/stock/add`, {
              method: "POST",
              headers: fetchedHeaders,
              body: JSON.stringify(productData),
            }).then((res) =>
              res.ok ? res.json() : Promise.reject("Failed to add product")
            )
        );

        // Execute all product addition requests and handle errors
        await Promise.all(productAddRequests).catch((err) => {
          console.error(err);
          toast.error("Failed to add one or more products");
          throw err; // Stop processing further on error
        });
      }

      // Success message
      toast.success("Products and invoice added successfully!");

      // Reset invoice and products state
      setInvoiceDetails({
        invoiceNo: "",
        invoiceDate: "",
        PODate: "",
        totalAmount: 0,
        fromAddress: "",
        toAddress: "",
        invoiceImage: "",
      });

      setProducts([]);
    } catch (err) {
      console.error("Transaction failed:", err);
      toast.error("An error occurred while processing the request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md my-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Products</h2>
        <div>
          {/* Invoice Details Section */}
          <div className="bg-white p-4 mb-6 rounded shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Invoice Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Invoice Number"
                title="Unique identifier for the invoice (required)"
                value={invoiceDetails.invoiceNo}
                onChange={(e) => handleInvoiceChange("invoiceNo", e.target.value)}
                className="p-2 border rounded"
                required
              />
              <input
                type="date"
                placeholder="Purchase Order Date"
                title="Date of the purchase order (must be before invoice date)"
                value={invoiceDetails.PODate}
                max={invoiceDetails.invoiceDate}
                onChange={(e) => handleInvoiceChange("PODate", e.target.value)}
                className="p-2 border rounded"
              />
              <textarea
                placeholder="From Address"
                value={invoiceDetails.fromAddress}
                onChange={(e) =>
                  handleInvoiceChange("fromAddress", e.target.value)
                }
                className="p-2 border rounded col-span-2"
              />
              <textarea
                placeholder="To Address"
                value={invoiceDetails.toAddress}
                onChange={(e) =>
                  handleInvoiceChange("toAddress", e.target.value)
                }
                className="p-2 border rounded col-span-2"
              />
              <input
                type="number"
                placeholder="Total Amount"
                value={invoiceDetails.totalAmount || ""}
                onChange={(e) =>
                  handleInvoiceChange(
                    "totalAmount",
                    parseFloat(e.target.value)
                  )
                }
                className="p-2 border rounded"
              />
              <input
                placeholder="Invoice Image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadImageAndGetURL(file, e).then((url) => {
                      handleInvoiceChange("invoiceImage", url);
                    });
                  }
                }}
                className="hidden" // hide file input (default style)
                id="invoiceImageInput"
              />
              <input
                type="date"
                placeholder="Invoice Date"
                title="Date of the invoice (must be after purchase order date)"
                value={invoiceDetails.invoiceDate}
                min={invoiceDetails.PODate}
                onChange={(e) => handleInvoiceChange("invoiceDate", e.target.value)}
                className="p-2 border rounded"
              />
              <label
                htmlFor="invoiceImageInput"
                className={
                  `p-2 border rounded bg-blue-600 col-span-2 text-white cursor-pointer inline-block text-center hover:bg-blue-700 transition-all duration-200` +
                  (invoiceDetails.invoiceImage ? " bg-green-500 hover:bg-green-700" : "")
                }
              >
                {invoiceDetails.invoiceImage
                  ? "Invoice Image Uploaded"
                  : "Choose Invoice Image"}{" "}
              </label>

            </div>
          </div>

          {/* Products Section */}
          {products.map((product, index) => (
            <div key={index} className="bg-white p-4 mb-4 rounded shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2 flex">
                Product {index + 1}
                <span
                  className="bg-red-500 text-white cursor-pointer ml-auto px-2 rounded"
                  onClick={() =>
                    // confirmation
                    confirmAlert({
                      title: "Confirm to delete",
                      message: "Are you sure you want to delete this product?",
                      buttons: [
                        {
                          label: "Yes",
                          onClick: () =>
                            setProducts(products.filter((_, i) => i !== index)),
                        },
                        {
                          label: "No",
                          onClick: () => { },
                        },
                      ],
                    })
                  }
                >
                  {" "}
                  X
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Vol No"
                  value={product.volNo}
                  onChange={(e) =>
                    handleProductChange(index, "volNo", e.target.value)
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Page No"
                  value={product.pageNo}
                  onChange={(e) =>
                    handleProductChange(index, "pageNo", e.target.value)
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Serial No"
                  value={product.serialNo}
                  onChange={(e) =>
                    handleProductChange(index, "serialNo", e.target.value)
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Product Name"
                  value={product.productName}
                  onChange={(e) =>
                    handleProductChange(index, "productName", e.target.value)
                  }
                  className="p-2 border rounded"
                />
                <textarea
                  placeholder="Description"
                  value={product.productDescription}
                  onChange={(e) =>
                    handleProductChange(
                      index,
                      "productDescription",
                      e.target.value
                    )
                  }
                  className="p-2 border rounded col-span-2"
                />
                <select
                  aria-label="Category"
                  value={product.category}
                  onChange={(e) =>
                    handleProductChange(index, "category", e.target.value)
                  }
                  className={
                    `p-2 border rounded` +
                    (product.category === "other"
                      ? " col-span-1"
                      : " col-span-2")
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((catg, catgIndex) => (
                    <option key={catgIndex} value={catg}>
                      {catg}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {product.category === "other" && (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="New Category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="p-2 border rounded flex-1"
                    />
                    <button
                      type="button"
                      onClick={addNewCategory}
                      className="bg-blue-700 text-white px-4 py-2 rounded shadow ml-2"
                    >
                      Add Category
                    </button>
                  </div>
                )}
                <select
                  aria-label="Location"
                  value={product.location}
                  onChange={(e) =>
                    handleProductChange(index, "location", e.target.value)
                  }
                  className={
                    `p-2 border rounded` +
                    (product.location == "other"
                      ? " col-span-1"
                      : " col-span-2")
                  }
                >
                  <option value="">Select Location</option>
                  {locations.map((loc, locIndex) => (
                    <option key={locIndex} value={loc}>
                      {loc}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {product.location === "other" && (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="New Location"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="p-2 border rounded flex-1"
                    />
                    <button
                      type="button"
                      onClick={addNewLocation}
                      className="bg-blue-700 text-white px-4 py-2 rounded shadow ml-2"
                    >
                      Add Location
                    </button>
                  </div>
                )}
                <select
                  aria-label="Status"
                  value={product.Status}
                  onChange={(e) =>
                    handleProductChange(index, "Status", e.target.value)
                  }
                  className={
                    `p-2 border rounded` +
                    (product.Status == "other" ? " col-span-1" : " col-span-2")
                  }
                >
                  <option value="">Select Status</option>
                  {Statuses.map((rem, remIndex) => (
                    <option key={remIndex} value={rem}>
                      {rem}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {product.Status === "other" && (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="New Status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="p-2 border rounded flex-1"
                    />
                    <button
                      type="button"
                      onClick={addNewStatus}
                      className="bg-blue-700 text-white px-4 py-2 rounded shadow ml-2"
                    >
                      Add Status
                    </button>
                  </div>
                )}
                <input
                  type="number"
                  placeholder="Price"
                  title="Price per unit before tax"
                  value={product.price || ""}
                  onChange={(e) => handleProductChange(index, "price", parseFloat(e.target.value))}
                  className="p-2 border rounded"
                />

                <input
                  type="number"
                  placeholder="GST Amount"
                  title="GST amount per unit"
                  value={product.gstAmount || ""}
                  onChange={(e) => handleProductChange(index, "gstAmount", parseFloat(e.target.value))}
                  className="p-2 border rounded"
                />

                <input
                  type="number"
                  placeholder="Quantity"
                  title="Number of units"
                  value={product.quantity || ""}
                  onChange={(e) => handleProductChange(index, "quantity", parseInt(e.target.value, 10))}
                  className="p-2 border rounded"
                />

                <input
                  type="number"
                  placeholder="Total Price"
                  title="Calculated total (Price + GST) × Quantity"
                  value={(product.quantity * (product.price + product.gstAmount)) || ""}
                  className="p-2 border rounded bg-gray-100"
                  readOnly
                />
                <input
                  placeholder="Product Image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadImageAndGetURL(file, e).then((url) => {
                        handleProductChange(index, "productImage", url);
                      });
                    }
                  }}
                  className="hidden" // hide file input (default style)
                  id="productImageInput"
                />
                <label
                  htmlFor="productImageInput"
                  className={
                    `p-2 border rounded col-span-2 bg-blue-600 text-white cursor-pointer inline-block text-center hover:bg-blue-700 transition-all duration-200` +
                    (products[index].productImage ? " bg-green-500 hover:bg-green-700" : "")
                  }
                >
                  {products[index].productImage
                    ? "Product Image Uploaded"
                    : "Choose Product Image"}{" "}
                </label>
                <input
                  placeholder="Transfer Letter"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadImageAndGetURL(file, e).then((url) => {
                        handleProductChange(index, "transferLetter", url);
                      });
                    }
                  }}
                  className="hidden" // hide file input (default style)
                  id="transferLetterInput"
                />
                <label
                  htmlFor="transferLetterInput"
                  className={
                    `p-2 border rounded col-span-2 bg-blue-600 text-white cursor-pointer inline-block text-center hover:bg-blue-700 transition-all duration-200` +
                    (products[index].transferLetter ? " bg-green-500 hover:bg-green-700" : "")
                  }
                >
                  {products[index].transferLetter
                    ? "Transfer Letter Uploaded"
                    : "Choose Transfer Letter"}{" "}
                </label>
              </div>
            </div>))}

          {/* Submit Section */}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={() => setProducts([...products, defaultProduct])}
              className="bg-gray-700 text-white px-4 py-2 rounded shadow hover:bg-black transition-all duration-200"
              title="Add another product to this invoice"
            >
              Add Product
            </button>

            <div className="p-2 rounded-lg shadow-md text-gray-800 font-semibold">
              Invoice Total Amount: ₹{invoiceTotalPrice.toFixed(2)}
            </div>
            <div className={`p-2 rounded-lg shadow-md text-white font-semibold ${isEquals ? " bg-green-700" : " bg-red-700"}`} >
              Total Products Price: ₹
              {productTotalPrice.toFixed(2)} {isEquals ? " ✅" : " ❌"}
            </div>

            <button
              type="submit"
              className={`bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-all duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              onClick={handleSubmit}
              title="Submit the entire invoice with all products"
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit Invoice"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;