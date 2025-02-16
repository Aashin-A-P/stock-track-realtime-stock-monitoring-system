import React from 'react'
import { uploadImageAndGetURL } from '../utils';

type InvoiceCardProps = {
    handleInvoiceChange : (key: string, value: any) => void;
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
}

const InvoiceCard = ({ handleInvoiceChange, invoiceDetails, budgets}: InvoiceCardProps) => {
  return (
    <div className="bg-white p-4 mb-6 rounded shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Invoice Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <select
                aria-label="Budget"
                value={invoiceDetails.budgetName}
                onChange={(e) => handleInvoiceChange("budgetName", e.target.value)}
                className="p-2 border rounded col-span-2"
              >
                <option value="">Select Budget</option>
                {budgets.map((budget, budgetIndex) => (
                  <option key={budgetIndex} value={budget}>
                    {budget}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Invoice Number"
                title="Unique identifier for the invoice (required)"
                value={invoiceDetails.invoiceNo}
                onChange={(e) => handleInvoiceChange("invoiceNo", e.target.value)}
                className="p-2 border rounded"
                required
              />
              <input
                type="date"
                placeholder="Purchase Order Date"
                title="Date of the purchase order (must be before invoice date)"
                value={invoiceDetails.PODate}
                max={invoiceDetails.invoiceDate}
                onChange={(e) => handleInvoiceChange("PODate", e.target.value)}
                className="p-2 border rounded"
              />
              <textarea
                placeholder="From Address"
                value={invoiceDetails.fromAddress}
                onChange={(e) =>
                  handleInvoiceChange("fromAddress", e.target.value)
                }
                className="p-2 border rounded col-span-2"
              />
              <textarea
                placeholder="To Address"
                value={invoiceDetails.toAddress}
                onChange={(e) =>
                  handleInvoiceChange("toAddress", e.target.value)
                }
                className="p-2 border rounded col-span-2"
              />
              <input
                type="number"
                placeholder="Total Amount"
                value={invoiceDetails.totalAmount || ""}
                onChange={(e) =>
                  handleInvoiceChange(
                    "totalAmount",
                    parseFloat(e.target.value)
                  )
                }
                className="p-2 border rounded"
              />
              <input
                placeholder="Invoice Image"
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
                className="hidden" // hide file input (default style)
                id="invoiceImageInput"
              />
              <input
                type="date"
                placeholder="Invoice Date"
                title="Date of the invoice (must be after purchase order date)"
                value={invoiceDetails.invoiceDate}
                min={invoiceDetails.PODate}
                onChange={(e) => handleInvoiceChange("invoiceDate", e.target.value)}
                className="p-2 border rounded"
              />
              <label
                htmlFor="invoiceImageInput"
                className={
                  `p-2 border rounded bg-blue-600 col-span-2 text-white cursor-pointer inline-block text-center hover:bg-blue-700 transition-all duration-200` +
                  (invoiceDetails.invoiceImage ? " bg-green-500 hover:bg-green-700" : "")
                }
              >
                {invoiceDetails.invoiceImage
                  ? "Invoice Image Uploaded"
                  : "Choose Invoice Image"}{" "}
              </label>

            </div>
          </div>
  )
}

export default InvoiceCard