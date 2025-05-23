import { useState } from "react";
import { uploadImageAndGetURL } from "./../utils/index";
import { Product, RangeMapping } from "./../types/index"; // Ensure Product type here includes gstInputType & gstInputValue

interface ProductCardProps {
  index: number;
  product: Product;
  handleProductChange: (index: number, field: string, value: any) => void; // value can be number, string, RangeMapping[], or 'percentage'|'fixed'
  categories: string[];
  locations: string[];
  Statuses: string[];
  newCategory: string;
  newLocation: { locationName: string; staffIncharge: string };
  newStatus: string;
  addNewCategory: (productIndex: number) => void; // Pass index to update correct product
  addNewLocation: (productIndex: number, mappingIndex: number) => void; // Pass indices
  addNewStatus: (productIndex: number) => void; // Pass index
  setNewCategory: (value: string) => void;
  setNewLocation: (value: {
    locationName: string;
    staffIncharge: string;
  }) => void;
  setNewStatus: (value: string) => void;
  handleClose: (index: number) => void;
}

const ProductCard = ({
  index,
  product,
  handleProductChange,
  categories,
  locations,
  Statuses,
  newCategory,
  newLocation,
  newStatus,
  addNewCategory,
  addNewLocation,
  addNewStatus,
  setNewCategory,
  setNewLocation,
  setNewStatus,
  handleClose,
}: ProductCardProps) => {
  const [rangeMappingError, setRangeMappingError] = useState<string>("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      const form = (e.target as HTMLElement).closest("form");
      if (form) {
        // Query focusable elements only within this product card's scope
        const cardElement = (e.target as HTMLElement).closest(
          `.product-card-scope-${index}`
        );
        if (!cardElement) return;

        const focusableElements = Array.from(
          cardElement.querySelectorAll<HTMLElement>(
            'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
          )
        ).filter((el) => el.tabIndex !== -1 && el.offsetParent !== null);

        const currentIndex = focusableElements.indexOf(e.target as HTMLElement);

        // Explicitly type nextElement to allow HTMLElement, undefined (from array access), or null.
        let nextElement: HTMLElement | null | undefined =
          focusableElements[currentIndex + 1];

        // Skip "Add Category/Location/Status" buttons for general flow if they are not the intended next step
        while (
          nextElement && // This check also narrows nextElement to HTMLElement for property access below
          nextElement.tagName === "BUTTON" &&
          (nextElement.textContent?.includes("Add ") ||
            nextElement.textContent === "X")
        ) {
          // Inside this loop, nextElement is an HTMLElement due to the loop condition.
          const nextIndex: number = focusableElements.indexOf(nextElement) + 1;
          if (nextIndex < focusableElements.length) {
            // focusableElements[nextIndex] can be HTMLElement or undefined.
            // This assignment is valid for the declared type of nextElement.
            nextElement = focusableElements[nextIndex];
          } else {
            // This assignment of null is now valid for the declared type of nextElement.
            nextElement = null; // Reached end
            break;
          }
        }

        if (nextElement) {
          // If nextElement is not null or undefined, it's an HTMLElement
          nextElement.focus();
        }
      }
    }
  };

  const validateRangeMappings = (
    mappings: RangeMapping[],
    total: number
  ): string | null => {
    if (total <= 0) return "Quantity must be greater than 0 to map ranges.";
    const assignedNumbers = new Set<number>();
    for (const mapping of mappings) {
      if (!mapping.range.trim()) {
        return "All mapping rows must have a valid range.";
      }
      const rangeItems = mapping.range.split(",").map((x) => x.trim());
      for (const item of rangeItems) {
        if (item.includes("-")) {
          const bounds = item.split("-");
          if (bounds.length !== 2) return `Invalid range format in '${item}'`;
          const start = parseInt(bounds[0], 10);
          const end = parseInt(bounds[1], 10);
          if (
            isNaN(start) ||
            isNaN(end) ||
            start > end ||
            start < 1 ||
            end > total
          ) {
            return `Range '${item}' is out of bounds (should be between 1 and ${total})`;
          }
          for (let i = start; i <= end; i++) {
            if (assignedNumbers.has(i))
              return `Duplicate assignment for unit ${i}`;
            assignedNumbers.add(i);
          }
        } else {
          const num = parseInt(item, 10);
          if (isNaN(num) || num < 1 || num > total) {
            return `Number '${item}' is out of bounds (should be between 1 and ${total})`;
          }
          if (assignedNumbers.has(num))
            return `Duplicate assignment for unit ${num}`;
          assignedNumbers.add(num);
        }
      }
    }
    if (assignedNumbers.size !== total) {
      return `Assigned units cover ${assignedNumbers.size} of ${total} total units. Please ensure all units from 1 to ${total} are covered.`;
    }
    return null;
  };

  const addMapping = () => {
    const currentMappings: RangeMapping[] = product.locationRangeMappings || [];
    const newMappings = [...currentMappings, { range: "", location: "" }];
    handleProductChange(index, "locationRangeMappings", newMappings);
  };

  const updateMappingRange = (mappingIndex: number, newRange: string) => {
    const currentMappings: RangeMapping[] = product.locationRangeMappings || [];
    const newMappings = currentMappings.map((mapping, i) =>
      i === mappingIndex ? { ...mapping, range: newRange } : mapping
    );
    handleProductChange(index, "locationRangeMappings", newMappings);
    // No immediate blur validation here, user might still be typing. Validation on blur.
  };

  const updateMappingLocation = (mappingIndex: number, newLocation: string) => {
    const currentMappings: RangeMapping[] = product.locationRangeMappings || [];
    const newMappings = currentMappings.map((mapping, i) =>
      i === mappingIndex ? { ...mapping, location: newLocation } : mapping
    );
    handleProductChange(index, "locationRangeMappings", newMappings);
  };

  const removeMapping = (mappingIndex: number) => {
    const currentMappings: RangeMapping[] = product.locationRangeMappings || [];
    const newMappings = currentMappings.filter((_, i) => i !== mappingIndex);
    handleProductChange(index, "locationRangeMappings", newMappings);
    // Re-validate after removing a mapping
    const error = validateRangeMappings(newMappings, product.quantity || 0);
    setRangeMappingError(error || "");
  };

  const handleMappingBlur = () => {
    const mappings: RangeMapping[] = product.locationRangeMappings || [];
    const error = validateRangeMappings(mappings, product.quantity || 0);
    setRangeMappingError(error || "");
  };

  const productImageInputId = `productImageInput-${index}`;
  const transferLetterInputId = `transferLetterInput-${index}`;

  return (
    <div
      key={index}
      className={`bg-white p-4 mb-4 rounded shadow product-card-scope-${index}`}
    >
      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex justify-between items-center">
        Product {index + 1}
        <button
          type="button"
          onClick={() => handleClose(index)}
          className="bg-red-500 text-white cursor-pointer px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
          title="Remove this product"
        >
          X
        </button>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <label
            htmlFor={`volNo-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Vol No
          </label>
          <input
            id={`volNo-${index}`}
            type="text"
            placeholder="Vol No"
            value={product.volNo}
            onChange={(e) =>
              handleProductChange(index, "volNo", e.target.value)
            }
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label
            htmlFor={`pageNo-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Page No
          </label>
          <input
            id={`pageNo-${index}`}
            type="text"
            placeholder="Page No"
            value={product.pageNo}
            onChange={(e) =>
              handleProductChange(index, "pageNo", e.target.value)
            }
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label
            htmlFor={`serialNo-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Product Serial No (Optional)
          </label>
          <input
            id={`serialNo-${index}`}
            type="text"
            placeholder="Product Serial No"
            value={product.serialNo}
            onChange={(e) =>
              handleProductChange(index, "serialNo", e.target.value)
            }
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label
            htmlFor={`productName-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            id={`productName-${index}`}
            type="text"
            placeholder="Product Name"
            value={product.productName}
            onChange={(e) =>
              handleProductChange(index, "productName", e.target.value)
            }
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label
            htmlFor={`productDescription-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id={`productDescription-${index}`}
            placeholder="Description"
            value={product.productDescription}
            onChange={(e) =>
              handleProductChange(index, "productDescription", e.target.value)
            }
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
            rows={2}
          />
        </div>

        {/* Category */}
        <div
          className={` ${
            product.category === "other" ? "md:col-span-1" : "md:col-span-2"
          }`}
        >
          <label
            htmlFor={`category-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id={`category-${index}`}
            aria-label="Category"
            value={product.category}
            onChange={(e) =>
              handleProductChange(index, "category", e.target.value)
            }
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Category</option>
            {categories.map((catg, catgIndex) => (
              <option key={catgIndex} value={catg}>
                {catg}
              </option>
            ))}
            <option value="other">Other (Specify)</option>
          </select>
        </div>
        {product.category === "other" && (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label
                htmlFor={`newCategoryInput-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Category Name
              </label>
              <input
                id={`newCategoryInput-${index}`}
                type="text"
                placeholder="New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={handleKeyDown}
                className="p-2 border rounded w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => addNewCategory(index)}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 h-[42px]"
            >
              Add
            </button>
          </div>
        )}

        {/* Status */}
        <div
          className={` ${
            product.Status === "other" ? "md:col-span-1" : "md:col-span-2"
          }`}
        >
          <label
            htmlFor={`status-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id={`status-${index}`}
            aria-label="Status"
            value={product.Status}
            onChange={(e) =>
              handleProductChange(index, "Status", e.target.value)
            }
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Status</option>
            {Statuses.map((rem, remIndex) => (
              <option key={remIndex} value={rem}>
                {rem}
              </option>
            ))}
            <option value="other">Other (Specify)</option>
          </select>
        </div>
        {product.Status === "other" && (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label
                htmlFor={`newStatusInput-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Status Description
              </label>
              <input
                id={`newStatusInput-${index}`}
                type="text"
                placeholder="New Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                onKeyDown={handleKeyDown}
                className="p-2 border rounded w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => addNewStatus(index)}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 h-[42px]"
            >
              Add
            </button>
          </div>
        )}

        {/* Price, Quantity */}
        <div>
          <label
            htmlFor={`price-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price (per unit, pre-GST)
          </label>
          <input
            id={`price-${index}`}
            type="number"
            placeholder="Price"
            title="Price per unit before tax"
            value={product.price || ""}
            onChange={(e) =>
              handleProductChange(index, "price", parseFloat(e.target.value))
            }
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label
            htmlFor={`quantity-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id={`quantity-${index}`}
            type="number"
            placeholder="Quantity"
            title="Number of units"
            value={product.quantity || ""}
            onChange={(e) =>
              handleProductChange(
                index,
                "quantity",
                parseInt(e.target.value, 10)
              )
            }
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
            min="0"
            step="1"
          />
        </div>

        {/* GST Section */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3 items-end">
          <div>
            <label
              htmlFor={`gstInputType-${index}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              GST Type
            </label>
            <select
              id={`gstInputType-${index}`}
              value={product.gstInputType}
              onChange={(e) =>
                handleProductChange(
                  index,
                  "gstInputType",
                  e.target.value as "percentage" | "fixed"
                )
              }
              onKeyDown={handleKeyDown}
              className="p-2 border rounded w-full h-[42px]"
            >
              <option value="fixed">Fixed Amount</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>
          <div>
            <label
              htmlFor={`gstInputValue-${index}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              GST Value{" "}
              {product.gstInputType === "percentage" ? "(%)" : "(Amount)"}
            </label>
            <input
              id={`gstInputValue-${index}`}
              type="number"
              placeholder={
                product.gstInputType === "percentage"
                  ? "e.g., 18 for 18%"
                  : "GST Amount per unit"
              }
              title={
                product.gstInputType === "percentage"
                  ? "GST Percentage"
                  : "Fixed GST amount per unit"
              }
              value={product.gstInputValue || ""}
              onChange={(e) =>
                handleProductChange(
                  index,
                  "gstInputValue",
                  parseFloat(e.target.value)
                )
              }
              onKeyDown={handleKeyDown}
              className="p-2 border rounded w-full"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculated GST (per unit)
            </label>
            <input
              type="number"
              title="Calculated GST amount per unit"
              value={product.gstAmount.toFixed(2) || "0.00"}
              className="p-2 border rounded w-full bg-gray-100"
              readOnly
              disabled
            />
          </div>
        </div>

        {/* Total Price (Calculated) */}
        <div className="md:col-span-2">
          <label
            htmlFor={`totalPrice-${index}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Total Price for this Product
          </label>
          <input
            id={`totalPrice-${index}`}
            type="number"
            placeholder="Total Price"
            title="Calculated total: (Price + GST per unit) × Quantity"
            value={
              ((product.price + product.gstAmount) * product.quantity).toFixed(
                2
              ) || ""
            }
            className="p-2 border rounded w-full bg-gray-100"
            readOnly
            disabled
          />
        </div>

        {/* Image Uploads */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                uploadImageAndGetURL(file, e).then((url) => {
                  handleProductChange(index, "productImage", url);
                });
              }
            }}
            className="hidden"
            id={productImageInputId}
            onKeyDown={handleKeyDown}
          />
          <label
            htmlFor={productImageInputId}
            className={
              `p-2 border rounded col-span-2 bg-blue-600 text-white cursor-pointer inline-block text-center hover:bg-blue-700 transition-all duration-200 w-full` +
              (product.productImage ? " bg-green-500 hover:bg-green-700" : "")
            }
          >
            {product.productImage
              ? "Product Image Uploaded"
              : "Choose Product Image"}
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transfer Letter Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                uploadImageAndGetURL(file, e).then((url) => {
                  handleProductChange(index, "transferLetter", url);
                });
              }
            }}
            className="hidden"
            id={transferLetterInputId}
            onKeyDown={handleKeyDown}
          />
          <label
            htmlFor={transferLetterInputId}
            className={
              `p-2 border rounded col-span-2 bg-blue-600 text-white cursor-pointer inline-block text-center hover:bg-blue-700 transition-all duration-200 w-full` +
              (product.transferLetter ? " bg-green-500 hover:bg-green-700" : "")
            }
          >
            {product.transferLetter
              ? "Transfer Letter Uploaded"
              : "Choose Transfer Letter"}
          </label>
        </div>

        {/* Location Range Associations */}
        <div className="md:col-span-2 pt-2">
          <label className="block text-gray-700 font-semibold mb-2">
            Location & Serial Range Associations (Total Quantity:{" "}
            {product.quantity || 0})
          </label>
          {(product.locationRangeMappings || []).map(
            (mapping: RangeMapping, mappingIndex: number) => (
              <div
                key={mappingIndex}
                className="border p-3 rounded mb-3 bg-gray-50"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                  <div className="flex-1 w-full sm:w-auto">
                    <label
                      htmlFor={`range-${index}-${mappingIndex}`}
                      className="block text-xs font-medium text-gray-600 mb-0.5"
                    >
                      Range (e.g., 1-5, 7)
                    </label>
                    <input
                      id={`range-${index}-${mappingIndex}`}
                      type="text"
                      placeholder="e.g., 1-5, 7, 10-12"
                      value={mapping.range}
                      onChange={(e) =>
                        updateMappingRange(mappingIndex, e.target.value)
                      }
                      onBlur={handleMappingBlur} // Validate when focus leaves
                      onKeyDown={handleKeyDown}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                  <div className="flex-1 w-full sm:w-auto">
                    <label
                      htmlFor={`location-${index}-${mappingIndex}`}
                      className="block text-xs font-medium text-gray-600 mb-0.5"
                    >
                      Location
                    </label>
                    <select
                      id={`location-${index}-${mappingIndex}`}
                      value={mapping.location}
                      onChange={(e) =>
                        updateMappingLocation(mappingIndex, e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className="p-2 border rounded w-full h-[42px]" // Match height of input
                    >
                      <option value="">Select Location</option>
                      {locations.map((loc, locIndex) => (
                        <option key={locIndex} value={loc}>
                          {loc}
                        </option>
                      ))}
                      <option value="other">Other (Specify)</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMapping(mappingIndex)}
                    className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors self-end sm:self-center h-[42px]"
                    title="Remove this mapping"
                  >
                    X
                  </button>
                </div>
                {mapping.location === "other" && (
                  <div className="flex flex-col sm:flex-row items-end gap-2 mt-2 p-2 border-t">
                    <div className="flex-1">
                      <label
                        htmlFor={`newLocationName-${index}-${mappingIndex}`}
                        className="block text-xs font-medium text-gray-600 mb-0.5"
                      >
                        New Location Name
                      </label>
                      <input
                        id={`newLocationName-${index}-${mappingIndex}`}
                        type="text"
                        placeholder="New Location Name"
                        value={newLocation.locationName}
                        onChange={(e) =>
                          setNewLocation({
                            ...newLocation,
                            locationName: e.target.value,
                          })
                        }
                        onKeyDown={handleKeyDown}
                        className="p-2 border rounded w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor={`newStaffIncharge-${index}-${mappingIndex}`}
                        className="block text-xs font-medium text-gray-600 mb-0.5"
                      >
                        Staff Incharge
                      </label>
                      <input
                        id={`newStaffIncharge-${index}-${mappingIndex}`}
                        type="text"
                        placeholder="Staff Incharge"
                        value={newLocation.staffIncharge}
                        onChange={(e) =>
                          setNewLocation({
                            ...newLocation,
                            staffIncharge: e.target.value,
                          })
                        }
                        onKeyDown={handleKeyDown}
                        className="p-2 border rounded w-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => addNewLocation(index, mappingIndex)} // Pass product index and mapping index
                      className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 h-[42px]"
                    >
                      Add Location
                    </button>
                  </div>
                )}
              </div>
            )
          )}
          <button
            type="button"
            onClick={addMapping}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 mt-1"
          >
            Add Location/Serial Mapping
          </button>
          {rangeMappingError && (
            <p className="text-red-500 text-sm mt-2">{rangeMappingError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
