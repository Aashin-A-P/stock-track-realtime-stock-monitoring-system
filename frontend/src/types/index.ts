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
    category: string;
    quantity: number;
    gstAmount: number;
    Status: string;
    transferLetter?: string;
    remark: string;
    price: number;
    productImage?: string;
    locationRangeMappings?: RangeMapping[];
  }