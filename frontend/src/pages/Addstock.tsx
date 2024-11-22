import React, { useState } from "react";
import './addStock.css';


interface Product {
  productId: string;
  itemName: string;
  description: string;
  quantity: number;
  location: string;
  remarks?: string;
  price: number;
  productImage?: File | null;
}

interface Invoice {
  invoiceId: string;
  invoiceImage?: File | null;
  products: Product[];
}

const AddStock: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const handleInvoiceChange = (index: number, field: string, value: any) => {
    const updatedInvoices = [...invoices];
    updatedInvoices[index] = {
      ...updatedInvoices[index],
      [field]: field === "invoiceImage" ? value.target.files[0] : value,
    };
    setInvoices(updatedInvoices);
  };

  const handleProductChange = (invoiceIndex: number, productIndex: number, field: string, value: any) => {
    const updatedInvoices = [...invoices];
    const updatedProducts = updatedInvoices[invoiceIndex].products;
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      [field]: field === "productImage" ? value.target.files[0] : value,
    };
    updatedInvoices[invoiceIndex].products = updatedProducts;
    setInvoices(updatedInvoices);
  };

  const addInvoice = () => {
    setInvoices([...invoices, { invoiceId: "", invoiceImage: null, products: [] }]);
  };

  const addProduct = (invoiceIndex: number) => {
    const updatedInvoices = [...invoices];
    updatedInvoices[invoiceIndex].products.push({
      productId: "",
      itemName: "",
      description: "",
      quantity: 0,
      location: "",
      remarks: "",
      price: 0,
      productImage: null,
    });
    setInvoices(updatedInvoices);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Invoices:", invoices);
    // Implement API integration or save data here
  };

  return (
    <div className="add-stock">
      <h2>Add Stock</h2>
      <button type="button" onClick={addInvoice}>
        Add Invoice
      </button>
      <form onSubmit={handleSubmit}>
        {invoices.map((invoice, invoiceIndex) => (
          <div key={invoiceIndex} className="invoice">
            <h3>Invoice {invoiceIndex + 1}</h3>
            <div>
              <label htmlFor={`invoiceId-${invoiceIndex}`}>Invoice ID:</label>
              <input
                type="text"
                id={`invoiceId-${invoiceIndex}`}
                value={invoice.invoiceId}
                onChange={(e) => handleInvoiceChange(invoiceIndex, "invoiceId", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`invoiceImage-${invoiceIndex}`}>Invoice Image:</label>
              <input
                type="file"
                id={`invoiceImage-${invoiceIndex}`}
                accept="image/*"
                onChange={(e) => handleInvoiceChange(invoiceIndex, "invoiceImage", e)}
              />
            </div>
            <button type="button" onClick={() => addProduct(invoiceIndex)}>
              Add Product
            </button>
            {invoice.products.map((product, productIndex) => (
              <div key={productIndex} className="product">
                <h4>Product {productIndex + 1}</h4>
                <div>
                  <label htmlFor={`productId-${invoiceIndex}-${productIndex}`}>Product ID:</label>
                  <input
                    type="text"
                    id={`productId-${invoiceIndex}-${productIndex}`}
                    value={product.productId}
                    onChange={(e) => handleProductChange(invoiceIndex, productIndex, "productId", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`itemName-${invoiceIndex}-${productIndex}`}>Item Name:</label>
                  <input
                    type="text"
                    id={`itemName-${invoiceIndex}-${productIndex}`}
                    value={product.itemName}
                    onChange={(e) => handleProductChange(invoiceIndex, productIndex, "itemName", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`description-${invoiceIndex}-${productIndex}`}>Description:</label>
                  <textarea
                    id={`description-${invoiceIndex}-${productIndex}`}
                    value={product.description}
                    onChange={(e) => handleProductChange(invoiceIndex, productIndex, "description", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`quantity-${invoiceIndex}-${productIndex}`}>Quantity:</label>
                  <input
                    type="number"
                    id={`quantity-${invoiceIndex}-${productIndex}`}
                    value={product.quantity}
                    onChange={(e) => handleProductChange(invoiceIndex, productIndex, "quantity", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`location-${invoiceIndex}-${productIndex}`}>Location:</label>
                  <input
                    type="text"
                    id={`location-${invoiceIndex}-${productIndex}`}
                    value={product.location}
                    onChange={(e) => handleProductChange(invoiceIndex, productIndex, "location", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`remarks-${invoiceIndex}-${productIndex}`}>Remarks:</label>
                  <input
                    type="text"
                    id={`remarks-${invoiceIndex}-${productIndex}`}
                    value={product.remarks}
                    onChange={(e) => handleProductChange(invoiceIndex, productIndex, "remarks", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`price-${invoiceIndex}-${productIndex}`}>Price:</label>
                  <input
                    type="number"
                    id={`price-${invoiceIndex}-${productIndex}`}
                    value={product.price}
                    onChange={(e) => handleProductChange(invoiceIndex, productIndex, "price", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`productImage-${invoiceIndex}-${productIndex}`}>Product Image:</label>
                  <input
                    type="file"
                    id={`productImage-${invoiceIndex}-${productIndex}`}
                    accept="image/*"
                    onChange={(e) => handleProductChange(invoiceIndex, productIndex, "productImage", e)}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddStock;
