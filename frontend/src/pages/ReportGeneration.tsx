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
  serialNo: string; // Part of stockId, used for sub-column
  volNo: string; // Part of stockId, used for sub-column
  pageNo: string; // Part of stockId, used for sub-column
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
  [key: string]: string; // Aliases for BASE columns only
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
  groupHeader: string;
}

interface ExcelMainColumnInfo {
  id: string;
  defaultHeader: string;
  dataKey: keyof Stock | "displaySerialNo" | string; // string for custom column IDs
}
type ActualExcelColumnInfo = ExcelSubColumnInfo | ExcelMainColumnInfo;

// --- NEW: Custom Column Interfaces ---
interface CustomColumnDefinition {
  id: string; // Unique ID, e.g., "custom_col_1678886400000"
  displayName: string;
  type: "concatenation" | "arithmetic" | "static";
  sourceColumns: string[]; // IDs of source columns (can be base or other custom)
  separator?: string; // For concatenation
  operation?: "+" | "-" | "*" | "/"; // For arithmetic
  staticValue?: string | number; // For static
}
// --- END NEW ---

const formatColumnKeyForDisplay = (
  key: string,
  customDefs: CustomColumnDefinition[] = [] // Now accepts custom definitions
): string => {
  const customDef = customDefs.find((c) => c.id === key);
  if (customDef) return customDef.displayName;

  if (key === "displaySerialNo") return "S.No.";
  if (key === STOCK_REGISTER_GROUP_KEY) return "Stock Register";
  // Check if it's a known sub-column ID (used in dropdowns)
  const subCol = STOCK_REG_SUB_COLUMNS.find((sc) => sc.id === key);
  if (subCol) return subCol.defaultHeader;

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

// ======================
// Filter Dropdown Component (Unchanged)
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
  customColumnDefs: CustomColumnDefinition[]; // To format display names
}

const ColumnSelection: React.FC<ColumnSelectionProps> = ({
  selectedColumns,
  onToggleColumn,
  allPossibleColumnsForSelection,
  customColumnDefs,
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
                {formatColumnKeyForDisplay(columnKey, customColumnDefs)}
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
  columnDisplayName: string; // Combined alias or custom name
  isCustomColumn: boolean; // To disable renaming for custom columns
  aliasInputValue: string; // Value for the input field (base column alias)
  handleAliasChange: (
    // Only for base columns
    e: React.ChangeEvent<HTMLInputElement>,
    columnKey: string
  ) => void;
}

const DraggableColumn: React.FC<DraggableColumnProps> = ({
  columnKey,
  index,
  moveColumn,
  columnDisplayName,
  isCustomColumn,
  aliasInputValue,
  handleAliasChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);

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
          {columnDisplayName}
        </span>
        {!isCustomColumn ? (
          <input
            type="text"
            value={aliasInputValue}
            onChange={(e) => handleAliasChange(e, columnKey)}
            placeholder={`Rename ${columnDisplayName}`}
            className="text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        ) : (
          <span className="text-sm p-2 text-gray-500 italic">
            {" "}
            (Custom Column){" "}
          </span>
        )}
      </div>
    </div>
  );
};

