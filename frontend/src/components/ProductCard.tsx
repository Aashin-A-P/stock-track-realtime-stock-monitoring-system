import { useState } from 'react'
import { uploadImageAndGetURL } from "./../utils/index"
import { Product, RangeMapping } from "./../types/index"

interface ProductCardProps {
  index: number;
  product: Product;
  handleProductChange: (index: number, field: string, value: number|string|RangeMapping[]) => void;
  categories: string[];
  locations: string[];
  Statuses: string[];
  newCategory: string;
  newLocation: {locationName: string, staffIncharge: string};
  newStatus: string;
  addNewCategory: () => void;
  addNewLocation: () => void;
  addNewStatus: () => void;
  setNewCategory: (value: string) => void;
  setNewLocation: (value: {locationName: string, staffIncharge: string}) => void;
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
  // Local state to store any error message for the range mappings
  const [rangeMappingError, setRangeMappingError] = useState<string>("");

  // Helper: validate all mapping rows against the product.quantity
  // Each mapping's range string can contain comma-separated segments (e.g., "1-5" or "7")
  // This function verifies that:
  //   1. Each segment is valid and within 1 to total
  //   2. There are no duplicate assignments
  //   3. All units from 1 to total are covered.
  const validateRangeMappings = (mappings: RangeMapping[], total: number): string | null => {
    const assignedNumbers = new Set<number>();
    for (const mapping of mappings) {
      if (!mapping.range.trim()) {
        return "All mapping rows must have a valid range.";
      }
      const rangeItems = mapping.range.split(",").map(x => x.trim());
      for (const item of rangeItems) {
        if (item.includes("-")) {
          const bounds = item.split("-");
          if (bounds.length !== 2) return "Invalid range format in '" + item + "'";
          const start = parseInt(bounds[0], 10);
          const end = parseInt(bounds[1], 10);
          if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > total) {
            return "Range '" + item + "' is out of bounds (should be between 1 and " + total + ")";
          }
          for (let i = start; i <= end; i++) {
            if (assignedNumbers.has(i)) return "Duplicate assignment for unit " + i;
            assignedNumbers.add(i);
          }
        } else {
          const num = parseInt(item, 10);
          if (isNaN(num) || num < 1 || num > total) {
            return "Number '" + item + "' is out of bounds (should be between 1 and " + total + ")";
          }
          if (assignedNumbers.has(num)) return "Duplicate assignment for unit " + num;
          assignedNumbers.add(num);
        }
      }
    }
    if (assignedNumbers.size !== total) {
      return (
        "Assigned units (" +
        Array.from(assignedNumbers)
          .sort((a, b) => a - b)
          .join(", ") +
        ") do not cover all units from 1 to " +
        total
      );
    }
    return null;
  };

  // Helpers to manage mapping rows in the product object.
  // Assume product.locationRangeMappings is an array of RangeMapping objects.
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
  };

  // Validate mapping rows when focus leaves a range input.
  const handleMappingBlur = () => {
    const mappings: RangeMapping[] = product.locationRangeMappings || [];
    const error = validateRangeMappings(mappings, product.quantity || 0);
    setRangeMappingError(error || "");
  };

  return (
    <div key={index} className="bg-white p-4 mb-4 rounded shadow">
      <h3 className="text-lg font-semibold text-gray-700 mb-2 flex">
        Product {index + 1}
        <span
          className="bg-red-500 text-white cursor-pointer ml-auto px-2 rounded cursor-pointer"
          onClick={() => handleClose(index)}
        >
          X
        </span>
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Existing Product Fields */}
        <input
          type="text"
          placeholder="Vol No"
          value={product.volNo}
          onChange={(e) => handleProductChange(index, "volNo", e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Page No"
          value={product.pageNo}
          onChange={(e) => handleProductChange(index, "pageNo", e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Serial No"
          value={product.serialNo}
          onChange={(e) => handleProductChange(index, "serialNo", e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Product Name"
          value={product.productName}
          onChange={(e) => handleProductChange(index, "productName", e.target.value)}
          className="p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={product.productDescription}
          onChange={(e) =>
            handleProductChange(index, "productDescription", e.target.value)
          }
          className="p-2 border rounded col-span-2"
        />

        {/* Category, Location, and Status Fields */}
        <select
          aria-label="Category"
          value={product.category}
          onChange={(e) =>
            handleProductChange(index, "category", e.target.value)
          }
          className={`p-2 border rounded ${product.category === "other" ? "col-span-1" : "col-span-2"}`}
        >
          <option value="">Select Category</option>
          {categories.map((catg, catgIndex) => (
            <option key={catgIndex} value={catg}>
              {catg}
            </option>
          ))}
          <option value="other">Other</option>
        </select>
        {product.category === "other" && (
          <div className="flex gap-1">
            <input
              type="text"
              placeholder="New Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="p-2 border rounded flex-1"
            />
            <button
              type="button"
              onClick={addNewCategory}
              className="bg-blue-700 text-white px-4 py-2 rounded shadow ml-2"
            >
              Add Category
            </button>
          </div>
        )}

        <select
          aria-label="Status"
          value={product.Status}
          onChange={(e) =>
            handleProductChange(index, "Status", e.target.value)
          }
          className={`p-2 border rounded ${product.Status === "other" ? "col-span-1" : "col-span-2"}`}
        >
          <option value="">Select Status</option>
          {Statuses.map((rem, remIndex) => (
            <option key={remIndex} value={rem}>
              {rem}
            </option>
          ))}
          <option value="other">Other</option>
        </select>
        {product.Status === "other" && (
          <div className="flex gap-1">
            <input
              type="text"
              placeholder="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="p-2 border rounded flex-1"
            />
            <button
              type="button"
              onClick={addNewStatus}
              className="bg-blue-700 text-white px-4 py-2 rounded shadow ml-2"
            >
              Add Status
            </button>
          </div>
        )}

        {/* Price, GST, Quantity, and Total Price Fields */}
        <input
          type="number"
          placeholder="Price"
          title="Price per unit before tax"
          value={product.price || ""}
          onChange={(e) =>
            handleProductChange(index, "price", parseFloat(e.target.value))
          }
          className="p-2 border rounded"
        />

        <input
          type="number"
          placeholder="GST Amount"
          title="GST amount per unit"
          value={product.gstAmount || ""}
          onChange={(e) =>
            handleProductChange(index, "gstAmount", parseFloat(e.target.value))
          }
          className="p-2 border rounded"
        />

        <input
          type="number"
          placeholder="Quantity"
          title="Number of units"
          value={product.quantity || ""}
          onChange={(e) =>
            handleProductChange(index, "quantity", parseInt(e.target.value, 10))
          }
          className="p-2 border rounded"
        />

        <input
          type="number"
          placeholder="Total Price"
          title="Calculated total (Price + GST) × Quantity"
          value={(product.quantity * (product.price + product.gstAmount)) || ""}
          className="p-2 border rounded bg-gray-100"
          readOnly
        />

        {/* Image Uploads */}
        <input
          placeholder="Product Image"
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
          id="productImageInput"
        />
        <label
          htmlFor="productImageInput"
          className={
            `p-2 border rounded col-span-2 bg-blue-600 text-white cursor-pointer inline-block text-center hover:bg-blue-700 transition-all duration-200` +
            (product.productImage ? " bg-green-500 hover:bg-green-700" : "")
          }
        >
          {product.productImage ? "Product Image Uploaded" : "Choose Product Image"}
        </label>

        <input
          placeholder="Transfer Letter"
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
          id="transferLetterInput"
        />
        <label
          htmlFor="transferLetterInput"
          className={
            `p-2 border rounded col-span-2 bg-blue-600 text-white cursor-pointer inline-block text-center hover:bg-blue-700 transition-all duration-200` +
            (product.transferLetter ? " bg-green-500 hover:bg-green-700" : "")
          }
        >
          {product.transferLetter ? "Transfer Letter Uploaded" : "Choose Transfer Letter"}
        </label>

        {/* New Section: Range-Based Location Association */}
        <div className="col-span-2">
          <label className="block text-gray-700 font-semibold mb-1">
            Location Range Associations
          </label>
          {(product.locationRangeMappings || []).map((mapping: RangeMapping, mappingIndex: number) => (
            <div key={mappingIndex} className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Range (e.g., 1-5)"
                  value={mapping.range}
                  onChange={(e) => updateMappingRange(mappingIndex, e.target.value)}
                  onBlur={handleMappingBlur}
                  className="p-2 border rounded flex-1"
                />
                <select
                  value={mapping.location}
                  onChange={(e) => updateMappingLocation(mappingIndex, e.target.value)}
                  className="p-2 border rounded flex-1"
                >
                  <option value="">Select Location</option>
                  {locations.map((loc, locIndex) => (
                    <option key={locIndex} value={loc}>
                      {loc}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeMapping(mappingIndex)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  X
                </button>
              </div>
              {mapping.location === "other" && (
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="New Location"
                    value={newLocation.locationName}
                    onChange={(e) => setNewLocation({ ...newLocation, locationName: e.target.value })}
                    className="p-2 border rounded flex-1"
                  />
                    <input
                        type="text"
                        placeholder="Staff Incharge"
                        value={newLocation.staffIncharge}
                        onChange={(e) => setNewLocation({ ...newLocation, staffIncharge: e.target.value })}
                        className="p-2 border rounded flex-1"
                    />
                  <button
                    type="button"
                    onClick={() => {
                        addNewLocation();
                        updateMappingLocation(mappingIndex, newLocation.locationName);
                    }}
                    className="bg-blue-700 text-white px-4 py-2 rounded shadow ml-2"
                  >
                    Add Location
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMapping}
            className="bg-blue-700 text-white px-4 py-2 rounded shadow mt-2"
          >
            Add Mapping
          </button>
          {rangeMappingError && (
            <p className="text-red-500 text-sm mt-1">{rangeMappingError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
