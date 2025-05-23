import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const baseURL = import.meta.env.VITE_API_BASE_URL;

type Product = {
  productId: number;
  productVolPageSerial: string;
  productName: string;
  productDescription: string;
  productImage: string;
  locationName: string;
  categoryName: string;
  statusDescription: string;
  actualAmount: string;
  gstAmount: string;
  PODate: string;
  invoiceNo: string;
  invoiceDate: string;
  fromAddress: string;
  toAddress: string;
  remarks: string;
};

const SearchStock: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const [products, setProducts] = useState<Product[]>([]);
  console.log(products);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAttribute, setSelectedAttribute] =
    useState<string>("product_name");

  const fetchHeaders = {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token") || "",
  };

  // Fetch products based on current page, pageSize, search query, and selected attribute
  const fetchProducts = async (
    page: number,
    pageSize: number,
    query: string,
    attribute: string
  ) => {
    setLoading(true);
    try {
      const url = `${baseURL}/stock/details?page=${page}&pageSize=${pageSize}&column=${attribute}&query=${query}`;
      // console.log(url);
      const response = await fetch(
        url,
        { headers: fetchHeaders }
      );
      // console.log(response);
      const data = await response.json();
      // console.log(data.products);
      setProducts(data.products);
      setPagination({ page, pageSize, totalRecords: data.totalRecords });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Adjusted pagination: directly pass the desired page number.
  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage, pagination.pageSize, searchQuery, selectedAttribute);
  };

  // Handle changes to the search bar
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    // Reset to page 1 when doing a new search
    fetchProducts(1, pagination.pageSize, query, selectedAttribute);
  };

  // Update the search attribute and reset the search query
  const handleAttributeChange = (value: string) => {
    setSelectedAttribute(value);
    setSearchQuery("");
    fetchProducts(1, pagination.pageSize, "", value);
  };

  // Fetch initial products on mount
  useEffect(() => {
    fetchProducts(
      pagination.page,
      pagination.pageSize,
      searchQuery,
      selectedAttribute
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.ceil(pagination.totalRecords / pagination.pageSize);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-8xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Search Stock</h2>

        {/* Dropdown for selecting search attribute */}
        <div className="mb-4">
          <label htmlFor="attribute-dropdown" className="block text-gray-700 mb-2">
            Search Attribute
          </label>
          <select
            id="attribute-dropdown"
            value={selectedAttribute}
            onChange={(e) => handleAttributeChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* <option value="product_id">Product ID</option> */}
            <option value="product_vol_page_serial">Vol Page Serial</option>
            <option value="product_name">Name</option>
            <option value="product_description">Description</option>
            <option value="category_name">Category</option>
            <option value="location_name">Location</option>
            <option value="status_description">Status</option>
            {/* <option value="product_price">Actual Amount</option> */}
            {/* <option value="GST_amount">GST Amount</option> */}
            {/* <option value="invoice_date">Invoice Date</option> */}
            <option value="invoice_no">Invoice No</option>
            {/* <option value="po_date">PO Date</option> */}
            <option value="from_address">From Address</option>
            <option value="to_address">To Address</option>
            <option value="remarks">Remarks</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center justify-center items-center text-blue-600">
            <LoadingSpinner />
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left bg-white shadow border rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4">Product ID</th>
                  <th className="p-4">Vol Page Serial</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actual Amount</th>
                  <th className="p-4">GST Amount</th>
                  <th className="p-4">Invoice Date</th>
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">PO Date</th>
                  <th className="p-4">From Address</th>
                  <th className="p-4">To Address</th>
                  <th className="p-4">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr
                      key={product.productId}
                      className="border-b last:border-none hover:bg-blue-50 cursor-pointer"
                      onClick={() => navigate(`/stocks/${product.productId}`)}
                    >
                      <td className="p-4">{product.productId}</td>
                      <td className="p-4">{product.productVolPageSerial}</td>
                      <td className="p-4">{product.productName}</td>
                      <td className="p-4">{product.productDescription}</td>
                      <td className="p-4">{product.categoryName}</td>
                      <td className="p-4">{product.locationName}</td>
                      <td className="p-4">{product.statusDescription}</td>
                      <td className="p-4">{product.actualAmount}</td>
                      <td className="p-4">{product.gstAmount}</td>
                      <td className="p-4">{product.invoiceDate}</td>
                      <td className="p-4">{product.invoiceNo}</td>
                      <td className="p-4">{product.PODate}</td>
                      <td className="p-4">{product.fromAddress}</td>
                      <td className="p-4">{product.toAddress}</td>
                      <td className="p-4">{product.remarks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    {/* Updated colSpan to match the number of columns (14) */}
                    <td colSpan={14} className="p-4 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && <div className="flex justify-between items-center mt-4">
          <button
            className={`px-4 py-2 ${pagination.page > 1
                ? "bg-blue-500 text-white rounded"
                : "bg-gray-300 text-gray-500 rounded"
              }`}
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {totalPages}
          </span>
          <button
            type="button"
            className={`px-4 py-2 ${pagination.page < totalPages
                ? "bg-blue-500 text-white rounded"
                : "bg-gray-300 text-gray-500 rounded"
              }`}
            disabled={pagination.page >= totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>}
      </div>
    </>
  );
};

export default SearchStock;
