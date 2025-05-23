import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
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

    // Recalculate gstAmount if price, gstInputType, or gstInputValue changed
    if (["price", "gstInputType", "gstInputValue"].includes(field)) {
      if (productToUpdate.gstInputType === "percentage") {
        productToUpdate.gstAmount =
          (productToUpdate.price * productToUpdate.gstInputValue) / 100;
      } else {
        // 'fixed'
        productToUpdate.gstAmount = productToUpdate.gstInputValue;
      }
    }

    // Update productVolPageSerial (placeholder for batch, individual IDs generated on submit)
    if (
      ["pageNo", "volNo"].includes(field) ||
      (field === "quantity" && productToUpdate.quantity > 0)
    ) {
      productToUpdate.productVolPageSerial = `${
        productToUpdate.volNo || "N/A"
      }-${productToUpdate.pageNo || "N/A"}-[1-${
        productToUpdate.quantity || "N/A"
      }]`;
    }

    updatedProducts[index] = productToUpdate;
    setProducts(updatedProducts);
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const fetchedHeaders = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token") || "",
  };

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
        headers: fetchedHeaders,
        body: JSON.stringify(newLocation),
      });
      if (!res.ok) {
        throw new Error(`Error adding location: ${res.statusText}`);
      }
      const addedLocationName = newLocation.locationName;
      setLocations((prev) => [...prev, addedLocationName].sort());
      toast.success("Location added successfully!");

      // Update the specific product's mapping
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
      setNewLocation({ locationName: "", staffIncharge: "" }); // Reset form
    } catch (error) {
      toast.error("Failed to add location");
      console.error("Failed to add location:", error);
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
        headers: fetchedHeaders,
        body: JSON.stringify({ statusDescription: newStatus }),
      });
      if (!res.ok) {
        throw new Error(`Error adding status: ${res.statusText}`);
      }
      const addedStatus = newStatus;
      setStatuses((prev) => [...prev, addedStatus].sort());
      toast.success("Status added successfully!");

      // Update the specific product's status
      const updatedProducts = products.map((p, idx) =>
        idx === productIndex ? { ...p, Status: addedStatus } : p
      );
      setProducts(updatedProducts);
      setNewStatus(""); // Reset form
    } catch (error) {
      toast.error("Failed to add status");
      console.error("Failed to add status:", error);
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
        headers: fetchedHeaders,
        body: JSON.stringify({ categoryName: newCategory }),
      });
      if (!res.ok) {
        throw new Error(`Error adding category: ${res.statusText}`);
      }
      const addedCategory = newCategory;
      setCategories((prev) => [...prev, addedCategory].sort());
      toast.success("Category added successfully!");

      // Update the specific product's category
      const updatedProducts = products.map((p, idx) =>
        idx === productIndex ? { ...p, category: addedCategory } : p
      );
      setProducts(updatedProducts);
      setNewCategory(""); // Reset form
    } catch (error) {
      toast.error("Failed to add category");
      console.error("Failed to add category:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [budgetRes, locationRes, statusRes, categoryRes] =
          await Promise.all([
            fetch(baseUrl + "/funds", { headers: fetchedHeaders }),
            fetch(baseUrl + "/stock/locations", { headers: fetchedHeaders }),
            fetch(baseUrl + "/stock/status", { headers: fetchedHeaders }),
            fetch(baseUrl + "/stock/category", { headers: fetchedHeaders }),
          ]);

        if (!budgetRes.ok)
          throw new Error(`Error fetching Budgets: ${budgetRes.statusText}`);
        const budgetData = await budgetRes.json();
        setBudgets(
          budgetData.budgets
            .map((b: { budgetName: string }) => b.budgetName)
            .sort()
        );

        if (!locationRes.ok)
          throw new Error(
            `Error fetching locations: ${locationRes.statusText}`
          );
        const locationData = await locationRes.json();
        setLocations(
          locationData.locations
            .map((loc: { locationName: string }) => loc.locationName)
            .sort()
        );

        if (!statusRes.ok)
          throw new Error(`Error fetching Statuses: ${statusRes.statusText}`);
        const statusData: {
          statuses: { statusId: number; statusDescription: string }[];
        } = await statusRes.json();
        setStatuses(
          statusData.statuses.map((rem) => rem.statusDescription).sort()
        );

        if (!categoryRes.ok)
          throw new Error(`Error fetching category: ${categoryRes.statusText}`);
        const categoryData: {
          categories: { categoryId: number; categoryName: string }[];
        } = await categoryRes.json();
        setCategories(
          categoryData.categories.map((cat) => cat.categoryName).sort()
        );
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error("Failed to load essential data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl, token]); // Removed fetchedHeaders from deps as token covers its Authorization part

  const handleInvoiceChange = (field: string, value: string | number) => {
    setInvoiceDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic Validations
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
    if (products.length === 0) {
      toast.error("Please add at least one product.");
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

    // Product specific validations
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
        toast.error(
          `At least one location and serial range mapping is required for ${productLabel}.`
        );
        setLoading(false);
        return;
      }
      // Range validation
      const totalQuantity = product.quantity;
      const assignedNumbers = new Set<number>();
      for (const mapping of product.locationRangeMappings) {
        if (!mapping.location) {
          toast.error(
            `Location is required for all range mappings in ${productLabel}.`
          );
          setLoading(false);
          return;
        }
        if (!mapping.range.trim()) {
          toast.error(
            `Serial range is required for all range mappings in ${productLabel}.`
          );
          setLoading(false);
          return;
        }

        const rangeItems = mapping.range.split(",").map((x) => x.trim());
        for (const item of rangeItems) {
          if (item.includes("-")) {
            const bounds = item.split("-");
            if (bounds.length !== 2) {
              toast.error(`Invalid range format '${item}' in ${productLabel}.`);
              setLoading(false);
              return;
            }
            const start = parseInt(bounds[0], 10);
            const end = parseInt(bounds[1], 10);
            if (
              isNaN(start) ||
              isNaN(end) ||
              start > end ||
              start < 1 ||
              end > totalQuantity
            ) {
              toast.error(
                `Range '${item}' in ${productLabel} is out of bounds (1-${totalQuantity}).`
              );
              setLoading(false);
              return;
            }
            for (let k = start; k <= end; k++) {
              if (assignedNumbers.has(k)) {
                toast.error(
                  `Duplicate assignment for unit ${k} in ${productLabel}.`
                );
                setLoading(false);
                return;
              }
              assignedNumbers.add(k);
            }
          } else {
            const num = parseInt(item, 10);
            if (isNaN(num) || num < 1 || num > totalQuantity) {
              toast.error(
                `Number '${item}' in ${productLabel} is out of bounds (1-${totalQuantity}).`
              );
              setLoading(false);
              return;
            }
            if (assignedNumbers.has(num)) {
              toast.error(
                `Duplicate assignment for unit ${num} in ${productLabel}.`
              );
              setLoading(false);
              return;
            }
            assignedNumbers.add(num);
          }
        }
      }
      if (assignedNumbers.size !== totalQuantity) {
        toast.error(
          `Range mappings for ${productLabel} do not cover all ${totalQuantity} units.`
        );
        setLoading(false);
        return;
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
        totalAmount: invoiceDetails.totalAmount.toString(),
        budgetId: budgetId,
      };

      const invoiceRes = await fetch(`${baseUrl}/stock/invoice/add`, {
        method: "POST",
        headers: fetchedHeaders,
        body: JSON.stringify(parsedInvoiceData),
      });

      if (!invoiceRes.ok) {
        const errorData = await invoiceRes.text();
        toast.error(`Failed to add invoice: ${errorData}`);
        setLoading(false);
        return;
      }
      const { invoice } = await invoiceRes.json();
      const invoiceId = invoice.invoiceId;

      for (const product of products) {
        const [statusMeta, categoryMeta] = await Promise.all([
          fetchMetadata(baseUrl, "stock/status/search", product.Status),
          fetchMetadata(baseUrl, "stock/category/search", product.category),
        ]);

        if (!statusMeta || !statusMeta.statusId)
          throw new Error(`Status metadata not found for: ${product.Status}`);
        if (!categoryMeta || !categoryMeta.categoryId)
          throw new Error(
            `Category metadata not found for: ${product.category}`
          );

        for (const mapping of product.locationRangeMappings!) {
          const locationMeta = await fetchMetadata(
            baseUrl,
            "stock/location/search",
            mapping.location
          );
          if (!locationMeta || !locationMeta.locationId)
            throw new Error(
              `Location metadata not found for: ${mapping.location}`
            );

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
              invoiceId: invoiceId,
              categoryId: categoryMeta.categoryId,
              productPrice: product.price,
              transferLetter: product.transferLetter,
              remarks: product.remark,
              budgetId: budgetId,
            };

            const res = await fetch(`${baseUrl}/stock/add`, {
              method: "POST",
              headers: fetchedHeaders,
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
        <form onSubmit={handleSubmit}>
          {" "}
          <InvoiceCard
            handleInvoiceChange={handleInvoiceChange}
            invoiceDetails={invoiceDetails}
            budgets={budgets}
          />
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
              onClick={() => setProducts([...products, { ...defaultProduct }])} // Spread defaultProduct for a fresh object
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
                loading ? "opacity-50 cursor-not-allowed" : ""
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
