import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { db } from "firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Props = {
    activeTab?: string
}

type Category = {
    id: string;
    Name: string;
    Description: string;
}

export default function FormCategory({ activeTab: activeTab } : Props) {

    const [categories, setCategories] = useState<Category[]>([]);

    const [categoryForm, setCategoryForm] = useState({
        Name: '',
        Description: ''
    });

    const loadCategories = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "categories"));
            const data: Category[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Category, "id">),
              }));

              setCategories(data);
        } catch (err) {
            toast.error("Error fetching categories.");
        }
    }

    // Simulate fetching data
    useEffect(() => {
        loadCategories();
    })

    const handleCategoryInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCategoryForm({
            ...categoryForm,
            [name]: value
        });
    };

    const handleAddCategory = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newCategory = {...categoryForm};

        try {
            const res = await addDoc(collection(db, "categories"), newCategory);

            await loadCategories();
            setCategoryForm({ Name: "", Description: "" });
            toast.success("New category has been added.");
        } catch (err) {
            toast.error("Failed to store new category.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            await deleteDoc(doc(db, "categories", id));
            setCategories(prev => prev.filter(c => c.id !== id));
            toast.success("Category has been deleted.");
        } catch (error) {
            toast.error("Error deleting category.");
        }
    }

    return (
        <div id="categories" className={`tab-content ${activeTab === 'categories' ? 'active' : ''}`}>
            <div className="bg-white rounded-xl p-8 card-shadow mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Category</h2>
                <form id="categoryForm" className="space-y-6" onSubmit={handleAddCategory}>
                    <div>
                        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input type="text" id="Name" name="Name" className="w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500" required
                            value={categoryForm.Name}
                            onChange={handleCategoryInputChange}
                            />
                    </div>

                    <div>
                        <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="Description" name="Description" rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500"
                            value={categoryForm.Description}
                            onChange={handleCategoryInputChange}
                        ></textarea>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md transform hover:scale-[1.02]">
                            Add Category
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl p-8 card-shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="categoriesContainer">
                    {categories.length > 0 ? categories.map(category => (
                        <div className="p-5" key={category.id}>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.Name}</h3>
                            <p className="text-gray-600 mb-4">{category.Description || 'No description available'}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">ID: {category.id}</span>
                                <button onClick={() => handleDelete(category.id)} className="text-red-500 cursor-pointer hover:text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div>No data available</div>
                    )}
                </div>
            </div>
        </div>
    )
}