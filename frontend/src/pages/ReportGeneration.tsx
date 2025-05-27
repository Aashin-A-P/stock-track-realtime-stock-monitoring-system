import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../components/Navbar";
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FilterDateRangePicker from "../components/FilterDateRangePicker";
import { toast } from "react-toastify";
import ExcelJS from "exceljs";

const API_URL = import.meta.env.VITE_API_BASE_URL;

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

interface Stock {
  serialNo: string;
  volNo: string;
  pageNo: string;
  stockName: string;
  stockDescription: string;
  stockId: string; // Representative stockId
  locations: string[]; // Array of location names
  staffs: string[]; // Array of staff names
  usage: string[]; // Array of "location - staff - count: X" strings
  quantity: number; // Summed quantity
  basePrice: number; // Representative base price
  gstAmount: number; // Representative GST amount
  price: number; // Summed price (basePrice + gstAmount) * quantity_of_group
  remarks: string;
  budgetName: string;
  categoryName?: string;
  invoiceNo?: string;
  fromAddress?: string;
  toAddress?: string;
  purchaseOrderDate: string;
  invoiceDate: string;
  status?: string;
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

// interface ExcelSubColumnInfo {
//   id: (typeof STOCK_REG_SUB_COLUMNS)[number]["id"];
//   defaultHeader: (typeof STOCK_REG_SUB_COLUMNS)[number]["defaultHeader"];
//   dataKey: (typeof STOCK_REG_SUB_COLUMNS)[number]["dataKey"];
//   groupHeader: string;
// }

// interface ExcelMainColumnInfo {
//   id: string;
//   defaultHeader: string;
//   dataKey: keyof Stock | "displaySerialNo" | string;
// }
// type ActualExcelColumnInfo = ExcelSubColumnInfo | ExcelMainColumnInfo;

interface CustomColumnDefinition {
  id: string;
  displayName: string;
  type: "concatenation" | "arithmetic" | "static";
  sourceColumns?: string[];
  separator?: string;
  arithmeticExpression?: string;
  staticValue?: string | number;
}

const formatColumnKeyForDisplay = (
  key: string,
  customDefs: CustomColumnDefinition[] = []
): string => {
  const customDef = customDefs.find((c) => c.id === key);
  if (customDef) return customDef.displayName;

  if (key === "displaySerialNo") return "S.No.";
  if (key === STOCK_REGISTER_GROUP_KEY) return "Stock Register";
  const subCol = STOCK_REG_SUB_COLUMNS.find((sc) => sc.id === key);
  if (subCol) return subCol.defaultHeader;

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

// interface FilterDropdownProps {
//   year: number;
//   onYearChange: (year: number, startDate: string, endDate: string) => void;
// }

// const FilterDropdown: React.FC<FilterDropdownProps> = ({
//   year,
//   onYearChange,
// }) => {
//   const { years } = useDashboard();
//   const handleYearSelect = (selectedYearValue: number) => {
//     const yearStr = selectedYearValue.toString();
//     const [startYearStr, endYearStr] = yearStr.split("-");
//     const startYear = parseInt(startYearStr);
//     const endYear = endYearStr ? parseInt(endYearStr) : startYear;
//     const startDate = `${startYear}-04-01`;
//     const financialEndDate = `${endYear + (endYearStr ? 0 : 1)}-03-31`;
//     onYearChange(selectedYearValue, startDate, financialEndDate);
//   };
//   return (
//     <div className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
//       <label className="block font-medium mb-2 text-gray-700">
//         Filter by Budget Year
//       </label>
//       <YearDropdown
//         selectedYear={year}
//         onSelectYear={handleYearSelect}
//         years={years}
//       />
//     </div>
//   );
// };

interface ColumnSelectionProps {
  selectedColumns: SelectedColumns;
  onToggleColumn: (column: string) => void;
  allPossibleColumnsForSelection: string[];
  customColumnDefs: CustomColumnDefinition[];
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

interface DraggableColumnProps {
  columnKey: string;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  columnDisplayName: string;
  isCustomColumn: boolean;
  aliasInputValue: string;
  handleAliasChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    columnKey: string
  ) => void;
  children?: React.ReactNode
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
            (Custom Column)
          </span>
        )}
      </div>
    </div>
  );
};

interface ColumnReorderProps {
  draggableColumnOrder: string[];
  columnAliases: Record<string, string>;
  customColumnDefs: CustomColumnDefinition[];
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
  onRemoveCustomColumn: (columnKey: string) => void;
}

type SpecialHeaderKey =
  | "annexure"
  | "nameOfCenter"
  | "stockRegNameAndVolNo"
  | "statementOfVerification";


