import type { FieldValue, Timestamp } from "firebase/firestore";

// src/types/product.ts
export type Product = {
    id: string;
    Name: string;
    ActualPrice: number;
    OfferPrice: number;
    SellPrice: number;
    CategoryID: string;
    Description: string;
    Image: string;
    Quantity: number;
    Purchase?: string;
    Halal?: string;
    CreatedAt?: Timestamp | FieldValue;
    UpdatedAt?: Timestamp | FieldValue;
};  