import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { set } from "lodash";

const baseURL = import.meta.env.VITE_API_BASE_URL;

type Product = {
  productId: number;
  productName: string;
  productDescription: string;
  categoryName: string;
  locationName: string;
  remark: string;
  actualAmount: string;
  gstAmount: string;
  invoiceDate: string;
};

const SearchStock: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
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

  const fetchProducts = async (
    page: number,
    pageSize: number,
    query: string,
    attribute: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseURL}/stock/details?page=${page}&pageSize=${pageSize}&column=${attribute}&query=${query}`,
        { headers: fetchHeaders }
      );
      const data = await response.json();
      setProducts(data.products);
      setPagination({ page, pageSize, totalRecords: data.totalRecords });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchProducts(
      newPage + 1,
      pagination.pageSize,
      searchQuery,
      selectedAttribute
    );
  };

  // const handlePageSizeChange = (newSize: number) => {
  //   fetchProducts(1, newSize, searchQuery, selectedAttribute);
  // };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    fetchProducts(1, pagination.pageSize, query, selectedAttribute);
  };

  const handleAttributeChange = (value: string) => {
    setSelectedAttribute(value);
    fetchProducts(1, pagination.pageSize, "", "product_name");
  };

  useEffect(() => {
    fetchProducts(
      pagination.page,
      pagination.pageSize,
      searchQuery,
      selectedAttribute
    );
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Search Stock</h2>

        {/* Dropdown */}
        <div className="mb-4">
          <label
            htmlFor="attribute-dropdown"
            className="block text-gray-700 mb-2"
          >
            Search Attribute
          </label>
          <select
            id="attribute-dropdown"
            value={selectedAttribute}
            onChange={(e) => {
              setSearchQuery("");
              handleAttributeChange(e.target.value);
            }}
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="product_name">Product Name</option>
            <option value="category_name">Category</option>
            <option value="location_name">Location</option>
            <option value="product_description">Description</option>
            <option value="remark">Remark</option>
            
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
          <div className="flex justify-center items-center h-screen text-blue-600">
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left bg-white shadow border rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4">Product ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Remark</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">GST</th>
                  <th className="p-4">Invoice Date</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr
                      key={product.productId}
                      className="border-b last:border-none hover:bg-blue-50 cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/stocks/${product.productId}`)
                      }
                    >
                      <td className="p-4">{product.productId}</td>
                      <td className="p-4">{product.productName}</td>
                      <td className="p-4">{product.productDescription}</td>
                      <td className="p-4">{product.categoryName}</td>
                      <td className="p-4">{product.locationName}</td>
                      <td className="p-4">{product.remark}</td>
                      <td className="p-4">{product.actualAmount}</td>
                      <td className="p-4">{product.gstAmount}</td>
                      <td className="p-4">{product.invoiceDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            className={
              "px-4 py-2 " +
              (pagination.page !== 1
                ? ` bg-blue-500 text-white rounded`
                : ` bg-gray-300 text-gray-500 rounded`)
            }
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 2)}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of{" "}
            {Math.ceil(pagination.totalRecords / pagination.pageSize)}
          </span>
          <button
            type="button"
            className={
              "px-4 py-2 " +
              (pagination.page >=
              Math.ceil(pagination.totalRecords / pagination.pageSize)
                ? ` bg-gray-300 text-gray-500 rounded`
                : ` bg-blue-500 text-white rounded`)
            }
            disabled={
              pagination.page >=
              Math.ceil(pagination.totalRecords / pagination.pageSize)
            }
            onClick={() => handlePageChange(pagination.page)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default SearchStock;
