import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import YearDropdown from "../components/YearDropdown";
import { useDashboard } from "../context/DashboardContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ======================
// Interfaces & Types
// ======================
interface Stock {
	serialNo: number;
	volNo: string;
	pageNo: string;
	stockName: string;
	stockDescription: string;
	stockId: string;
	location: string;
	quantity: number;
	price: number;
	remarks: string;
	budgetName: string;
	categoryName?: string;
	invoiceNo?: string;
	fromAddress?: string;
	toAddress?: string;
	status?: string;
	staff?: string;
	annexure?: string;
	nameOfCenter?: string;
	stockRegNameAndVolNo?: string;
}

interface SelectedColumns {
	[key: string]: boolean;
}

interface ColumnAliases {
	[key: string]: string;
}

// ======================
// Filter Dropdown Component
// ======================
interface FilterDropdownProps {
	year: number;
	onYearChange: (year: number) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ year, onYearChange }) => {
	const { years } = useDashboard();
	return (
		<div className="mb-6">
			<label htmlFor="yearFilter" className="block font-medium mb-1 text-blue-700">
				Filter by Year
			</label>
			<YearDropdown selectedYear={Number(year)} onSelectYear={onYearChange} years={years} />
		</div>
	);
};

// ======================
// Column Selection Component
// ======================
interface ColumnSelectionProps {
	selectedColumns: SelectedColumns;
	onToggleColumn: (column: keyof SelectedColumns) => void;
}

const ColumnSelection: React.FC<ColumnSelectionProps> = ({ selectedColumns, onToggleColumn }) => {
	return (
		<div className="mb-6">
			<h2 className="font-semibold text-blue-700 mb-3">Select Columns</h2>
			<div className="grid lg:grid-cols-6 gap-4 md:grid-cols-3 sm:grid-cols-2">
				{Object.keys(selectedColumns).map((column) => (
					<label key={column} className="flex items-center space-x-2">
						<input
							type="checkbox"
							checked={selectedColumns[column as keyof SelectedColumns]}
							onChange={() => onToggleColumn(column as keyof SelectedColumns)}
							className="mr-2"
						/>
						<span className="text-blue-700 capitalize">{column}</span>
					</label>
				))}
			</div>
		</div>
	);
};

// ======================
// Draggable Column Component
// ======================
interface DraggableColumnProps {
	column: string;
	index: number;
	moveColumn: (dragIndex: number, hoverIndex: number) => void;
	alias: string;
	handleAliasChange: (e: React.ChangeEvent<HTMLInputElement>, column: string) => void;
}

