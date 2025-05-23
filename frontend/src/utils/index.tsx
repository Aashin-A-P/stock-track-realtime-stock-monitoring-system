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

export const fetchMetadata = async (
  baseUrl: string,
  endpoint: string,
  key: string | number,
  headers?: Record<string, string>
): Promise<any> => {
  const defaultHeaders = {
    Authorization: localStorage.getItem("token") || "",
    "Content-Type": "application/json",
  };
  const requestHeaders = { ...defaultHeaders, ...headers };

  let url = `${baseUrl}/${endpoint}`;
  if (
    endpoint.endsWith("/id") &&
    (typeof key === "number" ||
      (typeof key === "string" && key.trim() !== "" && !isNaN(Number(key))))
  ) {
    url = `${baseUrl}/${endpoint}/${key}`;
  } else if (typeof key === "string" && key.trim() !== "") {
    url = `${baseUrl}/${endpoint}?query=${encodeURIComponent(key)}`;
  } else if (typeof key === "number" && !endpoint.endsWith("/id")) {
    url = `${baseUrl}/${endpoint}?query=${key}`;
  } else if (
    typeof key === "string" &&
    key.trim() === "" &&
    !endpoint.endsWith("/id")
  ) {
    url = `${baseUrl}/${endpoint}`;
  } else if (
    (!key || (typeof key === "string" && key.trim() === "")) &&
    endpoint.endsWith("/id")
  ) {
    console.error(`Invalid or empty key for ID lookup on endpoint ${endpoint}`);
    return Promise.reject(`Invalid key for ID lookup on endpoint ${endpoint}`);
  }

  try {
    const res = await fetch(url, { headers: requestHeaders });
    if (!res.ok) {
      const errorText = await res
        .text()
        .catch(() => "Could not read error response.");
      console.error(
        `Error fetching ${endpoint} with key ${key}: ${res.status} ${res.statusText}`,
        errorText
      );
      return Promise.reject(
        `Error fetching ${endpoint} for "${key}": ${res.status} ${
          res.statusText
        }. Details: ${errorText.substring(0, 150)}`
      );
    }
    if (res.status === 204) {
      return Promise.resolve(null);
    }
    return res.json();
  } catch (error) {
    console.error(
      `Network or other error fetching ${endpoint} with key ${key}:`,
      error
    );
    return Promise.reject(
      `Network error or invalid response for ${endpoint} with key "${key}"`
    );
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
