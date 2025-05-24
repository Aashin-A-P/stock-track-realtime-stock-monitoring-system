import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../components/Navbar";
import * as ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import YearDropdown from "../components/YearDropdown";
import { useDashboard } from "../context/DashboardContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// ======================
// Constants for Stock Register Group
// ======================
const STOCK_REGISTER_GROUP_KEY = "stockRegisterGroup";
const STOCK_REG_SUB_COLUMNS = [
  {
    id: "volNoSub",
    defaultHeader: "VOL. NO.",
    dataKey: "volNo" as keyof Stock,
  },
  {
    id: "pageNoSub",
    defaultHeader: "PAGE NO.",
    dataKey: "pageNo" as keyof Stock,
  },
  {
    id: "serialNoSub",
    defaultHeader: "SERIAL NO.",
    dataKey: "serialNo" as keyof Stock,
  },
];

// ======================
// Interfaces & Types
// ======================
interface Stock {
  serialNo: string;
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
  statementOfVerification?: string;
}

interface SelectedColumns {
  [key: string]: boolean;
}

interface ColumnAliases {
  [key: string]: string;
}

interface DragItem {
  index: number;
  type: string;
}

// Types for Excel column definitions
interface ExcelSubColumnInfo {
  id: (typeof STOCK_REG_SUB_COLUMNS)[number]["id"];
  defaultHeader: (typeof STOCK_REG_SUB_COLUMNS)[number]["defaultHeader"];
  dataKey: (typeof STOCK_REG_SUB_COLUMNS)[number]["dataKey"];
  groupHeader: string; // Mandatory for this type
}

interface ExcelMainColumnInfo {
  id: string;
  defaultHeader: string;
  dataKey: keyof Stock | "displaySerialNo";
  // No groupHeader property here
}
type ActualExcelColumnInfo = ExcelSubColumnInfo | ExcelMainColumnInfo;

