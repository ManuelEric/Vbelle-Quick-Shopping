import { collection, limit, onSnapshot, orderBy, query, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import { db } from "firebaseConfig";

interface Product {
    id: string;
    Name: string;
    ActualPrice: number;
    OfferPrice: number;
    SellPrice: number;
    CategoryID: string;
    Description: string;
    Image: string;
    Quantity: number;
    CreatedAt: Timestamp;
    UpdatedAt: Timestamp;
}

export const loadProductsRealtime = (
  onUpdate: (products: Product[]) => void,
  onError?: (error: unknown) => void
): (() => void) => {
    const productsQuery = query(
        collection(db, "products"),
        // orderBy("CreatedAt", "desc") // ✅ Order newest first
    );

    const unsubscribe = onSnapshot(
        productsQuery, (querySnapshot) => {
            const products: Product[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
                id: doc.id,
                ...(doc.data() as Omit<Product, "id">),
            }));
            onUpdate(products); // Pass updated products back
        },
        (error) => {
            console.error("Error in real-time product listener:", error);
            if (onError) onError(error);
        }
    );

    return unsubscribe; // Allow caller to unsubscribe later
};

// export const loadProductsPaginated = async (
//     pageSize: number,
//     lastDoc?: QueryDocumentSnapshot<DocumentData>
// ): Promise<{
//     products: Product[];
//     lastVisible: QueryDocumentSnapshot<DocumentData> | null;
// }> => {
//     const productQuery = query(
//     collection(db, "products"),
//     orderBy("CreatedAt", "desc"),
//     ...(lastDoc ? [startAfter(lastDoc)] : []),
//     limit(pageSize)
//     );

//     const snapshot = await getDocs(productQuery);
//     const products: Product[] = snapshot.docs.map(doc => ({
//     id: doc.id,
//     ...(doc.data() as Omit<Product, "id">),
//     }));

//     const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

//     return { products, lastVisible };
// };