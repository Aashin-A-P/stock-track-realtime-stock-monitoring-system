import React, { useState } from "react";

interface Stock {
  productId: string;
  itemName: string;
  description: string;
  location: string;
  invoiceId: string;
  year: number;
}

const dummyData: Stock[] = [
  {
    productId: "P001",
    itemName: "Laptop",
    description: "High-performance laptop",
    location: "Warehouse A",
    invoiceId: "INV001",
    year: 2023,
  },
  {
    productId: "P002",
    itemName: "Smartphone",
    description: "Flagship smartphone",
    location: "Warehouse B",
    invoiceId: "INV002",
    year: 2022,
  },
  // Add more dummy stocks here for testing
];

const SearchStock: React.FC = () => {
  const [filterType, setFilterType] = useState<string>("location");
  const [searchValue, setSearchValue] = useState<string>("");
  const [results, setResults] = useState<Stock[]>([]);

  const handleSearch = () => {
    const filteredStocks = dummyData.filter((stock) => {
      switch (filterType) {
        case "location":
          return stock.location.toLowerCase().includes(searchValue.toLowerCase());
        case "spec":
          return stock.description.toLowerCase().includes(searchValue.toLowerCase());
        case "productName":
          return stock.itemName.toLowerCase().includes(searchValue.toLowerCase());
        case "invoiceId":
          return stock.invoiceId.toLowerCase().includes(searchValue.toLowerCase());
        case "productId":
          return stock.productId.toLowerCase().includes(searchValue.toLowerCase());
        case "year":
          return stock.year.toString() === searchValue;
        default:
          return false;
      }
    });

    setResults(filteredStocks);
  };

  return (
    <div className="search-stock">
      <h2>Search Stock</h2>
      <div className="search-filters">
        <label>Search By:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="location">Location</option>
          <option value="spec">Specifications</option>
          <option value="productName">Product Name</option>
          <option value="invoiceId">Invoice ID</option>
          <option value="productId">Product ID</option>
          <option value="year">Year</option>
        </select>
        <label>Enter Value:</label>
        <input
          type="text"
          placeholder={`Enter ${filterType}`}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="search-results">
        <h3>Search Results</h3>
        {results.length === 0 ? (
          <p>No results found</p>
        ) : (
          <ul>
            {results.map((stock, index) => (
              <li key={index}>
                <strong>{stock.itemName}</strong> (ID: {stock.productId})<br />
                <em>{stock.description}</em><br />
                Location: {stock.location} | Invoice ID: {stock.invoiceId} | Year: {stock.year}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchStock;
