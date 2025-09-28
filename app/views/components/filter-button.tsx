import { collection, getDocs } from "firebase/firestore";
import { db } from "firebaseConfig";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { loadProductsRealtime } from "@/hooks/useProduct";
import { loadCategoriesRealtime } from "@/hooks/useCategory";

export default function FilterButton({selectedCategory, setSelectedCategory}: {selectedCategory: string; setSelectedCategory: (category: string) => void}) {

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
    // Add loading state
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
        setIsLoading(false);
        }, 800);
        
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let unsubscribeProducts: (() => void) | undefined;
        let unsubscribeCategories: (() => void) | undefined;
    
        const fetchData = () => {
            unsubscribeProducts = loadProductsRealtime((productData) => {
                setProducts(productData);
    
                const uniqueCategoryIDs = Array.from(
                    new Set(productData.map(p => p.CategoryID))
                );
    
                // ⚠️ Unsubscribe previous category listener if exists (important for updates)
                if (unsubscribeCategories) {
                    unsubscribeCategories();
                }
    
                // 🔄 Subscribe to filtered category updates
                unsubscribeCategories = loadCategoriesRealtime(uniqueCategoryIDs, (categoryData) => {
                    const usedCategories = categoryData.filter(cat =>
                        uniqueCategoryIDs.includes(cat.id)
                    );
    
                    setCategories(["all", ...usedCategories.map(c => c.id)]);
    
                    const map: Record<string, string> = {};
                    usedCategories.forEach(c => {
                        map[c.id] = c.Name;
                    });
                    setCategoryMap(map);
                });
    
            });
        };
    
        fetchData();
    
        // 🔚 Cleanup both listeners on unmount
        return () => {
            if (unsubscribeProducts) unsubscribeProducts();
            if (unsubscribeCategories) unsubscribeCategories();
        };
    }, []);
    

    return (
        <>
        {/* Add skeleton loader */}
        {(isLoading || categories.length === 0) ? ( 
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Cari Produk</h2>
                <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2">
                    {[...Array(4)].map((_, i) => (
                    <button 
                        className="category-btn w-30 bg-gray-200 px-4 py-2 rounded-full animate-pulse" 
                        key={i}
                    >&nbsp;</button>
                    ))}
                </div>
            </div>
            ) : (
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Cari Produk</h2>
                <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2">
                    {categories.map(categoryID => {
                        const label = categoryID === "all" ? "Semua" : categoryMap[categoryID] || "Unknown";
                        return (
                        <button 
                            className={`category-btn px-4 py-2 rounded-full cursor-pointer ${selectedCategory === categoryID ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"}`} 
                            key={categoryID} 
                            onClick={() => setSelectedCategory(categoryID)}
                        >
                            {label}
                        </button>
                    );
                })}
                </div>
            </div>
            )
        }
        </>
    );
}