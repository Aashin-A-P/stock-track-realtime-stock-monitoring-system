export interface RangeMapping {
  range: string;
  location: string;
}

export interface Product {
  pageNo: string;
  volNo: string;
  serialNo: string;
  productVolPageSerial: string;
  productName: string;
  productDescription: string;
  transferLetter: string;
  category: string;
  quantity: number;
  Status: string; 
  remark: string;
  price: number;
  productImage: string;
  locationRangeMappings: RangeMapping[];

  gstInputType: "percentage" | "fixed";
  gstInputValue: number;
  gstAmount: number; 
}


export interface RawFetchedProductItem {
  locationName: string;
  statusDescription: string;
  productId: number; 
  productVolPageSerial: string; 
  productName: string;
  productDescription: string;
  productImage?: string;
  locationId: number;
  statusId: number;
  categoryId: number;
  gstAmount: string | number; 
  actualAmount: string | number;
  remarks?: string;
  transferLetter?: string;
  volNo?: string;
  pageNo?: string;
  serialNo?: string;
  categoryName:string;
}