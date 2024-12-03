import React, { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import axios from "axios";
import { debounce } from "lodash";
import Navbar from "../components/Navbar";

// Types for Product and Pagination
type Product = {
  productId: number;
  productName: string;
  productDescription: string;
  productImage: string;
  locationName: string;
  remark: string;
  categoryName: string;
  fromAddress: string;
  toAddress: string;
  actualAmount: string;
  gstAmount: string;
  invoiceDate: string;
};

type Pagination = {
  page: number;
  pageSize: number;
  totalRecords: number;
};

// SearchStockPage Component
const SearchStock: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
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

  // Fetch Products with Pagination
  const fetchProducts = async (
    page: number,
    pageSize: number,
    query: string,
    attribute: string
  ) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/stock/details?page=${page}&pageSize=${pageSize}&column=${attribute}&query=${query}`,
        {
          headers: fetchHeaders,
        }
      );
      setProducts(response.data.products);
      setPagination({
        page,
        pageSize,
        totalRecords: response.data.totalRecords,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of handleSearch
  const handleSearchDebounced = debounce((query: string) => {
    fetchProducts(1, pagination.pageSize, query, selectedAttribute);
  }, 500); // Debounced for 500ms delay

  // Handle Page Change
  const handlePageChange = (_: unknown, newPage: number) => {
    fetchProducts(
      newPage + 1,
      pagination.pageSize,
      searchQuery,
      selectedAttribute
    );
  };

  // Handle Rows Per Page Change
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    fetchProducts(1, newSize, searchQuery, selectedAttribute);
  };

  // Handle Search Input Change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    handleSearchDebounced(event.target.value); // Call the debounced function
  };

  // Handle Attribute Selection
  const handleAttributeChange = (event: SelectChangeEvent<string>) => {
    setSelectedAttribute(event.target.value as string);
    fetchProducts(
      1,
      pagination.pageSize,
      searchQuery,
      event.target.value as string
    );
  };

  useEffect(() => {
    fetchProducts(
      pagination.page,
      pagination.pageSize,
      searchQuery,
      selectedAttribute
    );
  }, []); // Fetch initial data when the component mounts

  return (
    <>
      <Navbar />
      <Container>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          color="primary"
          className="pt-8 pb-5"
        >
          Stock Search
        </Typography>

        <FormControl
          fullWidth
          variant="outlined"
          style={{ marginBottom: "1rem" }}
        >
          <InputLabel htmlFor="search-attribute">Search Attribute</InputLabel>
          <Select
            value={selectedAttribute}
            onChange={handleAttributeChange}
            label="Search Attribute"
            inputProps={{
              id: "search-attribute",
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                  width: "fit-content",
                  overflowY: "auto", // Ensures scrolling is visible
                },
              },
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left",
              },
            }}
          >
            <MenuItem value="product_name">Product Name</MenuItem>
            <MenuItem value="location_name">Location</MenuItem>
            <MenuItem value="category_name">Category</MenuItem>
            <MenuItem value="remark">Remark</MenuItem>
          </Select>
        </FormControl>

        {/* Updated TextField with proper margin and styling */}
        <TextField
          fullWidth
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          variant="outlined"
          style={{ marginBottom: "1rem" }}
        />

        {loading ? (
          <CircularProgress
            color="primary"
            style={{ display: "block", margin: "0 auto" }}
          />
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Remark</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>GST</TableCell>
                    <TableCell>Invoice Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <img
                          src={
                            "http://localhost:3000" +
                            (product.productImage ||
                              "/uploads/default-image.jpg")
                          }
                          alt={product.productName}
                          className="w-12 h-12"
                        />
                      </TableCell>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell>{product.productDescription}</TableCell>
                      <TableCell>{product.categoryName}</TableCell>
                      <TableCell>{product.locationName}</TableCell>
                      <TableCell>{product.remark}</TableCell>
                      <TableCell>{product.actualAmount}</TableCell>
                      <TableCell>{product.gstAmount}</TableCell>
                      <TableCell>{product.invoiceDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={pagination.totalRecords}
              page={pagination.page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={pagination.pageSize}
              onRowsPerPageChange={handlePageSizeChange}
            />
          </>
        )}
      </Container>
    </>
  );
};

export default SearchStock;
