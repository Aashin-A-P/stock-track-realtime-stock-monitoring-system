import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CategoryScale } from "chart.js";

const ReportGeneration: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumns>({
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

  const [columnAliases, setColumnAliases] = useState<ColumnAliases>({
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

  const [yearFilter, setYearFilter] = useState<string>("2024");

  useEffect(() => {
    const generateDummyData = (): Stock[] =>
      Array.from({ length: 25 }, (_, index) => ({
        budgetName: "Budget Name",
        categoryName: "Category",
        invoiceNo: "Invoice No",
        fromAddress: "From Address",
        toAddress: "To Address",
        serialNo: index + 1,
        volNo: `Vol-${Math.floor(Math.random() * 100)}`,
        pageNo: `Page-${Math.floor(Math.random() * 100)}`,
        stockName: `Stock ${index + 1}`,
        stockDescription: `Description of Stock ${index + 1}`,
        stockId: `ID-${index + 1}`,
        location: `Location ${Math.floor(Math.random() * 10)}`,
        quantity: Math.floor(Math.random() * 100),
        price: parseFloat((Math.random() * 1000).toFixed(2)),
        status: "Status",
        remarks: `Remark ${index + 1}`,
        staff: "Staff Incharge",
      }));

    setStocks(generateDummyData());
  }, []);

  const [pdfPageSize, setPdfPageSize] = useState<"a4" | "a3" | "letter" | "legal" | "a2">("a4");
const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleColumnSelection = (column: keyof SelectedColumns) => {
    setSelectedColumns((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }));
  };

  const handleColumnAliasChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    column: keyof ColumnAliases
  ) => {
    setColumnAliases((prev) => ({ ...prev, [column]: e.target.value }));
  };

  const exportToExcel = () => {
    const tableData = stocks.map((stock) => {
        const row: Record<string, any> = {};
        Object.entries(selectedColumns).forEach(([key, isSelected]) => {
            if (isSelected) {
                row[columnAliases[key as keyof ColumnAliases]] =
                    key === "stockRegister"
                        ? `${stock.volNo}, ${stock.pageNo}, ${stock.serialNo}`
                        : stock[key as keyof Stock];
            }
        });
        return row;
    });

    // Convert JSON to Sheet
    const ws = XLSX.utils.json_to_sheet(tableData);

    // Determine column widths dynamically
    const columnWidths = Object.keys(tableData[0] || {}).map((key) => ({
        wch: Math.max(
            key.length,  // Minimum width based on header name
            ...tableData.map(row => row[key]?.toString().length || 10) // Max content length
        ) + 2 // Extra padding
    }));

    ws['!cols'] = columnWidths; // Apply column widths

    // Apply borders to all cells
    const range = XLSX.utils.decode_range(ws['!ref']!); // Get worksheet range
    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
            if (!ws[cellRef]) continue; // Skip empty cells

            ws[cellRef].s = {
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                }
            };
        }
    }

    // Create workbook and export
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Report");
    XLSX.writeFile(wb, "Stock_Report.xlsx");
};

  
  // Define dimensions for different page sizes (landscape mode)
  const PAGE_SIZES: Record<string, [number, number]> = {
      a4: [297, 210],    // A4 Landscape: 297mm x 210mm
      letter: [279, 216], // Letter Landscape: 279mm x 216mm
      legal: [356, 216],  // Legal Landscape: 356mm x 216mm
      a2: [594, 420],   
      a3: [420, 297],
  };
  
  const exportToPDF = (pageSize: "a4" | "letter" | "legal" | "a3" | "a2" = "a4") => {
      const [width, height] = PAGE_SIZES[pageSize] || PAGE_SIZES["a4"]; // Default to A4 if invalid
  
      // Create jsPDF instance with correct dimensions
      const doc = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: [width, height], // Explicitly set page size
      });
  
      const tableData = stocks.map((stock) => {
          const row: Record<string, any> = {};
          Object.entries(selectedColumns).forEach(([key, isSelected]) => {
              if (isSelected) {
                  row[columnAliases[key as keyof ColumnAliases]] =
                      key === "stockRegister"
                          ? `${stock.volNo}, ${stock.pageNo}, ${stock.serialNo}`
                          : stock[key as keyof Stock];
              }
          });
          return row;
      });
  
      // Table columns (Filtered based on selectedColumns)
      const tableColumns = Object.keys(selectedColumns)
          .filter((key) => selectedColumns[key]) // Include only selected columns
          .map((key) => columnAliases[key as keyof ColumnAliases]);
  
      // Check if there is data to export
      if (tableData.length === 0) {
          console.warn("No data available to export.");
          return;
      }
  
      // Generate the table
      (doc as any).autoTable({
        head: [tableColumns],
        body: tableData.map((row) => tableColumns.map((col) => row[col] || "")), // Ensure correct column order
        styles: { lineWidth: 0.1, lineColor: "#000" }, // Thin black outline
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: "#000",
            fontStyle: "bold",
        }, // Bold headers, no color
        bodyStyles: { textColor: "#000" }, // Normal text
        startY: 20,
        margin: { left: 10, right: 10 },
    });
    
    // Get total pages after the table is fully drawn
    const totalPages = doc.getNumberOfPages();
    
    // Loop through each page and add the footer
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); // Move to the specific page
        doc.setFontSize(10);
        doc.text(
            `Page ${i} of ${totalPages}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" }
        );
    }
            
    
      // Save the PDF
      doc.save(`Stock_Report_${pageSize.toUpperCase()}.pdf`);
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
          <label htmlFor="yearFilter" className="block font-medium mb-1">
            Filter by Year
          </label>
          <select
            id="yearFilter"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2023, 2022, 2021, 2020].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
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
                  checked={selectedColumns[column as keyof SelectedColumns]}
                  onChange={() =>
                    handleColumnSelection(column as keyof SelectedColumns)
                  }
                  className="mr-2"
                />
                <span>{column as keyof ColumnAliases}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Column Aliases */}
        <div className="mb-4">
          <h2 className="font-semibold text-gray-700 mb-2">Column Aliases</h2>
          <div className="space-y-2">
            {Object.keys(selectedColumns).map((column) =>
              selectedColumns[column as keyof SelectedColumns] ? (
                <div key={column} className="flex items-center">
                  <label className="w-1/3 font-medium text-gray-700">
                    {column as keyof ColumnAliases}:
                  </label>
                  <input
                    placeholder="Enter alias"
                    type="text"
                    value={columnAliases[column as keyof ColumnAliases]}
                    onChange={(e) =>
                      handleColumnAliasChange(e, column as keyof ColumnAliases)
                    }
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
                {Object.entries(selectedColumns).map(
                  ([column, isSelected]) =>
                    isSelected && (
                      <th key={column} className="p-4">
                        {columnAliases[column as keyof ColumnAliases]}
                      </th>
                    )
                )}
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-none hover:bg-blue-50"
                >
                  {Object.entries(selectedColumns).map(
                    ([column, isSelected]) =>
                      isSelected && (
                        <td key={column} className="p-4">
                          {column === "stockRegister"
                            ? `${stock.volNo}, ${stock.pageNo}, ${stock.serialNo}`
                            : stock[column as keyof Stock]}
                        </td>
                      )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between">
  {/* Export to Excel Button */}
  <button
    onClick={exportToExcel}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    Export to Excel
  </button>

  {/* Export to PDF with Drop-Up Menu */}
  <div className="relative">
    <button
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
    >
      Export to PDF
      <span className="ml-2">&#9652;</span> {/* Upward Arrow for Drop-Up */}
    </button>

    {/* Drop-Up Menu */}
    {isDropdownOpen && (
      <div className="absolute right-0 bottom-full mb-2 w-40 bg-white border border-gray-300 shadow-lg rounded">
        {["a4", "a3","a2", "letter", "legal"].map((size) => (
          <button
            key={size}
            onClick={() => {
              setPdfPageSize(size as "a4" | "a3" | "letter" | "legal" | "a2");
              setIsDropdownOpen(false); // Close dropdown after selection
              exportToPDF(size as "a4" | "a3" | "letter" | "legal" | "a2");
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            {size.toUpperCase()}
          </button>
        ))}
      </div>
    )}
  </div>
</div>
      </div>
    </>
  );
};

export default ReportGeneration;

// Interfaces
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
  budgetName: string,
}

interface SelectedColumns {
  [key: string]: boolean;
}

interface ColumnAliases {
  [key: string]: string;
}
