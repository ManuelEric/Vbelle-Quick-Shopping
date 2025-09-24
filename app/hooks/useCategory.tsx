import { collection, limit, onSnapshot, orderBy, query, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import { db } from "firebaseConfig";

interface Category {
    id: string;
    Name: string;
    Description: string;
}

export const loadCategoriesRealtime = (
    allowedIDs: string[], // ✅ New parameter
    onUpdate: (category: Category[]) => void,
    onError?: (error: unknown) => void
): (() => void) => {
    const categoriesQuery = query(
        collection(db, "categories"),
        orderBy("Name", "asc") // ✅ Order newest first
    );

    const unsubscribe = onSnapshot(
        categoriesQuery, (querySnapshot) => {
            const categories: Category[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
                id: doc.id,
                ...(doc.data() as Omit<Category, "id">),
            }))
            .filter(cat => allowedIDs.includes(cat.id)); // ✅ Filter here
            
            onUpdate(categories); // Pass updated category back
        },
        (error) => {
            console.error("Error in real-time category listener:", error);
            if (onError) onError(error);
        }
    );

    return unsubscribe; // Allow caller to unsubscribe later
};
