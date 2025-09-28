import { useEffect, useState, useRef, type ChangeEvent, type FormEvent } from "react";
import type { MouseEvent as ReactMouseEvent } from 'react';
import { db } from "firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import type { Product } from "@/types/product";
import 'react-toastify/dist/ReactToastify.css';
import { formatRupiah } from "@/utils/formatRupiah";

type Props = {
    activeTab?: string
}

type Category = {
    id: string;
    Name: string;
}

export default function FormProduct({ activeTab = "products" }: Props) {

    const [date, setDate] = useState<string | null>(null);
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [loading, setLoading] = useState(false);

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isEdit, setIsEdit] = useState(false);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);

    const [imageURL, setImageURL] = useState(null);
    const [imageRaw, setImageRaw] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/807a55a7-e6b3-4fca-879c-f58681ec332d.png');
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [productForm, setProductForm] = useState<Omit<Product, "id">>({
        Name: '',
        ActualPrice: 0,
        OfferPrice: 0,
        SellPrice: 0,
        CategoryID: '',
        Description: '',
        Image: '',
        Quantity: 0,
        Purchase: 'not purchased',
        Halal: '',
        CreatedAt: serverTimestamp(),
        UpdatedAt: serverTimestamp(),
    });

    const loadProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const data: Product[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Product, "id">),
              }));

              setProducts(data);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    }

    const loadCategories = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "categories"));
            const data: Category[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                Name: (doc.data() as { Name?: string }).Name ?? "",
            }));
            setCategories(data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }

    // Simulate fetching data
    useEffect(() => {
        loadProducts();
        loadCategories();
        setDate(new Date().toLocaleString()); // runs only on client
    }, []);

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;

        setLoadingUpload(true);
        setImageRaw(file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "my_preset"); // 👈 your unsigned preset
            formData.append("folder", "products"); // optional: organize uploads

            const res = await fetch("https://api.cloudinary.com/v1_1/dnqfsh8xb/image/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setImageURL(data.secure_url); // 👈 this is the final image URL
            setLoadingUpload(false);
        }
      };

    const handleImageClick = () => {
        imageInputRef.current?.click();
    };

    const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProductForm({
            ...productForm,
            [name]: value
        });
    };

    const handleAddProduct = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        if (!imageRaw) {
            toast.warning("Please select an image.");
            return;
        }

        try {
            const productDoc = {
                ...productForm,
                Image: imageURL, // ✅ save URL, not the file
            };
            await addDoc(collection(db, "products"), productDoc);

            await loadProducts();
            setProductForm({
                Name: '',
                ActualPrice: 0,
                OfferPrice: 0,
                SellPrice: 0,
                CategoryID: '',
                Description: '',
                Image: '',
                Quantity: 0,
                Purchase: 'not purchased',
                Halal: '',
                CreatedAt: serverTimestamp(),
                UpdatedAt: serverTimestamp(),
            });
            setImageRaw(null);
            setImagePreview("");
            toast.success("Product added successfully!");
        } catch (err) {
            console.error("Error:", err);
            toast.error("Failed to add new product.");
        } finally {
            setLoading(false);
        }
      };

    const handleEditProduct = async (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try {
            const productRef = doc(db, "products", id);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
                const data = productSnap.data() as Omit<Product, "id">;

                setProductForm({
                    Name: data.Name,
                    ActualPrice: data.ActualPrice,
                    OfferPrice: data.OfferPrice,
                    SellPrice: data.SellPrice,
                    CategoryID: data.CategoryID,
                    Description: data.Description,
                    Image: data.Image,
                    Quantity: 1,
                    Purchase: 'not purchased',
                    Halal: '',
                    CreatedAt: data.CreatedAt,
                    UpdatedAt: data.UpdatedAt,
                });

                setIsEdit(true);
                setEditingProductId(id);
                setImagePreview(data.Image || "");
            } else {
                toast.error("Product not found.");
            }
        } catch (err) {
            // error
            console.error('Error:', err)
            toast.error("Error deleting product.");
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEdit) {
            if (!editingProductId) return; // or show a message
            await handleUpdateProduct(editingProductId, e);
        } else {
            await handleAddProduct(e);
        }
      };

    const handleUpdateProduct = async (id: string, e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            let imageUrl = productForm.Image;
            if (imageRaw) {
                const storage = getStorage();
                const path = `products/${date}-${imageRaw.name}`;
                const imgRef = storageRef(storage, path);
                await uploadBytes(imgRef, imageRaw);
                imageUrl = await getDownloadURL(imgRef);
            }

            await updateDoc(doc(db, "products", id), {
                Name: productForm.Name,
                ActualPrice: productForm.ActualPrice,
                OfferPrice: productForm.OfferPrice,
                SellPrice: productForm.SellPrice,
                CategoryID: productForm.CategoryID,
                Description: productForm.Description,
                Image: imageUrl,
                Halal: productForm.Halal,
                UpdatedAt: serverTimestamp(),
            });

            setIsEdit(false);
            setEditingProductId(null);
            setImageRaw(null);
            await loadProducts();
            toast.success("Product updated successfully!");
        } catch (err) {
            console.error('Error:', err);
            toast.error("Error updating product.");
        }
    }

    const handleDeleteProduct = async (id: string, e: ReactMouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!confirm('Delete this product?')) return;
        try {
            await deleteDoc(doc(db, "products", id));
            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success("Product deleted successfully!");
        } catch (err) {
            console.error('Error:', err);
            toast.error("Error deleting product.");
        }
    }

    const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

    return (
        <div id="products" className={`tab-content ${activeTab === 'products' ? 'active' : ''}`}>
            <div className="bg-white rounded-xl p-8 card-shadow mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>
                <form id="productForm" className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Product Name <sup className="text-red-500">*</sup></label>
                        <input type="text" id="Name" name="Name" className="w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500" required
                            value={productForm.Name}
                            onChange={handleProductInputChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="ActualPrice" className="block text-sm font-medium text-gray-700 mb-1">Actual Price (Rp) <sup className="text-red-500">*</sup></label>
                        <input type="number" id="ActualPrice" name="ActualPrice" step="0.01" min="0" className="w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500" required
                            value={productForm.ActualPrice}
                            onChange={handleProductInputChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="OfferPrice" className="block text-sm font-medium text-gray-700 mb-1">Offer Price (Rp) <sup className="text-red-500">*</sup></label>
                        <input type="number" id="OfferPrice" name="OfferPrice" step="0.01" min="0" className="w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500" required
                            value={productForm.OfferPrice}
                            onChange={handleProductInputChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="SellPrice" className="block text-sm font-medium text-gray-700 mb-1">Sell Price (Rp) <sup className="text-red-500">*</sup></label>
                        <input type="number" id="SellPrice" name="SellPrice" step="0.01" min="0" className="w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500" required
                            value={productForm.SellPrice}
                            onChange={handleProductInputChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="CategoryID" className="block text-sm font-medium text-gray-700 mb-1">Category <sup className="text-red-500">*</sup></label>
                        <select id="CategoryID" name="CategoryID" className="w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500" required
                            value={productForm.CategoryID} onChange={handleProductInputChange}
                        >
                            <option>Select Category</option>
                            {categories.length > 0 ? categories.map(category => (
                                <option key={category.id} value={category.id}>{category.Name}</option>
                            )) : (
                                <option>No Categories</option>
                            )}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="Halal" className="block text-sm font-medium text-gray-700 mb-1">Category <sup className="text-red-500">*</sup></label>
                        <select id="Halal" name="Halal" className="w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500" required
                            value={productForm.Halal || ''} onChange={handleProductInputChange}
                        >
                            <option>Select Halal</option>
                            <option>Halal</option>  
                            <option>Non Halal</option>  
                        </select>
                    </div>

                    <div>
                        <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-1">Description <sup className="text-red-500">*</sup></label>
                        <textarea id="Description" name="Description" rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500"
                            value={productForm.Description}
                            onChange={handleProductInputChange}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image <sup className="text-red-500">*</sup></label>
                        <div className="mt-1 flex items-center">
                            <span className="inline-block h-40 w-80 rounded-md overflow-hidden bg-gray-100 mr-4">
                                <img id="productImagePreview"
                                    src={imagePreview} alt="Product image placeholder showing empty white space where image would appear" className="h-full w-full object-cover" />
                            </span>
                            <input type="file" id="Image" name="Image" accept="image/*" capture="environment" onChange={handleImageChange} ref={imageInputRef} className="hidden" />
                            <button type="button" onClick={handleImageClick} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Upload Image
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <ToastContainer
                            position="top-center"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick={false}
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="light"
                            transition={Bounce}
                            />
                        <button type="submit"
                            disabled={loading||loadingUpload}
                            className={`w-full cursor-pointer font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md transform
                                ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]"}`}>
                            {loadingUpload ? "Uploading..." : '' }
                            {loading ? "Submitting..." : isEdit ? "Update Product" : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl p-8 card-shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Products</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sell Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Halal/Non Halal</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.length > 0 ? products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img src={product.Image} alt={product.Name + ' product image'} className="h-10 w-10 rounded-md object-cover" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.Name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRupiah(product.ActualPrice)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRupiah(product.OfferPrice)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRupiah(product.SellPrice)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(product.Description).substring(0, 50)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{categories.find(c => c.id === product.CategoryID)?.Name ?? '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.Halal}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button type="button" onClick={(e) => handleEditProduct(product.id, e)} className="bg-gray-500 px-4 py-1 text-white rounded-l-lg cursor-pointer">Edit</button>
                                        <button type="button" onClick={(e) => handleDeleteProduct(product.id, e)} className="bg-red-500 px-4 py-1 text-white rounded-r-lg cursor-pointer">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}