const ColumnReorder: React.FC<ColumnReorderProps> = ({
  draggableColumnOrder,
  columnAliases,
  customColumnDefs,
  moveColumn,
  onAliasChange,
  onAliasChangeForSpecialHeader,
  onRemoveCustomColumn,
}) => {
  const specialHeaderKeys: SpecialHeaderKey[] = [
    "annexure",
    "nameOfCenter",
    "stockRegNameAndVolNo",
    "statementOfVerification",
  ];

  const getDraggableColumnDisplayName = (key: string) => {
    const customCol = customColumnDefs.find((cc) => cc.id === key);
    if (customCol) return customCol.displayName;
    // Pass customColumnDefs to formatColumnKeyForDisplay if it can use it
    // to find original names if an alias is not set.
    // console.log(
    //   columnAliases[key], formatColumnKeyForDisplay(key, customColumnDefs),
    //   columnAliases, key);
    return (
      key || formatColumnKeyForDisplay(key, customColumnDefs)
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
              <div
                key={columnKey}
                className="flex items-center space-x-2 group" // Added group for potential hover effects on button
              >
                <DraggableColumn
                  // key prop is on the wrapping div now
                  columnKey={columnKey}
                  index={index}
                  moveColumn={moveColumn}
                  columnDisplayName={getDraggableColumnDisplayName(columnKey)}
                  isCustomColumn={isCustom}
                  aliasInputValue={
                    columnAliases[columnKey] ||
                    // For initial display of alias input, if no alias, show formatted key
                    // If it's a custom column, its displayName is already part of getDraggableColumnDisplayName.
                    // The alias input should ideally start empty or with the current alias.
                    // If customCol.displayName is the "true name" and alias is different, then this is fine.
                    (customColumnDefs.find((cc) => cc.id === columnKey)
                      ?.displayName !==
                    (columnAliases[columnKey] ||
                      formatColumnKeyForDisplay(columnKey, []))
                      ? columnAliases[columnKey] || ""
                      : formatColumnKeyForDisplay(columnKey, []))
                  }
                  handleAliasChange={onAliasChange}
                />
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => onRemoveCustomColumn(columnKey)}
                    className="p-1.5 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 rounded-md transition-colors duration-150 ease-in-out"
                    title="Remove custom column"
                    aria-label={`Remove custom column ${getDraggableColumnDisplayName(
                      columnKey
                    )}`}
                  >
                    {/* Using a simple 'X' icon, you can replace with an SVG or icon font */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
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
                value={columnAliases[key] || ""}
                onChange={(e) => onAliasChangeForSpecialHeader(e, key)} // key is correctly typed here
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

interface AddCustomColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddColumn: (definition: CustomColumnDefinition) => void;
  existingColumnKeys: string[];
  customColumnDefs: CustomColumnDefinition[];
}

const AddCustomColumnModal: React.FC<AddCustomColumnModalProps> = ({
  isOpen,
  onClose,
  onAddColumn,
  existingColumnKeys,
  customColumnDefs,
}) => {
  const [displayName, setDisplayName] = useState("");
  const [type, setType] = useState<CustomColumnDefinition["type"]>("static");
  const [arithmeticExpression, setArithmeticExpression] = useState<string>("");
  const [concatOrderSources, setConcatOrderSources] = useState<string[]>([]);
  const [currentConcatSourceToAdd, setCurrentConcatSourceToAdd] =
    useState<string>("");
  const [separator, setSeparator] = useState(" ");
  const [staticValue, setStaticValue] = useState<string | number>("");
  const [showAvailableVars, setShowAvailableVars] = useState(false);

  const resetForm = () => {
    setDisplayName("");
    setType("static");
    setArithmeticExpression("");
    setConcatOrderSources([]);
    setCurrentConcatSourceToAdd("");
    setSeparator(" ");
    setStaticValue("");
    setShowAvailableVars(false);
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
    let definition: Partial<CustomColumnDefinition> &
      Pick<CustomColumnDefinition, "id" | "displayName" | "type"> = {
      id,
      displayName: displayName.trim(),
      type,
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
        if (!arithmeticExpression.trim()) {
          alert("Arithmetic expression is required.");
          return;
        }
        definition = {
          ...definition,
          arithmeticExpression: arithmeticExpression.trim(),
        };
        break;
    }
    onAddColumn(definition as CustomColumnDefinition);
    resetForm();
    onClose();
  };

  const handleAddSourceToConcatList = () => {
    if (
      currentConcatSourceToAdd &&
      !concatOrderSources.includes(currentConcatSourceToAdd)
    ) {
      setConcatOrderSources((prev) => [...prev, currentConcatSourceToAdd]);
      setCurrentConcatSourceToAdd("");
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
              <option value="arithmetic">Arithmetic Expression</option>
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
                      .filter((key) => !concatOrderSources.includes(key))
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
                  Arithmetic Expression
                </label>
                <input
                  type="text"
                  value={arithmeticExpression}
                  onChange={(e) => setArithmeticExpression(e.target.value)}
                  placeholder="e.g., quantity * price + gstAmount"
                  className="mt-1 p-2 w-full border rounded"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use column IDs as variables (e.g., `quantity * price`). You
                  can also use `Math` functions like `Math.round()`.
                  <button
                    type="button"
                    onClick={() => setShowAvailableVars(!showAvailableVars)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    {showAvailableVars ? "Hide" : "Show"} available variable IDs
                  </button>
                </p>
                {showAvailableVars && (
                  <div className="mt-1 p-2 border rounded bg-gray-50 max-h-32 overflow-y-auto">
                    <p className="text-xs font-semibold mb-1">
                      Available Column IDs for expression:
                    </p>
                    <ul className="list-disc list-inside text-xs">
                      {selectableSourceKeys.map((key) => (
                        <li key={`var-${key}`}>
                          <code>{key}</code> (
                          {formatColumnKeyForDisplay(key, customColumnDefs)})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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

interface StockTableProps {
  stocks: Stock[];
  columnOrder: string[];
  selectedColumns: SelectedColumns;
  columnAliases: ColumnAliases;
  customColumnDefs: CustomColumnDefinition[];
  computeCustomColumnValueFn: (
    stock: Stock,
    columnId: string,
    customDefs: CustomColumnDefinition[],
    allStock: Stock[],
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

  const renderableColumns: {
    id: string;
    header: string;
    isSubColumn: boolean;
    dataKeyForStock: keyof Stock;
    parentGroupKey?: string;
}[] = columnOrder
    .flatMap((colKey) => {
      if (!selectedColumns[colKey]) return [];
      if (colKey === STOCK_REGISTER_GROUP_KEY) {
        return STOCK_REG_SUB_COLUMNS.map((sc) => ({
          id: sc.id,
          header: sc.defaultHeader,
          isSubColumn: true,
          dataKeyForStock: sc.dataKey,
          parentGroupKey: STOCK_REGISTER_GROUP_KEY,
        }));
      } else {
        return [
          {
            id: colKey,
            header: getColumnEffectiveDisplayName(colKey),
            isSubColumn: false,
            dataKeyForStock: colKey as keyof Stock, // This will be used for direct access
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
    <div className="overflow-x-auto shadow-lg bg-white">
      <table
        id="stockReportTable"
        className="w-full text-xs text-left border-collapse border border-black"
      >
        <thead className="align-middle">
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

          <tr className="bg-white main-header-row">
            {columnOrder
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
          {isStockRegisterGroupSelected && (
            <tr className="bg-white sub-header-row">
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
                  return [];
                })}
            </tr>
          )}
        </thead>
        <tbody>
          {stocks.map((stock, idx) => (
            <tr
              key={stock.stockId + idx} // stockId might not be unique if not selected, use index
              className="hover:bg-gray-50 transition-colors"
            >
              {renderableColumns.map((rCol) => {
                let cellValue: string | number | undefined;
                if (
                  rCol.parentGroupKey! === STOCK_REGISTER_GROUP_KEY &&
                  rCol.dataKeyForStock!
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
                    // For arrays like locations, staffs, usage, String() will comma-separate them.
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
                        "gstAmount",
                        "basePrice",
                        "displaySerialNo",
                        ...STOCK_REG_SUB_COLUMNS.map((s) => s.id),
                      ].includes(rCol.id)
                        ? "text-center"
                        : "text-left"
                    } ${rCol.id === "stockDescription" ? "min-w-[200px]" : ""}`}
                  >
                    {/* For arrays like usage, this will render them comma-separated if multiple items exist */}
                    {/* If specific HTML formatting (like <br />) is needed, this part would need more logic */}
                    {Array.isArray(cellValue)
                      ? cellValue.join(", ")
                      : cellValue}
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

interface ExportButtonsProps {
  onExportExcel: () => void;
  // onExportPDF: (pageSize: "a4" | "a3" | "a2" | "letter" | "legal") => void;
  onPrintTable: () => void;
  hasData: boolean;
}
const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportExcel,
  // onExportPDF,
  onPrintTable,
  hasData,
}) => {
  // const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
      <button
        onClick={onPrintTable}
        disabled={!hasData}
        className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generate Report
      </button>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={onExportExcel}
          disabled={!hasData}
          className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export to Excel
        </button>
        {/* <div className="relative w-full sm:w-auto">
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
        </div> */}
      </div>
    </div>
  );
};

const ALL_BASE_SELECTABLE_COLUMNS: string[] = [
  "displaySerialNo",
  STOCK_REGISTER_GROUP_KEY,
  "stockId",
  "stockName",
  "stockDescription",
  "locations",
  "staffs",
  "usage",
  "quantity",
  "basePrice",
  "gstAmount",
  "price",
  "remarks",
  "budgetName",
  "categoryName",
  "invoiceNo",
  "purchaseOrderDate",
  "invoiceDate",
  "fromAddress",
  "toAddress",
  "status",
];

const PRE_COMPUTED_INITIAL_SELECTED_COLUMNS =
  ALL_BASE_SELECTABLE_COLUMNS.reduce((acc, colKey) => {
    acc[colKey] = [
      "displaySerialNo",
      STOCK_REGISTER_GROUP_KEY,
      "stockName",
      "quantity",
      "price",
    ].includes(colKey);
    return acc;
  }, {} as SelectedColumns);

const PRE_COMPUTED_INITIAL_COLUMN_ALIASES: ColumnAliases = {
  annexure: "ANNEXURE - I",
  nameOfCenter: "Name of the Center/Department: Example Department",
  stockRegNameAndVolNo:
    "Name of the Stock Register & Vol.No: Example Register Vol. 1",
  statementOfVerification:
    "STATEMENT SHOWING THE DETAILS OF VERIFICATION OF STORES AND STOCK FOR THE YEAR 2023-2024",
  ...ALL_BASE_SELECTABLE_COLUMNS.reduce((acc, colKey) => {
    acc[colKey] = formatColumnKeyForDisplay(colKey, []);
    return acc;
  }, {} as ColumnAliases),
};

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
          if (sourceIsCustomDef.id === customDef.id) {
            console.error(
              `Cycle detected: ${customDef.displayName} directly references itself.`
            );
            return "CycleErr";
          }
          if (
            sourceIsCustomDef.sourceColumns?.includes(customDef.id) ||
            (sourceIsCustomDef.type === "arithmetic" &&
              sourceIsCustomDef.arithmeticExpression?.includes(customDef.id))
          ) {
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
        if (subColDef) return stockItem[subColDef.dataKey as keyof Stock];

        if (Object.prototype.hasOwnProperty.call(stockItem, sourceColId)) {
          return stockItem[sourceColId as keyof Stock];
        }
        return undefined;
      };

      switch (customDef.type) {
        case "static":
          return customDef.staticValue;
        case "concatenation":
          return (customDef.sourceColumns || [])
            .map((scId) => String(getSourceValue(scId) ?? ""))
            .join(customDef.separator || " ");
        case "arithmetic":
          if (customDef.arithmeticExpression) {
            const expression = customDef.arithmeticExpression;
            const variableRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
            let match;
            const variableNamesInExpression = new Set<string>();
            while ((match = variableRegex.exec(expression)) !== null) {
              if (
                typeof Math[match[1] as keyof Math] === "undefined" &&
                match[1] !== "Math"
              ) {
                variableNamesInExpression.add(match[1]);
              }
            }

            const argValues: any[] = [];
            const argNames: string[] = [];
            const unresolvedVariable = false;

            for (const varName of variableNamesInExpression) {
              const value = getSourceValue(varName);
              const isKnownColumn =
                allCustomDefs.some((def) => def.id === varName) ||
                STOCK_REG_SUB_COLUMNS.some((sc) => sc.id === varName) ||
                ALL_BASE_SELECTABLE_COLUMNS.includes(varName) ||
                varName === "displaySerialNo";

              if (isKnownColumn) {
                if (
                  value === undefined ||
                  value === null ||
                  value === "CycleErr"
                ) {
                  console.warn(
                    `Variable '${varName}' for arithmetic column '${customDef.displayName}' is undefined, null, or created a cycle. Using NaN.`
                  );
                  argValues.push(NaN);
                } else {
                  const numericValue = parseFloat(String(value)); // String(value) handles arrays by comma-separating
                  argValues.push(isNaN(numericValue) ? value : numericValue);
                }
                argNames.push(varName);
              }
            }

            if (unresolvedVariable) return "Err:Var";

            try {
              const evaluator = new Function(
                ...argNames,
                `'use strict'; return ${expression};`
              );
              const result = evaluator(...argValues);

              if (typeof result === "number") {
                if (isNaN(result)) return "Err:CalcNaN";
                if (!isFinite(result)) return "Err:Infinite";
                return parseFloat(result.toFixed(4));
              }
              return result;
            } catch (e: any) {
              console.error(
                `Error evaluating expression for ${
                  customDef.displayName
                }: "${expression}" with args ${JSON.stringify(
                  argNames
                )} = ${JSON.stringify(argValues)}`,
                e.message
              );
              return "Err:Expr";
            }
          }
          return "Err:NoExpr";
        default:
          return undefined;
      }
    },
    []
  );

  const [allEffectiveSelectableColumns, setAllEffectiveSelectableColumns] =
    useState<string[]>([]);

  useEffect(() => {
    setAllEffectiveSelectableColumns([
      ...ALL_BASE_SELECTABLE_COLUMNS,
      ...customColumns.map((cc) => cc.id),
    ]);
  }, [customColumns]);

  // const initialSelectedColumns = ALL_BASE_SELECTABLE_COLUMNS.reduce(
  //   (acc, colKey) => {
  //     acc[colKey] = [
  //       "displaySerialNo",
  //       STOCK_REGISTER_GROUP_KEY,
  //       "stockName",
  //       "quantity",
  //       "price",
  //     ].includes(colKey);
  //     return acc;
  //   },
  //   {} as SelectedColumns
  // );
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumns>(
    PRE_COMPUTED_INITIAL_SELECTED_COLUMNS // Use the stable constant
  );
  const [columnAliases, setColumnAliases] = useState<ColumnAliases>(
    PRE_COMPUTED_INITIAL_COLUMN_ALIASES // Use the stable constant
  );

  const [columnOrder, setColumnOrder] = useState<string[]>([
    ...ALL_BASE_SELECTABLE_COLUMNS,
  ]);

  // const initialColumnAliases: ColumnAliases = {
  //   annexure: "ANNEXURE - I",
  //   nameOfCenter: "Name of the Center/Department: Example Department",
  //   stockRegNameAndVolNo:
  //     "Name of the Stock Register & Vol.No: Example Register Vol. 1",
  //   statementOfVerification:
  //     "STATEMENT SHOWING THE DETAILS OF VERIFICATION OF STORES AND STOCK FOR THE YEAR 2023-2024",
  //   ...ALL_BASE_SELECTABLE_COLUMNS.reduce((acc, colKey) => {
  //     acc[colKey] = formatColumnKeyForDisplay(colKey, []);
  //     return acc;
  //   }, {} as ColumnAliases),
  // };

  const getInitialFinancialDates = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0 (Jan) - 11 (Dec)

    let startYear = currentYear;
    // If current month is before April, the financial year started last year
    if (currentMonth < 3) {
      // Before April (Jan, Feb, Mar)
      startYear = currentYear - 1;
    }
    const financialStartDate = `${startYear}-04-01`;
    const financialEndDate = `${startYear + 1}-03-31`;
    return { financialStartDate, financialEndDate };
  };

  const { financialStartDate, financialEndDate } = getInitialFinancialDates();

  const [startDate, setStartDate] = useState<string | null>(financialStartDate);
  const [endDate, setEndDate] = useState<string | null>(financialEndDate);

  // This is where you would typically fetch or filter data based on startDate and endDate
  useEffect(() => {
    if (startDate && endDate) {
      console.log("Selected date range for filtering:");
      console.log("Start Date:", startDate);
      console.log("End Date:", endDate);
      // Example: fetchData(startDate, endDate);
    }
  }, [startDate, endDate]);

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    // Optional: Add validation, e.g., startDate should not be after endDate
    if (endDate && new Date(date) > new Date(endDate)) {
      setEndDate(null); // Or set to startDate, or show an error
      toast.warn("Start date cannot be after end date. End date cleared.");
    }
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    // Optional: Add validation, e.g., endDate should not be before startDate
    if (startDate && new Date(date) < new Date(startDate)) {
      setStartDate(null); // Or set to endDate, or show an error
      toast.warn("End date cannot be before start date. Start date cleared.");
    }
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
        console.log("Data : ", JSON.stringify(data, null, 2));
        const loadedCustomColumns = Array.isArray(data.customColumns)
          ? data.customColumns
          : [];
        setCustomColumns(loadedCustomColumns);

        const currentAllEffectiveCols = [
          ...ALL_BASE_SELECTABLE_COLUMNS, // Stable constant
          ...loadedCustomColumns.map((cc: CustomColumnDefinition) => cc.id),
        ];

        // Build newSelectedColumns based on PRE_COMPUTED_INITIAL_SELECTED_COLUMNS and fetched data
        const newSelectedColumnsState: SelectedColumns = {};
        Object.keys(PRE_COMPUTED_INITIAL_SELECTED_COLUMNS).forEach((key) => {
          // Use stable constant
          newSelectedColumnsState[key] =
            PRE_COMPUTED_INITIAL_SELECTED_COLUMNS[key];
        });
        if (data.selectedColumns) {
          currentAllEffectiveCols.forEach((key) => {
            if (data.selectedColumns[key] !== undefined) {
              newSelectedColumnsState[key] = data.selectedColumns[key];
            } else if (!newSelectedColumnsState.hasOwnProperty(key)) {
              newSelectedColumnsState[key] = false; // Default for new custom cols not in fetched settings
            }
          });
        }
        setSelectedColumns(newSelectedColumnsState);

        // Order logic (ensure ALL_BASE_SELECTABLE_COLUMNS is stable)
        let savedOrder =
          data.columnOrder && Array.isArray(data.columnOrder)
            ? data.columnOrder.filter((col: string) =>
                currentAllEffectiveCols.includes(col)
              )
            : [];
        const defaultOrder = [
          ...ALL_BASE_SELECTABLE_COLUMNS, // Stable constant
          ...loadedCustomColumns
            .map((cc: CustomColumnDefinition) => cc.id)
            .filter((id: string) => !ALL_BASE_SELECTABLE_COLUMNS.includes(id)),
        ];
        setColumnOrder([...new Set([...savedOrder, ...defaultOrder])]);

        // Build newAliases based on PRE_COMPUTED_INITIAL_COLUMN_ALIASES and fetched data
        const newAliasesState: ColumnAliases = {
          ...PRE_COMPUTED_INITIAL_COLUMN_ALIASES,
        }; // Use stable constant
        if (data.columnAliases) {
          Object.keys(data.columnAliases).forEach((key) => {
            if (PRE_COMPUTED_INITIAL_COLUMN_ALIASES.hasOwnProperty(key))
              // Only update known alias keys
              newAliasesState[key] = data.columnAliases[key];
          });
        }
        setColumnAliases(newAliasesState);
      } else {
        console.warn("Failed to fetch settings, using defaults.");
        setCustomColumns([]);
        setSelectedColumns(PRE_COMPUTED_INITIAL_SELECTED_COLUMNS); // Use stable constant
        setColumnOrder([...ALL_BASE_SELECTABLE_COLUMNS]); // Use stable constant
        setColumnAliases(PRE_COMPUTED_INITIAL_COLUMN_ALIASES); // Use stable constant
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setCustomColumns([]);
      setSelectedColumns(PRE_COMPUTED_INITIAL_SELECTED_COLUMNS); // Use stable constant
      setColumnOrder([...ALL_BASE_SELECTABLE_COLUMNS]); // Use stable constant
      setColumnAliases(PRE_COMPUTED_INITIAL_COLUMN_ALIASES);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchSettingsCallback();
  }, [fetchSettingsCallback, token]);

  useEffect(() => {
    const getReportData = async () => {
      if (!token) return;
      let url = `${API_URL}/stock/report`;
      if (startDate && endDate)
        url += `?startDate=${startDate}&endDate=${endDate}`;
      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const rawApiData = await response.json();
        console.log("Raw api data : ", JSON.stringify(rawApiData, null, 2));

        const processedData = (Array.isArray(rawApiData) ? rawApiData : []).map(
          (item: any): Stock => {
            let vol = "",
              page = "",
              ser = "";

            const stockId = item.stockId?.toString() || "";

            // New format regex
            const newFormatMatch = stockId.match(
              /Vol\.No\.([^/]+)\/Pg\.No\.([^/]+)\/S\.No\.([^\-/\[]+)/
            );

            if (newFormatMatch) {
              vol = newFormatMatch[1]?.trim() || "N/A";
              page = newFormatMatch[2]?.trim() || "N/A";
              ser = newFormatMatch[3]?.trim() || "N/A";
            } else {
              // fallback to old format: "vol-page-serial"
              const [v = "", p = "", s = ""] = stockId.split("-");
              vol = v.trim();
              page = p.trim();
              ser = s.trim();
            }

            return {
              stockId: stockId,
              stockName: item.stockName || "N/A",
              stockDescription: item.stockDescription || "",
              locations: Array.isArray(item.locations) ? item.locations : [],
              staffs: Array.isArray(item.staffs) ? item.staffs : [],
              usage: Array.isArray(item.usage) ? item.usage : [],
              quantity: parseInt(item.quantity, 10) || 0,
              basePrice: parseFloat(item.basePrice) || 0,
              gstAmount: parseFloat(item.gstAmount) || 0,
              price: parseFloat(item.price) || 0,
              remarks: item.remarks || "",
              budgetName: item.budgetName || "N/A",
              volNo: vol,
              pageNo: page,
              serialNo: ser,
              categoryName: item.categoryName || undefined,
              invoiceNo: item.invoiceNo || undefined,
              fromAddress: item.fromAddress || undefined,
              toAddress: item.toAddress || undefined,
              purchaseOrderDate: item.purchaseOrderDate
                ? new Date(item.purchaseOrderDate).toISOString().split("T")[0]
                : "",
              invoiceDate: item.invoiceDate
                ? new Date(item.invoiceDate).toISOString().split("T")[0]
                : "",
              status: item.status || undefined,
              annexure: undefined,
              nameOfCenter: undefined,
              stockRegNameAndVolNo: undefined,
              statementOfVerification: undefined,
            };
          }
        );
        setStocks(processedData);
      } catch (error) {
        console.error("Failed to fetch stock data:", error);
        setStocks([]);
      }
    };
    if (token) getReportData();
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

  const removeCustomColumnHandler = (columnIdToRemove: string) => {
    // --- Debugging Step: ---
    // Log the values here to confirm they are what you expect before calling the main logic.
    // If customColumns is undefined here, the problem is how this handler accesses the state.
    console.log(
      "Attempting to remove column. Current states in wrapper handler:"
    );
    console.log("columnIdToRemove:", columnIdToRemove);
    console.log("customColumns:", customColumns); // Crucial check!
    console.log("selectedColumns:", selectedColumns);
    console.log("columnOrder:", columnOrder);
    console.log("columnAliases:", columnAliases);

    // Ensure all arguments are correctly passed from the component's state
    handleRemoveCustomColumn(
      columnIdToRemove,
      customColumns, // Make sure this 'customColumns' is the state variable
      setCustomColumns,
      selectedColumns, // Same for selectedColumns
      setSelectedColumns,
      columnOrder, // Same for columnOrder
      setColumnOrder,
      columnAliases // Same for columnAliases
      // If saveSettings is a function from context or props, pass it too, or ensure it's in scope for handleRemoveCustomColumn
      // For instance, if handleRemoveCustomColumn relies on a saveSettings in its own scope:
      // saveSettings // (if handleRemoveCustomColumn is defined in the same scope as saveSettings)
    );
  };
  

  const handleRemoveCustomColumn = (
    columnIdToRemove: string,
    customColumns: CustomColumnDefinition[],
    setCustomColumns: React.Dispatch<
      React.SetStateAction<CustomColumnDefinition[]>
    >,
    selectedColumns: Record<string, boolean>,
    setSelectedColumns: React.Dispatch<
      React.SetStateAction<Record<string, boolean>>
    >,
    columnOrder: string[],
    setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>,
    columnAliases: Record<string, string> 
  ) => {
    // 1. Remove from customColumns
    const newCustomCols = customColumns.filter(
      (col) => col.id !== columnIdToRemove
    );
    setCustomColumns(newCustomCols);

    // 2. Remove from selectedColumns
    const newSelectedCols = { ...selectedColumns };
    delete newSelectedCols[columnIdToRemove];
    setSelectedColumns(newSelectedCols);

    // 3. Remove from columnOrder
    const newColumnOrder = columnOrder.filter(
      (cId) => cId !== columnIdToRemove
    );
    setColumnOrder(newColumnOrder);

    // 4. Persist changes
    saveSettings({
      selectedColumns: newSelectedCols,
      columnOrder: newColumnOrder,
      columnAliases, 
      customColumns: newCustomCols,
    });

    console.log(
      `Custom column with ID "${columnIdToRemove}" has been removed.`
    );
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
    const finalNewOrder = newDraggableOrder.slice();
    const draggableSet = new Set(newDraggableOrder);
    columnOrder.forEach((colKey) => {
      if (
        !draggableSet.has(colKey) &&
        currentAllColsSet.has(colKey) &&
        !finalNewOrder.includes(colKey)
      )
        finalNewOrder.push(colKey);
    });
    allEffectiveSelectableColumns.forEach((key) => {
      if (!finalNewOrder.includes(key)) finalNewOrder.push(key);
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

  // const exportToExcel = async () => {
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet("Stock Report");
  //   const isStockRegisterGroupSelected =
  //     selectedColumns[STOCK_REGISTER_GROUP_KEY] === true &&
  //     columnOrder.includes(STOCK_REGISTER_GROUP_KEY);

  //   const excelColumnsStructure: {
  //     id: string;
  //     header: string;
  //     isSub: boolean;
  //     parentGroup?: string;
  //     dataKeyForStock?: keyof Stock;
  //   }[] = [];
  //   columnOrder.forEach((colKey) => {
  //     if (!selectedColumns[colKey]) return;
  //     if (colKey === STOCK_REGISTER_GROUP_KEY) {
  //       STOCK_REG_SUB_COLUMNS.forEach((sc) =>
  //         excelColumnsStructure.push({
  //           id: sc.id,
  //           header: sc.defaultHeader,
  //           isSub: true,
  //           parentGroup: getColumnEffectiveDisplayName(
  //             STOCK_REGISTER_GROUP_KEY
  //           ),
  //           dataKeyForStock: sc.dataKey,
  //         })
  //       );
  //     } else {
  //       excelColumnsStructure.push({
  //         id: colKey,
  //         header: getColumnEffectiveDisplayName(colKey),
  //         isSub: false,
  //       });
  //     }
  //   });

  //   const colCount = excelColumnsStructure.length;
  //   if (colCount === 0) return;
  //   let currentRowIdx = 1;
  //   const styleCell = (
  //     cell: ExcelJS.Cell,
  //     style: Partial<ExcelJS.Style & { value: any }>
  //   ) => {
  //     cell.border = {
  //       top: { style: "thin" },
  //       left: { style: "thin" },
  //       bottom: { style: "thin" },
  //       right: { style: "thin" },
  //     };
  //     cell.font = { ...cell.font, ...style.font };
  //     cell.alignment = { ...cell.alignment, ...style.alignment };
  //     cell.fill = { ...cell.fill, ...style.fill };
  //     if (style.value !== undefined) cell.value = style.value;
  //   };

  //   if (columnAliases.annexure) {
  //     worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
  //     styleCell(worksheet.getCell(currentRowIdx, 1), {
  //       value: columnAliases.annexure,
  //       font: { bold: true, size: 12 },
  //       alignment: { horizontal: "center", vertical: "middle" },
  //       fill: {
  //         type: "pattern",
  //         pattern: "solid",
  //         fgColor: { argb: "FFFFFFFF" },
  //       },
  //     });
  //     worksheet.getRow(currentRowIdx).height = 20;
  //     currentRowIdx++;
  //   }
  //   if (columnAliases.nameOfCenter || columnAliases.stockRegNameAndVolNo) {
  //     const midPoint = Math.ceil(colCount / 2);
  //     if (columnAliases.nameOfCenter && columnAliases.stockRegNameAndVolNo) {
  //       worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, midPoint);
  //       styleCell(worksheet.getCell(currentRowIdx, 1), {
  //         value: columnAliases.nameOfCenter,
  //         alignment: { horizontal: "center", vertical: "middle" },
  //         fill: {
  //           type: "pattern",
  //           pattern: "solid",
  //           fgColor: { argb: "FFFFFFFF" },
  //         },
  //       });
  //       worksheet.mergeCells(
  //         currentRowIdx,
  //         midPoint + 1,
  //         currentRowIdx,
  //         colCount
  //       );
  //       styleCell(worksheet.getCell(currentRowIdx, midPoint + 1), {
  //         value: columnAliases.stockRegNameAndVolNo,
  //         alignment: { horizontal: "center", vertical: "middle" },
  //         fill: {
  //           type: "pattern",
  //           pattern: "solid",
  //           fgColor: { argb: "FFFFFFFF" },
  //         },
  //       });
  //     } else if (columnAliases.nameOfCenter) {
  //       worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
  //       styleCell(worksheet.getCell(currentRowIdx, 1), {
  //         value: columnAliases.nameOfCenter,
  //         alignment: { horizontal: "center", vertical: "middle" },
  //         fill: {
  //           type: "pattern",
  //           pattern: "solid",
  //           fgColor: { argb: "FFFFFFFF" },
  //         },
  //       });
  //     } else if (columnAliases.stockRegNameAndVolNo) {
  //       worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
  //       styleCell(worksheet.getCell(currentRowIdx, 1), {
  //         value: columnAliases.stockRegNameAndVolNo,
  //         alignment: { horizontal: "center", vertical: "middle" },
  //         fill: {
  //           type: "pattern",
  //           pattern: "solid",
  //           fgColor: { argb: "FFFFFFFF" },
  //         },
  //       });
  //     }
  //     worksheet.getRow(currentRowIdx).height = 20;
  //     currentRowIdx++;
  //   }
  //   if (columnAliases.statementOfVerification) {
  //     worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
  //     styleCell(worksheet.getCell(currentRowIdx, 1), {
  //       value: columnAliases.statementOfVerification,
  //       font: { bold: true, size: 12 },
  //       alignment: { horizontal: "center", vertical: "middle" },
  //       fill: {
  //         type: "pattern",
  //         pattern: "solid",
  //         fgColor: { argb: "FFFFFFFF" },
  //       },
  //     });
  //     worksheet.getRow(currentRowIdx).height = 20;
  //     currentRowIdx++;
  //   }

  //   const headerRow1Values: (string | null)[] = [];
  //   columnOrder
  //     .filter((colKey) => selectedColumns[colKey])
  //     .forEach((colKey) => {
  //       if (colKey === STOCK_REGISTER_GROUP_KEY) {
  //         headerRow1Values.push(getColumnEffectiveDisplayName(colKey));
  //         for (let i = 1; i < STOCK_REG_SUB_COLUMNS.length; i++)
  //           headerRow1Values.push(null);
  //       } else {
  //         headerRow1Values.push(getColumnEffectiveDisplayName(colKey));
  //       }
  //     });

  //   const r1 = worksheet.addRow(headerRow1Values);
  //   r1.height = 25;
  //   r1.eachCell((cell) =>
  //     styleCell(cell, {
  //       font: { bold: true, size: 9 },
  //       alignment: { horizontal: "center", vertical: "middle", wrapText: true },
  //       fill: {
  //         type: "pattern",
  //         pattern: "solid",
  //         fgColor: { argb: "FFFFFFFF" },
  //       },
  //     })
  //   );

  //   let currentExcelCol = 1;
  //   columnOrder
  //     .filter((colKey) => selectedColumns[colKey])
  //     .forEach((colKey) => {
  //       if (colKey === STOCK_REGISTER_GROUP_KEY) {
  //         worksheet.mergeCells(
  //           currentRowIdx,
  //           currentExcelCol,
  //           currentRowIdx,
  //           currentExcelCol + STOCK_REG_SUB_COLUMNS.length - 1
  //         );
  //         currentExcelCol += STOCK_REG_SUB_COLUMNS.length;
  //       } else {
  //         if (isStockRegisterGroupSelected)
  //           worksheet.mergeCells(
  //             currentRowIdx,
  //             currentExcelCol,
  //             currentRowIdx + 1,
  //             currentExcelCol
  //           );
  //         currentExcelCol++;
  //       }
  //     });
  //   const mainHeaderRow1Number = currentRowIdx;
  //   currentRowIdx++;

  //   if (isStockRegisterGroupSelected) {
  //     let excelColForSub = 1;
  //     columnOrder
  //       .filter((colKey) => selectedColumns[colKey])
  //       .forEach((colKey) => {
  //         if (colKey === STOCK_REGISTER_GROUP_KEY) {
  //           STOCK_REG_SUB_COLUMNS.forEach((sc) => {
  //             worksheet.getCell(currentRowIdx, excelColForSub).value =
  //               sc.defaultHeader;
  //             styleCell(worksheet.getCell(currentRowIdx, excelColForSub), {
  //               font: { bold: true, size: 9 },
  //               alignment: {
  //                 horizontal: "center",
  //                 vertical: "middle",
  //                 wrapText: true,
  //               },
  //               fill: {
  //                 type: "pattern",
  //                 pattern: "solid",
  //                 fgColor: { argb: "FFFFFFFF" },
  //               },
  //             });
  //             excelColForSub++;
  //           });
  //         } else {
  //           excelColForSub++; 
  //         }
  //       });
  //     worksheet.getRow(currentRowIdx).height = 25;
  //     currentRowIdx++;
  //   }

  //   stocks.forEach((stock, idx) => {
  //     const rowData = excelColumnsStructure.map((colInfo) => {
  //       if (
  //         colInfo.parentGroup ===
  //           getColumnEffectiveDisplayName(STOCK_REGISTER_GROUP_KEY) &&
  //         colInfo.dataKeyForStock
  //       )
  //         return stock[colInfo.dataKeyForStock as keyof Stock] ?? "";
  //       if (colInfo.id === "displaySerialNo") return idx + 1;
  //       const customDef = customColumns.find((cc) => cc.id === colInfo.id);
  //       if (customDef)
  //         return computeCustomColumnValue(
  //           stock,
  //           colInfo.id,
  //           customColumns,
  //           stocks,
  //           idx
  //         );

  //       const val = stock[colInfo.id as keyof Stock];
  //       return Array.isArray(val) ? val.join(", ") : val ?? ""; 
  //     });
  //     const dataRow = worksheet.addRow(rowData);
  //     dataRow.height = 18;
  //     dataRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
  //       const colInfo = excelColumnsStructure[colNum - 1];
  //       if (!colInfo) return;
  //       styleCell(cell, {
  //         font: { size: 8 },
  //         alignment: {
  //           vertical: "top",
  //           wrapText: true,
  //           horizontal: [
  //             "quantity",
  //             "price",
  //             "basePrice",
  //             "gstAmount",
  //             "displaySerialNo",
  //             ...STOCK_REG_SUB_COLUMNS.map((s) => s.id),
  //           ].includes(colInfo.id)
  //             ? "center"
  //             : "left",
  //         },
  //       });

  //       if (typeof cell.value === "number") {
  //         if (["price", "basePrice", "gstAmount"].includes(colInfo.id)) {
  //           cell.numFmt = "#,##0.00";
  //         } else if (
  //           colInfo.id === "quantity" ||
  //           colInfo.id === "serialNoSub"
  //         ) {
  //           cell.numFmt = "#,##0";
  //         } else {
  //           const customDef = customColumns.find((cc) => cc.id === colInfo.id);
  //           if (customDef && customDef.type === "arithmetic") {
  //             cell.numFmt = "0.00##";
  //           } else {
  //             cell.numFmt = "#,##0.####";
  //           }
  //         }
  //       }
  //     });
  //   });

  //   excelColumnsStructure.forEach((colInfo, i) => {
  //     const column = worksheet.getColumn(i + 1);
  //     let maxLength = colInfo.header.length;
  //     stocks.forEach((stock, stockIdx) => {
  //       let cellValueStr = "";
  //       if (
  //         colInfo.parentGroup ===
  //           getColumnEffectiveDisplayName(STOCK_REGISTER_GROUP_KEY) &&
  //         colInfo.dataKeyForStock
  //       )
  //         cellValueStr = String(
  //           stock[colInfo.dataKeyForStock as keyof Stock] ?? ""
  //         );
  //       else if (colInfo.id === "displaySerialNo")
  //         cellValueStr = String(stockIdx + 1);
  //       else {
  //         const customDef = customColumns.find((cc) => cc.id === colInfo.id);
  //         if (customDef)
  //           cellValueStr = String(
  //             computeCustomColumnValue(
  //               stock,
  //               colInfo.id,
  //               customColumns,
  //               stocks,
  //               stockIdx
  //             ) ?? ""
  //           );
  //         else {
  //           const val = stock[colInfo.id as keyof Stock];
  //           cellValueStr = Array.isArray(val)
  //             ? val.join(", ")
  //             : String(val ?? "");
  //         }
  //       }
  //       if (cellValueStr.length > maxLength) maxLength = cellValueStr.length;
  //     });
  //     if (colInfo.id === "stockDescription") column.width = 40;
  //     else if (colInfo.id === "stockName") column.width = 25;
  //     else column.width = Math.max(10, Math.min(30, maxLength + 2));
  //   });

  //   worksheet.pageSetup.printTitlesRow = `${mainHeaderRow1Number}:${
  //     isStockRegisterGroupSelected
  //       ? mainHeaderRow1Number + 1
  //       : mainHeaderRow1Number
  //   }`;
  //   worksheet.pageSetup.orientation = "landscape";
  //   worksheet.pageSetup.fitToPage = true;
  //   worksheet.pageSetup.fitToWidth = 1;
  //   worksheet.pageSetup.fitToHeight = 0; // Allow multiple pages vertically
  //   worksheet.pageSetup.margins = {
  //     left: 0.5,
  //     right: 0.5,
  //     top: 0.75,
  //     bottom: 0.75,
  //     header: 0.3,
  //     footer: 0.3,
  //   };

  //   const buffer = await workbook.xlsx.writeBuffer();
  //   const blob = new Blob([buffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });
  //   const url = window.URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = `Stock_Report_${startDate}_to_${endDate}.xlsx`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   window.URL.revokeObjectURL(url);
  // };

  const MAX_EXCEL_CELL_LENGTH = 32767;

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock_Report");

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
        STOCK_REG_SUB_COLUMNS.forEach((sc) =>
          excelColumnsStructure.push({
            id: sc.id,
            header: sc.defaultHeader,
            isSub: true,
            parentGroup: getColumnEffectiveDisplayName(
              STOCK_REGISTER_GROUP_KEY
            ),
            dataKeyForStock: sc.dataKey,
          })
        );
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
      style: Partial<ExcelJS.Style> & { value?: any }
    ) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      if (style.value !== undefined) cell.value = style.value;
      if (style.font) cell.font = style.font;
      if (style.alignment) cell.alignment = style.alignment;
      if (style.fill) cell.fill = style.fill;
    };

    const addCenteredMergedRow = (value: string) => {
      worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, colCount);
      styleCell(worksheet.getCell(currentRowIdx, 1), {
        value,
        font: { bold: true, size: 12 },
        alignment: { horizontal: "center", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFFFF" },
        },
      });
      worksheet.getRow(currentRowIdx).height = 20;
      currentRowIdx++;
    };

    if (columnAliases.annexure) addCenteredMergedRow(columnAliases.annexure);

    if (columnAliases.nameOfCenter || columnAliases.stockRegNameAndVolNo) {
      const mid = Math.ceil(colCount / 2);
      if (columnAliases.nameOfCenter && columnAliases.stockRegNameAndVolNo) {
        worksheet.mergeCells(currentRowIdx, 1, currentRowIdx, mid);
        worksheet.mergeCells(currentRowIdx, mid + 1, currentRowIdx, colCount);
        styleCell(worksheet.getCell(currentRowIdx, 1), {
          value: columnAliases.nameOfCenter,
          alignment: { horizontal: "center", vertical: "middle" },
        });
        styleCell(worksheet.getCell(currentRowIdx, mid + 1), {
          value: columnAliases.stockRegNameAndVolNo,
          alignment: { horizontal: "center", vertical: "middle" },
        });
      } else {
        addCenteredMergedRow(
          columnAliases.nameOfCenter || columnAliases.stockRegNameAndVolNo
        );
      }
      worksheet.getRow(currentRowIdx).height = 20;
      currentRowIdx++;
    }

    if (columnAliases.statementOfVerification)
      addCenteredMergedRow(columnAliases.statementOfVerification);

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

    const headerRow = worksheet.addRow(headerRow1Values);
    headerRow.height = 25;
    headerRow.eachCell((cell: any) =>
      styleCell(cell, {
        font: { bold: true, size: 9 },
        alignment: { horizontal: "center", vertical: "middle", wrapText: true },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFFFF" },
        },
      })
    );

    let excelCol = 1;
    columnOrder
      .filter((colKey) => selectedColumns[colKey])
      .forEach((colKey) => {
        if (colKey === STOCK_REGISTER_GROUP_KEY) {
          worksheet.mergeCells(
            currentRowIdx,
            excelCol,
            currentRowIdx,
            excelCol + STOCK_REG_SUB_COLUMNS.length - 1
          );
          excelCol += STOCK_REG_SUB_COLUMNS.length;
        } else {
          if (isStockRegisterGroupSelected) {
            worksheet.mergeCells(
              currentRowIdx,
              excelCol,
              currentRowIdx + 1,
              excelCol
            );
          }
          excelCol++;
        }
      });

    const mainHeaderRow = currentRowIdx;
    currentRowIdx++;

    if (isStockRegisterGroupSelected) {
      let subColIdx = 1;
      columnOrder
        .filter((colKey) => selectedColumns[colKey])
        .forEach((colKey) => {
          if (colKey === STOCK_REGISTER_GROUP_KEY) {
            STOCK_REG_SUB_COLUMNS.forEach((sc) => {
              const cell = worksheet.getCell(currentRowIdx, subColIdx++);
              styleCell(cell, {
                value: sc.defaultHeader,
                font: { bold: true, size: 9 },
                alignment: {
                  horizontal: "center",
                  vertical: "middle",
                  wrapText: true,
                },
                fill: {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: "FFFFFFFF" },
                },
              });
            });
          } else {
            subColIdx++;
          }
        });
      worksheet.getRow(currentRowIdx).height = 25;
      currentRowIdx++;
    }

    stocks.forEach((stock, idx) => {
      const rowData = excelColumnsStructure.map((colInfo) => {
        let value: any = "";
        if (colInfo.id === "displaySerialNo") value = idx + 1;
        else if (colInfo.dataKeyForStock) {
          value = stock[colInfo.dataKeyForStock];
        } else {
          const custom = customColumns.find((cc) => cc.id === colInfo.id);
          value = custom
            ? computeCustomColumnValue(
                stock,
                colInfo.id,
                customColumns,
                stocks,
                idx
              )
            : stock[colInfo.id as keyof Stock];
        }

        const strVal = Array.isArray(value)
          ? value.join(", ")
          : String(value ?? "");
        return strVal.length > MAX_EXCEL_CELL_LENGTH
          ? strVal.substring(0, MAX_EXCEL_CELL_LENGTH)
          : strVal;
      });

      const dataRow = worksheet.addRow(rowData);
      dataRow.height = 18;

      dataRow.eachCell({ includeEmpty: true }, (cell: any, colNum: any) => {
        const colInfo = excelColumnsStructure[colNum - 1];
        const isNumber = !isNaN(Number(cell.value));
        const numberFormatCols = ["price", "basePrice", "gstAmount"];
        const centeredCols = [
          "quantity",
          "price",
          "basePrice",
          "gstAmount",
          "displaySerialNo",
          ...STOCK_REG_SUB_COLUMNS.map((s) => s.id),
        ];

        styleCell(cell, {
          font: { size: 8 },
          alignment: {
            vertical: "top",
            wrapText: true,
            horizontal: centeredCols.includes(colInfo.id) ? "center" : "left",
          },
        });

        if (isNumber) {
          if (numberFormatCols.includes(colInfo.id)) cell.numFmt = "#,##0.00";
          else if (colInfo.id === "quantity") cell.numFmt = "#,##0";
        }
      });
    });

    excelColumnsStructure.forEach((colInfo, i) => {
      const column = worksheet.getColumn(i + 1);
      let maxLen = colInfo.header.length;

      stocks.forEach((stock, idx) => {
        let val = "";
        if (colInfo.id === "displaySerialNo") val = String(idx + 1);
        else if (colInfo.dataKeyForStock)
          val = String(stock[colInfo.dataKeyForStock] ?? "");
        else {
          const custom = customColumns.find((cc) => cc.id === colInfo.id);
          val = custom
            ? String(
                computeCustomColumnValue(
                  stock,
                  colInfo.id,
                  customColumns,
                  stocks,
                  idx
                )
              )
            : String(stock[colInfo.id as keyof Stock] ?? "");
        }
        if (val.length > maxLen) maxLen = val.length;
      });

      column.width =
        colInfo.id === "stockDescription"
          ? 40
          : colInfo.id === "stockName"
          ? 25
          : Math.max(10, Math.min(30, maxLen + 2));
    });

    worksheet.pageSetup.printTitlesRow = `${mainHeaderRow}:${
      isStockRegisterGroupSelected ? mainHeaderRow + 1 : mainHeaderRow
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
    link.download = `Stock_Report_${startDate}_to_${endDate}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };


  // const exportToPDF = (
  //   pageSize: "a4" | "a3" | "a2" | "letter" | "legal" = "a4"
  // ) => {
  //   const doc = new jsPDF({
  //     orientation: "landscape",
  //     unit: "mm",
  //     format: pageSize,
  //   });
  //   const isStockRegisterGroupSelected =
  //     selectedColumns[STOCK_REGISTER_GROUP_KEY] === true &&
  //     columnOrder.includes(STOCK_REGISTER_GROUP_KEY);

  //   const head: any[][] = [];
  //   const headRow1: any[] = [];
  //   columnOrder
  //     .filter((colKey) => selectedColumns[colKey])
  //     .forEach((colKey) => {
  //       if (colKey === STOCK_REGISTER_GROUP_KEY)
  //         headRow1.push({
  //           content: getColumnEffectiveDisplayName(colKey),
  //           colSpan: STOCK_REG_SUB_COLUMNS.length,
  //         });
  //       else
  //         headRow1.push({
  //           content: getColumnEffectiveDisplayName(colKey),
  //           rowSpan: isStockRegisterGroupSelected ? 2 : 1,
  //         });
  //     });
  //   head.push(headRow1);

  //   if (isStockRegisterGroupSelected) {
  //     const dynamicHeadRow2: any[] = [];
  //     // This logic needs to ensure that subheaders are only added under the STOCK_REGISTER_GROUP_KEY
  //     // For PDF, autotable handles cell placement based on colSpans in previous rows
  //     columnOrder
  //       .filter((colKey) => selectedColumns[colKey])
  //       .forEach((colKey) => {
  //         if (colKey === STOCK_REGISTER_GROUP_KEY) {
  //           STOCK_REG_SUB_COLUMNS.forEach((sc) =>
  //             dynamicHeadRow2.push(sc.defaultHeader)
  //           );
  //         }
  //         // No 'else' needed here, as rowSpanned cells from headRow1 cover other columns
  //       });
  //     if (dynamicHeadRow2.length > 0) head.push(dynamicHeadRow2);
  //   }

  //   const body = stocks.map((stock, idx) => {
  //     const rowData: (string | number)[] = [];
  //     columnOrder
  //       .filter((colKey) => selectedColumns[colKey])
  //       .forEach((outerColKey) => {
  //         if (outerColKey === STOCK_REGISTER_GROUP_KEY)
  //           STOCK_REG_SUB_COLUMNS.forEach((sc) =>
  //             rowData.push(String(stock[sc.dataKey as keyof Stock] ?? ""))
  //           );
  //         else if (outerColKey === "displaySerialNo")
  //           rowData.push(String(idx + 1));
  //         else {
  //           const customDef = customColumns.find((cc) => cc.id === outerColKey);
  //           if (customDef)
  //             rowData.push(
  //               String(
  //                 computeCustomColumnValue(
  //                   stock,
  //                   outerColKey,
  //                   customColumns,
  //                   stocks,
  //                   idx
  //                 ) ?? ""
  //               )
  //             );
  //           else {
  //             const val = stock[outerColKey as keyof Stock];
  //             rowData.push(
  //               Array.isArray(val) ? val.join(", ") : String(val ?? "")
  //             ); // Join arrays for PDF
  //           }
  //         }
  //       });
  //     return rowData;
  //   });

  //   const columnStyles: any = {};
  //   let currentPdfColIndex = 0;
  //   columnOrder
  //     .filter((colKey) => selectedColumns[colKey])
  //     .forEach((outerColKey) => {
  //       if (outerColKey === STOCK_REGISTER_GROUP_KEY) {
  //         STOCK_REG_SUB_COLUMNS.forEach((subCol) => {
  //           columnStyles[currentPdfColIndex++] = {
  //             halign: ["volNoSub", "pageNoSub", "serialNoSub"].includes(
  //               subCol.id
  //             )
  //               ? "center"
  //               : "left",
  //           };
  //         });
  //       } else {
  //         columnStyles[currentPdfColIndex++] = {
  //           halign: [
  //             "quantity",
  //             "price",
  //             "basePrice",
  //             "gstAmount",
  //             "displaySerialNo",
  //           ].includes(outerColKey)
  //             ? "center"
  //             : "left",
  //         };
  //       }
  //     });

  //   let startY = 10;
  //   const margin = 10;
  //   const pageWidth = doc.internal.pageSize.getWidth();
  //   const availableWidth = pageWidth - margin * 2;
  //   const drawManualHeader = (
  //     text: string | undefined,
  //     yPos: number,
  //     isBold = false,
  //     isCentered = true,
  //     colSpan = 1,
  //     splitCols?: number
  //   ): number => {
  //     if (
  //       !text &&
  //       !(
  //         splitCols &&
  //         colSpan === 2 &&
  //         columnAliases.nameOfCenter &&
  //         columnAliases.stockRegNameAndVolNo
  //       )
  //     )
  //       return yPos;
  //     doc.setFont("helvetica", isBold ? "bold" : "normal");
  //     doc.setFontSize(isBold ? 9 : 8);
  //     const textHeight = 7;
  //     if (
  //       splitCols &&
  //       colSpan === 2 &&
  //       columnAliases.nameOfCenter &&
  //       columnAliases.stockRegNameAndVolNo
  //     ) {
  //       const firstColWidth = availableWidth / 2;
  //       const secondColWidth = availableWidth / 2;
  //       doc.text(
  //         columnAliases.nameOfCenter,
  //         margin + firstColWidth / 2,
  //         yPos + textHeight / 2 + 1.5,
  //         { align: "center", maxWidth: firstColWidth - 4 }
  //       );
  //       doc.text(
  //         columnAliases.stockRegNameAndVolNo,
  //         margin + firstColWidth + secondColWidth / 2,
  //         yPos + textHeight / 2 + 1.5,
  //         { align: "center", maxWidth: secondColWidth - 4 }
  //       );
  //     } else if (text) {
  //       doc.text(
  //         text,
  //         isCentered ? pageWidth / 2 : margin + 2,
  //         yPos + textHeight / 2 + 1.5,
  //         {
  //           align: isCentered ? "center" : "left",
  //           maxWidth: availableWidth - 4,
  //         }
  //       );
  //     }
  //     yPos += textHeight + 1;
  //     return yPos;
  //   };

  //   startY = drawManualHeader(columnAliases.annexure, startY, true, true);
  //   if (columnAliases.nameOfCenter || columnAliases.stockRegNameAndVolNo) {
  //     if (columnAliases.nameOfCenter && columnAliases.stockRegNameAndVolNo)
  //       startY = drawManualHeader(undefined, startY, false, true, 2, 2);
  //     else if (columnAliases.nameOfCenter)
  //       startY = drawManualHeader(
  //         columnAliases.nameOfCenter,
  //         startY,
  //         false,
  //         true
  //       );
  //     else if (columnAliases.stockRegNameAndVolNo)
  //       startY = drawManualHeader(
  //         columnAliases.stockRegNameAndVolNo,
  //         startY,
  //         false,
  //         true
  //       );
  //   }
  //   startY = drawManualHeader(
  //     columnAliases.statementOfVerification,
  //     startY,
  //     true,
  //     true
  //   );
  //   startY += 2;

  //   autoTable(doc, {
  //     head: head,
  //     body: body,
  //     startY: startY,
  //     theme: "grid",
  //     headStyles: {
  //       fillColor: [255, 255, 255],
  //       textColor: [0, 0, 0],
  //       fontStyle: "bold",
  //       halign: "center",
  //       valign: "middle",
  //     },
  //     columnStyles: columnStyles,
  //     didDrawPage: (hookData: any) => {
  //       const pageCount = (doc as any).internal.getNumberOfPages();
  //       doc.setFontSize(8);
  //       doc.text(
  //         `Page ${hookData.pageNumber} of ${pageCount}`,
  //         pageWidth / 2,
  //         doc.internal.pageSize.getHeight() - margin / 2,
  //         { align: "center" }
  //       );
  //     },
  //   });
  //   doc.save(
  //     `Stock_Report_${selectedYear || "AllYears"}_${pageSize.toUpperCase()}.pdf`
  //   );
  // };

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

  const sourceColumnsForModal = Array.from(
    new Set([
      ...ALL_BASE_SELECTABLE_COLUMNS,
      ...STOCK_REG_SUB_COLUMNS.map((sc) => sc.id),
      ...customColumns.map((cc) => cc.id),
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
            .printable-area { position: absolute !important; left: 0; top: 0; width: 100%; margin: 0 !important; padding: 0 !important; overflow: visible !important; max-height: none !important; }
            #stockReportTable { font-size: 8pt !important; border-collapse: collapse !important; width: 100% !important; table-layout: fixed !important; }
            #stockReportTable th, #stockReportTable td { padding: 3px !important; border: 1px solid black !important; word-wrap: break-word !important; overflow-wrap: break-word !important; min-width: 0 !important; }
            #stockReportTable thead tr.main-header-row th, #stockReportTable thead tr.sub-header-row th { background-color: white !important; color: black !important; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
            #stockReportTable thead tr.bg-white th { background-color: white !important; color: black !important; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
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
          {/* <FilterDropdown year={selectedYear} onYearChange={handleYearChange} /> */}
          <FilterDateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
          {/* Display data based on selected dates */}
          {startDate && endDate && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p>
                Filtering data from <strong>{startDate}</strong> to{" "}
                <strong>{endDate}</strong>.
              </p>
              {/* Render your filtered data here */}
            </div>
          )}
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
            onRemoveCustomColumn={removeCustomColumnHandler}
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
              // onExportPDF={exportToPDF}
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
