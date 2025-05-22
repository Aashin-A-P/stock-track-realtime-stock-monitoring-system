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
import { Product, RangeMapping } from "../types";

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

  const handleProductChange = (index: number, field: string, value: string|number|RangeMapping[]) => {
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
          (budget: {budgetName: string}) => budget.budgetName
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
          (loc: {locationName: string}) => loc.locationName
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

  const handleInvoiceChange = (field: string, value: string|number) => {
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
    const calculatedTotal = products.reduce((acc: number, product: Product) => {
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

    if (products.length === 0) {
      toast.error("Please add at least one product.");
      setLoading(false);
      return;
    }

    for (const product of products) {
      if (!product.productName.trim()) {
        toast.error("Product name is required for all products.");
        setLoading(false);
        return;
      }
      if (!product.volNo.trim()) {
        toast.error(
          `Volume Number is required for product: ${product.productName}`
        );
        setLoading(false);
        return;
      }
      if (!product.pageNo.trim()) {
        toast.error(
          `Page Number is required for product: ${product.productName}`
        );
        setLoading(false);
        return;
      }
      if (!product.category) {
        toast.error(`Category is required for product: ${product.productName}`);
        setLoading(false);
        return;
      }
      if (!product.Status) {
        // Assuming 'Status' maps to a status description
        toast.error(`Status is required for product: ${product.productName}`);
        setLoading(false);
        return;
      }
      if (
        !product.locationRangeMappings ||
        product.locationRangeMappings.length === 0
      ) {
        toast.error(
          `At least one location and serial range mapping is required for product: ${product.productName}`
        );
        setLoading(false);
        return;
      }
      for (const mapping of product.locationRangeMappings) {
        if (!mapping.location) {
          toast.error(
            `Location is required for all range mappings in product: ${product.productName}`
          );
          setLoading(false);
          return;
        }
        if (!mapping.range.trim()) {
          toast.error(
            `Serial range is required for all range mappings in product: ${product.productName}`
          );
          setLoading(false);
          return;
        }
        const unitNumbers = parseRange(mapping.range);
        if (unitNumbers.length === 0) {
          toast.error(
            `Invalid or empty serial range provided for product: ${product.productName} in location ${mapping.location}`
          );
          setLoading(false);
          return;
        }
      }
    }

    try {
      const budgetMeta = await fetchMetadata(
        baseUrl,
        "funds/search",
        invoiceDetails.budgetName
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

      const parsedInvoiceData = {
        ...invoiceDetails,
        totalAmount: invoiceDetails.totalAmount.toString(), // Keep as string if backend expects
        budgetId: budgetId,
      };

      const invoiceRes = await fetch(`${baseUrl}/stock/invoice/add`, {
        method: "POST",
        headers: fetchedHeaders,
        body: JSON.stringify(parsedInvoiceData),
      });

      if (!invoiceRes.ok) {
        const errorData = await invoiceRes.text();
        console.error("Error adding invoice:", errorData);
        toast.error(`Failed to add invoice: ${errorData}`);
        setLoading(false);
        return;
      }

      const { invoice } = await invoiceRes.json();
      const invoiceId = invoice.invoiceId;
      console.log("Invoice added successfully, ID:", invoiceId);

      for (const product of products) {
        const [statusMeta, categoryMeta] = await Promise.all([
          fetchMetadata(baseUrl, "stock/status/search", product.Status),
          fetchMetadata(baseUrl, "stock/category/search", product.category),
        ]);

        if (!statusMeta || !statusMeta.statusId) {
          toast.error(`Status metadata not found for: ${product.Status}`);
          throw new Error(`Status metadata not found for: ${product.Status}`);
        }
        if (!categoryMeta || !categoryMeta.categoryId) {
          toast.error(`Category metadata not found for: ${product.category}`);
          throw new Error(
            `Category metadata not found for: ${product.category}`
          );
        }

        for (const mapping of product.locationRangeMappings!) {
          const locationMeta = await fetchMetadata(
            baseUrl,
            "stock/location/search",
            mapping.location
          );
          if (!locationMeta || !locationMeta.locationId) {
            toast.error(`Location metadata not found for: ${mapping.location}`);
            throw new Error(
              `Location metadata not found for: ${mapping.location}`
            );
          }

          const unitNumbers = parseRange(mapping.range);
          const productAddPromises = unitNumbers.map(async (unitNo) => {
            const individualProductVolPageSerial = `${product.volNo}-${product.pageNo}-${unitNo}`;

            const singleProductData = {
              productVolPageSerial: individualProductVolPageSerial,
              productName: product.productName,
              productDescription: product.productDescription,
              locationId: locationMeta.locationId,
              statusId: statusMeta.statusId,
              gstAmount: product.gstAmount, // Number
              productImage: product.productImage,
              invoiceId: invoiceId, // Number
              categoryId: categoryMeta.categoryId, // Number
              productPrice: product.price, // Number
              transferLetter: product.transferLetter,
              remarks: product.remark,
              budgetId: budgetId, // Number
            };
            console.log(
              `Submitting product unit: ${individualProductVolPageSerial}`,
              singleProductData
            );

            const res = await fetch(`${baseUrl}/stock/add`, {
              method: "POST",
              headers: fetchedHeaders,
              body: JSON.stringify(singleProductData),
            });

            if (!res.ok) {
              const errorText = await res.text();
              console.error(
                `Failed to add product unit ${individualProductVolPageSerial}. Status: ${res.status}. Body: ${errorText}`
              );
              toast.error(
                `Error for ${individualProductVolPageSerial}: ${errorText.substring(
                  0,
                  100
                )}`
              ); // Show snippet of error
              throw new Error( // This error will be caught by Promise.all
                `Failed to add product unit ${individualProductVolPageSerial}: ${errorText}`
              );
            }
            return res.json();
          });
          await Promise.all(productAddPromises); // Wait for all units in this mapping
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
      setProducts([]); // Add defaultProduct if you want one to remain
      // setProducts([defaultProduct]);
    } catch (err) {
      console.error("Transaction failed overall:", err);
      // Error already toasted by specific failing parts, or add a generic one
      if (
        err instanceof Error &&
        !err.message.startsWith("Failed to add product unit")
      ) {
        toast.error("An error occurred: " + err.message);
      }
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
          for (let i = start; i <= end; i++) {
            result.push(i);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num)) result.push(num);
      }
    });
    return result;
  };

  const handleClose = (index: number) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this product?",
      buttons: [
        {
          label: "Yes",
          onClick: () =>
            setProducts(products.filter((_, i: number) => i !== index)),
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