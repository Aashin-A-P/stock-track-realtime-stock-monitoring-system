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
  location: string;
  remarks: string;
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
    category: "",
    quantity: 0,
    location: "",
    remarks: "",
    price: 0,
    productImage: "",
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [remarks, setRemarks] = useState<string[]>([]);
  const [invoiceDetails, setInvoiceDetails] = useState({
    // invoiceNumber: "",
    invoiceDate: "",
    // vendorName: "",
    gstAmount: 0,
    actualAmount: 0,
    fromAddress: "",
    toAddress: "",
    invoiceImage: "",
  });

  const [newLocation, setNewLocation] = useState("");
  const [newRemark, setNewRemark] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleProductChange = (index: number, field: string, value: any) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
    };
    if (["pageNo", "volNo", "serialNo"].includes(field)) {
      updatedProducts[
        index
      ].productVolPageSerial = `${updatedProducts[index].volNo}-${updatedProducts[index].pageNo}-${updatedProducts[index].serialNo}`;
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

  const addNewRemark = async () => {
    try {
      const res = await fetch(baseUrl + "/stock/remark/add", {
        method: "POST",
        headers: fetchedHeaders,
        body: JSON.stringify({ remark: newRemark }),
      });
      if (!res.ok) {
        throw new Error(`Error adding remark: ${res.statusText}`);
      }
      setRemarks([...remarks, newRemark]);
      toast.success("Remark added successfully!");
      setProducts(
        products.map((product) =>
          product.remarks === "other"
            ? { ...product, remarks: newRemark }
            : product
        )
      );
      setNewRemark("");
    } catch (error) {
      toast.error("Failed to add remark");
      console.error("Failed to add remark:", error);
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

        // Fetch remarks data
        const remarkRes = await fetch(baseUrl + "/stock/remark", {
          headers: fetchedHeaders,
        });
        // Check if the response is OK (status 200)
        if (!remarkRes.ok) {
          throw new Error(`Error fetching remarks: ${remarkRes.statusText}`);
        }
        // Parse the response as JSON
        const remarkData = await remarkRes.json();
        const parsedRemarks = remarkData.remarks.map((rem: any) => rem.remark);
        setRemarks(parsedRemarks);

        // Fetch category data
        const categoryRes = await fetch(baseUrl + "/stock/category", {
          headers: fetchedHeaders,
        });
        // Check if the response is OK (status 200)
        if (!categoryRes.ok) {
          throw new Error(`Error fetching category: ${categoryRes.statusText}`);
        }
        // Parse the response as JSON
        const categoryData = await categoryRes.json();
        const parsedCategories = categoryData.categories.map(
          (catg: any) => catg.categoryName
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

    try {
      const res = await fetch(baseUrl + "/upload", {
        method: "POST",
        headers: { Authorization: localStorage.getItem("token") as string },
        body: formData, // Pass FormData as body
      });

      // If the response is not ok, throw an error
      if (!res.ok) {
        const errorData = await res.json();
        console.log("Error uploading image:", errorData);
        throw new Error(errorData.error || "Error uploading image");
      }

      // Parse response JSON
      const details = await res.json();
      console.log("Image uploaded successfully:", details);
      const imageUrl = details.imageUrl;
      console.log("Image URL:", imageUrl);

      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error; // Rethrow the error or handle it appropriately
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const parsedInvoiceData = {
      ...invoiceDetails,
      gstAmount: invoiceDetails.gstAmount.toString(),
      actualAmount: invoiceDetails.actualAmount.toString(),
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

      // Fetch data for locations, remarks, and categories in parallel
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
        const [locationData, remarkData, categoryData] = await Promise.all([
          fetchMetadata("stock/location/search", product.location),
          fetchMetadata("stock/remark/search", product.remarks),
          fetchMetadata("stock/category/search", product.category),
        ]);

        const productData = {
          productVolPageSerial: product.productVolPageSerial,
          productName: product.productName,
          productDescription: product.productDescription,
          locationId: locationData.locationId,
          remarkId: remarkData.remarkId,
          gst: invoiceDetails.gstAmount,
          productImage: product.productImage,
          invoiceId,
          categoryId: categoryData.categoryId,
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
        invoiceDate: "",
        gstAmount: 0,
        actualAmount: 0,
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
              {/* <input
                type="text"
                placeholder="Invoice Number"
                value={invoiceDetails.invoiceNumber}
                onChange={(e) =>
                  handleInvoiceChange("invoiceNumber", e.target.value)
                }
                className="p-2 border rounded"
              /> */}
              {/* <input
                type="text"
                placeholder="Vendor Name"
                value={invoiceDetails.vendorName}
                onChange={(e) =>
                  handleInvoiceChange("vendorName", e.target.value)
                }
                className="p-2 border rounded col-span-2"
              /> */}
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
                placeholder="Tax Amount"
                value={invoiceDetails.gstAmount || ""}
                onChange={(e) =>
                  handleInvoiceChange("gstAmount", parseFloat(e.target.value))
                }
                className="p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Total Amount"
                value={invoiceDetails.actualAmount || ""}
                onChange={(e) =>
                  handleInvoiceChange(
                    "actualAmount",
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

              <label
                htmlFor="invoiceImageInput"
                className={
                  `p-2 border rounded bg-blue-600 text-white cursor-pointer inline-block text-center hover:bg-blue-700 transition-all duration-200` +
                  (invoiceDetails.invoiceImage ? " bg-green-500" : "")
                }
              >
                {invoiceDetails.invoiceImage
                  ? "Invoice Image Uploaded"
                  : "Choose Invoice Image"}{" "}
              </label>

              <input
                type="date"
                placeholder="Invoice Date"
                value={invoiceDetails.invoiceDate}
                onChange={(e) =>
                  handleInvoiceChange("invoiceDate", e.target.value)
                }
                className="p-2 border rounded"
              />
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
                      title: 'Confirm to delete',
                      message: 'Are you sure you want to delete this product?',
                      buttons: [
                        {
                          label: 'Yes',
                          onClick: () => setProducts(products.filter((_, i) => i !== index))
                        },
                        {
                          label: 'No',
                          onClick: () => {}
                        }
                      ]
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
                  aria-label="Remarks"
                  value={product.remarks}
                  onChange={(e) =>
                    handleProductChange(index, "remarks", e.target.value)
                  }
                  className={
                    `p-2 border rounded` +
                    (product.remarks == "other" ? " col-span-1" : " col-span-2")
                  }
                >
                  <option value="">Select Remarks</option>
                  {remarks.map((rem, remIndex) => (
                    <option key={remIndex} value={rem}>
                      {rem}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {product.remarks === "other" && (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="New Remark"
                      value={newRemark}
                      onChange={(e) => setNewRemark(e.target.value)}
                      className="p-2 border rounded flex-1"
                    />
                    <button
                      type="button"
                      onClick={addNewRemark}
                      className="bg-blue-700 text-white px-4 py-2 rounded shadow ml-2"
                    >
                      Add Remark
                    </button>
                  </div>
                )}
                <input
                  type="number"
                  placeholder="Quantity"
                  value={product.quantity || ""}
                  onChange={(e) =>
                    handleProductChange(
                      index,
                      "quantity",
                      parseInt(e.target.value, 10)
                    )
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={product.price || ""}
                  onChange={(e) =>
                    handleProductChange(
                      index,
                      "price",
                      parseFloat(e.target.value)
                    )
                  }
                  className="p-2 border rounded"
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
                    `p-2 border rounded bg-blue-600 text-white cursor-pointer inline-block text-center hover:bg-blue-700 transition-all duration-200` +
                    (products[index].productImage ? " bg-green-500" : "")
                  }
                >
                  {products[index].productImage
                    ? "Product Image Uploaded"
                    : "Choose Product Image"}{" "}
                </label>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setProducts([...products, defaultProduct])}
              className="bg-gray-700 text-white px-4 py-2 rounded shadow hover:bg-black transition-all duration-200"
            >
              Add Product
            </button>
            <button
              type="button"
              className={`cursor-pointer text-white p-2 rounded-md bg-blue-600 transition-all duration-200 disabled:opacity-50 ${
                loading ? "" : "hover:bg-blue-700"
              }`}
              onClick={handleSubmit}
              disabled={loading}
            >
              Submit Invoice
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
