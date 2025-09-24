import type { FieldValue, Timestamp } from "firebase/firestore";

// src/types/request.ts
export type Request = {
    id: string;
    FullName: string;
    PhoneNumber: string;
    ProductName: string;
    CreatedAt?: Timestamp | FieldValue;
    UpdatedAt?: Timestamp | FieldValue;
};  