import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchMetadata } from "../utils";
import InvoiceCard from "../components/InvoiceCard";
import ProductCard from "../components/ProductCard";
import { Product } from "../types";

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
    Status: "",
    remark: "",
    price: 0,
    productImage: "",
    locationRangeMappings: [],
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
  const [newLocation, setNewLocation] = useState({ locationName: "", staffIncharge: "" });
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

    if (["pageNo", "volNo", "serialNo", "quantity"].includes(field)) {
      // Use the product's quantity instead of the overall products array length.
      const qty = updatedProducts[index].quantity || 1; // fallback to 1 if quantity is falsy
      updatedProducts[index].productVolPageSerial =
        `${updatedProducts[index].pageNo}-${updatedProducts[index].volNo}-[${index + 1}/${qty}]`;
    }
    console.log("Updated : ", updatedProducts);
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
        body: JSON.stringify(newLocation),
      });
      if (!res.ok) {
        throw new Error(`Error adding location: ${res.statusText}`);
      }
      setLocations([...locations, newLocation.locationName]);
      toast.success("Location added successfully!");
      setNewLocation({ locationName: "", staffIncharge: "" });
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
        // Fetch Budget data
        const budgetRes = await fetch(baseUrl + "/funds", {
          headers: fetchedHeaders,
        });

        // Check if the response is OK (status 200)
        if (!budgetRes.ok) {
          throw new Error(`Error fetching Budgets: ${budgetRes.statusText}`);
        }
        // Parse the response as JSON
        const budgetData = await budgetRes.json();
        const parsedBudgets = budgetData.budgets.map(
          (budget: any) => budget.budgetName
        );
        setBudgets(parsedBudgets);


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

    if (invoiceDetails.budgetName === "") {
      toast.error("Budget Name is required");
      setLoading(false);
      return;
    }

    const budgetData = await fetchMetadata(baseUrl, "funds/search", invoiceDetails.budgetName);
    if (!budgetData) {
      toast.error("Budget not found");
      setLoading(false);
      return;
    }

    const parsedInvoiceData = {
      ...invoiceDetails,
      totalAmount: invoiceDetails.totalAmount.toString(),
      budgetId: budgetData.budgets[0].budgetId,
    };

    // Helper function to parse a range string (e.g., "1-5,7,9-10") into an array of numbers.
    const parseRange = (rangeStr: string): number[] => {
      const result: number[] = [];
      const parts = rangeStr.split(",").map((part) => part.trim());
      parts.forEach((part) => {
        if (part.includes("-")) {
          const [startStr, endStr] = part.split("-").map((s) => s.trim());
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          for (let i = start; i <= end; i++) {
            result.push(i);
          }
        } else {
          const num = parseInt(part, 10);
          if (!isNaN(num)) result.push(num);
        }
      });
      return result;
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
        setLoading(false);
        return;
      }

      const { invoice } = await invoiceRes.json();
      const invoiceId = invoice.invoiceId;
      console.log("Invoice added successfully, ID:", invoiceId);

      // Process each product
      products.forEach(async (product, index) => {
        // Get common metadata for status and category
        const [statusData, categoryData] = await Promise.all([
          fetchMetadata(baseUrl, "stock/status/search", product.Status),
          fetchMetadata(baseUrl, "stock/category/search", product.category),
        ]);

        // Ensure we have locationRangeMappings for this product
        if (!product.locationRangeMappings || product.locationRangeMappings.length === 0) {
          toast.error(`No location range mapping provided for product: ${product.productName}`);
          setLoading(false);
          return;
        }

        // Process each location range mapping
        for (const mapping of product.locationRangeMappings) {
          // Lookup location metadata for the mapping's selected location
          const locationData = await fetchMetadata(baseUrl, "stock/location/search", mapping.location);

          // Parse the mapping range (e.g., "1-5,7") into individual unit numbers
          const unitNumbers = parseRange(mapping.range);
          if (unitNumbers.length === 0) {
            toast.error(`Invalid range provided for product: ${product.productName}`);
            setLoading(false);
            return;
          }

          // Prepare common product data for insertion
          const productData = {
            productVolPageSerial: `${product.productVolPageSerial}-[${index + 1}/${products.length}]`,
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

          // For each unit specified in the range, add an individual product record
          const productAddRequests = unitNumbers.map(() =>
            fetch(`${baseUrl}/stock/add`, {
              method: "POST",
              headers: fetchedHeaders,
              body: JSON.stringify(productData),
            }).then((res) =>
              res.ok ? res.json() : Promise.reject("Failed to add product")
            )
          );

          // Execute all insertions for this mapping and handle errors
          await Promise.all(productAddRequests).catch((err) => {
            console.error(err);
            toast.error("Failed to add one or more products");
            throw err; // Stop processing further on error
          });
        }
      });

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
        budgetName: "",
      });

      setProducts([]);
    } catch (err) {
      console.error("Transaction failed:", err);
      toast.error("An error occurred while processing the request.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (index: number) => {
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

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md my-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Products</h2>
        <div>
          {/* Invoice Details Section */}
          <InvoiceCard handleInvoiceChange={handleInvoiceChange} invoiceDetails={invoiceDetails} budgets={budgets} />

          {/* Products Section */}
          {products.map((product, index) => (
            <ProductCard
              key={index}
              index={index}
              product={product}
              categories={categories}
              locations={locations}
              Statuses={Statuses}
              newCategory={newCategory}
              newLocation={newLocation}
              newStatus={newStatus}
              handleProductChange={handleProductChange}
              addNewCategory={addNewCategory}
              addNewLocation={addNewLocation}
              addNewStatus={addNewStatus}
              setNewCategory={setNewCategory}
              setNewLocation={setNewLocation}
              setNewStatus={setNewStatus}
              handleClose={handleClose}
            />
          ))}

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