import { Product, RangeMapping, RawFetchedProductItem } from "../types";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const defaultProduct: Product = {
  pageNo: "",
  volNo: "",
  serialNo: "",
  productVolPageSerial: "",
  productName: "",
  productDescription: "",
  transferLetter: "",
  category: "",
  quantity: 0,
  Status: "",
  remark: "",
  price: 0,
  productImage: "",
  locationRangeMappings: [],
  gstInputType: "fixed",
  gstInputValue: 0,
  gstAmount: 0,
};

interface FetchErrorResponse {
  status: number; // HTTP status code, or 0 for network errors
  message: string; // User-friendly error message
  body?: any; // The raw error body from the server (JSON object or text)
  isAccessDenied?: boolean; // True if status is 403
  isAuthError?: boolean; // True if status is 401
  isNetworkError?: boolean; // True if it's a network/fetch-level error
}

export const fetchMetadata = async (
  baseUrl: string,
  endpoint: string,
  key: string | number, 
  headers?: Record<string, string>
): Promise<any> => {
  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    defaultHeaders["Authorization"] = `${token}`;
  }
  const requestHeaders = { ...defaultHeaders, ...headers };

  let url = `${baseUrl}/${endpoint}`;

  // Determine how to use the 'key'
  if (
    endpoint.endsWith("/id") &&
    (typeof key === "number" ||
      (typeof key === "string" && key.trim() !== "" && !isNaN(Number(key))))
  ) {
    // Endpoint expects an ID in the path, and key is a valid ID
    url = `${baseUrl}/${endpoint.replace("/id", "")}/${key}`; // More robust replacement
  } else if (typeof key === "string" && key.trim() !== "") {
    // Key is a non-empty string, use as a query parameter
    url = `${baseUrl}/${endpoint}?query=${encodeURIComponent(key)}`;
  } else if (typeof key === "number") {
    // Key is a number, use as a query parameter (if not an /id endpoint handled above)
    url = `${baseUrl}/${endpoint}?query=${key}`;
  } else if (
    (!key || (typeof key === "string" && key.trim() === "")) &&
    endpoint.endsWith("/id")
  ) {
    // Invalid: /id endpoint requires a key
    const errorMessage = `Invalid or empty key for ID lookup on endpoint ${endpoint}`;
    console.error(errorMessage);
    return Promise.reject({
      status: 400, // Bad Request
      message: errorMessage,
      isNetworkError: false,
    } as FetchErrorResponse);
  }

  try {
    const res = await fetch(url, { headers: requestHeaders });

    if (!res.ok) {
      let errorBody: any = null;
      let errorMessageFromServer = "Error response from server.";

      // Try to parse error body
      try {
        // Prefer JSON, but fallback to text
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          errorBody = await res.json();
        } else {
          errorBody = await res.text();
        }

        // Extract a more specific message if available
        if (typeof errorBody === "object" && errorBody !== null) {
          errorMessageFromServer =
            errorBody.message || errorBody.error || JSON.stringify(errorBody);
        } else if (typeof errorBody === "string" && errorBody.trim() !== "") {
          errorMessageFromServer = errorBody;
        }
      } catch (e) {
        // Failed to parse error body, use a generic message
        errorMessageFromServer = "Could not parse error response body.";
        console.warn("Failed to parse error response body:", e);
      }

      const finalErrorMessage = `Request failed: ${res.status} ${res.statusText}. ${errorMessageFromServer}`;
      const errorResponse: FetchErrorResponse = {
        status: res.status,
        message: finalErrorMessage,
        body: errorBody,
      };

      if (res.status === 401) {
        errorResponse.message = `Authentication failed. Please log in again. (Server: ${errorMessageFromServer})`;
        errorResponse.isAuthError = true;
      } else if (res.status === 403) {
        errorResponse.message = `Access Denied: You do not have permission for this action. (Server: ${errorMessageFromServer})`;
        errorResponse.isAccessDenied = true;
      } else if (res.status === 404) {
        errorResponse.message = `Resource not found at ${url}. (Server: ${errorMessageFromServer})`;
      }

      console.error(`HTTP error ${res.status} for ${url}:`, errorResponse);
      return Promise.reject(errorResponse);
    }

    if (res.status === 204) {
      return null;
    }

    return res.json();
  } catch (error: any) {
    // This catches network errors (e.g., DNS, CORS, server unreachable) or if fetch itself throws
    console.error(
      `Network or client-side error fetching ${endpoint} with key ${key}:`,
      error
    );
    const networkErrorResponse: FetchErrorResponse = {
      status: 0, // Indicate network or client-side error
      message: `Network error or client-side issue: ${
        error.message || "Failed to fetch"
      }`,
      body: error.toString(),
      isNetworkError: true,
    };
    return Promise.reject(networkErrorResponse);
  }
};