// ======================
// Column Reorder & Rename Component
// ======================
interface ColumnReorderProps {
  draggableColumnOrder: string[];
  columnAliases: Record<string, string>; // Aliases for base columns
  customColumnDefs: CustomColumnDefinition[]; // For display names of custom columns
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  onAliasChange: (
    // For base columns
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
  customColumnDefs,
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

  const getDraggableColumnDisplayName = (key: string) => {
    const customCol = customColumnDefs.find((cc) => cc.id === key);
    if (customCol) return customCol.displayName;
    return (
      columnAliases[key] || formatColumnKeyForDisplay(key, customColumnDefs)
    );
  };

  return (
    <div className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
      <h2 className="font-semibold text-gray-700 text-lg mb-3">
        Reorder & Rename Columns
      </h2>
      <DndProvider backend={HTML5Backend}>
        <div className="space-y-2">
          {draggableColumnOrder.map((columnKey, index) => {
            const isCustom = customColumnDefs.some((cc) => cc.id === columnKey);
            return (
              <DraggableColumn
                key={columnKey}
                columnKey={columnKey}
                index={index}
                moveColumn={moveColumn}
                columnDisplayName={getDraggableColumnDisplayName(columnKey)}
                isCustomColumn={isCustom}
                aliasInputValue={
                  columnAliases[columnKey] ||
                  formatColumnKeyForDisplay(columnKey, [])
                } // Pass raw alias for base
                handleAliasChange={onAliasChange}
              />
            );
          })}
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
                value={columnAliases[key] || ""} // These are always base aliases
                onChange={(e) => onAliasChangeForSpecialHeader(e, key as any)}
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
// Add Custom Column Modal Component
// ======================
interface AddCustomColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddColumn: (definition: CustomColumnDefinition) => void;
  existingColumnKeys: string[]; // Base keys + existing custom column IDs for source selection
  customColumnDefs: CustomColumnDefinition[]; // To format display names in dropdown
}

const AddCustomColumnModal: React.FC<AddCustomColumnModalProps> = ({
  isOpen,
  onClose,
  onAddColumn,
  existingColumnKeys, // This is the comprehensive list of all usable column IDs
  customColumnDefs,
}) => {
  const [displayName, setDisplayName] = useState("");
  const [type, setType] = useState<CustomColumnDefinition["type"]>("static");

  // For Arithmetic
  const [arithmeticSource1, setArithmeticSource1] = useState<string>("");
  const [arithmeticSource2, setArithmeticSource2] = useState<string>("");
  const [operation, setOperation] = useState<"+" | "-" | "*" | "/">("+");

  // For Concatenation (ORDER MATTERS HERE)
  const [concatOrderSources, setConcatOrderSources] = useState<string[]>([]);
  const [currentConcatSourceToAdd, setCurrentConcatSourceToAdd] =
    useState<string>("");
  const [separator, setSeparator] = useState(" ");

  // For Static
  const [staticValue, setStaticValue] = useState<string | number>("");

  const resetForm = () => {
    setDisplayName("");
    setType("static");
    setArithmeticSource1("");
    setArithmeticSource2("");
    setOperation("+");
    setConcatOrderSources([]);
    setCurrentConcatSourceToAdd("");
    setSeparator(" ");
    setStaticValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert("Display Name is required.");
      return;
    }
    const id = `custom_${displayName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")}_${Date.now()}`;
    let definition: CustomColumnDefinition = {
      id,
      displayName: displayName.trim(),
      type,
      sourceColumns: [],
    };

    switch (type) {
      case "static":
        definition = { ...definition, staticValue };
        break;
      case "concatenation":
        if (concatOrderSources.length < 1) {
          alert("Select at least one source column for concatenation.");
          return;
        }
        definition = {
          ...definition,
          sourceColumns: concatOrderSources,
          separator,
        };
        break;
      case "arithmetic":
        if (!arithmeticSource1 || !arithmeticSource2) {
          alert("Select two source columns for arithmetic operation.");
          return;
        }
        if (arithmeticSource1 === arithmeticSource2) {
          alert("Source columns for arithmetic operation must be different.");
          return;
        }
        definition = {
          ...definition,
          sourceColumns: [arithmeticSource1, arithmeticSource2],
          operation,
        };
        break;
    }
    onAddColumn(definition);
    resetForm(); // Reset form fields
    onClose(); // Close modal
  };

  const handleAddSourceToConcatList = () => {
    if (
      currentConcatSourceToAdd &&
      !concatOrderSources.includes(currentConcatSourceToAdd)
    ) {
      setConcatOrderSources((prev) => [...prev, currentConcatSourceToAdd]);
      setCurrentConcatSourceToAdd(""); // Reset dropdown
    }
  };

  const handleRemoveConcatSource = (indexToRemove: number) => {
    setConcatOrderSources((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleMoveConcatSource = (index: number, direction: "up" | "down") => {
    setConcatOrderSources((prev) => {
      const newArray = [...prev];
      const item = newArray[index];
      if (direction === "up" && index > 0) {
        newArray.splice(index, 1);
        newArray.splice(index - 1, 0, item);
      } else if (direction === "down" && index < newArray.length - 1) {
        newArray.splice(index, 1);
        newArray.splice(index + 1, 0, item);
      }
      return newArray;
    });
  };

  if (!isOpen) return null;

  // Filter out STOCK_REGISTER_GROUP_KEY as it's not a direct value source
  const selectableSourceKeys = existingColumnKeys.filter(
    (key) => key !== STOCK_REGISTER_GROUP_KEY
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Add Custom Column</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Display Name *</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="mt-1 p-2 w-full border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="mt-1 p-2 w-full border rounded"
            >
              <option value="static">Static Value</option>
              <option value="concatenation">Concatenation (Ordered)</option>
              <option value="arithmetic">Arithmetic</option>
            </select>
          </div>

          {type === "static" && (
            <div>
              <label className="block text-sm font-medium">Static Value</label>
              <input
                type="text"
                value={staticValue}
                onChange={(e) => setStaticValue(e.target.value)}
                className="mt-1 p-2 w-full border rounded"
              />
            </div>
          )}

          {type === "concatenation" && (
            <>
              <div>
                <label className="block text-sm font-medium">
                  Source Columns (in order)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <select
                    value={currentConcatSourceToAdd}
                    onChange={(e) =>
                      setCurrentConcatSourceToAdd(e.target.value)
                    }
                    className="p-2 flex-grow border rounded"
                  >
                    <option value="">-- Select column to add --</option>
                    {selectableSourceKeys
                      .filter((key) => !concatOrderSources.includes(key)) // Exclude already added
                      .map((key) => (
                        <option key={key} value={key}>
                          {formatColumnKeyForDisplay(key, customColumnDefs)}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSourceToConcatList}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                  >
                    Add
                  </button>
                </div>
                {concatOrderSources.length > 0 && (
                  <ul className="mt-2 border rounded p-2 space-y-1 max-h-40 overflow-y-auto">
                    {concatOrderSources.map((colId, index) => (
                      <li
                        key={colId + index}
                        className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-sm"
                      >
                        <span>
                          {index + 1}.{" "}
                          {formatColumnKeyForDisplay(colId, customColumnDefs)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleMoveConcatSource(index, "up")}
                            disabled={index === 0}
                            className="px-1 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleMoveConcatSource(index, "down")
                            }
                            disabled={index === concatOrderSources.length - 1}
                            className="px-1 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveConcatSource(index)}
                            className="px-1 text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Separator</label>
                <input
                  type="text"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="mt-1 p-2 w-full border rounded"
                />
              </div>
            </>
          )}

          {type === "arithmetic" && (
            <>
              <div>
                <label className="block text-sm font-medium">
                  Source Column 1 (Numeric)
                </label>
                <select
                  value={arithmeticSource1}
                  onChange={(e) => setArithmeticSource1(e.target.value)}
                  className="mt-1 p-2 w-full border rounded"
                >
                  <option value="">-- Select Column 1 --</option>
                  {selectableSourceKeys.map((key) => (
                    <option key={`arith1-${key}`} value={key}>
                      {formatColumnKeyForDisplay(key, customColumnDefs)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Source Column 2 (Numeric)
                </label>
                <select
                  value={arithmeticSource2}
                  onChange={(e) => setArithmeticSource2(e.target.value)}
                  className="mt-1 p-2 w-full border rounded"
                >
                  <option value="">-- Select Column 2 --</option>
                  {selectableSourceKeys.map((key) => (
                    <option key={`arith2-${key}`} value={key}>
                      {formatColumnKeyForDisplay(key, customColumnDefs)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Operation</label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value as any)}
                  className="mt-1 p-2 w-full border rounded"
                >
                  <option value="+">Add (+)</option>
                  <option value="-">Subtract (-)</option>
                  <option value="*">Multiply (*)</option>
                  <option value="/">Divide (/)</option>
                </select>
              </div>
            </>
          )}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Column
            </button>
          </div>
        </form>
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
  columnAliases: ColumnAliases; // Base column aliases
  customColumnDefs: CustomColumnDefinition[]; // For custom columns
  computeCustomColumnValueFn: (
    stock: Stock,
    columnId: string,
    customDefs: CustomColumnDefinition[],
    allStock: Stock[], // For things like S.No. or aggregations if needed
    stockIndex: number
  ) => string | number | undefined;
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
  customColumnDefs,
  computeCustomColumnValueFn,
  annexureText,
  nameOfCenterText,
  stockRegNameAndVolNoText,
  statementOfVerificationText,
}) => {
  const getColumnEffectiveDisplayName = (colKey: string) => {
    const customCol = customColumnDefs.find((cc) => cc.id === colKey);
    if (customCol) return customCol.displayName;
    return (
      columnAliases[colKey] ||
      formatColumnKeyForDisplay(colKey, customColumnDefs)
    );
  };

  // This defines the structure of what is rendered (IDs, headers, etc.)
  const renderableColumns = columnOrder
    .flatMap((colKey) => {
      if (!selectedColumns[colKey]) return [];

      if (colKey === STOCK_REGISTER_GROUP_KEY) {
        return STOCK_REG_SUB_COLUMNS.map((sc) => ({
          id: sc.id, // e.g. "volNoSub"
          header: sc.defaultHeader,
          isSubColumn: true,
          dataKeyForStock: sc.dataKey, // keyof Stock for direct access
          parentGroupKey: STOCK_REGISTER_GROUP_KEY,
        }));
      } else {
        return [
          {
            id: colKey, // Base stock key or custom column ID
            header: getColumnEffectiveDisplayName(colKey),
            isSubColumn: false,
            dataKeyForStock: colKey as keyof Stock, // May not be a keyof Stock if custom
          },
        ];
      }
    })
    .filter(Boolean);

  const colCount = renderableColumns.length;
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
            {columnOrder // Iterate through the master order of selected groups/columns
              .filter((orderedColKey) => selectedColumns[orderedColKey])
              .map((orderedColKey) => {
                if (orderedColKey === STOCK_REGISTER_GROUP_KEY) {
                  return (
                    <th
                      key={orderedColKey}
                      colSpan={STOCK_REG_SUB_COLUMNS.length}
                      className="p-2 border border-black font-bold text-center h-12 align-middle"
                    >
                      {getColumnEffectiveDisplayName(orderedColKey)}
                    </th>
                  );
                } else {
                  // Regular column or custom column
                  return (
                    <th
                      key={orderedColKey}
                      rowSpan={isStockRegisterGroupSelected ? 2 : 1}
                      className="p-2 border border-black font-bold text-center h-12 align-middle"
                    >
                      {getColumnEffectiveDisplayName(orderedColKey)}
                    </th>
                  );
                }
              })}
          </tr>
          {isStockRegisterGroupSelected && ( // Second header row for sub-columns
            <tr className="bg-gray-200">
              {columnOrder
                .filter((orderedColKey) => selectedColumns[orderedColKey])
                .flatMap((orderedColKey) => {
                  if (orderedColKey === STOCK_REGISTER_GROUP_KEY) {
                    return STOCK_REG_SUB_COLUMNS.map((subCol) => (
                      <th
                        key={subCol.id}
                        className="p-2 border border-black font-bold text-center h-12"
                      >
                        {subCol.defaultHeader}
                      </th>
                    ));
                  }
                  return []; // Placeholder for non-grouped columns handled by rowspan
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
              {renderableColumns.map((rCol) => {
                let cellValue: string | number | undefined;
                if (
                  rCol.parentGroupKey === STOCK_REGISTER_GROUP_KEY &&
                  rCol.dataKeyForStock
                ) {
                  cellValue = String(
                    stock[rCol.dataKeyForStock as keyof Stock] ?? ""
                  );
                } else if (rCol.id === "displaySerialNo") {
                  cellValue = idx + 1;
                } else {
                  const customDef = customColumnDefs.find(
                    (cc) => cc.id === rCol.id
                  );
                  if (customDef) {
                    cellValue = computeCustomColumnValueFn(
                      stock,
                      rCol.id,
                      customColumnDefs,
                      stocks,
                      idx
                    );
                  } else {
                    cellValue = String(
                      stock[rCol.dataKeyForStock as keyof Stock] ?? ""
                    );
                  }
                }

                return (
                  <td
                    key={rCol.id}
                    className={`p-2 border border-black break-words align-top ${
                      [
                        "quantity",
                        "price",
                        "displaySerialNo",
                        ...STOCK_REG_SUB_COLUMNS.map((s) => s.id),
                      ].includes(rCol.id)
                        ? "text-center"
                        : "text-left"
                    } ${rCol.id === "stockDescription" ? "min-w-[200px]" : ""}`}
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ======================
// Export Buttons (Unchanged, but behavior of exports will change)
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
const ALL_BASE_SELECTABLE_COLUMNS: Array<
  // Renamed to clarify these are base Stock fields
  | keyof Omit<Stock, "volNo" | "pageNo" | "serialNo"> // Omit sub-column data keys
  | "displaySerialNo"
  | typeof STOCK_REGISTER_GROUP_KEY
> = [
  "displaySerialNo",
  STOCK_REGISTER_GROUP_KEY, // Represents the group of volNo, pageNo, serialNo
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
    if (!token && !localStorage.getItem("token")) navigate("/login");
  }, [token, navigate]);

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [customColumns, setCustomColumns] = useState<CustomColumnDefinition[]>(
    []
  );
  const [isCustomColumnModalOpen, setIsCustomColumnModalOpen] = useState(false);

  // Function to compute custom column values
  const computeCustomColumnValue = useCallback(
    (
      stockItem: Stock,
      columnId: string,
      allCustomDefs: CustomColumnDefinition[],
      allStockItems: Stock[],
      stockItemIndex: number
    ): string | number | undefined => {
      const customDef = allCustomDefs.find((cc) => cc.id === columnId);
      if (!customDef) return undefined;

      const getSourceValue = (sourceColId: string): any => {
        if (sourceColId === "displaySerialNo") return stockItemIndex + 1;

        const sourceIsCustomDef = allCustomDefs.find(
          (cc) => cc.id === sourceColId
        );
        if (sourceIsCustomDef) {
          if (
            sourceIsCustomDef.sourceColumns.includes(customDef.id) &&
            sourceIsCustomDef.id !== customDef.id
          ) {
            // Basic cycle detection
            console.error(
              `Potential cycle: ${customDef.displayName} uses ${sourceIsCustomDef.displayName} which might use ${customDef.displayName}`
            );
            return "CycleErr";
          }
          return computeCustomColumnValue(
            stockItem,
            sourceColId,
            allCustomDefs,
            allStockItems,
            stockItemIndex
          );
        }

        const subColDef = STOCK_REG_SUB_COLUMNS.find(
          (sc) => sc.id === sourceColId
        );
        if (subColDef) {
          return stockItem[subColDef.dataKey as keyof Stock];
        }

        if (Object.prototype.hasOwnProperty.call(stockItem, sourceColId)) {
          return stockItem[sourceColId as keyof Stock];
        }

        return undefined;
      };

      switch (customDef.type) {
        case "static":
          return customDef.staticValue;
        case "concatenation":
          return customDef.sourceColumns
            .map((scId) => String(getSourceValue(scId) ?? ""))
            .join(customDef.separator || " ");
        case "arithmetic":
          if (customDef.sourceColumns.length === 2 && customDef.operation) {
            const val1Str = String(getSourceValue(customDef.sourceColumns[0]));
            const val2Str = String(getSourceValue(customDef.sourceColumns[1]));

            // Check if source values might be from concatenation, which could be non-numeric
            const val1 = parseFloat(val1Str);
            const val2 = parseFloat(val2Str);

            if (isNaN(val1) || isNaN(val2)) {
              console.warn(
                `Arithmetic on non-numeric values: '${val1Str}', '${val2Str}' for column ${customDef.displayName}`
              );
              return "Err:NaN";
            }

            switch (customDef.operation) {
              case "+":
                return val1 + val2;
              case "-":
                return val1 - val2;
              case "*":
                return val1 * val2;
              case "/":
                return val2 !== 0
                  ? parseFloat((val1 / val2).toFixed(4))
                  : "Err:Div0"; // Format to 4 decimal places for division
              default:
                return "Err:Op";
            }
          }
          return "Err:ArithSetup";
        default:
          return undefined;
      }
    },
    []
  );

  // Effective list of all columns (base + custom) for selection UI
  const [allEffectiveSelectableColumns, setAllEffectiveSelectableColumns] =
    useState<string[]>([]);

  useEffect(() => {
    setAllEffectiveSelectableColumns([
      ...(ALL_BASE_SELECTABLE_COLUMNS as string[]),
      ...customColumns.map((cc) => cc.id),
    ]);
  }, [customColumns]);

  const initialSelectedColumns = (
    ALL_BASE_SELECTABLE_COLUMNS as string[]
  ).reduce((acc, colKey) => {
    acc[colKey] = [
      "displaySerialNo",
      STOCK_REGISTER_GROUP_KEY,
      "stockName",
      "quantity",
      "price",
    ].includes(colKey);
    return acc;
  }, {} as SelectedColumns);
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumns>(
    initialSelectedColumns
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    ALL_BASE_SELECTABLE_COLUMNS as string[]
  );

  const initialColumnAliases: ColumnAliases = {
    annexure: "ANNEXURE - I",
    nameOfCenter: "Name of the Center/Department: Example Department",
    stockRegNameAndVolNo:
      "Name of the Stock Register & Vol.No: Example Register Vol. 1",
    statementOfVerification:
      "STATEMENT SHOWING THE DETAILS OF VERIFICATION OF STORES AND STOCK FOR THE YEAR 2023-2024",
    ...(ALL_BASE_SELECTABLE_COLUMNS as string[]).reduce((acc, colKey) => {
      acc[colKey] = formatColumnKeyForDisplay(colKey, []);
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

  const getColumnEffectiveDisplayName = useCallback(
    (colKey: string) => {
      const customCol = customColumns.find((cc) => cc.id === colKey);
      if (customCol) return customCol.displayName;
      return (
        columnAliases[colKey] ||
        formatColumnKeyForDisplay(colKey, customColumns)
      );
    },
    [customColumns, columnAliases]
  );

  const fetchSettingsCallback = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/settings`, {
        headers: { Authorization: `${token}` },
      });
      if (response.ok) {
        const data = await response.json();

        const loadedCustomColumns = Array.isArray(data.customColumns)
          ? data.customColumns
          : [];
        setCustomColumns(loadedCustomColumns);

        const currentAllEffectiveCols = [
          ...(ALL_BASE_SELECTABLE_COLUMNS as string[]),
          ...loadedCustomColumns.map((cc: CustomColumnDefinition) => cc.id),
        ];

        const newSelectedColumns: SelectedColumns = {};
        // Initialize from initialSelectedColumns for base columns first
        Object.keys(initialSelectedColumns).forEach((key) => {
          newSelectedColumns[key] = initialSelectedColumns[key];
        });
        // Then override with saved selections if available
        if (data.selectedColumns) {
          currentAllEffectiveCols.forEach((key) => {
            if (data.selectedColumns[key] !== undefined) {
              newSelectedColumns[key] = data.selectedColumns[key];
            } else if (!newSelectedColumns.hasOwnProperty(key)) {
              // For new custom cols not in saved data
              newSelectedColumns[key] = false; // Default to not selected
            }
          });
        }
        setSelectedColumns(newSelectedColumns);

        let savedOrder =
          data.columnOrder && Array.isArray(data.columnOrder)
            ? data.columnOrder.filter((col: string) =>
                currentAllEffectiveCols.includes(col)
              )
            : [];

        const defaultOrder = [
          ...(ALL_BASE_SELECTABLE_COLUMNS as string[]),
          ...loadedCustomColumns
            .map((cc: CustomColumnDefinition) => cc.id)
            .filter(
              (id: string) =>
                !(ALL_BASE_SELECTABLE_COLUMNS as string[]).includes(id)
            ),
        ];
        setColumnOrder([...new Set([...savedOrder, ...defaultOrder])]);

        const newAliases: ColumnAliases = { ...initialColumnAliases };
        if (data.columnAliases) {
          Object.keys(data.columnAliases).forEach((key) => {
            if (initialColumnAliases.hasOwnProperty(key)) {
              newAliases[key] = data.columnAliases[key];
            }
          });
        }
        setColumnAliases(newAliases);
      } else {
        console.warn("Failed to fetch settings, using defaults.");
        setCustomColumns([]);
        setSelectedColumns(initialSelectedColumns);
        setColumnOrder(ALL_BASE_SELECTABLE_COLUMNS as string[]);
        setColumnAliases(initialColumnAliases);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setCustomColumns([]);
      setSelectedColumns(initialSelectedColumns);
      setColumnOrder(ALL_BASE_SELECTABLE_COLUMNS as string[]);
      setColumnAliases(initialColumnAliases);
    }
  }, [token, initialSelectedColumns, initialColumnAliases]);

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
      customColumns: CustomColumnDefinition[];
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

  const handleAddCustomColumn = (definition: CustomColumnDefinition) => {
    const newCustomCols = [...customColumns, definition];
    setCustomColumns(newCustomCols);

    const newSelectedCols = { ...selectedColumns, [definition.id]: true };
    setSelectedColumns(newSelectedCols);

    const newColumnOrder = [
      ...columnOrder.filter((cId) => cId !== definition.id),
      definition.id,
    ];
    setColumnOrder(newColumnOrder);

    saveSettings({
      selectedColumns: newSelectedCols,
      columnOrder: newColumnOrder,
      columnAliases,
      customColumns: newCustomCols,
    });
  };

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

    const currentAllColsSet = new Set(allEffectiveSelectableColumns);
    const finalNewOrder = newDraggableOrder.slice(); // Start with the reordered visible items

    // Add any other columns (selected but not draggable, or not selected) from the full order
    // maintaining their relative order from the original `columnOrder`
    const draggableSet = new Set(newDraggableOrder);
    columnOrder.forEach((colKey) => {
      if (
        !draggableSet.has(colKey) &&
        currentAllColsSet.has(colKey) &&
        !finalNewOrder.includes(colKey)
      ) {
        finalNewOrder.push(colKey);
      }
    });

    // Ensure all columns are present, add missing ones to the end if any
    allEffectiveSelectableColumns.forEach((key) => {
      if (!finalNewOrder.includes(key)) {
        finalNewOrder.push(key);
      }
    });

    setColumnOrder(finalNewOrder);
    saveSettings({
      selectedColumns,
      columnOrder: finalNewOrder,
      columnAliases,
      customColumns,
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
      customColumns,
    });
  };

  const handleAliasChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    columnKey: string
  ) => {
    if (customColumns.some((cc) => cc.id === columnKey)) return;

    const updatedAliases = { ...columnAliases, [columnKey]: e.target.value };
    setColumnAliases(updatedAliases);
    saveSettings({
      selectedColumns,
      columnOrder,
      columnAliases: updatedAliases,
      customColumns,
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
      customColumns,
    });
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock Report");

    const isStockRegisterGroupSelected =
      selectedColumns[STOCK_REGISTER_GROUP_KEY] === true &&
      columnOrder.includes(STOCK_REGISTER_GROUP_KEY);

    const excelColumnsStructure: {
      id: string;
      header: string;
      isSub: boolean;
      parentGroup?: string;
      dataKeyForStock?: keyof Stock;
    }[] = [];
    columnOrder.forEach((colKey) => {
      if (!selectedColumns[colKey]) return;
      if (colKey === STOCK_REGISTER_GROUP_KEY) {
        STOCK_REG_SUB_COLUMNS.forEach((sc) => {
          excelColumnsStructure.push({
            id: sc.id,
            header: sc.defaultHeader,
            isSub: true,
            parentGroup: getColumnEffectiveDisplayName(
              STOCK_REGISTER_GROUP_KEY
            ),
            dataKeyForStock: sc.dataKey,
          });
        });
      } else {
        excelColumnsStructure.push({
          id: colKey,
          header: getColumnEffectiveDisplayName(colKey),
          isSub: false,
        });
      }
    });

    const colCount = excelColumnsStructure.length;
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
      const midPoint = Math.ceil(colCount / 2);
      if (columnAliases.nameOfCenter && columnAliases.stockRegNameAndVolNo) {
        worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, midPoint);
        styleCell(worksheet.getCell(currentRowIdx, 1), {
          value: columnAliases.nameOfCenter,
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
          alignment: { horizontal: "center", vertical: "middle" },
        });
      } else if (columnAliases.nameOfCenter) {
        worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
        styleCell(worksheet.getCell(currentRowIdx, 1), {
          value: columnAliases.nameOfCenter,
          alignment: { horizontal: "center", vertical: "middle" },
        });
      } else if (columnAliases.stockRegNameAndVolNo) {
        worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
        styleCell(worksheet.getCell(currentRowIdx, 1), {
          value: columnAliases.stockRegNameAndVolNo,
          alignment: { horizontal: "center", vertical: "middle" },
        });
      }
      worksheet.getRow(currentRowIdx).height = 20;
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
    columnOrder
      .filter((colKey) => selectedColumns[colKey])
      .forEach((colKey) => {
        if (colKey === STOCK_REGISTER_GROUP_KEY) {
          headerRow1Values.push(getColumnEffectiveDisplayName(colKey));
          for (let i = 1; i < STOCK_REG_SUB_COLUMNS.length; i++)
            headerRow1Values.push(null);
        } else {
          headerRow1Values.push(getColumnEffectiveDisplayName(colKey));
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
            currentRowIdx,
            currentExcelCol,
            currentRowIdx,
            currentExcelCol + STOCK_REG_SUB_COLUMNS.length - 1
          );
          currentExcelCol += STOCK_REG_SUB_COLUMNS.length;
        } else {
          if (isStockRegisterGroupSelected)
            worksheet.mergeCells(
              currentRowIdx,
              currentExcelCol,
              currentRowIdx + 1,
              currentExcelCol
            );
          currentExcelCol++;
        }
      });
    const mainHeaderRow1Number = currentRowIdx;
    currentRowIdx++;

    if (isStockRegisterGroupSelected) {
      let excelColForSub = 1;
      columnOrder
        .filter((colKey) => selectedColumns[colKey])
        .forEach((colKey) => {
          if (colKey === STOCK_REGISTER_GROUP_KEY) {
            STOCK_REG_SUB_COLUMNS.forEach((sc) => {
              worksheet.getCell(currentRowIdx, excelColForSub).value =
                sc.defaultHeader;
              styleCell(worksheet.getCell(currentRowIdx, excelColForSub), {
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
              excelColForSub++;
            });
          } else {
            excelColForSub++;
          }
        });
      worksheet.getRow(currentRowIdx).height = 25;
      currentRowIdx++;
    }

    stocks.forEach((stock, idx) => {
      const rowData = excelColumnsStructure.map((colInfo) => {
        if (
          colInfo.parentGroup ===
            getColumnEffectiveDisplayName(STOCK_REGISTER_GROUP_KEY) &&
          colInfo.dataKeyForStock
        ) {
          return stock[colInfo.dataKeyForStock as keyof Stock] ?? "";
        }
        if (colInfo.id === "displaySerialNo") return idx + 1;

        const customDef = customColumns.find((cc) => cc.id === colInfo.id);
        if (customDef) {
          return computeCustomColumnValue(
            stock,
            colInfo.id,
            customColumns,
            stocks,
            idx
          );
        }
        return stock[colInfo.id as keyof Stock] ?? "";
      });
      const dataRow = worksheet.addRow(rowData);
      dataRow.height = 18;
      dataRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
        const colInfo = excelColumnsStructure[colNum - 1];
        if (!colInfo) return;
        let alignment: Partial<ExcelJS.Alignment> = {
          vertical: "top",
          wrapText: true,
          horizontal: [
            "quantity",
            "price",
            "displaySerialNo",
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
          (colInfo.id === "quantity" ||
            colInfo.id === "serialNoSub" ||
            (customDefines && customDefines.type === "arithmetic"))
        )
          cell.numFmt = "#,##0.####"; // More precision for arithmetic
        else if (typeof cell.value === "number") cell.numFmt = "#,##0";

        // Identify if it's a custom arithmetic column for number formatting
        const customDefines = customColumns.find((cc) => cc.id === colInfo.id);
        if (
          customDefines &&
          customDefines.type === "arithmetic" &&
          typeof cell.value === "number"
        ) {
          cell.numFmt = "0.00##"; // e.g., 2 decimal places, up to 4 if needed
        }
      });
    });

    excelColumnsStructure.forEach((colInfo, i) => {
      const column = worksheet.getColumn(i + 1);
      let headerTextForLength = colInfo.header;
      let maxLength = headerTextForLength.length;

      stocks.forEach((stock, stockIdx) => {
        let cellValueStr = "";
        if (
          colInfo.parentGroup ===
            getColumnEffectiveDisplayName(STOCK_REGISTER_GROUP_KEY) &&
          colInfo.dataKeyForStock
        ) {
          cellValueStr = String(
            stock[colInfo.dataKeyForStock as keyof Stock] ?? ""
          );
        } else if (colInfo.id === "displaySerialNo") {
          cellValueStr = String(stockIdx + 1);
        } else {
          const customDef = customColumns.find((cc) => cc.id === colInfo.id);
          if (customDef) {
            cellValueStr = String(
              computeCustomColumnValue(
                stock,
                colInfo.id,
                customColumns,
                stocks,
                stockIdx
              ) ?? ""
            );
          } else {
            cellValueStr = String(stock[colInfo.id as keyof Stock] ?? "");
          }
        }
        if (cellValueStr.length > maxLength) maxLength = cellValueStr.length;
      });

      if (colInfo.id === "stockDescription") column.width = 40;
      else if (colInfo.id === "stockName") column.width = 25;
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
            content: getColumnEffectiveDisplayName(colKey),
            colSpan: STOCK_REG_SUB_COLUMNS.length,
          });
        } else {
          headRow1.push({
            content: getColumnEffectiveDisplayName(colKey),
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
      const rowData: (string | number)[] = [];
      columnOrder
        .filter((colKey) => selectedColumns[colKey])
        .forEach((outerColKey) => {
          if (outerColKey === STOCK_REGISTER_GROUP_KEY) {
            STOCK_REG_SUB_COLUMNS.forEach((sc) => {
              rowData.push(String(stock[sc.dataKey as keyof Stock] ?? ""));
            });
          } else if (outerColKey === "displaySerialNo") {
            rowData.push(String(idx + 1));
          } else {
            const customDef = customColumns.find((cc) => cc.id === outerColKey);
            if (customDef) {
              rowData.push(
                String(
                  computeCustomColumnValue(
                    stock,
                    outerColKey,
                    customColumns,
                    stocks,
                    idx
                  ) ?? ""
                )
              );
            } else {
              rowData.push(String(stock[outerColKey as keyof Stock] ?? ""));
            }
          }
        });
      return rowData;
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
      const textHeight = 7;
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
      if (columnAliases.nameOfCenter && columnAliases.stockRegNameAndVolNo)
        startY = drawManualHeader(undefined, startY, false, true, 2, 2);
      else if (columnAliases.nameOfCenter)
        startY = drawManualHeader(
          columnAliases.nameOfCenter,
          startY,
          false,
          true
        );
      else if (columnAliases.stockRegNameAndVolNo)
        startY = drawManualHeader(
          columnAliases.stockRegNameAndVolNo,
          startY,
          false,
          true
        );
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

  // Ensure this list is comprehensive for the modal's source dropdowns
  const sourceColumnsForModal = Array.from(
    new Set([
      ...(ALL_BASE_SELECTABLE_COLUMNS as string[]), // Base fields
      ...STOCK_REG_SUB_COLUMNS.map((sc) => sc.id), // Sub-columns of stock register group explicitly
      ...customColumns.map((cc) => cc.id), // Existing custom columns
    ])
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
      <AddCustomColumnModal
        isOpen={isCustomColumnModalOpen}
        onClose={() => setIsCustomColumnModalOpen(false)}
        onAddColumn={handleAddCustomColumn}
        existingColumnKeys={sourceColumnsForModal}
        customColumnDefs={customColumns}
      />
      <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 lg:p-8 bg-gray-100 min-h-screen">
        <div className="lg:w-1/3 space-y-4 no-print overflow-y-auto max-h-[calc(100vh-100px)] p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-700 mb-1">
              Report Generation
            </h1>
            <button
              onClick={() => setIsCustomColumnModalOpen(true)}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              title="Add a calculated or static column to the report"
            >
              + Add Custom Column
            </button>
          </div>
          <FilterDropdown year={selectedYear} onYearChange={handleYearChange} />
          <ColumnSelection
            selectedColumns={selectedColumns}
            onToggleColumn={handleColumnSelection}
            allPossibleColumnsForSelection={allEffectiveSelectableColumns}
            customColumnDefs={customColumns}
          />
          <ColumnReorder
            draggableColumnOrder={draggableColumnsForReorder}
            columnAliases={columnAliases}
            customColumnDefs={customColumns}
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
              customColumnDefs={customColumns}
              computeCustomColumnValueFn={computeCustomColumnValue}
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
