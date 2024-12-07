import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProductDetails: React.FC = () => {
  const { stockId } = useParams<{ stockId: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<any[]>([]);
  const [invoiceDetails, setInvoiceDetails] = useState<any>({
    fromAddress: "",
    toAddress: "",
    gstAmount: 0,
    actualAmount: 0,
    invoiceDate: "",
    invoiceImage: "",
  });
  
  const fetchHeaders = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token") || "",
  };

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/stock/details?page=1&pageSize=1&column=product_id&query=${stockId}`,
        { headers: fetchHeaders }
      );
      const data = await response.json();
      setProduct(data.products[0]);
    } catch (error) {
      console.error("Error fetching stock details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceChange = (key: string, value: any) => {
    setInvoiceDetails((prev: any) => ({ ...prev, [key]: value }));
  };


  const uploadImageAndGetURL = async (file: File): Promise<string> => {
    // Simulate image upload and return a URL
    return new Promise((resolve) => {
      setTimeout(() => resolve(URL.createObjectURL(file)), 1000);
    });
  };

  const defaultProduct = {
    volNo: "",
    pageNo: "",
    serialNo: "",
    productName: "",
    productDescription: "",
    category: "",
    location: "",
    remarks: "",
    quantity: 0,
    price: 0,
    productImage: "",
  };

  useEffect(() => {
    fetchProductDetails();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md my-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Products</h2>

      {/* Invoice Details Section */}
      <div className="bg-white p-4 mb-6 rounded shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Invoice Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
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
              handleInvoiceChange("actualAmount", parseFloat(e.target.value))
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
                uploadImageAndGetURL(file).then((url) =>
                  handleInvoiceChange("invoiceImage", url)
                );
              }
            }}
            className="hidden"
            id="invoiceImageInput"
          />
          <label
            htmlFor="invoiceImageInput"
            className={`p-2 border rounded bg-blue-600 text-white cursor-pointer text-center ${
              invoiceDetails.invoiceImage ? "bg-green-500" : ""
            }`}
          >
            {invoiceDetails.invoiceImage
              ? "Invoice Image Uploaded"
              : "Choose Invoice Image"}
          </label>
          <input
            placeholder="Invoice Date"
            type="date"
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
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Product {index + 1}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Add inputs for product details */}
          </div>
        </div>
      ))}

      <button
        onClick={() => setProducts([...products, defaultProduct])}
        className="bg-gray-700 text-white px-4 py-2 rounded shadow hover:bg-black"
      >
        Add New Product
      </button>
    </div>
  );
};

export default ProductDetails;