export const uploadImageAndGetURL = async (
  file: File,
  event?: React.ChangeEvent<HTMLInputElement>
): Promise<string> => {
  if (event) event.preventDefault();
  const formData = new FormData();
  formData.append("image", file);
  try {
    const res = await fetch(`${baseURL}/upload`, {
      method: "POST",
      headers: { Authorization: localStorage.getItem("token") || "" },
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: "Image upload failed, server error." }));
      throw new Error(
        errorData.error || `Error uploading image: ${res.statusText}`
      );
    }
    const details = await res.json();
    if (!details.imageUrl) {
      throw new Error("Image URL not found in upload response.");
    }
    return details.imageUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const convertProductData = async (
  rawIndividualProducts: RawFetchedProductItem[],
  // baseUrl: string,
  // headers: Record<string, string>
): Promise<Product[]> => {
  if (!rawIndividualProducts || rawIndividualProducts.length === 0) return [];

  const groupedProducts = new Map<
    string,
    { baseProduct: Partial<Product>; items: RawFetchedProductItem[] }
  >();
  // console.log("RAw products",rawIndividualProducts);

  for (const item of rawIndividualProducts) {
    // Ensure critical fields for grouping have default values if undefined/null from API
    // console.log("categoryId for product Inside loop:", item.categoryId);

    const productName = item.productName?.trim() || "Unnamed Product";
    const productPrice = parseFloat(item.actualAmount as any) || 0;
    const productDescription = item.productDescription?.trim() || "";
    const categoryId = item.categoryId || 0; // Default to 0 or handle as error if critical
    const categoryName = item.categoryName || "Unknown Category";
const statusName = item.statusDescription || "Unknown Status";
// const locationName = item.locationName || "Unknown Location";
    const statusId = item.statusId || 0;
   let volNo = item.volNo?.trim();
let pageNo = item.pageNo?.trim();
let serialNo = item.serialNo?.trim();

// If missing, try to extract from productVolPageSerial
if ((!volNo || !pageNo || !serialNo) && item.productVolPageSerial) {
  const parts = item.productVolPageSerial.split("-");
  if (parts.length === 3) {
    volNo = volNo || parts[0].trim();
    pageNo = pageNo || parts[1].trim();
    serialNo = serialNo || parts[2].trim();
  }

}
console.log("VOL-PAGE" ,volNo,pageNo,serialNo);

    const groupKey = `${productName}-${productPrice}-${productDescription}-${categoryId}-${statusId}-${volNo}-${pageNo}`;

    if (!groupedProducts.has(groupKey)) {
      // let categoryName = "Unknown Category";
      // console.log("categoryId for product:", categoryId);

      // if (categoryId !== 0) {
      //   try {
      //     const catMeta = await fetchMetadata(
      //       baseUrl,
      //       `stock/category/id`,
      //       categoryId,
      //       headers
      //     );
      //         console.log("Fetched catMeta for ID", categoryId, ":", catMeta);

      //     if (catMeta && catMeta.category)
      //       categoryName = catMeta.category.categoryName;
      //   } catch (e) {
      //     console.warn(
      //       `Failed to fetch category name for ID ${categoryId}:`,
      //       e
      //     );
      //   }
      // }


      // let statusName = "Unknown Status";
      // if (statusId !== 0) {
      //   try {
      //     const statMeta = await fetchMetadata(
      //       baseUrl,
      //       `stock/status/id`,
      //       statusId,
      //       headers
      //     );
      //     if (statMeta && statMeta.status)
      //       statusName = statMeta.status.statusDescription;
      //   } catch (e) {
      //     console.warn(`Failed to fetch status name for ID ${statusId}:`, e);
      //   }
      // }

      groupedProducts.set(groupKey, {
        baseProduct: {
          productName: productName,
          productDescription: productDescription,
          transferLetter: item.transferLetter,
          category: categoryName,
          Status: statusName,
          price: productPrice,
          productImage: item.productImage,
          remark: item.remarks,
          gstInputType: "fixed",
          gstInputValue: parseFloat(item.gstAmount as any) || 0,
          gstAmount: parseFloat(item.gstAmount as any) || 0,
          volNo: volNo || "N/A",
          pageNo: pageNo || "N/A",
          },
        items: [],
      });
    }
    groupedProducts.get(groupKey)!.items.push(item);
    // console.log(groupedProducts)

  }

  const uiProducts: Product[] = [];
  for (const [_, group] of groupedProducts) {
  const locationRangeMappings: RangeMapping[] = [];
  let totalQuantityInGroup = 0;

  const itemsByLocation = new Map<string, RawFetchedProductItem[]>(); // Use locationName instead of ID
  for (const item of group.items) {
    const locationName = item.locationName?.trim() || "Unknown Location";
    if (!itemsByLocation.has(locationName)) {
      itemsByLocation.set(locationName, []);
    }
    itemsByLocation.get(locationName)!.push(item);
    totalQuantityInGroup++;
  }

  for (const [locationName, itemsInLocation] of itemsByLocation) {
    const serialNumbers: number[] = [];
    itemsInLocation.forEach((item) => {
      const serialToParse = item.serialNo || item.productVolPageSerial;
      const serialMatch = serialToParse?.match(/(?:[^-]*-)*(\d+)$/); // Get last number group
      if (serialMatch && serialMatch[1]) {
        serialNumbers.push(parseInt(serialMatch[1], 10));
      } else {
        console.warn(
          `Could not parse serial: ${serialToParse} for ${group.baseProduct.productName}`
        );
      }
    });

    if (serialNumbers.length > 0) {
      const rangeString = createRangeString(serialNumbers);
      locationRangeMappings.push({
        location: locationName,
        range: rangeString,
      });
    }
  }

  // ... Rest of the code



    const productVolPageSerialTemplate = `${group.baseProduct.volNo || "N/A"}-${
      group.baseProduct.pageNo || "N/A"
    }-[1-${totalQuantityInGroup || "N/A"}]`;

    uiProducts.push({
      ...defaultProduct, // Ensure all Product fields are initialized
      ...group.baseProduct,
      quantity: totalQuantityInGroup,
      productVolPageSerial: productVolPageSerialTemplate,
      locationRangeMappings,
      // Use the serialNo from the first item in the group as a representative serial for the batch
      // or an empty string if not available. This is for the top-level `serialNo` field of the `Product`.
      serialNo:
        group.items[0]?.serialNo ||
        group.items[0]?.productVolPageSerial?.match(/(?:[^-]*-)*(\d+)$/)?.[1] ||
        "",
    } as Product);
  }
  console.log("Final products for UI:", uiProducts);

  return uiProducts;
};

function createRangeString(numbers: number[]): string {
  if (!numbers || numbers.length === 0) return "";
  // Create a unique, sorted list of numbers
  const uniqueSortedNumbers = Array.from(new Set(numbers)).sort(
    (a, b) => a - b
  );

  if (uniqueSortedNumbers.length === 0) return "";

  const ranges: string[] = [];
  let startOfRange = uniqueSortedNumbers[0];

  for (let i = 0; i < uniqueSortedNumbers.length; i++) {
    const current = uniqueSortedNumbers[i];
    const next = uniqueSortedNumbers[i + 1];

    if (next === undefined || next !== current + 1) {
      if (startOfRange === current) {
        ranges.push(String(startOfRange));
      } else {
        ranges.push(`${startOfRange}-${current}`);
      }
      if (next !== undefined) {
        startOfRange = next;
      }
    }
  }
  return ranges.join(",");
}
