import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReportGeneration: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumns>({
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

  const [columnAliases, setColumnAliases] = useState<ColumnAliases>({
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

  const [yearFilter, setYearFilter] = useState<string>("2024");

  useEffect(() => {
    const generateDummyData = (): Stock[] =>
      Array.from({ length: 25 }, (_, index) => ({
        serialNo: index + 1,
        volNo: `Vol-${Math.floor(Math.random() * 100)}`,
        pageNo: `Page-${Math.floor(Math.random() * 100)}`,
        stockName: `Stock ${index + 1}`,
        stockDescription: `Description of Stock ${index + 1}`,
        stockId: `ID-${index + 1}`,
        location: `Location ${Math.floor(Math.random() * 10)}`,
        quantity: Math.floor(Math.random() * 100),
        price: parseFloat((Math.random() * 1000).toFixed(2)),
        remarks: `Remark ${index + 1}`,
      }));

    setStocks(generateDummyData());
  }, []);

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
    const doc = new jsPDF({ orientation: "landscape" });

    // Prepare table data
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

    // Table columns
    const tableColumns = [
      columnAliases.serialNo,
      columnAliases.stockRegister,
      columnAliases.stockName,
      columnAliases.stockDescription,
      columnAliases.stockId,
      columnAliases.location,
      columnAliases.quantity,
      columnAliases.price,
      columnAliases.remarks,
    ];

    // Add table
    // @ts-expect-error - Property 'autoTable' exist on type 'jsPDF' with jspdf-autotable extention.
    doc.autoTable({
      head: [tableColumns],
      body: tableData,
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

    // Footer with signature placeholders
    // @ts-expect-error - Property 'internal' exist on type 'jsPDF' with jspdf-autotable extention.
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text("Signature (Left)", 20, doc.internal.pageSize.height - 10); // Left footer
      doc.text(
        "Signature (Right)",
        doc.internal.pageSize.width - 50,
        doc.internal.pageSize.height - 10
      ); // Right footer
    }

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
                <span>{columnAliases[column as keyof ColumnAliases]}</span>
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
                    {columnAliases[column as keyof ColumnAliases]}:
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
}

interface SelectedColumns {
  [key: string]: boolean;
}

interface ColumnAliases {
  [key: string]: string;
}
