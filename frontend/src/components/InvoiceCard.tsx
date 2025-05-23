import { uploadImageAndGetURL } from "../utils";

type InvoiceCardProps = {
  handleInvoiceChange: (key: string, value: any) => void;
  invoiceDetails: {
    budgetName: string;
    invoiceNo: string;
    PODate: string;
    fromAddress: string;
    toAddress: string;
    totalAmount: number;
    invoiceImage: string;
    invoiceDate: string;
  };
  budgets: string[];
};

const InvoiceCard = ({
  handleInvoiceChange,
  invoiceDetails,
  budgets,
}: InvoiceCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      const form = (e.target as HTMLElement).closest("form");
      if (form) {
        const focusableElements = Array.from(
          form.querySelectorAll<HTMLElement>(
            'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
          )
        ).filter(
          (el) =>
            el.tabIndex !== -1 &&
            el.offsetParent !== null &&
            el.closest(".invoice-card-scope")
        ); // Scope to this card

        const currentIndex = focusableElements.indexOf(e.target as HTMLElement);
        const nextElement = focusableElements[currentIndex + 1];
        if (nextElement) {
          nextElement.focus();
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 mb-6 rounded shadow invoice-card-scope">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Invoice Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        <div className="md:col-span-2">
          <label
            htmlFor="budgetName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Budget
          </label>
          <select
            id="budgetName"
            aria-label="Budget"
            value={invoiceDetails.budgetName}
            onChange={(e) => handleInvoiceChange("budgetName", e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Budget</option>
            {budgets.map((budget, budgetIndex) => (
              <option key={budgetIndex} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="invoiceNo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Invoice Number <span className="text-red-500">*</span>
          </label>
          <input
            id="invoiceNo"
            type="text"
            placeholder="Invoice Number"
            title="Unique identifier for the invoice (required)"
            value={invoiceDetails.invoiceNo}
            onChange={(e) => handleInvoiceChange("invoiceNo", e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
            required
          />
        </div>

        <div>
          <label
            htmlFor="invoiceDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Invoice Date
          </label>
          <input
            id="invoiceDate"
            type="date"
            placeholder="Invoice Date"
            title="Date of the invoice (must be after purchase order date)"
            value={invoiceDetails.invoiceDate}
            min={invoiceDetails.PODate}
            onChange={(e) => handleInvoiceChange("invoiceDate", e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label
            htmlFor="PODate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Purchase Order Date
          </label>
          <input
            id="PODate"
            type="date"
            placeholder="Purchase Order Date"
            title="Date of the purchase order (must be before invoice date)"
            value={invoiceDetails.PODate}
            max={invoiceDetails.invoiceDate}
            onChange={(e) => handleInvoiceChange("PODate", e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
          />
        </div>

        <div>
          <label
            htmlFor="totalAmount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Total Amount
          </label>
          <input
            id="totalAmount"
            type="number"
            placeholder="Total Amount"
            value={invoiceDetails.totalAmount || ""}
            onChange={(e) =>
              handleInvoiceChange("totalAmount", parseFloat(e.target.value))
            }
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="fromAddress"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            From Address
          </label>
          <textarea
            id="fromAddress"
            placeholder="From Address"
            value={invoiceDetails.fromAddress}
            onChange={(e) => handleInvoiceChange("fromAddress", e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
            rows={2}
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="toAddress"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            To Address
          </label>
          <textarea
            id="toAddress"
            placeholder="To Address"
            value={invoiceDetails.toAddress}
            onChange={(e) => handleInvoiceChange("toAddress", e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-2 border rounded w-full"
            rows={2}
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="invoiceImageInput"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Invoice Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                uploadImageAndGetURL(file, e).then((url) => {
                  handleInvoiceChange("invoiceImage", url);
                });
              }
            }}
            className="hidden"
            id="invoiceImageInput"
            onKeyDown={handleKeyDown}
          />
          <label
            htmlFor="invoiceImageInput"
            className={
              `p-2 border rounded bg-blue-600 text-white cursor-pointer inline-block text-center hover:bg-blue-700 transition-all duration-200 w-full` +
              (invoiceDetails.invoiceImage
                ? " bg-green-500 hover:bg-green-700"
                : "")
            }
          >
            {invoiceDetails.invoiceImage
              ? "Invoice Image Uploaded"
              : "Choose Invoice Image"}{" "}
          </label>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