const formatColumnKeyForDisplay = (key: string): string => {
  if (key === "displaySerialNo") return "S.No.";
  if (key === STOCK_REGISTER_GROUP_KEY) return "Stock Register";
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

// ======================
// Filter Dropdown Component
// ======================
interface FilterDropdownProps {
  year: number;
  onYearChange: (year: number, startDate: string, endDate: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  year,
  onYearChange,
}) => {
  const { years } = useDashboard();
  const handleYearSelect = (selectedYearValue: number) => {
    const yearStr = selectedYearValue.toString();
    const [startYearStr, endYearStr] = yearStr.split("-");
    const startYear = parseInt(startYearStr);
    const endYear = endYearStr ? parseInt(endYearStr) : startYear;
    const startDate = `${startYear}-04-01`;
    const financialEndDate = `${endYear + (endYearStr ? 0 : 1)}-03-31`;
    onYearChange(selectedYearValue, startDate, financialEndDate);
  };
  return (
    <div className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
      <label className="block font-medium mb-2 text-gray-700">
        Filter by Budget Year
      </label>
      <YearDropdown
        selectedYear={year}
        onSelectYear={handleYearSelect}
        years={years}
      />
    </div>
  );
};

// ======================
// Column Selection Component
// ======================
interface ColumnSelectionProps {
  selectedColumns: SelectedColumns;
  onToggleColumn: (column: string) => void;
  allPossibleColumnsForSelection: string[];
}

const ColumnSelection: React.FC<ColumnSelectionProps> = ({
  selectedColumns,
  onToggleColumn,
  allPossibleColumnsForSelection,
}) => {
  return (
    <div className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
      <h2 className="font-semibold text-gray-700 mb-3 text-lg">
        Select Columns to Display
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {allPossibleColumnsForSelection
          .filter(
            (col) =>
              ![
                "annexure",
                "nameOfCenter",
                "stockRegNameAndVolNo",
                "statementOfVerification",
              ].includes(col)
          )
          .map((columnKey) => (
            <label
              key={columnKey}
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!selectedColumns[columnKey]}
                onChange={() => onToggleColumn(columnKey)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 capitalize text-sm">
                {formatColumnKeyForDisplay(columnKey)}
              </span>
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
  columnKey: string;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  alias: string;
  handleAliasChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    columnKey: string
  ) => void;
}

const DraggableColumn: React.FC<DraggableColumnProps> = ({
  columnKey,
  index,
  moveColumn,
  alias,
  handleAliasChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const displayColumnName = formatColumnKeyForDisplay(columnKey);

  const [{ isDragging }, drag] = useDrag({
    type: "COLUMN",
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop<
    DragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: "COLUMN",
    hover: (item: DragItem, monitor: DropTargetMonitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (
        (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
        (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
      )
        return;
      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`flex items-center p-3 border border-gray-300 rounded-md bg-white shadow-sm transition-all transform ${
        isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"
      } cursor-grab active:cursor-grabbing`}
    >
      <span className="mr-3 text-gray-500 text-lg">☰</span>
      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 items-center gap-2">
        <span className="text-sm font-medium text-gray-800 capitalize">
          {displayColumnName}
        </span>
        <input
          type="text"
          value={alias}
          onChange={(e) => handleAliasChange(e, columnKey)}
          placeholder={`Rename ${displayColumnName}`}
          className="text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

// ======================
// Column Reorder & Rename Component
// ======================
interface ColumnReorderProps {
  draggableColumnOrder: string[];
  columnAliases: Record<string, string>;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  onAliasChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    columnKey: string
  ) => void;
  onAliasChangeForSpecialHeader: (
    e: React.ChangeEvent<HTMLInputElement>,
    headerKey:
      | "annexure"
      | "nameOfCenter"
      | "stockRegNameAndVolNo"
      | "statementOfVerification"
  ) => void;
}

const ColumnReorder: React.FC<ColumnReorderProps> = ({
  draggableColumnOrder,
  columnAliases,
  moveColumn,
  onAliasChange,
  onAliasChangeForSpecialHeader,
}) => {
  const specialHeaderKeys: Array<
    | "annexure"
    | "nameOfCenter"
    | "stockRegNameAndVolNo"
    | "statementOfVerification"
  > = [
    "annexure",
    "nameOfCenter",
    "stockRegNameAndVolNo",
    "statementOfVerification",
  ];
  return (
    <div className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
      <h2 className="font-semibold text-gray-700 text-lg mb-3">
        Reorder & Rename Columns
      </h2>
      <DndProvider backend={HTML5Backend}>
        <div className="space-y-2">
          {draggableColumnOrder.map((columnKey, index) => (
            <DraggableColumn
              key={columnKey}
              columnKey={columnKey}
              index={index}
              moveColumn={moveColumn}
              alias={
                columnAliases[columnKey] || formatColumnKeyForDisplay(columnKey)
              }
              handleAliasChange={onAliasChange}
            />
          ))}
        </div>
      </DndProvider>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="font-semibold text-gray-700 text-md mb-3">
          Rename Report Headers
        </h3>
        <div className="space-y-3">
          {specialHeaderKeys.map((key) => (
            <div
              key={key}
              className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2"
            >
              <label
                htmlFor={`alias-${key}`}
                className="text-sm font-medium text-gray-800 capitalize"
              >
                {formatColumnKeyForDisplay(key)}:
              </label>
              <input
                type="text"
                id={`alias-${key}`}
                value={columnAliases[key] || ""}
                onChange={(e) => onAliasChangeForSpecialHeader(e, key)}
                placeholder={`Enter ${formatColumnKeyForDisplay(key)}`}
                className="text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>
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
  annexureText?: string;
  nameOfCenterText?: string;
  stockRegNameAndVolNoText?: string;
  statementOfVerificationText?: string;
}

const StockTable: React.FC<StockTableProps> = ({
  stocks,
  columnOrder,
  selectedColumns,
  columnAliases,
  annexureText,
  nameOfCenterText,
  stockRegNameAndVolNoText,
  statementOfVerificationText,
}) => {
  const getColumnDisplayName = (colKey: string) =>
    columnAliases[colKey] || formatColumnKeyForDisplay(colKey);

  const actualDataColumns = columnOrder
    .flatMap((colKey) => {
      if (
        colKey === STOCK_REGISTER_GROUP_KEY &&
        selectedColumns[STOCK_REGISTER_GROUP_KEY]
      ) {
        return STOCK_REG_SUB_COLUMNS.map((sc) => ({
          key: sc.id,
          dataKey: sc.dataKey,
          isSubColumn: true,
        }));
      }
      if (selectedColumns[colKey] && colKey !== STOCK_REGISTER_GROUP_KEY) {
        return [
          {
            key: colKey,
            dataKey: colKey as keyof Stock | "displaySerialNo",
            isSubColumn: false,
          },
        ];
      }
      return [];
    })
    .filter(Boolean);

  const colCount = actualDataColumns.length;
  const isStockRegisterGroupSelected =
    selectedColumns[STOCK_REGISTER_GROUP_KEY] === true &&
    columnOrder.includes(STOCK_REGISTER_GROUP_KEY);

  if (colCount === 0 && stocks.length === 0)
    return (
      <div className="p-4 text-center text-gray-500">
        Select columns and filters.
      </div>
    );
  if (colCount === 0 && stocks.length > 0)
    return (
      <div className="p-4 text-center text-gray-500">No columns selected.</div>
    );
  if (colCount > 0 && stocks.length === 0)
    return (
      <div className="p-4 text-center text-gray-500">No data for filters.</div>
    );

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
      <table
        id="stockReportTable"
        className="w-full text-xs text-left border-collapse border border-black"
      >
        <thead className="text-black align-middle">
          {annexureText && (
            <tr className="bg-white">
              <th
                colSpan={colCount || 1}
                className="p-2 border border-black text-center font-bold text-sm h-10"
              >
                {annexureText}
              </th>
            </tr>
          )}
          {(nameOfCenterText || stockRegNameAndVolNoText) && (
            <tr className="bg-white">
              {nameOfCenterText && (
                <th
                  colSpan={
                    nameOfCenterText && stockRegNameAndVolNoText
                      ? Math.ceil(colCount / 2)
                      : colCount || 1
                  }
                  className="p-2 border border-black text-center font-semibold h-10"
                >
                  {nameOfCenterText}
                </th>
              )}
              {stockRegNameAndVolNoText && (
                <th
                  colSpan={
                    nameOfCenterText && stockRegNameAndVolNoText
                      ? Math.floor(colCount / 2)
                      : colCount || 1
                  }
                  className="p-2 border border-black text-center font-semibold h-10"
                >
                  {stockRegNameAndVolNoText}
                </th>
              )}
            </tr>
          )}
          {statementOfVerificationText && (
            <tr className="bg-white">
              <th
                colSpan={colCount || 1}
                className="p-2 border border-black text-center font-bold text-sm h-10"
              >
                {statementOfVerificationText}
              </th>
            </tr>
          )}

          <tr className="bg-gray-200">
            {columnOrder
              .filter((colKey) => selectedColumns[colKey])
              .map((colKey) => {
                if (colKey === STOCK_REGISTER_GROUP_KEY) {
                  return (
                    <th
                      key={colKey}
                      colSpan={STOCK_REG_SUB_COLUMNS.length}
                      className="p-2 border border-black font-bold text-center h-12 align-middle"
                    >
                      {getColumnDisplayName(colKey)}
                    </th>
                  );
                } else {
                  return (
                    <th
                      key={colKey}
                      rowSpan={isStockRegisterGroupSelected ? 2 : 1}
                      className="p-2 border border-black font-bold text-center h-12 align-middle"
                    >
                      {getColumnDisplayName(colKey)}
                    </th>
                  );
                }
              })}
          </tr>
          {isStockRegisterGroupSelected && (
            <tr className="bg-gray-200">
              {columnOrder
                .filter((colKey) => selectedColumns[colKey])
                .flatMap((colKey) => {
                  if (colKey === STOCK_REGISTER_GROUP_KEY) {
                    return STOCK_REG_SUB_COLUMNS.map((subCol) => (
                      <th
                        key={subCol.id}
                        className="p-2 border border-black font-bold text-center h-12"
                      >
                        {subCol.defaultHeader}
                      </th>
                    ));
                  }
                  return [];
                })}
            </tr>
          )}
        </thead>
        <tbody>
          {stocks.map((stock, idx) => (
            <tr
              key={stock.stockId + idx}
              className="hover:bg-gray-50 transition-colors"
            >
              {actualDataColumns.map((col) => (
                <td
                  key={col.key}
                  className={`p-2 border border-black break-words align-top ${
                    [
                      "quantity",
                      "price",
                      "displaySerialNo",
                      ...STOCK_REG_SUB_COLUMNS.map((s) => s.id),
                    ].includes(col.key)
                      ? "text-center"
                      : "text-left"
                  } ${col.key === "stockDescription" ? "min-w-[200px]" : ""}`}
                >
                  {col.key === "displaySerialNo"
                    ? idx + 1
                    : String(stock[col.dataKey as keyof Stock] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ======================
// Export Buttons
// ======================
interface ExportButtonsProps {
  onExportExcel: () => void;
  onExportPDF: (pageSize: "a4" | "a3" | "a2" | "letter" | "legal") => void;
  onPrintTable: () => void;
  hasData: boolean;
}
const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportExcel,
  onExportPDF,
  onPrintTable,
  hasData,
}) => {
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
      <button
        onClick={onPrintTable}
        disabled={!hasData}
        className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Print Table
      </button>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={onExportExcel}
          disabled={!hasData}
          className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export to Excel
        </button>
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setIsPdfDropdownOpen(!isPdfDropdownOpen)}
            disabled={!hasData}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export to PDF{" "}
            <span
              className={`ml-2 transform transition-transform ${
                isPdfDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </button>
          {isPdfDropdownOpen && (
            <div className="absolute right-0 sm:left-0 bottom-full mb-1 w-full sm:w-40 bg-white border border-gray-300 shadow-lg rounded-md z-10">
              {["a4", "a3", "a2", "letter", "legal"].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setIsPdfDropdownOpen(false);
                    onExportPDF(size as any);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ======================
// Main ReportGeneration Component
// ======================
const ALL_SELECTABLE_COLUMNS: Array<
  | keyof Omit<Stock, "volNo" | "pageNo" | "serialNo">
  | "displaySerialNo"
  | typeof STOCK_REGISTER_GROUP_KEY
> = [
  "displaySerialNo",
  STOCK_REGISTER_GROUP_KEY,
  "stockId",
  "stockName",
  "stockDescription",
  "location",
  "quantity",
  "price",
  "remarks",
  "budgetName",
  "categoryName",
  "invoiceNo",
  "fromAddress",
  "toAddress",
  "status",
  "staff",
];

const ReportGeneration: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const [stocks, setStocks] = useState<Stock[]>([]);

  const initialSelectedColumns = ALL_SELECTABLE_COLUMNS.reduce(
    (acc, colKey) => {
      const key = colKey as string;
      acc[key] = [
        "displaySerialNo",
        STOCK_REGISTER_GROUP_KEY,
        "stockName",
        "quantity",
        "price",
      ].includes(key);
      return acc;
    },
    {} as SelectedColumns
  );
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumns>(
    initialSelectedColumns
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    ALL_SELECTABLE_COLUMNS as string[]
  );

  const initialColumnAliases = {
    annexure: "ANNEXURE - I",
    nameOfCenter: "Name of the Center/Department: Example Department",
    stockRegNameAndVolNo:
      "Name of the Stock Register & Vol.No: Example Register Vol. 1",
    statementOfVerification:
      "STATEMENT SHOWING THE DETAILS OF VERIFICATION OF STORES AND STOCK FOR THE YEAR 2023-2024",
    ...ALL_SELECTABLE_COLUMNS.reduce((acc, colKey) => {
      const key = colKey as string;
      acc[key] = formatColumnKeyForDisplay(key);
      return acc;
    }, {} as ColumnAliases),
  };
  const [columnAliases, setColumnAliases] =
    useState<ColumnAliases>(initialColumnAliases);

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const handleYearChange = (year: number, startDt: string, endDt: string) => {
    setSelectedYear(year);
    setStartDate(startDt);
    setEndDate(endDt);
  };

  const getColumnDisplayName = (colKey: string) =>
    columnAliases[colKey] || formatColumnKeyForDisplay(colKey);

  const fetchSettingsCallback = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/settings`, {
        headers: { Authorization: `${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const newSelectedColumns: SelectedColumns = {
          ...initialSelectedColumns,
        };
        if (data.selectedColumns) {
          (ALL_SELECTABLE_COLUMNS as string[]).forEach((key) => {
            if (data.selectedColumns[key] !== undefined)
              newSelectedColumns[key] = data.selectedColumns[key];
          });
        }
        setSelectedColumns(newSelectedColumns);

        let savedOrder =
          data.columnOrder && Array.isArray(data.columnOrder)
            ? data.columnOrder.filter((col: string) =>
                (ALL_SELECTABLE_COLUMNS as string[]).includes(col)
              )
            : [];
        const baseOrder = ALL_SELECTABLE_COLUMNS as string[];
        setColumnOrder([...new Set([...savedOrder, ...baseOrder])]);

        const newAliases: ColumnAliases = { ...initialColumnAliases };
        if (data.columnAliases) {
          Object.keys(data.columnAliases).forEach((key) => {
            if (
              newAliases[key] !== undefined ||
              [
                "annexure",
                "nameOfCenter",
                "stockRegNameAndVolNo",
                "statementOfVerification",
              ].includes(key)
            ) {
              newAliases[key] = data.columnAliases[key];
            }
          });
        }
        setColumnAliases(newAliases);
      } else {
        console.warn("Failed to fetch settings, using defaults.");
        setSelectedColumns(initialSelectedColumns);
        setColumnOrder(ALL_SELECTABLE_COLUMNS as string[]);
        setColumnAliases(initialColumnAliases);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setSelectedColumns(initialSelectedColumns);
      setColumnOrder(ALL_SELECTABLE_COLUMNS as string[]);
      setColumnAliases(initialColumnAliases);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (token) fetchSettingsCallback();
  }, [fetchSettingsCallback, token]);

  useEffect(() => {
    const getReportData = async () => {
      if (!token) return;
      let url = `${API_URL}/stock/report`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawApiData = await response.json();

        const processedData = (Array.isArray(rawApiData) ? rawApiData : []).map(
          (item: any): Stock => {
            const [vol = "", page = "", ser = ""] =
              item.stockId?.toString().split("-") || [];

            return {
              stockId: item.stockId || "",
              stockName: item.stockName || "N/A",
              stockDescription: item.stockDescription || "",
              location: item.location || "N/A",
              quantity: parseInt(item.quantity, 10) || 0,
              price: parseFloat(item.price) || 0,
              remarks: item.remarks || "",
              budgetName: item.budgetName || "N/A",

              volNo: vol.trim(),
              pageNo: page.trim(),
              serialNo: ser.trim(),

              categoryName: item.categoryName,
              invoiceNo: item.invoiceNo,
              fromAddress: item.fromAddress,
              toAddress: item.toAddress,
              status: item.status,
              staff: item.staff,

              annexure: item.annexure,
              nameOfCenter: item.nameOfCenter,
              stockRegNameAndVolNo: item.stockRegNameAndVolNo,
              statementOfVerification: item.statementOfVerification,
            };
          }
        );

        console.log(
          "Processed Stock Data: ",
          JSON.stringify(processedData, null, 2)
        );
        setStocks(processedData);
      } catch (error) {
        console.error("Failed to fetch stock data:", error);
        setStocks([]);
      }
    };

    getReportData();
  }, [token, startDate, endDate]);

  const saveSettings = useCallback(
    async (settings: {
      selectedColumns: SelectedColumns;
      columnOrder: string[];
      columnAliases: ColumnAliases;
    }) => {
      if (!token) return;
      try {
        await fetch(`${API_URL}/settings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify(settings),
        });
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    },
    [token]
  );

  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    const currentDraggableOrder = columnOrder.filter(
      (colKey) =>
        selectedColumns[colKey] &&
        ![
          "annexure",
          "nameOfCenter",
          "stockRegNameAndVolNo",
          "statementOfVerification",
        ].includes(colKey)
    );
    const draggedItem = currentDraggableOrder[dragIndex];
    const newDraggableOrder = [...currentDraggableOrder];
    newDraggableOrder.splice(dragIndex, 1);
    newDraggableOrder.splice(hoverIndex, 0, draggedItem);

    const fullOrder = ALL_SELECTABLE_COLUMNS as string[];
    const finalNewOrder: string[] = [];
    const draggableSet = new Set(newDraggableOrder);

    newDraggableOrder.forEach((col) => finalNewOrder.push(col));
    fullOrder.forEach((col) => {
      if (!draggableSet.has(col)) {
        finalNewOrder.push(col);
      }
    });

    setColumnOrder(finalNewOrder);
    saveSettings({
      selectedColumns,
      columnOrder: finalNewOrder,
      columnAliases,
    });
  };

  const handleColumnSelection = (columnKey: string) => {
    const updatedSelected = {
      ...selectedColumns,
      [columnKey]: !selectedColumns[columnKey],
    };
    setSelectedColumns(updatedSelected);
    saveSettings({
      selectedColumns: updatedSelected,
      columnOrder,
      columnAliases,
    });
  };

  const handleAliasChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    columnKey: string
  ) => {
    const updatedAliases = { ...columnAliases, [columnKey]: e.target.value };
    setColumnAliases(updatedAliases);
    saveSettings({
      selectedColumns,
      columnOrder,
      columnAliases: updatedAliases,
    });
  };

  const handleAliasChangeForSpecialHeader = (
    e: React.ChangeEvent<HTMLInputElement>,
    headerKey:
      | "annexure"
      | "nameOfCenter"
      | "stockRegNameAndVolNo"
      | "statementOfVerification"
  ) => {
    const updatedAliases = { ...columnAliases, [headerKey]: e.target.value };
    setColumnAliases(updatedAliases);
    saveSettings({
      selectedColumns,
      columnOrder,
      columnAliases: updatedAliases,
    });
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock Report");

    const isStockRegisterGroupSelected =
      selectedColumns[STOCK_REGISTER_GROUP_KEY] === true &&
      columnOrder.includes(STOCK_REGISTER_GROUP_KEY);

    const actualDataColumns: ActualExcelColumnInfo[] = columnOrder.flatMap(
      (colKey): ActualExcelColumnInfo[] => {
        if (
          colKey === STOCK_REGISTER_GROUP_KEY &&
          isStockRegisterGroupSelected
        ) {
          return STOCK_REG_SUB_COLUMNS.map((sc) => ({
            id: sc.id,
            defaultHeader: sc.defaultHeader,
            dataKey: sc.dataKey,
            groupHeader: getColumnDisplayName(STOCK_REGISTER_GROUP_KEY),
          }));
        }
        if (selectedColumns[colKey] && colKey !== STOCK_REGISTER_GROUP_KEY) {
          return [
            {
              id: colKey,
              defaultHeader: getColumnDisplayName(colKey),
              dataKey: colKey as keyof Stock | "displaySerialNo",
            },
          ];
        }
        return [];
      }
    );

    const colCount = actualDataColumns.length;
    if (colCount === 0) return;

    let currentRowIdx = 1;
    const styleCell = (
      cell: ExcelJS.Cell,
      style: Partial<ExcelJS.Style & { value: any }>
    ) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.font = { ...cell.font, ...style.font };
      cell.alignment = { ...cell.alignment, ...style.alignment };
      cell.fill = { ...cell.fill, ...style.fill };
      if (style.value !== undefined) cell.value = style.value;
    };

    if (columnAliases.annexure) {
      worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
      styleCell(worksheet.getCell(currentRowIdx, 1), {
        value: columnAliases.annexure,
        font: { bold: true, size: 12 },
        alignment: { horizontal: "center", vertical: "middle" },
      });
      worksheet.getRow(currentRowIdx).height = 20;
      currentRowIdx++;
    }
    if (columnAliases.nameOfCenter || columnAliases.stockRegNameAndVolNo) {
      const row = worksheet.getRow(currentRowIdx);
      row.height = 20;
      if (columnAliases.nameOfCenter && columnAliases.stockRegNameAndVolNo) {
        const midPoint = Math.ceil(colCount / 2);
        worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, midPoint);
        styleCell(worksheet.getCell(currentRowIdx, 1), {
          value: columnAliases.nameOfCenter,
          font: { bold: false, size: 10 },
          alignment: { horizontal: "center", vertical: "middle" },
        });
        worksheet.mergeCells(
          currentRowIdx,
          midPoint + 1,
          currentRowIdx,
          colCount
        );
        styleCell(worksheet.getCell(currentRowIdx, midPoint + 1), {
          value: columnAliases.stockRegNameAndVolNo,
          font: { bold: false, size: 10 },
          alignment: { horizontal: "center", vertical: "middle" },
        });
      } else if (columnAliases.nameOfCenter) {
        worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
        styleCell(worksheet.getCell(currentRowIdx, 1), {
          value: columnAliases.nameOfCenter,
          font: { bold: false, size: 10 },
          alignment: { horizontal: "center", vertical: "middle" },
        });
      } else if (columnAliases.stockRegNameAndVolNo) {
        worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
        styleCell(worksheet.getCell(currentRowIdx, 1), {
          value: columnAliases.stockRegNameAndVolNo,
          font: { bold: false, size: 10 },
          alignment: { horizontal: "center", vertical: "middle" },
        });
      }
      currentRowIdx++;
    }
    if (columnAliases.statementOfVerification) {
      worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
      styleCell(worksheet.getCell(currentRowIdx, 1), {
        value: columnAliases.statementOfVerification,
        font: { bold: true, size: 12 },
        alignment: { horizontal: "center", vertical: "middle" },
      });
      worksheet.getRow(currentRowIdx).height = 20;
      currentRowIdx++;
    }

    const headerRow1Values: (string | null)[] = [];
    // const headerRow2Values: (string | null)[] = []; // Not directly used to add row, but for logic

    columnOrder
      .filter((colKey) => selectedColumns[colKey])
      .forEach((colKey) => {
        if (colKey === STOCK_REGISTER_GROUP_KEY) {
          headerRow1Values.push(getColumnDisplayName(STOCK_REGISTER_GROUP_KEY));
          for (let i = 1; i < STOCK_REG_SUB_COLUMNS.length; i++)
            headerRow1Values.push(null); // For merging
          // STOCK_REG_SUB_COLUMNS.forEach((sc) => headerRow2Values.push(sc.defaultHeader)); // For headerRow2 if needed
        } else {
          headerRow1Values.push(getColumnDisplayName(colKey));
          // if (isStockRegisterGroupSelected) headerRow2Values.push(null); // For merging
        }
      });

    const r1 = worksheet.addRow(headerRow1Values);
    r1.height = 25;
    r1.eachCell((cell) =>
      styleCell(cell, {
        font: { bold: true, size: 9 },
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD9D9D9" },
        },
      })
    );

    let currentExcelCol = 1;
    columnOrder
      .filter((colKey) => selectedColumns[colKey])
      .forEach((colKey) => {
        if (colKey === STOCK_REGISTER_GROUP_KEY) {
          worksheet.mergeCells(
            currentRowIdx, // current row for header 1
            currentExcelCol,
            currentRowIdx, // same row
            currentExcelCol + STOCK_REG_SUB_COLUMNS.length - 1
          );
          currentExcelCol += STOCK_REG_SUB_COLUMNS.length;
        } else {
          if (isStockRegisterGroupSelected) {
            // If there's a second header row, merge this main column cell
            worksheet.mergeCells(
              currentRowIdx, // current row for header 1
              currentExcelCol,
              currentRowIdx + 1, // merge down to next row
              currentExcelCol
            );
          }
          // If not isStockRegisterGroupSelected, no merge needed, it's a single row header.
          currentExcelCol++;
        }
      });
    const mainHeaderRow1Number = currentRowIdx;
    currentRowIdx++; // Advance to where second header row (if any) or data will start

    if (isStockRegisterGroupSelected) {
      let excelColCursorForSubHeaders = 1; // Tracks current column in Excel for placing sub-headers
      columnOrder
        .filter((colKey) => selectedColumns[colKey])
        .forEach((colKey) => {
          if (colKey === STOCK_REGISTER_GROUP_KEY) {
            STOCK_REG_SUB_COLUMNS.forEach((sc, subIndex) => {
              const cell = worksheet.getCell(
                currentRowIdx, // This is the second header row
                excelColCursorForSubHeaders + subIndex
              );
              cell.value = sc.defaultHeader;
              styleCell(cell, {
                font: { bold: true, size: 9 },
                alignment: {
                  horizontal: "center",
                  vertical: "middle",
                  wrapText: true,
                },
                fill: {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFD9D9D9" },
                },
              });
            });
            excelColCursorForSubHeaders += STOCK_REG_SUB_COLUMNS.length;
          } else {
            // This is a non-grouped, selected column. Its cell in header row 1 was merged downwards.
            // We just need to advance the column cursor.
            excelColCursorForSubHeaders++;
          }
        });
      worksheet.getRow(currentRowIdx).height = 25;
      currentRowIdx++; // Move past the second header row
    }

    stocks.forEach((stock, idx) => {
      const rowData = actualDataColumns.map((colDef) =>
        colDef.id === "displaySerialNo" && !("groupHeader" in colDef) // Ensure it's the main S.No.
          ? idx + 1
          : stock[colDef.dataKey as keyof Stock] ?? ""
      );
      const dataRow = worksheet.addRow(rowData);
      dataRow.height = 18;
      dataRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
        const colInfo = actualDataColumns[colNum - 1];
        if (!colInfo) return;
        let alignment: Partial<ExcelJS.Alignment> = {
          vertical: "top",
          wrapText: true,
          horizontal: [
            "quantity",
            "price",
            "displaySerialNo", // This applies to the main S.No.
            ...STOCK_REG_SUB_COLUMNS.map((s) => s.id),
          ].includes(colInfo.id)
            ? "center"
            : "left",
        };
        styleCell(cell, { font: { size: 8 }, alignment });
        if (typeof cell.value === "number" && colInfo.id === "price")
          cell.numFmt = "#,##0.00";
        else if (
          typeof cell.value === "number" &&
          (colInfo.id === "quantity" || colInfo.id === "serialNoSub")
        )
          cell.numFmt = "#,##0";
      });
    });

    actualDataColumns.forEach((colDef, i) => {
      const column = worksheet.getColumn(i + 1);
      let headerTextForLength = colDef.defaultHeader;
      if (!headerTextForLength && colDef.id) headerTextForLength = colDef.id; // Fallback, though defaultHeader should exist
      let maxLength = headerTextForLength.length;

      stocks.forEach((stock) => {
        let cellValue = "";
        if (colDef.id === "displaySerialNo" && !("groupHeader" in colDef)) {
          cellValue = String(stocks.indexOf(stock) + 1);
        } else {
          cellValue = String(stock[colDef.dataKey as keyof Stock] ?? "");
        }
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });

      if (colDef.id === "stockDescription") column.width = 40;
      else if (colDef.id === "stockName") column.width = 25;
      else column.width = Math.max(10, Math.min(30, maxLength + 2));
    });

    worksheet.pageSetup.printTitlesRow = `${mainHeaderRow1Number}:${
      isStockRegisterGroupSelected
        ? mainHeaderRow1Number + 1
        : mainHeaderRow1Number
    }`;
    worksheet.pageSetup.orientation = "landscape";
    worksheet.pageSetup.fitToPage = true;
    worksheet.pageSetup.fitToWidth = 1;
    worksheet.pageSetup.fitToHeight = 0;
    worksheet.pageSetup.margins = {
      left: 0.5,
      right: 0.5,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Stock_Report_${selectedYear || "AllYears"}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (
    pageSize: "a4" | "a3" | "a2" | "letter" | "legal" = "a4"
  ) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: pageSize,
    });
    const isStockRegisterGroupSelected =
      selectedColumns[STOCK_REGISTER_GROUP_KEY] === true &&
      columnOrder.includes(STOCK_REGISTER_GROUP_KEY);

    const head: any[][] = [];
    const headRow1: any[] = [];

    columnOrder
      .filter((colKey) => selectedColumns[colKey])
      .forEach((colKey) => {
        if (colKey === STOCK_REGISTER_GROUP_KEY) {
          headRow1.push({
            content: getColumnDisplayName(colKey),
            colSpan: STOCK_REG_SUB_COLUMNS.length,
          });
        } else {
          headRow1.push({
            content: getColumnDisplayName(colKey),
            rowSpan: isStockRegisterGroupSelected ? 2 : 1,
          });
        }
      });
    head.push(headRow1);

    if (isStockRegisterGroupSelected) {
      const dynamicHeadRow2: any[] = [];
      columnOrder
        .filter((colKey) => selectedColumns[colKey])
        .forEach((colKey) => {
          if (colKey === STOCK_REGISTER_GROUP_KEY) {
            STOCK_REG_SUB_COLUMNS.forEach((sc) =>
              dynamicHeadRow2.push(sc.defaultHeader)
            );
          }
        });
      if (dynamicHeadRow2.length > 0) head.push(dynamicHeadRow2);
    }

    const body = stocks.map((stock, idx) => {
      return columnOrder
        .flatMap((colKey) => {
          if (
            colKey === STOCK_REGISTER_GROUP_KEY &&
            selectedColumns[STOCK_REGISTER_GROUP_KEY]
          ) {
            return STOCK_REG_SUB_COLUMNS.map((sc) =>
              String(stock[sc.dataKey as keyof Stock] ?? "")
            );
          }
          if (selectedColumns[colKey] && colKey !== STOCK_REGISTER_GROUP_KEY) {
            if (colKey === "displaySerialNo") return String(idx + 1);
            return String(stock[colKey as keyof Stock] ?? "");
          }
          return [];
        })
        .filter((cellData) => cellData !== undefined);
    });

    const columnStyles: any = {};
    let currentPdfColIndex = 0;
    columnOrder
      .filter((colKey) => selectedColumns[colKey])
      .forEach((outerColKey) => {
        if (outerColKey === STOCK_REGISTER_GROUP_KEY) {
          STOCK_REG_SUB_COLUMNS.forEach((subCol) => {
            columnStyles[currentPdfColIndex++] = {
              halign: ["volNoSub", "pageNoSub", "serialNoSub"].includes(
                subCol.id
              )
                ? "center"
                : "left",
            };
          });
        } else {
          columnStyles[currentPdfColIndex++] = {
            halign: ["quantity", "price", "displaySerialNo"].includes(
              outerColKey
            )
              ? "center"
              : "left",
          };
        }
      });

    let startY = 10;
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const availableWidth = pageWidth - margin * 2;

    const drawManualHeader = (
      text: string | undefined,
      yPos: number,
      isBold = false,
      isCentered = true,
      colSpan = 1,
      splitCols?: number
    ): number => {
      if (
        !text &&
        !(
          splitCols &&
          colSpan === 2 &&
          columnAliases.nameOfCenter &&
          columnAliases.stockRegNameAndVolNo
        )
      )
        return yPos;
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setFontSize(isBold ? 9 : 8);
      const textHeight = 7; // mm

      if (
        splitCols &&
        colSpan === 2 &&
        columnAliases.nameOfCenter &&
        columnAliases.stockRegNameAndVolNo
      ) {
        const firstColWidth = availableWidth / 2;
        const secondColWidth = availableWidth / 2;
        doc.text(
          columnAliases.nameOfCenter,
          margin + firstColWidth / 2,
          yPos + textHeight / 2 + 1.5,
          { align: "center", maxWidth: firstColWidth - 4 }
        );
        doc.text(
          columnAliases.stockRegNameAndVolNo,
          margin + firstColWidth + secondColWidth / 2,
          yPos + textHeight / 2 + 1.5,
          { align: "center", maxWidth: secondColWidth - 4 }
        );
      } else if (text) {
        doc.text(
          text,
          isCentered ? pageWidth / 2 : margin + 2,
          yPos + textHeight / 2 + 1.5,
          {
            align: isCentered ? "center" : "left",
            maxWidth: availableWidth - 4,
          }
        );
      }
      yPos += textHeight + 1;
      return yPos;
    };

    startY = drawManualHeader(columnAliases.annexure, startY, true, true);
    if (columnAliases.nameOfCenter || columnAliases.stockRegNameAndVolNo) {
      if (columnAliases.nameOfCenter && columnAliases.stockRegNameAndVolNo) {
        startY = drawManualHeader(undefined, startY, false, true, 2, 2);
      } else if (columnAliases.nameOfCenter) {
        startY = drawManualHeader(
          columnAliases.nameOfCenter,
          startY,
          false,
          true
        );
      } else if (columnAliases.stockRegNameAndVolNo) {
        startY = drawManualHeader(
          columnAliases.stockRegNameAndVolNo,
          startY,
          false,
          true
        );
      }
    }
    startY = drawManualHeader(
      columnAliases.statementOfVerification,
      startY,
      true,
      true
    );
    startY += 2;

    autoTable(doc, {
      head: head,
      body: body,
      startY: startY,
      theme: "grid",
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 20,
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },
      columnStyles: columnStyles,
      didDrawPage: (hookData: any) => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(
          `Page ${hookData.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - margin / 2,
          { align: "center" }
        );
      },
    });
    doc.save(
      `Stock_Report_${selectedYear || "AllYears"}_${pageSize.toUpperCase()}.pdf`
    );
  };

  const handlePrintTable = () => {
    window.print();
  };

  const draggableColumnsForReorder = columnOrder.filter(
    (colKey) =>
      selectedColumns[colKey] &&
      ![
        "annexure",
        "nameOfCenter",
        "stockRegNameAndVolNo",
        "statementOfVerification",
      ].includes(colKey)
  );

  return (
    <>
      <Navbar />
      <style>{`
        @media print {
            body { margin: 0; padding: 0; }
            body * { visibility: hidden; box-shadow: none !important; }
            .printable-area, .printable-area * { visibility: visible; }
            .printable-area {
              position: absolute !important; left: 0; top: 0; width: 100%;
              margin: 0 !important; padding: 0 !important;
              overflow: visible !important; max-height: none !important;
            }
            #stockReportTable {
              font-size: 8pt !important; border-collapse: collapse !important;
              width: 100% !important; table-layout: fixed !important;
            }
            #stockReportTable th, #stockReportTable td {
              padding: 3px !important; border: 1px solid black !important;
              word-wrap: break-word !important; overflow-wrap: break-word !important;
              min-width: 0 !important; 
            }
            #stockReportTable thead tr th {
                background-color: #e2e8f0 !important; 
                -webkit-print-color-adjust: exact !important; color-adjust: exact !important;
            }
            #stockReportTable thead tr.bg-white th { 
                background-color: white !important;
                -webkit-print-color-adjust: exact !important; color-adjust: exact !important;
            }
            .no-print { display: none !important; }
            @page { size: landscape; margin: 0.5in; }
          }
      `}</style>
      <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen">
        <div className="lg:w-1/3 space-y-4 no-print overflow-y-auto max-h-[calc(100vh-100px)] p-4">
          <h1 className="text-2xl font-bold text-blue-700 mb-1 text-center lg:text-left">
            Report Generation
          </h1>
          <FilterDropdown year={selectedYear} onYearChange={handleYearChange} />
          <ColumnSelection
            selectedColumns={selectedColumns}
            onToggleColumn={handleColumnSelection}
            allPossibleColumnsForSelection={ALL_SELECTABLE_COLUMNS as string[]}
          />
          <ColumnReorder
            draggableColumnOrder={draggableColumnsForReorder}
            columnAliases={columnAliases}
            moveColumn={moveColumn}
            onAliasChange={handleAliasChange}
            onAliasChangeForSpecialHeader={handleAliasChangeForSpecialHeader}
          />
        </div>
        <div className="lg:w-2/3 flex flex-col">
          <div className="flex-grow overflow-y-auto max-h-[calc(100vh-160px)] printable-area p-2">
            <StockTable
              stocks={stocks}
              columnOrder={columnOrder}
              selectedColumns={selectedColumns}
              columnAliases={columnAliases}
              annexureText={columnAliases.annexure}
              nameOfCenterText={columnAliases.nameOfCenter}
              stockRegNameAndVolNoText={columnAliases.stockRegNameAndVolNo}
              statementOfVerificationText={
                columnAliases.statementOfVerification
              }
            />
          </div>
          <div className="mt-auto pt-4 no-print">
            <ExportButtons
              onExportExcel={exportToExcel}
              onExportPDF={exportToPDF}
              onPrintTable={handlePrintTable}
              hasData={
                stocks.length > 0 && draggableColumnsForReorder.length > 0
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportGeneration;
