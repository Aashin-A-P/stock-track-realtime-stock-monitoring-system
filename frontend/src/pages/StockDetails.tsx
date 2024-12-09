import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

type Product = {
  productId: number;
  productVolPageSerial: string;
  productName: string;
  productDescription: string;
  gst: string;
  productImage: string;
  locationName: string;
  categoryName: string;
  remark: string;
};

type Invoice = {
  invoiceId: number;
  fromAddress: string;
  toAddress: string;
  actualAmount: string;
  gstAmount: string;
  invoiceDate: string;
  invoiceImage: string;
};

const StockDetails = () => {
  const navigate = useNavigate();
  const stockId = useParams().stockId;
  const [loading, setLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updatedProduct, setUpdatedProduct] = useState<Product | null>(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const fetchHeaders = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token") || "",
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseURL}/stock/${stockId}`, {
          headers: fetchHeaders,
        });
        const data = await response.json();
        if (response.ok) {
          setProduct(data.product);
          setInvoice(data.invoice);
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
  }, [stockId]);

  const handleBack = () => {
    navigate("/stocks");
  };

  const handleImageClick = (imageUrl: string) => {
    console.log("Opening image:", imageUrl);
    window.open(baseURL + imageUrl, "_blank");
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setUpdatedProduct({ ...product! });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Product
  ) => {
    if (updatedProduct) {
      setUpdatedProduct({
        ...updatedProduct,
        [field]: e.target.value,
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!updatedProduct) return;
    const response = await fetch(`${baseURL}/stock/${stockId}`, {
      method: "PUT",
      headers: fetchHeaders,
      body: JSON.stringify(updatedProduct),
    });
    const data = await response.json();
    if (response.ok) {
      setProduct(updatedProduct);
      setIsEditing(false);
    } else {
      console.error("Error updating stock details:", data.message);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;

  if (!product || !invoice) {
    return (
      <div className="text-center text-red-500">
        Error: Unable to fetch stock or invoice details.
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="text-white bg-blue-600 px-4 py-2 rounded shadow hover:bg-blue-700 mb-4"
        >
          Back
        </button>
        <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">
          Stock Details
        </h1>

        {/* Product Details */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Product Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Product Name: </strong>
              {product.productName}
            </div>
            <div>
              <strong>Product Description: </strong>
              {product.productDescription}
            </div>
            <div>
              <strong>GST: </strong>
              {product.gst}
            </div>
            <div>
              <strong>Location: </strong>
              {isEditing ? (
                <input
                  placeholder="Enter location"
                  type="text"
                  value={updatedProduct?.locationName}
                  onChange={(e) => handleChange(e, "locationName")}
                  className="border p-2 rounded"
                />
              ) : (
                product.locationName
              )}
            </div>
            <div>
              <strong>Category: </strong>
              {isEditing ? (
                <input
                  placeholder="Enter category"
                  type="text"
                  value={updatedProduct?.categoryName}
                  onChange={(e) => handleChange(e, "categoryName")}
                  className="border p-2 rounded"
                />
              ) : (
                product.categoryName
              )}
            </div>
            <div>
              <strong>Remark: </strong>
              {isEditing ? (
                <textarea
                  placeholder="Enter remark"
                  value={updatedProduct?.remark}
                  onChange={(e) => handleChange(e, "remark")}
                  className="border p-2 rounded"
                />
              ) : (
                product.remark
              )}
            </div>
            <div>
              <strong>Product Image: </strong>
              <button
                onClick={() => handleImageClick(product.productImage)}
                className="text-blue-600 underline"
              >
                View Image
              </button>
            </div>
          </div>

          {/* Edit/Save Button */}
          {isEditing ? (
            <div className="mt-4">
              <button
                onClick={handleSaveChanges}
                className="text-white bg-green-600 px-4 py-2 rounded shadow hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <button
                onClick={handleEditClick}
                className="text-white bg-blue-600 px-4 py-2 rounded shadow hover:bg-blue-700"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Invoice Details */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Invoice Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>From Address: </strong>
              {invoice.fromAddress}
            </div>
            <div>
              <strong>To Address: </strong>
              {invoice.toAddress}
            </div>
            <div>
              <strong>Actual Amount: </strong>
              {invoice.actualAmount}
            </div>
            <div>
              <strong>GST Amount: </strong>
              {invoice.gstAmount}
            </div>
            <div>
              <strong>Invoice Date: </strong>
              {invoice.invoiceDate}
            </div>
            <div>
              <strong>Invoice Image: </strong>
              <button
                onClick={() => handleImageClick(invoice.invoiceImage)}
                className="text-blue-600 underline"
              >
                View Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockDetails;
