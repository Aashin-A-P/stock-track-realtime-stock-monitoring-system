import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const StockDetails: React.FC = () => {
	const navigate = useNavigate();
	const { stockId } = useParams<{ stockId: string }>();
	const [loading, setLoading] = useState<boolean>(true);
	const [product, setProduct] = useState<any>(null);
	const [invoice, setInvoice] = useState<any>(null);

	const fetchHeaders = {
		"Content-Type": "application/json",
		Authorization: localStorage.getItem("token") || "",
	};

	useEffect(() => {
		// Using dummy data to populate the sections
		const fetchDummyData = () => {
			setLoading(true);
			try {
				const dummyProduct = {
					product_id: "P12345",
					product_name: "Sample Product",
					product_description: "This is a sample product description.",
					location_id: "LOC001",
					remark_id: "REM123",
					category_id: "CAT456",
					GST: 18,
					product_image: "https://via.placeholder.com/150",
					invoice_id: "INV789",
					product_vol_page_serial: "VP1234", // Added product_vol_page_serial
				};

				const dummyInvoice = {
					invoice_id: "INV789",
					from_address: "123 Main Street, Chennai",
					to_address: "456 Elm Street, Bangalore",
					actual_amount: 10000,
					gst_amount: 1800,
					invoice_date: "2023-12-01",
					invoice_image: "https://via.placeholder.com/150",
				};

				setProduct(dummyProduct);
				setInvoice(dummyInvoice);
			} catch (error) {
				console.error("Error loading dummy data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDummyData();
	}, [stockId]);

	const handleEdit = () => {
		navigate(`/stock/edit/${stockId}`);
	};

	const handleDelete = async () => {
		try {
			await fetch(`http://localhost:3000/stock/delete/${stockId}`, {
				method: "DELETE",
				headers: fetchHeaders,
			});
			navigate("/stocks");
		} catch (error) {
			console.error("Error deleting stock:", error);
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
							<strong>Product ID:</strong> {product.product_id}
						</div>
						<div>
							<strong>Product Name:</strong> {product.product_name}
						</div>
						<div>
							<strong>Description:</strong> {product.product_description}
						</div>
						<div>
							<strong>Location ID:</strong> {product.location_id}
						</div>
						<div>
							<strong>Remark ID:</strong> {product.remark_id}
						</div>
						<div>
							<strong>Category ID:</strong> {product.category_id}
						</div>
						<div>
							<strong>GST:</strong> {product.GST}%
						</div>
						<div>
							<strong>Invoice ID:</strong> {product.invoice_id}
						</div>
						{/* New field */}
						<div>
							<strong>Volume/Page/Serial:</strong>{" "}
							{product.product_vol_page_serial}
						</div>
						{product.product_image && (
							<div className="col-span-2">
								<strong>Product Image:</strong>
								<img
									src={product.product_image}
									alt="Product"
									className="w-32 h-32 mt-2"
								/>
							</div>
						)}
					</div>
				</div>

				{/* Invoice Details */}
				<div className="bg-white shadow-lg rounded-lg p-6 mb-6">
					<h3 className="text-lg font-medium text-gray-700 mb-4">
						Invoice Details
					</h3>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<strong>Invoice ID:</strong> {invoice.invoice_id}
						</div>
						<div>
							<strong>From Address:</strong> {invoice.from_address}
						</div>
						<div>
							<strong>To Address:</strong> {invoice.to_address}
						</div>
						<div>
							<strong>Actual Amount:</strong> ₹{invoice.actual_amount}
						</div>
						<div>
							<strong>GST Amount:</strong> ₹{invoice.gst_amount}
						</div>
						<div>
							<strong>Invoice Date:</strong> {invoice.invoice_date}
						</div>
						{invoice.invoice_image && (
							<div className="col-span-2">
								<strong>Invoice Image:</strong>
								<img
									src={invoice.invoice_image}
									alt="Invoice"
									className="w-32 h-32 mt-2"
								/>
							</div>
						)}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-between mt-4">
					<button
						onClick={handleEdit}
						className="text-white bg-blue-600 px-4 py-2 rounded shadow hover:bg-blue-700"
					>
						Edit Details
					</button>
					<button
						onClick={handleDelete}
						className="text-white bg-red-600 px-4 py-2 rounded shadow hover:bg-red-700"
					>
						Delete Stock
					</button>
				</div>
			</div>
		</>
	);
};

export default StockDetails;
