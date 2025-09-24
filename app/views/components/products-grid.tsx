import { collection, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/utils/formatRupiah";
import { loadProductsRealtime } from "@/hooks/useProduct";

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
}

interface ProductsGridProps {
    cartItems: Product[];
    setCartItems: React.Dispatch<React.SetStateAction<Product[]>>;
    selectedCategory: string;
    searchTerm: string;
}

export default function ProductsGrid({ 
    cartItems, 
    setCartItems, 
    selectedCategory,
    searchTerm,
}: ProductsGridProps) {

    const [products, setProducts] = useState<Product[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    // Add loading state
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
        setIsLoading(false);
        }, 800);
        
        return () => clearTimeout(timer);
    }, []);

    // const loadProducts = async (): Promise<Product[]> => {
    //     try {
    //         const querySnapshot = await getDocs(collection(db, "products"));
    //         return querySnapshot.docs.map(doc => ({
    //             id: doc.id,
    //             ...(doc.data() as Omit<Product, "id">),
    //         }));
    //     } catch (err) {
    //         console.error("Error fetching products:", err);
    //         return []; // Important: must return an array
    //     }
    // };

    useEffect(() => {
        const unsubscribe = loadProductsRealtime(setProducts);

        return () => {
            unsubscribe(); // Clean up on unmount
        };
    }, []);

    const filteredProducts = products.filter((p) => {
        const matchCategory = selectedCategory === "all" || p.CategoryID === selectedCategory;
        const matchSearch = searchTerm.trim() === "" || p.Name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
    });

    /* add to cart */
    const AddToCart = (product: Product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(item => item.id === product.id);

            if (existingItem) {
                // Item exists: increase quantity
                return prevItems.map(item =>
                    item.id === product.id
                    ? { ...item, Quantity: item.Quantity + 1 }
                    : item
                );
            } else {
                // New item: add to cart
                return [...prevItems, { ...product, Quantity: 1 }];
            }
        });
    }

    return (
        <>
        {/* Add skeleton loader */}
        {isLoading ? 
            <div id="productsGrid" className="grid grid-colstn-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
                ))}
            </div>
        : <div id="productsGrid" className="grid grid-colstn-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {/* Products will be inserted here by JavaScript */}
                {filteredProducts.map((product, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md sm:shadow hover:shadow-lg transition-shadow">
                        <div className="p-4">
                            <div className="h-36 sm:h-48 overflow-hidden rounded-lg cursor-pointer">
                                <img
                                    onClick={() => setSelectedImage(product.Image)}
                                    src={product.Image ?? "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/36cbede6-cca8-4f15-8343-4a6656da4493.png"} alt="Product thumbnail" className="h-full w-full object-cover" />
                            </div>
                            <h3 className="mt-4 font-medium">{product.Name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{product.Description}</p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="font-bold">{formatRupiah(product.SellPrice)}</span>
                                <button onClick={() => AddToCart(product)} className="add-to-cart cursor-pointer px-3 py-1 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200" data-id="${product.id}">Add</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        }

        {/* Image Zoom Modal */}
        {selectedImage && (
            <div
                className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
                onClick={() => setSelectedImage(null)}
            >
                <div className="relative">
                    {/* Close Button */}
                    <button
                        className="absolute top-2 right-2 text-gray-500 text-3xl font-bold hover:text-gray-300 px-3"
                        onClick={() => setSelectedImage(null)}
                    >
                        &times;
                    </button>

                    {/* Zoomed Image */}
                    <img
                        src={selectedImage}
                        alt="Zoomed Product"
                        className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-lg"
                    />
                </div>
            </div>
        )}
        </>
    )
}