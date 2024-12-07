import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const ReportGeneration: React.FC = () => {
	const navigate = useNavigate();
	const { token } = useAuth();

	const [stocks, setStocks] = useState<any[]>([]);
	const [selectedColumns, setSelectedColumns] = useState({
		serialNo: true,
		stockRegister: true,
		stockName: true,
		stockDescription: true,
		stockId: true,
		location: true,
		quantity: true,
		price: true,
		remarks: true,
	});

	const [columnAliases, setColumnAliases] = useState({
		serialNo: "Serial No",
		stockRegister: "Stock Register",
		stockName: "Stock Name",
		stockDescription: "Stock Description",
		stockId: "Stock ID",
		location: "Location",
		quantity: "Quantity",
		price: "Price",
		remarks: "Remarks",
	});

	const [yearFilter, setYearFilter] = useState("2024");

	useEffect(() => {
		if (!token) {
			navigate("/login");
		}
	}, [token, navigate]);

	useEffect(() => {
		const fetchStocks = async () => {
			try {
				const response = await fetch(baseUrl + `/stocks?year=${yearFilter}`, {
					method: "GET",
					headers: {
						Authorization: token || "",
					},
				});

				if (!response.ok) {
					const errorText = await response.text();
					console.error("Error response text:", errorText);
					throw new Error("Failed to fetch stocks");
				}

				const data = await response.json();
				setStocks(data);
			} catch (error) {
				console.error("Error fetching stocks:", error);
			}
		};

		if (token) {
			fetchStocks();
		}
	}, [token, yearFilter]);

	const handleColumnSelection = (column: string) => {
		setSelectedColumns((prevState) => ({
			...prevState,
			[column]: !prevState[column],
		}));
	};

	const handleColumnAliasChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		column: string
	) => {
		setColumnAliases({
			...columnAliases,
			[column]: e.target.value,
		});
	};

	const exportToExcel = () => {
		const tableData = stocks.map((stock) => ({
			"Serial No": stock.serialNo,
			"Stock Register": `${stock.volNo}, ${stock.pageNo}, ${stock.serialNo}`,
			"Stock Name": stock.stockName,
			"Stock Description": stock.stockDescription,
			"Stock ID": stock.stockId,
			Location: stock.location,
			Quantity: stock.quantity,
			Price: stock.price,
			Remarks: stock.remarks,
		}));

		const ws = XLSX.utils.json_to_sheet(tableData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Stock Report");
		XLSX.writeFile(wb, "Stock_Report.xlsx");
	};

	const exportToPDF = () => {
		const doc = new jsPDF();
		const tableData = stocks.map((stock) => [
			stock.serialNo,
			`${stock.volNo}, ${stock.pageNo}, ${stock.serialNo}`,
			stock.stockName,
			stock.stockDescription,
			stock.stockId,
			stock.location,
			stock.quantity,
			stock.price,
			stock.remarks,
		]);

		doc.autoTable({
			head: [
				[
					columnAliases.serialNo,
					columnAliases.stockRegister,
					columnAliases.stockName,
					columnAliases.stockDescription,
					columnAliases.stockId,
					columnAliases.location,
					columnAliases.quantity,
					columnAliases.price,
					columnAliases.remarks,
				],
			],
			body: tableData,
		});

		doc.save("Stock_Report.pdf");
	};

	return (
		<>
			<Navbar />
			<div className="p-6 max-w-5xl mx-auto">
				<h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">
					Report Generation
				</h1>

				{/* Year Dropdown */}
				<div className="mb-4">
					<select
						value={yearFilter}
						onChange={(e) => setYearFilter(e.target.value)}
						className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="2024">2024</option>
						<option value="2023">2023</option>
						<option value="2022">2022</option>
						<option value="2021">2021</option>
						<option value="2020">2020</option>
					</select>
				</div>

				{/* Column Selection */}
				<div className="mb-4">
					<h2 className="font-semibold text-gray-700 mb-2">Select Columns</h2>
					<div className="grid grid-cols-2 gap-4">
						{Object.keys(selectedColumns).map((column) => (
							<label key={column} className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={selectedColumns[column]}
									onChange={() => handleColumnSelection(column)}
									className="mr-2"
								/>
								<span>{columnAliases[column]}</span>
							</label>
						))}
					</div>
				</div>

				{/* Column Aliases */}
				<div className="mb-4">
					<h2 className="font-semibold text-gray-700 mb-2">Column Aliases</h2>
					<div className="space-y-2">
						{Object.keys(selectedColumns).map((column) =>
							selectedColumns[column] ? (
								<div key={column} className="flex items-center">
									<label className="w-1/3 font-medium text-gray-700">
										{columnAliases[column]}:
									</label>
									<input
										type="text"
										value={columnAliases[column]}
										onChange={(e) => handleColumnAliasChange(e, column)}
										className="w-2/3 p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							) : null
						)}
					</div>
				</div>

				{/* Stock Table */}
				<div className="overflow-x-auto">
					<table className="w-full text-sm text-left bg-white shadow border rounded-lg">
						<thead className="bg-blue-600 text-white">
							<tr>
								{selectedColumns.serialNo && (
									<th className="p-4">{columnAliases.serialNo}</th>
								)}
								{selectedColumns.stockRegister && (
									<th className="p-4">{columnAliases.stockRegister}</th>
								)}
								{selectedColumns.stockName && (
									<th className="p-4">{columnAliases.stockName}</th>
								)}
								{selectedColumns.stockDescription && (
									<th className="p-4">{columnAliases.stockDescription}</th>
								)}
								{selectedColumns.stockId && (
									<th className="p-4">{columnAliases.stockId}</th>
								)}
								{selectedColumns.location && (
									<th className="p-4">{columnAliases.location}</th>
								)}
								{selectedColumns.quantity && (
									<th className="p-4">{columnAliases.quantity}</th>
								)}
								{selectedColumns.price && (
									<th className="p-4">{columnAliases.price}</th>
								)}
								{selectedColumns.remarks && (
									<th className="p-4">{columnAliases.remarks}</th>
								)}
							</tr>
						</thead>
						<tbody>
							{stocks.map((stock) => (
								<tr
									key={stock.stockId}
									className="border-b last:border-none hover:bg-blue-50"
								>
									{selectedColumns.serialNo && (
										<td className="p-4">{stock.serialNo}</td>
									)}
									{selectedColumns.stockRegister && (
										<td className="p-4">{`${stock.volNo}, ${stock.pageNo}, ${stock.serialNo}`}</td>
									)}
									{selectedColumns.stockName && (
										<td className="p-4">{stock.stockName}</td>
									)}
									{selectedColumns.stockDescription && (
										<td className="p-4">{stock.stockDescription}</td>
									)}
									{selectedColumns.stockId && (
										<td className="p-4">{stock.stockId}</td>
									)}
									{selectedColumns.location && (
										<td className="p-4">{stock.location}</td>
									)}
									{selectedColumns.quantity && (
										<td className="p-4">{stock.quantity}</td>
									)}
									{selectedColumns.price && (
										<td className="p-4">{stock.price}</td>
									)}
									{selectedColumns.remarks && (
										<td className="p-4">{stock.remarks}</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Download Buttons */}
				<div className="mt-6 flex justify-between">
					<button
						onClick={exportToExcel}
						className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
					>
						Export to Excel
					</button>
					<button
						onClick={exportToPDF}
						className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Export to PDF
					</button>
				</div>
			</div>
		</>
	);
};

export default ReportGeneration;