const DraggableColumn: React.FC<DraggableColumnProps> = ({
	column,
	index,
	moveColumn,
	alias,
	handleAliasChange,
}) => {
	const ref = React.useRef<HTMLDivElement>(null);

	const [{ isDragging }, drag] = useDrag({
		type: "COLUMN",
		item: { index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	const [, drop] = useDrop({
		accept: "COLUMN",
		hover: (item: { index: number }, monitor) => {
			if (!ref.current) return;
			const dragIndex = item.index;
			const hoverIndex = index;
			if (dragIndex === hoverIndex) return;

			const hoverBoundingRect = ref.current.getBoundingClientRect();
			const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
			const clientOffset = monitor.getClientOffset();
			if (!clientOffset) return;
			const hoverClientY = clientOffset.y - hoverBoundingRect.top;

			if (
				(dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
				(dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
			) {
				return;
			}
			moveColumn(dragIndex, hoverIndex);
			item.index = hoverIndex;
		},
	});

	drag(drop(ref));

	return (
		<div
			ref={ref}
			className={`flex items-center pl-4 pr-2 py-2 border border-gray-300 rounded-xl bg-white shadow-lg transition-all transform ${isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"
				} cursor-grab active:cursor-grabbing backdrop-blur-lg`}
		>
			<span className="mr-3 text-gray-600 text-xl">☰</span>
			<div className="grid grid-cols-5 items-center gap-4 w-full">
				<span className="text-lg font-semibold text-black capitalize mr-2">{column}</span>
				<input
					type="text"
					value={alias}
					onChange={(e) => handleAliasChange(e, column)}
					className="ml-2 col-span-4 mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
				/>
			</div>
		</div>
	);
};

// ======================
// Column Reorder & Rename Component
// ======================
interface ColumnReorderProps {
	columnOrder: string[];
	selectedColumns: Record<string, boolean>;
	columnAliases: Record<string, string>;
	moveColumn: (dragIndex: number, hoverIndex: number) => void;
	onAliasChange: (e: React.ChangeEvent<HTMLInputElement>, column: string) => void;
}

const ColumnReorder: React.FC<ColumnReorderProps> = ({
	columnOrder,
	selectedColumns,
	columnAliases,
	moveColumn,
	onAliasChange
}) => {

	return (
		<div className="mb-6 p-5 rounded-lg bg-gray-50 shadow-md">
			<h2 className="font-bold text-blue-700 text-lg mb-4">Reorder & Rename Columns</h2>
			<DndProvider backend={HTML5Backend}>
				<div className="space-y-3">
					{columnOrder.map(
						(column, index) =>
							selectedColumns[column] && (
								<DraggableColumn
									key={column}
									column={column}
									index={index}
									moveColumn={moveColumn}
									alias={columnAliases[column]}
									handleAliasChange={onAliasChange}
								/>
							)
					)}
				</div>
			</DndProvider>
		</div>
	);
};

// ======================
// Stock Table Component
// ======================
interface StockTableProps {
	stocks: Stock[];
	columnOrder: string[];
	selectedColumns: SelectedColumns;
	columnAliases: ColumnAliases;
	annexure?: string;
	nameOfCenter?: string;
	stockRegNameAndVolNo?: string;
	statementOfVerification?: string;
}

const StockTable: React.FC<StockTableProps> = ({
	stocks,
	columnOrder,
	selectedColumns,
	columnAliases,
	annexure,
	nameOfCenter,
	stockRegNameAndVolNo,
	statementOfVerification,
}) => {
	const colCount = columnOrder.length - 4; // Subtracting 4 for the special columns
	return (
		<div className="overflow-x-auto mb-6">
			<table className="w-full text-sm text-left bg-white shadow border border-gray-300 rounded-lg">
				<thead className="text-black text-center border border-gray-300">
					{annexure && (
						<tr className="border border-gray-300 hover:bg-blue-50">
							<th colSpan={colCount} className="p-4 border border-gray-300">
								{annexure}
							</th>
						</tr>
					)}
					{(nameOfCenter || stockRegNameAndVolNo) && (
						<tr className="border border-gray-300 hover:bg-blue-50">
							{nameOfCenter && (
								<th
									colSpan={nameOfCenter && stockRegNameAndVolNo ? colCount / 2 : colCount}
									className="p-4 border border-gray-300"
								>
									{nameOfCenter}
								</th>
							)}
							{stockRegNameAndVolNo && (
								<th
									colSpan={nameOfCenter && stockRegNameAndVolNo ? colCount - colCount / 2 : colCount}
									className="p-4 border border-gray-300"
								>
									{stockRegNameAndVolNo}
								</th>
							)}
						</tr>
					)}
					{statementOfVerification && (
						<tr>
							<th colSpan={colCount} className="p-4 border border-gray-300">
								{statementOfVerification}
							</th>
						</tr>
					)}
					<tr className="border border-gray-300 hover:bg-blue-50">
						{columnOrder.map(
							(column) =>
								selectedColumns[column] && column != "annexure" && column != "statementOfVerification" && column != "stockRegNameAndVolNo" && column != "nameOfCenter" && (
									<th key={column} className="p-4 border border-gray-300">
										{columnAliases[column]}
									</th>
								)
						)}
					</tr>
				</thead>
				<tbody>
					{stocks.map((stock, idx) => (
						<tr key={idx} className="border border-gray-300 hover:bg-blue-50">
							{columnOrder.map(
								(column) =>
									selectedColumns[column] && column != "annexure" && column != "statementOfVerification" && column != "stockRegNameAndVolNo" && column != "nameOfCenter" && (
										<td key={column} className="p-4 border border-gray-300">
											{column === "stockRegister"
												? `Vol-${stock["stockId"].split("-")[0]} Page-${stock["stockId"].split("-")[1]} Serial-${stock["stockId"].split("-")[2]}`
												: column === "serialNo" ? idx + 1 : stock[column as keyof Stock]}
										</td>
									)
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

// ======================
// Export Buttons Component
// ======================
interface ExportButtonsProps {
	onExportExcel: () => void;
	onExportPDF: (pageSize: "a4" | "a3" | "a2" | "letter" | "legal") => void;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ onExportExcel, onExportPDF }) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	return (
		<div className="mt-6 flex justify-between">
			<button
				onClick={onExportExcel}
				className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
			>
				Export to Excel
			</button>
			<div className="relative">
				<button
					onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
				>
					Export to PDF <span className="ml-2">&#9652;</span>
				</button>
				{isDropdownOpen && (
					<div className="absolute right-0 bottom-full mb-2 w-40 bg-white border border-blue-300 shadow-lg rounded">
						{["a4", "a3", "a2", "letter", "legal"].map((size) => (
							<button
								key={size}
								onClick={() => {
									setIsDropdownOpen(false);
									onExportPDF(size as "a4" | "a3" | "a2" | "letter" | "legal");
								}}
								className="block w-full text-left px-4 py-2 hover:bg-blue-100"
							>
								{size.toUpperCase()}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

// ======================
// Main ReportGeneration Component
// ======================
const ReportGeneration: React.FC = () => {
	const navigate = useNavigate();
	const { token } = useAuth();

	// Redirect to login if no token
	useEffect(() => {
		if (!token) {
			navigate("/login");
		}
	}, [token, navigate]);

	// State declarations
	const [stocks, setStocks] = useState<Stock[]>([]);
	const [selectedColumns, setSelectedColumns] = useState<SelectedColumns>({
		annexure: true,
		nameOfCenter: true,
		stockRegNameAndVolNo: true,
		statementOfVerification: true,
		budgetName: true,
		categoryName: true,
		invoiceNo: true,
		fromAddress: true,
		toAddress: true,
		serialNo: true,
		stockRegister: true,
		stockName: true,
		stockDescription: true,
		stockId: true,
		location: true,
		quantity: true,
		price: true,
		status: true,
		remarks: true,
		staff: true,
	});
	const [columnOrder, setColumnOrder] = useState<string[]>(Object.keys(selectedColumns));
	const [columnAliases, setColumnAliases] = useState<ColumnAliases>({
		annexure: "ANNEXURE : II",
		nameOfCenter: "Department of Information Technology",
		stockRegNameAndVolNo: "Non-Consumable Register Vol-1, Vol-2 and Vol-3",
		statementOfVerification: "Statement of Verification of Stocks as on 31st March 2024",
		budgetName: "Budget Name",
		categoryName: "Category",
		invoiceNo: "Invoice No",
		fromAddress: "From Address",
		toAddress: "To Address",
		serialNo: "Serial No",
		stockRegister: "Stock Register",
		stockName: "Stock Name",
		stockDescription: "Stock Description",
		stockId: "Stock ID",
		location: "Location",
		quantity: "Quantity",
		price: "Price",
		status: "Status",
		remarks: "Remarks",
		staff: "Staff Incharge",
	});
	const [yearFilter, setYearFilter] = useState<number>(2024);

	// Dummy data generation for demonstration
	useEffect(() => {
		const getActualData = async () => {
			// Fetch data from API
			const response = await fetch("http://localhost:3000/stock/report", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `${token}`,
				},
			});
			const data = await response.json();
			setStocks(data);
		}
		getActualData();
		// const generateDummyData = (): Stock[] =>
		// 	Array.from({ length: 100 }, (_, index) => ({
		// 		budgetName: "Budget Name",
		// 		categoryName: "Category",
		// 		invoiceNo: "Invoice No",
		// 		fromAddress: "From Address",
		// 		toAddress: "To Address",
		// 		serialNo: index + 1,
		// 		volNo: `Vol-${Math.floor(Math.random() * 100)}`, // already includes "Vol-"
		// 		pageNo: `Page-${Math.floor(Math.random() * 100)}`,
		// 		stockName: `Stock ${index + 1}`,
		// 		stockDescription: `Description of Stock ${index + 1}`,
		// 		stockId: `ID-${index + 1}`,
		// 		location: `Location ${Math.floor(Math.random() * 10)}`,
		// 		quantity: Math.floor(Math.random() * 100),
		// 		price: parseFloat((Math.random() * 1000).toFixed(2)),
		// 		status: "Status",
		// 		remarks: `Remark ${index + 1}`,
		// 		staff: "Staff Incharge",
		// 	}));
		// setStocks(generateDummyData());
	}, []);

	// Handlers & Helper Functions
	const moveColumn = (dragIndex: number, hoverIndex: number) => {
		const updatedOrder = [...columnOrder];
		const [draggedColumn] = updatedOrder.splice(dragIndex, 1);
		updatedOrder.splice(hoverIndex, 0, draggedColumn);
		setColumnOrder(updatedOrder);
	};

	const handleColumnSelection = (column: keyof SelectedColumns) => {
		setSelectedColumns((prev) => ({
			...prev,
			[column]: !prev[column],
		}));
	};

	const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>, column: keyof ColumnAliases) => {
		setColumnAliases((prev) => ({ ...prev, [column]: e.target.value }));
	};

	const exportToExcel = async () => {
		// Create table data similar to your original logic
		const tableData = stocks.map((stock) => {
			const row: Record<string, any> = {};
			columnOrder.forEach((key) => {
				if (selectedColumns[key]) {
					row[columnAliases[key]] =
						key === "stockRegister"
							? `Vol-${stock["stockId"].split("-")[0]} Page-${stock["stockId"].split("-")[1]} Serial-${stock["stockId"].split("-")[2]}`
							: stock[key as keyof Stock];
				}
			});
			return row;
		});

		// Create a new workbook and add a worksheet
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Stock Report");

		if (tableData.length > 0) {
			// Extract header keys from the first row object
			const headers = Object.keys(tableData[0]);
			// Add header row to the worksheet
			worksheet.addRow(headers);

			// Add each data row in the same order as the headers
			tableData.forEach((rowData) => {
				const rowValues = headers.map((header) => rowData[header]);
				worksheet.addRow(rowValues);
			});

			// Dynamically calculate and set column widths
			headers.forEach((header, colIndex) => {
				const column = worksheet.getColumn(colIndex + 1);
				const maxLength = Math.max(
					header.length,
					...tableData.map((row) => (row[header]?.toString().length || 0))
				);
				column.width = maxLength + 2;
			});
		}

		// Write workbook to a buffer and trigger download
		const buffer = await workbook.xlsx.writeBuffer();
		const blob = new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "Stock_Report.xlsx";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	};

	// Export to PDF
	const exportToPDF = (pageSize: "a4" | "a3" | "a2" | "letter" | "legal" = "a4") => {
		const PAGE_SIZES: Record<string, [number, number]> = {
		  a4: [297, 210],
		  a3: [420, 297],
		  a2: [594, 420],
		  letter: [279.4, 215.9],
		  legal: [355.6, 215.9],
		};
	  
		const [width, height] = PAGE_SIZES[pageSize] || PAGE_SIZES["a4"];
	  
		const doc = new jsPDF({
		  orientation: "landscape",
		  unit: "mm",
		  format: [width, height],
		});
	  
		// Determine visible columns
		const visibleColumns = columnOrder.filter(
		  (column) =>
			selectedColumns[column] &&
			column !== "annexure" &&
			column !== "statementOfVerification" &&
			column !== "stockRegNameAndVolNo" &&
			column !== "nameOfCenter"
		);
	  
		// Set styling variables
		const margin = 10;
		const tableWidth = width - margin * 2;
	  
		// Define heights for title rows
		const titleRowHeight = 8;
		const headerRowHeight = 10;
		const minRowHeight = 8; // Minimum row height
		const cellPadding = 2; // Padding inside cells
	  
		// Set starting Y position
		let currentY = margin;
	  
		// Draw borders and add text for title rows using variables from columnAliases
		doc.setDrawColor(0);
		doc.setLineWidth(0.1);
	  
		// Row 1: Annexure
		doc.rect(margin, currentY, tableWidth, titleRowHeight);
		doc.setFontSize(8);
		doc.setFont("helvetica", "bold");
		doc.text(columnAliases.annexure, width / 2, currentY + titleRowHeight / 2 + 2, { align: "center" });
		currentY += titleRowHeight;
	  
		// Row 2: Department and register info
		const halfWidth = tableWidth / 2;
		doc.rect(margin, currentY, halfWidth, titleRowHeight);
		doc.rect(margin + halfWidth, currentY, halfWidth, titleRowHeight);
	  
		doc.setFontSize(8);
		doc.text(columnAliases.nameOfCenter, margin + halfWidth / 2, currentY + titleRowHeight / 2 + 2, { align: "center" });
		doc.text(columnAliases.stockRegNameAndVolNo, margin + halfWidth + halfWidth / 2, currentY + titleRowHeight / 2 + 2, { align: "center" });
		currentY += titleRowHeight;
	  
		// Row 3: Statement of Verification
		doc.rect(margin, currentY, tableWidth, titleRowHeight);
		doc.text(columnAliases.statementOfVerification, width / 2, currentY + titleRowHeight / 2 + 2, { align: "center" });
		currentY += titleRowHeight;
	  
		// Table header position
		const tableStartY = currentY;
	  
		// Calculate column widths based on available space
		const columnWidths: Record<string, number> = {};
		const totalTableWidth = tableWidth;
	  
		// Updated relative column widths with keys matching state
		const columnWidthFactors: Record<string, number> = {
		  serialNo: 3,
		  stockRegister: 10,
		  stockName: 5,
		  stockDescription: 8,
		  stockId: 4,
		  location: 4,
		  quantity: 4,
		  price: 4,
		  status: 4,
		  remarks: 5,
		  staff: 5,
		  budgetName: 5,
		  categoryName: 4,
		  invoiceNo: 4,
		  fromAddress: 5,
		  toAddress: 5,
		};
	  
		// Calculate total factors
		const totalFactors = visibleColumns.reduce(
		  (total, col) => total + (columnWidthFactors[col] || 5),
		  0
		);
	  
		// Set actual widths based on factors
		visibleColumns.forEach((col) => {
		  columnWidths[col] = ((columnWidthFactors[col] || 5) / totalFactors) * totalTableWidth;
		});
	  
		// Draw header cells
		let currentX = margin;
		doc.rect(margin, tableStartY, tableWidth, headerRowHeight);
	  
		visibleColumns.forEach((column) => {
		  const colWidth = columnWidths[column];
		  doc.rect(currentX, tableStartY, colWidth, headerRowHeight);
	  
		  doc.setFont("helvetica", "bold");
		  doc.setFontSize(8);
		  
		  // Center text vertically in header cell
		  doc.text(
			columnAliases[column] || column,
			currentX + colWidth / 2,
			tableStartY + headerRowHeight / 2,
			{ 
			  align: "center", 
			  maxWidth: colWidth - (2 * cellPadding),
			  baseline: 'middle'
			}
		  );
	  
		  currentX += colWidth;
		});
	  
		// Improved function to calculate text height with better precision
		const calculateTextHeight = (text: string, fontSize: number, maxWidth: number): number => {
		  doc.setFontSize(fontSize);
		  
		  // Split text into lines based on available width
		  const textLines = doc.splitTextToSize(text, maxWidth);
		  
		  // Calculate height based on font size and line count
		  // Use a multiplier that accounts for line spacing (1.2 is common)
		  const lineHeight = fontSize * 0.352778; // Convert pt to mm (1pt = 0.352778mm)
		  const textHeight = textLines.length * lineHeight * 1.2;
		  
		  // Add padding to ensure text doesn't touch borders
		  return textHeight + (2 * cellPadding);
		};
	  
		// Add table data rows with adaptive heights
		let rowY = tableStartY + headerRowHeight;
	  
		// Function to add a new page with headers
		const addNewPageWithHeaders = () => {
		  doc.addPage();
		  currentY = margin;
	  
		  // Re-add title rows on the new page
		  doc.rect(margin, currentY, tableWidth, titleRowHeight);
		  doc.setFontSize(8);
		  doc.setFont("helvetica", "bold");
		  doc.text(columnAliases.annexure, width / 2, currentY + titleRowHeight / 2 + 2, { align: "center" });
		  currentY += titleRowHeight;
	  
		  doc.rect(margin, currentY, halfWidth, titleRowHeight);
		  doc.rect(margin + halfWidth, currentY, halfWidth, titleRowHeight);
		  doc.setFontSize(8);
		  doc.text(columnAliases.nameOfCenter, margin + halfWidth / 2, currentY + titleRowHeight / 2 + 2, { align: "center" });
		  doc.text(columnAliases.stockRegNameAndVolNo, margin + halfWidth + halfWidth / 2, currentY + titleRowHeight / 2 + 2, { align: "center" });
		  currentY += titleRowHeight;
	  
		  doc.rect(margin, currentY, tableWidth, titleRowHeight);
		  doc.text(columnAliases.statementOfVerification, width / 2, currentY + titleRowHeight / 2 + 2, { align: "center" });
		  currentY += titleRowHeight;
	  
		  const newTableStartY = currentY;
		  doc.rect(margin, newTableStartY, tableWidth, headerRowHeight);
	  
		  currentX = margin;
		  visibleColumns.forEach((column) => {
			const colWidth = columnWidths[column];
			doc.rect(currentX, newTableStartY, colWidth, headerRowHeight);
			doc.setFont("helvetica", "bold");
			doc.setFontSize(8);
			doc.text(
			  columnAliases[column] || column,
			  currentX + colWidth / 2,
			  newTableStartY + headerRowHeight / 2,
			  { 
				align: "center", 
				maxWidth: colWidth - (2 * cellPadding),
				baseline: 'middle'
			  }
			);
			currentX += colWidth;
		  });
	  
		  return newTableStartY + headerRowHeight;
		};
	  
		// Process each stock item
		stocks.forEach((stock, index) => {
		  // First pass: calculate the required row height
		  let rowHeight = minRowHeight;
	  
		  visibleColumns.forEach((column) => {
			const colWidth = columnWidths[column];
			let cellContent = "";
	  
			if (column === "stockRegister") {
			  cellContent = `Vol-${stock["stockId"].split("-")[0]} Page-${stock["stockId"].split("-")[1]} Serial-${stock["stockId"].split("-")[2]}`;
			} else if (column === "serialNo") {
			  cellContent = String(index + 1);
			} else {
			  cellContent = String(stock[column as keyof Stock] || "");
			}
	  
			// Calculate height needed for this cell's content
			const fontSize = column === "stockRegister" ? 6 : 7;
			const cellHeight = calculateTextHeight(cellContent, fontSize, colWidth - (2 * cellPadding));
	  
			// Update row height if this cell needs more space
			if (cellHeight > rowHeight) {
			  rowHeight = cellHeight;
			}
		  });
	  
		  // Add a bit of extra height to prevent overflow
		  rowHeight += 2;
	  
		  // Check if this row will fit on the current page
		  if (rowY + rowHeight > height - 20) {
			// Add a new page and reset Y position
			rowY = addNewPageWithHeaders();
		  }
	  
		  // Draw the outer row rectangle
		  doc.rect(margin, rowY, tableWidth, rowHeight);
	  
		  // Second pass: render the cell content
		  currentX = margin;
		  visibleColumns.forEach((column) => {
			const colWidth = columnWidths[column];
			doc.rect(currentX, rowY, colWidth, rowHeight);
	  
			let cellContent = "";
			if (column === "stockRegister") {
			  cellContent = `Vol-${stock["stockId"].split("-")[0]} Page-${stock["stockId"].split("-")[1]} Serial-${stock["stockId"].split("-")[2]}`;
			} else if (column === "serialNo") {
			  cellContent = String(index + 1);
			} else {
			  cellContent = String(stock[column as keyof Stock] || "");
			}
	  
			doc.setFont("helvetica", "normal");
			doc.setFontSize(column === "stockRegister" ? 6 : 7);
	  
			// Get text split into lines for this cell
			const maxWidth = colWidth - (2 * cellPadding);
			const textLines = doc.splitTextToSize(cellContent, maxWidth);
			
			if (column === "stockRegister") {
			  // Left-aligned text for stockRegister with proper vertical alignment
			  const lineHeight = (column === "stockRegister" ? 6 : 7) * 0.352778; // Convert pt to mm
			  
			  // Calculate top position to properly center the text block
			  const textBlockHeight = textLines.length * lineHeight;
			  const startY = rowY + (rowHeight - textBlockHeight) / 2;
			  
			  // Draw each line individually with proper spacing
			  // @ts-ignore
			  textLines.forEach((line, i) => {
				doc.text(line, currentX + cellPadding, startY + (i * lineHeight * 1.2));
			  });
			} else {
			  // Center-aligned text for other columns
			  if (textLines.length === 1) {
				// If single line, use baseline middle for perfect centering
				doc.text(cellContent, currentX + colWidth / 2, rowY + rowHeight / 2, {
				  align: "center",
				  maxWidth,
				  baseline: 'middle'
				});
			  } else {
				// For multiple lines, calculate proper vertical spacing
				const lineHeight = (column === "stockRegister" ? 6 : 7) * 0.352778; // Convert pt to mm
				const textBlockHeight = textLines.length * lineHeight * 1.2;
				const startY = rowY + (rowHeight - textBlockHeight) / 2;
				
				// Draw each line centered
				// @ts-ignore
				textLines.forEach((line, i) => {
				  doc.text(line, currentX + colWidth / 2, startY + (i * lineHeight * 1.2), {
					align: "center"
				  });
				});
			  }
			}
	  
			currentX += colWidth;
		  });
	  
		  // Move to the next row position
		  rowY += rowHeight;
		});
	  
		// Add page numbers
		// @ts-ignore
		const pageCount = doc.internal.getNumberOfPages();
		for (let i = 1; i <= pageCount; i++) {
		  doc.setPage(i);
		  doc.setFontSize(8);
		  doc.text(`Page ${i} of ${pageCount}`, width / 2, height - 10, { align: "center" });
		}
	  
		doc.save(`Stock_Report_${pageSize.toUpperCase()}.pdf`);
	  };

	return (
		<>
			<Navbar />
			<div className="p-10 mx-auto">
				<h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
					Report Generation
				</h1>
				<FilterDropdown year={yearFilter} onYearChange={setYearFilter} />
				<ColumnSelection
					selectedColumns={selectedColumns}
					onToggleColumn={handleColumnSelection}
				/>
				<ColumnReorder
					columnOrder={columnOrder}
					selectedColumns={selectedColumns}
					columnAliases={columnAliases}
					moveColumn={moveColumn}
					onAliasChange={handleAliasChange}
				/>
				<StockTable
					stocks={stocks}
					columnOrder={columnOrder}
					selectedColumns={selectedColumns}
					columnAliases={columnAliases}
					annexure={columnAliases.annexure}
					nameOfCenter={columnAliases.nameOfCenter}
					stockRegNameAndVolNo={columnAliases.stockRegNameAndVolNo}
					statementOfVerification={columnAliases.statementOfVerification}
				/>
				<ExportButtons onExportExcel={exportToExcel} onExportPDF={exportToPDF} />
			</div>
		</>
	);
};

export default ReportGeneration;
