import { Product } from "../types";

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Fetch data for locations, Statuses, and categories in parallel
export const fetchMetadata = async (baseUrl: string, endpoint: string, key: string) =>
    await fetch(`${baseUrl}/${endpoint}?query=${key}`, {
      headers: { Authorization: localStorage.getItem("token") as string },
    }).then((res) =>
      res.ok
        ? res.json()
        : Promise.reject(`Error fetching ${endpoint}: ${key}`)
    );

  // Upload image and return URL
  export const uploadImageAndGetURL = async (
    file: File,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`${baseURL}/upload`, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token") || "",
        },
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error uploading image");
      }
      const details = await res.json();
      return details.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };
  
  // The API product interface (as returned from your API)
  interface APIProduct {
    productId: number;
    productVolPageSerial: string;
    productName: string;
    productDescription: string;
    productImage: string;
    locationName: string;
    statusDescription: string;
    categoryName: string;
    fromAddress: string;
    toAddress: string;
    TotalAmount: string;
    gstAmount: string;
    PODate: string;
    invoiceDate: string;
    invoiceNo: string;
    remarks: string;
  }
  
  interface APIResponse {
    products: APIProduct[];
    totalRecords: number;
  }
  
  /**
   * Converts an APIResponse into an array of Product objects.
   * It also computes a location range mapping by extracting the index
   * from the productVolPageSerial and grouping by locationName.
   *
   * For example, if products with indices 1-4 have location F2 and 5-10 have location newLab,
   * then each product will have a locationRangeMappings entry like:
   *  - F2: { range: "1-4", location: "F2" }
   *  - newLab: { range: "5-10", location: "newLab" }
   */
  export function convertProductData(apiData: APIResponse): Product[] {
    // First, build a mapping from locationName to its minimum and maximum index.
    const locationMapping: Record<string, { min: number; max: number }> = {};
  
    apiData.products.forEach((prod) => {
      // Extract the index number from productVolPageSerial.
      // Expected format: "1-3-4-[1/10]" so we match the number before the slash.
      const indexMatch = prod.productVolPageSerial.match(/\[(\d+)\/\d+\]/);
      if (indexMatch) {
        const indexNumber = parseInt(indexMatch[1], 10);
        const loc = prod.locationName;
        if (locationMapping[loc]) {
          locationMapping[loc].min = Math.min(locationMapping[loc].min, indexNumber);
          locationMapping[loc].max = Math.max(locationMapping[loc].max, indexNumber);
        } else {
          locationMapping[loc] = { min: indexNumber, max: indexNumber };
        }
      }
    });
  
    // Now convert each APIProduct into a Product, attaching the computed location range mapping.
    return apiData.products.map((prod) => {
      // Split the productVolPageSerial into its parts.
      // Example: "1-3-4-[1/10]" -> ["1", "3", "4", "[1/10]"]
      const parts = prod.productVolPageSerial.split("-");
      const pageNo = parts[0] || "";
      const volNo = parts[1] || "";
      const serialNo = parts[2] || "";
  
      // Look up the overall range for this product's location.
      const mappingForLocation = locationMapping[prod.locationName];
      const locationRangeMappings = mappingForLocation
        ? [
            {
              range: `${mappingForLocation.min}-${mappingForLocation.max}`,
              location: prod.locationName,
            },
          ]
        : undefined;
  
      return {
        pageNo,
        volNo,
        serialNo,
        productVolPageSerial: prod.productVolPageSerial,
        productName: prod.productName,
        productDescription: prod.productDescription,
        category: prod.categoryName,
        quantity: 1, // Default quantity – update if your data provides a different value.
        gstAmount: Number(prod.gstAmount),
        Status: prod.statusDescription,
        remark: prod.remarks,
        price: Number(prod.TotalAmount),
        productImage:
          prod.productImage && prod.productImage.trim() !== ""
            ? prod.productImage
            : undefined,
        locationRangeMappings,
      };
    });
  }
  