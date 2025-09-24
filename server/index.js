import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, useNavigate } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useEffect, useRef } from "react";
import { getFirestore, addDoc, collection, Timestamp, query, onSnapshot, orderBy, where, getDocs, serverTimestamp, doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { toast, ToastContainer, Bounce } from "react-toastify";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(value);
}
function CartPanel({ isVisible, onClose, cartItems, setCartItems, setIsCheckoutOpen }) {
  const increaseQty = (id) => {
    setCartItems(
      (prev) => prev.map(
        (item) => item.id === id ? { ...item, Quantity: item.Quantity + 1 } : item
      )
    );
  };
  const decreaseQty = (id) => {
    setCartItems(
      (prev) => prev.map(
        (item) => item.id === id ? { ...item, Quantity: item.Quantity - 1 } : item
      ).filter((item) => item.Quantity > 0)
      // Remove item if quantity is 0
    );
  };
  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      return total + item.SellPrice * item.Quantity;
    }, 0);
  };
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };
  return /* @__PURE__ */ jsxs("div", { id: "cartPanel", className: `cart-panel fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-lg z-50 p-4 overflow-y-auto ${isVisible ? "open" : ""} `, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: "Keranjang Anda" }),
      /* @__PURE__ */ jsx("button", { id: "closeCart", onClick: onClose, className: "p-1 rounded-full hover:bg-gray-100", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: "size-6", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18 18 6M6 6l12 12" }) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { id: "cartItems", className: "space-y-4 mb-6", children: cartItems.length === 0 ? /* @__PURE__ */ jsx("p", { id: "emptyCart", className: "text-gray-500 text-center py-8", children: "Your cart is empty" }) : /* @__PURE__ */ jsx("div", { children: cartItems.map((item, index) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-b pb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 h-20 w-20 rounded bg-gray-100 overflow-hidden", children: /* @__PURE__ */ jsx("img", { src: item.Image ?? "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/36cbede6-cca8-4f15-8343-4a6656da4493.png", alt: "Product thumbnail", className: "h-full w-full object-cover" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: item.Name }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: formatRupiah(item.SellPrice) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx("button", { className: "quantity-btn px-2 py-1 bg-gray-100 rounded cursor-pointer", onClick: () => decreaseQty(item.id), children: "-" }),
        /* @__PURE__ */ jsx("span", { children: item.Quantity }),
        /* @__PURE__ */ jsx("button", { className: "quantity-btn px-2 py-1 bg-gray-100 rounded cursor-pointer", onClick: () => increaseQty(item.id), children: "+" }),
        /* @__PURE__ */ jsx("button", { className: "remove-btn px-2 py-1 text-red-500 rounded ml-2 cursor-pointer", onClick: () => removeFromCart(item.id), children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", "stroke-width": "1.5", stroke: "currentColor", className: "size-6", children: /* @__PURE__ */ jsx("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" }) }) })
      ] })
    ] }, index)) }) }),
    /* @__PURE__ */ jsx("div", { className: "border-t pt-4", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between font-bold text-lg", children: [
      /* @__PURE__ */ jsx("span", { children: "Total:" }),
      /* @__PURE__ */ jsx("span", { id: "cartTotal", children: formatRupiah(calculateTotal(cartItems)) })
    ] }) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        id: "checkoutButton",
        onClick: () => setIsCheckoutOpen(true),
        disabled: cartItems.length === 0,
        className: "w-full mt-6 cursor-pointer bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:bg-gray-300",
        children: "Proceed to Checkout"
      }
    )
  ] });
}
const firebaseConfig = {
  apiKey: "AIzaSyDs6MD8s0jJtN4295k4kwSzi0rRef1LkW0",
  authDomain: "quick-shopping-4f91f.firebaseapp.com",
  projectId: "quick-shopping-4f91f",
  storageBucket: "quick-shopping-4f91f.firebasestorage.app",
  messagingSenderId: "1096073948425",
  appId: "1:1096073948425:web:1c3898293dcd035ce7f7d8",
  measurementId: "G-KP30QK51T2"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let appCheckInitialized = false;
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    getAnalytics(app);
  });
}
if (typeof window !== "undefined" && !appCheckInitialized) {
  try {
    let siteKey = "6LdpDsQrAAAAAEEbIjQDpDk8KfcwRBW5VjScM6O-";
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true
    });
    appCheckInitialized = true;
  } catch (err) {
    if (err.code === "appCheck/already-initialized") {
      console.warn("AppCheck already initialized. Ignoring...");
    } else {
      throw err;
    }
  }
}
function CheckoutForm({ isCheckoutOpen, onClose, cartItems, clearCart }) {
  const [formData, setFormData] = useState({
    FullName: "",
    PhoneNumber: "",
    Status: "",
    Payment: ""
  });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const clearFormData = () => {
    setFormData({
      FullName: "",
      PhoneNumber: "",
      Status: "",
      Payment: ""
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const FullName = formData.FullName;
    const PhoneNumber = formData.PhoneNumber;
    const Status = "pending";
    const Payment = "waiting";
    try {
      await addDoc(collection(db, "orders"), {
        FullName,
        PhoneNumber,
        Status,
        Payment,
        Items: cartItems,
        CreatedAt: Timestamp.now(),
        Total: cartItems.reduce((sum, item) => sum + item.SellPrice * item.Quantity, 0)
      });
      clearCart();
      clearFormData();
      toast.success("Order submitted!");
      onClose();
    } catch (error) {
      toast.error("Failed to submit order. Please try again.");
      console.error("Error submitting order:", error);
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      id: "checkoutForm",
      className: `${isCheckoutOpen ? "open" : ""} checkout-form fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center`,
      children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg w-full max-w-xs sm:max-w-md mx-2 max-h-screen overflow-y-auto p-4 sm:p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: "Checkout" }),
          /* @__PURE__ */ jsx("button", { id: "closeCheckout", onClick: onClose, className: "p-1 rounded-full hover:bg-gray-100", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "M6 18L18 6M6 6l12 12" }) }) })
        ] }),
        /* @__PURE__ */ jsxs("form", { id: "shippingForm", className: "space-y-4", onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "FullName", className: "block text-sm font-medium text-gray-700", children: "Nama Lengkap" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "FullName",
                name: "FullName",
                value: formData.FullName,
                onChange: handleChange,
                required: true,
                className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "PhoneNumber", className: "block text-sm font-medium text-gray-700", children: "Nomor Telepon (diutamakan whatsapp)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "PhoneNumber",
                name: "PhoneNumber",
                value: formData.PhoneNumber,
                onChange: handleChange,
                required: true,
                className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-4 pt-4", children: [
            /* @__PURE__ */ jsx("button", { type: "button", id: "cancelCheckout", className: "px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50", children: "Cancel" }),
            /* @__PURE__ */ jsx("button", { type: "submit", className: "px-4 cursor-pointer py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700", children: "Submit Order" })
          ] })
        ] })
      ] })
    }
  );
}
const loadProductsRealtime = (onUpdate, onError) => {
  const productsQuery = query(
    collection(db, "products")
    // orderBy("CreatedAt", "desc") // ✅ Order newest first
  );
  const unsubscribe = onSnapshot(
    productsQuery,
    (querySnapshot) => {
      const products = querySnapshot.docs.map((doc2) => ({
        id: doc2.id,
        ...doc2.data()
      }));
      onUpdate(products);
    },
    (error) => {
      console.error("Error in real-time product listener:", error);
    }
  );
  return unsubscribe;
};
function ProductsGrid({
  cartItems,
  setCartItems,
  selectedCategory,
  searchTerm
}) {
  const [products, setProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const unsubscribe = loadProductsRealtime(setProducts);
    return () => {
      unsubscribe();
    };
  }, []);
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === "all" || p.CategoryID === selectedCategory;
    const matchSearch = searchTerm.trim() === "" || p.Name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });
  const AddToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map(
          (item) => item.id === product.id ? { ...item, Quantity: item.Quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, Quantity: 1 }];
      }
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    isLoading ? /* @__PURE__ */ jsx("div", { id: "productsGrid", className: "grid grid-colstn-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6", children: [...Array(4)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "bg-gray-200 rounded-lg h-64 animate-pulse" }, i)) }) : /* @__PURE__ */ jsx("div", { id: "productsGrid", className: "grid grid-colstn-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6", children: filteredProducts.map((product, index) => /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg overflow-hidden shadow-md sm:shadow hover:shadow-lg transition-shadow", children: /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
      /* @__PURE__ */ jsx("div", { className: "h-36 sm:h-48 overflow-hidden rounded-lg cursor-pointer", children: /* @__PURE__ */ jsx(
        "img",
        {
          onClick: () => setSelectedImage(product.Image),
          src: product.Image ?? "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/36cbede6-cca8-4f15-8343-4a6656da4493.png",
          alt: "Product thumbnail",
          className: "h-full w-full object-cover"
        }
      ) }),
      /* @__PURE__ */ jsx("h3", { className: "mt-4 font-medium", children: product.Name }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: product.Description }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "font-bold", children: formatRupiah(product.SellPrice) }),
        /* @__PURE__ */ jsx("button", { onClick: () => AddToCart(product), className: "add-to-cart cursor-pointer px-3 py-1 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200", "data-id": "${product.id}", children: "Add" })
      ] })
    ] }) }, index)) }),
    selectedImage && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/70 flex justify-center items-center z-50",
        onClick: () => setSelectedImage(null),
        children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "absolute top-2 right-2 text-gray-500 text-3xl font-bold hover:text-gray-300 px-3",
              onClick: () => setSelectedImage(null),
              children: "×"
            }
          ),
          /* @__PURE__ */ jsx(
            "img",
            {
              src: selectedImage,
              alt: "Zoomed Product",
              className: "max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-lg"
            }
          )
        ] })
      }
    )
  ] });
}
const loadCategoriesRealtime = (allowedIDs, onUpdate, onError) => {
  const categoriesQuery = query(
    collection(db, "categories"),
    orderBy("Name", "asc")
    // ✅ Order newest first
  );
  const unsubscribe = onSnapshot(
    categoriesQuery,
    (querySnapshot) => {
      const categories = querySnapshot.docs.map((doc2) => ({
        id: doc2.id,
        ...doc2.data()
      })).filter((cat) => allowedIDs.includes(cat.id));
      onUpdate(categories);
    },
    (error) => {
      console.error("Error in real-time category listener:", error);
    }
  );
  return unsubscribe;
};
function FilterButton({ selectedCategory, setSelectedCategory }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    let unsubscribeProducts;
    let unsubscribeCategories;
    const fetchData = () => {
      unsubscribeProducts = loadProductsRealtime((productData) => {
        setProducts(productData);
        const uniqueCategoryIDs = Array.from(
          new Set(productData.map((p) => p.CategoryID))
        );
        if (unsubscribeCategories) {
          unsubscribeCategories();
        }
        unsubscribeCategories = loadCategoriesRealtime(uniqueCategoryIDs, (categoryData) => {
          const usedCategories = categoryData.filter(
            (cat) => uniqueCategoryIDs.includes(cat.id)
          );
          setCategories(["all", ...usedCategories.map((c) => c.id)]);
          const map = {};
          usedCategories.forEach((c) => {
            map[c.id] = c.Name;
          });
          setCategoryMap(map);
        });
      });
    };
    fetchData();
    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeCategories) unsubscribeCategories();
    };
  }, []);
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading ? /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4", children: "Cari Produk" }),
    /* @__PURE__ */ jsx("div", { className: "flex space-x-1 sm:space-x-2 overflow-x-auto pb-2", children: [...Array(4)].map((_, i) => /* @__PURE__ */ jsx(
      "button",
      {
        className: "category-btn w-30 bg-gray-200 px-4 py-2 rounded-full animate-pulse",
        children: " "
      },
      i
    )) })
  ] }) : /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4", children: "Cari Produk" }),
    /* @__PURE__ */ jsx("div", { className: "flex space-x-1 sm:space-x-2 overflow-x-auto pb-2", children: categories.map((categoryID) => {
      const label = categoryID === "all" ? "Semua" : categoryMap[categoryID] || "Unknown";
      return /* @__PURE__ */ jsx(
        "button",
        {
          className: `category-btn px-4 py-2 rounded-full cursor-pointer ${selectedCategory === categoryID ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"}`,
          onClick: () => setSelectedCategory(categoryID),
          children: label
        },
        categoryID
      );
    }) })
  ] }) });
}
function SearchBar({ searchTerm, handleChange }) {
  return /* @__PURE__ */ jsx("div", { className: "my-3 xl:w-96", children: /* @__PURE__ */ jsxs("div", { className: "relative flex w-full flex-wrap items-stretch", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "search",
        id: "searchTerm",
        value: searchTerm,
        className: "relative m-0 block flex-auto rounded border border-solid border-indigo-600 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-indigo-600 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-indigo-600 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-indigo-600 dark:text-indigo-600 dark:placeholder:text-neutral-200 dark:focus:border-primary",
        placeholder: "Labubu / Crocs / Pop Mart ...",
        "aria-label": "Search",
        "aria-describedby": "button-addon2",
        onChange: handleChange
      }
    ),
    /* @__PURE__ */ jsx(
      "span",
      {
        className: "input-group-text flex items-center whitespace-nowrap rounded px-3 py-1.5 text-center text-base font-normal text-neutral-700 dark:text-neutral-200",
        id: "basic-addon2",
        children: /* @__PURE__ */ jsx(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 20 20",
            fill: "currentColor",
            className: "h-5 w-5",
            children: /* @__PURE__ */ jsx(
              "path",
              {
                fillRule: "evenodd",
                d: "M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z",
                clipRule: "evenodd"
              }
            )
          }
        )
      }
    )
  ] }) });
}
function CheckOrder({ showCheckOrder, onClose }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  if (!showCheckOrder) return null;
  const handleSearch = async () => {
    if (!phone.trim()) {
      setError("Masukkan nomor HP terlebih dahulu");
      return;
    }
    setLoading(true);
    setError("");
    setOrders([]);
    try {
      const q = query(
        collection(db, "orders"),
        where("PhoneNumber", "==", phone.trim())
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError("Tidak ada pesanan dengan nomor HP ini");
        setOrders([]);
      } else {
        const results = querySnapshot.docs.map((doc2) => ({
          id: doc2.id,
          ...doc2.data()
        }));
        setOrders(results);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Terjadi kesalahan. Coba lagi.");
    }
    setLoading(false);
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute top-3 right-3 text-gray-500 hover:text-gray-700",
        children: "✕"
      }
    ),
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-indigo-600 mb-4", children: "Cek Pesanan" }),
    /* @__PURE__ */ jsx(
      "label",
      {
        htmlFor: "phone",
        className: "block text-sm font-medium text-gray-700 mb-1",
        children: "Nomor HP:"
      }
    ),
    /* @__PURE__ */ jsx(
      "input",
      {
        id: "phone",
        type: "text",
        placeholder: "Contoh: 081234567890",
        value: phone,
        onChange: (e) => setPhone(e.target.value),
        className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4"
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleSearch,
        disabled: loading,
        className: `w-full py-2 rounded-lg transition ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`,
        children: loading ? "Mencari..." : "Cari Pesanan"
      }
    ),
    error && /* @__PURE__ */ jsx("div", { className: "mt-4 text-red-600 text-sm text-center", children: error }),
    orders.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "Hasil Pencarian" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: orders.map((order) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "border rounded-lg p-3 bg-gray-50 shadow-sm",
          children: [
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Nama:" }),
              " ",
              order.FullName
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Nomor HP:" }),
              " ",
              order.PhoneNumber
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Status:" }),
              " ",
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `px-2 py-1 rounded text-xs ${order.Status === "Selesai" ? "bg-green-100 text-green-700" : order.Status === "Diproses" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`,
                  children: order.Status
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Total:" }),
              " ",
              formatRupiah(order.Total)
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Produk:" }),
              /* @__PURE__ */ jsx("ul", { className: "list-disc ml-5 text-sm", children: order.Items.map((item, idx) => /* @__PURE__ */ jsxs("li", { children: [
                item.Name,
                " (",
                item.Quantity,
                " pcs)"
              ] }, idx)) })
            ] })
          ]
        },
        order.id
      )) })
    ] })
  ] }) });
}
function RequestModal({ isOpen, onClose }) {
  const [requestForm, setRequestForm] = useState({
    FullName: "",
    PhoneNumber: "",
    ProductName: "",
    CreatedAt: serverTimestamp(),
    UpdatedAt: serverTimestamp()
  });
  const clearRequestForm = () => {
    setRequestForm({
      FullName: "",
      PhoneNumber: "",
      ProductName: "",
      CreatedAt: serverTimestamp(),
      UpdatedAt: serverTimestamp()
    });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "request"), requestForm);
      clearRequestForm();
      toast.success("Request berhasil dikirim!");
      onClose();
    } catch (error) {
      toast.error("Gagal mengirim request. Coba kembali.");
      console.error("Error submitting order:", error);
    }
    onClose();
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg w-full max-w-md p-6 shadow-lg relative", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "absolute top-3 right-3 text-gray-500 hover:text-gray-800",
        children: "✕"
      }
    ),
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Carikan Item" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Nama Lengkap" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "FullName",
            name: "FullName",
            value: requestForm.FullName,
            onChange: handleChange,
            required: true,
            className: "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Nomor Telepon" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            name: "PhoneNumber",
            type: "PhoneNumber",
            value: requestForm.PhoneNumber,
            onChange: handleChange,
            required: true,
            className: "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Nama Item" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            name: "ProductName",
            value: requestForm.ProductName,
            onChange: handleChange,
            required: true,
            className: "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition",
          children: "Submit Request"
        }
      )
    ] })
  ] }) });
}
function FloatingRequestButton() {
  const [isOpen, setIsOpen] = useState(false);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsOpen(true),
        className: "fixed cursor-pointer bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition",
        "aria-label": "Request Product",
        children: /* @__PURE__ */ jsx(
          "svg",
          {
            className: "w-6 h-6",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M12 19l9 2-9-18-9 18 9-2z"
              }
            )
          }
        )
      }
    ),
    /* @__PURE__ */ jsx(RequestModal, { isOpen, onClose: () => setIsOpen(false) }),
    /* @__PURE__ */ jsx(
      ToastContainer,
      {
        position: "top-center",
        autoClose: 5e3,
        hideProgressBar: false,
        newestOnTop: false,
        closeOnClick: false,
        rtl: false,
        pauseOnFocusLoss: true,
        draggable: true,
        pauseOnHover: true,
        theme: "light",
        transition: Bounce
      }
    )
  ] });
}
function Catalog() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCheckOrder, setShowCheckOrder] = useState(false);
  const handleToggle = () => {
    setIsVisible((prev) => !prev);
  };
  const handleCheckOrder = () => {
    setShowCheckOrder((prev) => !prev);
  };
  const [cartItems, setCartItems] = useState([]);
  const clearCart = () => setCartItems([]);
  const uniqueItems = cartItems.length;
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(FloatingRequestButton, {}),
    /* @__PURE__ */ jsx("header", { className: "bg-white shadow-sm", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl sm:text-2xl font-bold text-indigo-600 text-center sm:text-left", children: "Katalog" }),
      /* @__PURE__ */ jsx("div", { className: "w-full sm:w-1/2 order-2 sm:order-1", children: /* @__PURE__ */ jsx(SearchBar, { searchTerm, handleChange }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center sm:justify-end gap-2 order-1 sm:order-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleCheckOrder,
            className: "sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-indigo-600 hover:underline cursor-pointer",
            children: "Riwayat Pesanan"
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleToggle,
            className: "relative flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 cursor-pointer",
            children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  className: "h-6 w-6",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  stroke: "currentColor",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: "2",
                      d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                "span",
                {
                  id: "cartCount",
                  className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5",
                  children: uniqueItems
                }
              )
            ]
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8", children: [
      /* @__PURE__ */ jsx(FilterButton, { selectedCategory, setSelectedCategory }),
      /* @__PURE__ */ jsx(ProductsGrid, { cartItems, setCartItems, selectedCategory, searchTerm })
    ] }),
    /* @__PURE__ */ jsx(CheckOrder, { showCheckOrder, onClose: () => setShowCheckOrder(false) }),
    /* @__PURE__ */ jsx(CartPanel, { isVisible, onClose: () => setIsVisible(false), cartItems, setCartItems, setIsCheckoutOpen }),
    /* @__PURE__ */ jsx(CheckoutForm, { isCheckoutOpen, onClose: () => {
      setIsCheckoutOpen(false);
      setIsVisible(false);
    }, cartItems, clearCart })
  ] });
}
function meta$1({}) {
  return [{
    title: "Product Catalog"
  }, {
    name: "description",
    content: "Welcome to Vbelle PO Bangkok 2025!"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsx(Catalog, {});
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const adminRef = doc(db, "admins", user.email);
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) {
        const token = await user.getIdToken();
        localStorage.setItem("adminToken", token);
        navigate("/admin/dashboard");
      } else {
        setError("Access denied. Not an admin.");
      }
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-10", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-8 w-8 text-white", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z", clipRule: "evenodd" }) }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-800", children: "Admin Portal" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 mt-2", children: "Sign in to access your dashboard" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-lg overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "p-1 bg-gradient-to-r from-blue-500 to-indigo-600" }),
      /* @__PURE__ */ jsxs("div", { className: "p-8", children: [
        error && /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start", children: [
          /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 mr-2 mt-0.5", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }),
          /* @__PURE__ */ jsx("span", { children: error })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-gray-700 font-medium mb-2", children: "Email" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-gray-400", viewBox: "0 0 20 20", fill: "currentColor", children: [
                /* @__PURE__ */ jsx("path", { d: "M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" }),
                /* @__PURE__ */ jsx("path", { d: "M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" })
              ] }) }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "email",
                  type: "email",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  className: "w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200",
                  placeholder: "admin@example.com",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-gray-700 font-medium mb-2", children: "Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-gray-400", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z", clipRule: "evenodd" }) }) }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "password",
                  type: "password",
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  className: "w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200",
                  placeholder: "••••••••",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: isLoading,
              className: "w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 flex items-center justify-center",
              children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                  /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ] }),
                "Signing in..."
              ] }) : "Sign In"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 pt-6 border-t border-gray-200", children: /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-gray-600", children: [
          "Demo credentials: ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "admin@example.com" }),
          " / ",
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "admin123" })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 text-center text-sm text-gray-500", children: /* @__PURE__ */ jsx("p", { children: "© 2023 Admin Portal. All rights reserved." }) })
  ] }) });
}
function meta({}) {
  return [{
    title: "Login"
  }, {
    name: "description",
    content: ""
  }];
}
const admin = UNSAFE_withComponentProps(function Home2() {
  return /* @__PURE__ */ jsx("main", {
    className: "min-h-screen bg-gray-50 flex items-center justify-center",
    children: /* @__PURE__ */ jsx(Login, {})
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: admin,
  meta
}, Symbol.toStringTag, { value: "Module" }));
function FormCategory({ activeTab }) {
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    Name: "",
    Description: ""
  });
  const loadCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const data = querySnapshot.docs.map((doc2) => ({
        id: doc2.id,
        ...doc2.data()
      }));
      setCategories(data);
    } catch (err) {
      toast.error("Error fetching categories.");
    }
  };
  useEffect(() => {
    loadCategories();
  });
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm({
      ...categoryForm,
      [name]: value
    });
  };
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const newCategory = { ...categoryForm };
    try {
      const res = await addDoc(collection(db, "categories"), newCategory);
      await loadCategories();
      setCategoryForm({ Name: "", Description: "" });
      toast.success("New category has been added.");
    } catch (err) {
      toast.error("Failed to store new category.");
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category has been deleted.");
    } catch (error) {
      toast.error("Error deleting category.");
    }
  };
  return /* @__PURE__ */ jsxs("div", { id: "categories", className: `tab-content ${activeTab === "categories" ? "active" : ""}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-8 card-shadow mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: "Add New Category" }),
      /* @__PURE__ */ jsxs("form", { id: "categoryForm", className: "space-y-6", onSubmit: handleAddCategory, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "categoryName", className: "block text-sm font-medium text-gray-700 mb-1", children: "Category Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "Name",
              name: "Name",
              className: "w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500",
              required: true,
              value: categoryForm.Name,
              onChange: handleCategoryInputChange
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "categoryDescription", className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "Description",
              name: "Description",
              rows: 4,
              className: "w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500",
              value: categoryForm.Description,
              onChange: handleCategoryInputChange
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsx("button", { type: "submit", className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md transform hover:scale-[1.02]", children: "Add Category" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-8 card-shadow", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: "Product Categories" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", id: "categoriesContainer", children: categories.length > 0 ? categories.map((category) => /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-2", children: category.Name }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-4", children: category.Description || "No description available" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-500", children: [
            "ID: ",
            category.id
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(category.id), className: "text-red-500 cursor-pointer hover:text-red-700", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", "stroke-width": "1.5", stroke: "currentColor", className: "size-6", children: /* @__PURE__ */ jsx("path", { "stroke-linecap": "round", "stroke-linejoin": "round", d: "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" }) }) })
        ] })
      ] }, category.id)) : /* @__PURE__ */ jsx("div", { children: "No data available" }) })
    ] })
  ] });
}
function FormProduct({ activeTab = "products" }) {
  const [date, setDate] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [imageRaw, setImageRaw] = useState(null);
  const [imagePreview, setImagePreview] = useState("https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/807a55a7-e6b3-4fca-879c-f58681ec332d.png");
  const imageInputRef = useRef(null);
  const [productForm, setProductForm] = useState({
    Name: "",
    ActualPrice: 0,
    OfferPrice: 0,
    SellPrice: 0,
    CategoryID: "",
    Description: "",
    Image: "",
    Quantity: 0,
    Purchase: "not purchased",
    Halal: "",
    CreatedAt: serverTimestamp(),
    UpdatedAt: serverTimestamp()
  });
  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const data = querySnapshot.docs.map((doc2) => ({
        id: doc2.id,
        ...doc2.data()
      }));
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };
  const loadCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const data = querySnapshot.docs.map((doc2) => ({
        id: doc2.id,
        Name: doc2.data().Name ?? ""
      }));
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };
  useEffect(() => {
    loadProducts();
    loadCategories();
    setDate((/* @__PURE__ */ new Date()).toLocaleString());
  }, []);
  const handleImageChange = async (e) => {
    var _a;
    const file = ((_a = e.target.files) == null ? void 0 : _a[0]) ?? null;
    setLoadingUpload(true);
    setImageRaw(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "my_preset");
      formData.append("folder", "products");
      const res = await fetch("https://api.cloudinary.com/v1_1/dnqfsh8xb/image/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setImageURL(data.secure_url);
      setLoadingUpload(false);
    }
  };
  const handleImageClick = () => {
    var _a;
    (_a = imageInputRef.current) == null ? void 0 : _a.click();
  };
  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm({
      ...productForm,
      [name]: value
    });
  };
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!imageRaw) {
      toast.warning("Please select an image.");
      return;
    }
    try {
      const productDoc = {
        ...productForm,
        Image: imageURL
        // ✅ save URL, not the file
      };
      await addDoc(collection(db, "products"), productDoc);
      await loadProducts();
      setProductForm({
        Name: "",
        ActualPrice: 0,
        OfferPrice: 0,
        SellPrice: 0,
        CategoryID: "",
        Description: "",
        Image: "",
        Quantity: 0,
        Purchase: "not purchased",
        Halal: "",
        CreatedAt: serverTimestamp(),
        UpdatedAt: serverTimestamp()
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
  const handleEditProduct = async (id, e) => {
    e.preventDefault();
    try {
      const productRef = doc(db, "products", id);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const data = productSnap.data();
        setProductForm({
          Name: data.Name,
          ActualPrice: data.ActualPrice,
          OfferPrice: data.OfferPrice,
          SellPrice: data.SellPrice,
          CategoryID: data.CategoryID,
          Description: data.Description,
          Image: data.Image,
          Quantity: 1,
          Purchase: "not purchased",
          Halal: "",
          CreatedAt: data.CreatedAt,
          UpdatedAt: data.UpdatedAt
        });
        setIsEdit(true);
        setEditingProductId(id);
        setImagePreview(data.Image || "");
      } else {
        toast.error("Product not found.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error deleting product.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      if (!editingProductId) return;
      await handleUpdateProduct(editingProductId, e);
    } else {
      await handleAddProduct(e);
    }
  };
  const handleUpdateProduct = async (id, e) => {
    e.preventDefault();
    try {
      let imageUrl = productForm.Image;
      if (imageRaw) {
        const storage = getStorage();
        const path = `products/${date}-${imageRaw.name}`;
        const imgRef = ref(storage, path);
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
        UpdatedAt: serverTimestamp()
      });
      setIsEdit(false);
      setEditingProductId(null);
      setImageRaw(null);
      await loadProducts();
      toast.success("Product updated successfully!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error updating product.");
    }
  };
  const handleDeleteProduct = async (id, e) => {
    e.preventDefault();
    if (!confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted successfully!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error deleting product.");
    }
  };
  return /* @__PURE__ */ jsxs("div", { id: "products", className: `tab-content ${activeTab === "products" ? "active" : ""}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-8 card-shadow mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: "Add New Product" }),
      /* @__PURE__ */ jsxs("form", { id: "productForm", className: "space-y-6", onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "productName", className: "block text-sm font-medium text-gray-700 mb-1", children: [
            "Product Name ",
            /* @__PURE__ */ jsx("sup", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "Name",
              name: "Name",
              className: "w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500",
              required: true,
              value: productForm.Name,
              onChange: handleProductInputChange
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "ActualPrice", className: "block text-sm font-medium text-gray-700 mb-1", children: [
            "Actual Price (Rp) ",
            /* @__PURE__ */ jsx("sup", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "ActualPrice",
              name: "ActualPrice",
              step: "0.01",
              min: "0",
              className: "w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500",
              required: true,
              value: productForm.ActualPrice,
              onChange: handleProductInputChange
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "OfferPrice", className: "block text-sm font-medium text-gray-700 mb-1", children: [
            "Offer Price (Rp) ",
            /* @__PURE__ */ jsx("sup", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "OfferPrice",
              name: "OfferPrice",
              step: "0.01",
              min: "0",
              className: "w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500",
              required: true,
              value: productForm.OfferPrice,
              onChange: handleProductInputChange
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "SellPrice", className: "block text-sm font-medium text-gray-700 mb-1", children: [
            "Sell Price (Rp) ",
            /* @__PURE__ */ jsx("sup", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "SellPrice",
              name: "SellPrice",
              step: "0.01",
              min: "0",
              className: "w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500",
              required: true,
              value: productForm.SellPrice,
              onChange: handleProductInputChange
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "CategoryID", className: "block text-sm font-medium text-gray-700 mb-1", children: [
            "Category ",
            /* @__PURE__ */ jsx("sup", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "CategoryID",
              name: "CategoryID",
              className: "w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500",
              required: true,
              value: productForm.CategoryID,
              onChange: handleProductInputChange,
              children: [
                /* @__PURE__ */ jsx("option", { children: "Select Category" }),
                categories.length > 0 ? categories.map((category) => /* @__PURE__ */ jsx("option", { value: category.id, children: category.Name }, category.id)) : /* @__PURE__ */ jsx("option", { children: "No Categories" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "Halal", className: "block text-sm font-medium text-gray-700 mb-1", children: [
            "Category ",
            /* @__PURE__ */ jsx("sup", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "Halal",
              name: "Halal",
              className: "w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500",
              required: true,
              value: productForm.Halal || "",
              onChange: handleProductInputChange,
              children: [
                /* @__PURE__ */ jsx("option", { children: "Select Halal" }),
                /* @__PURE__ */ jsx("option", { children: "Halal" }),
                /* @__PURE__ */ jsx("option", { children: "Non Halal" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "Description", className: "block text-sm font-medium text-gray-700 mb-1", children: [
            "Description ",
            /* @__PURE__ */ jsx("sup", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "Description",
              name: "Description",
              rows: 4,
              className: "w-full px-4 py-3 rounded-lg border border-gray-300 form-input focus:outline-none focus:border-blue-500",
              value: productForm.Description,
              onChange: handleProductInputChange
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
            "Product Image ",
            /* @__PURE__ */ jsx("sup", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-block h-40 w-80 rounded-md overflow-hidden bg-gray-100 mr-4", children: /* @__PURE__ */ jsx(
              "img",
              {
                id: "productImagePreview",
                src: imagePreview,
                alt: "Product image placeholder showing empty white space where image would appear",
                className: "h-full w-full object-cover"
              }
            ) }),
            /* @__PURE__ */ jsx("input", { type: "file", id: "Image", name: "Image", accept: "image/*", capture: "environment", onChange: handleImageChange, ref: imageInputRef, className: "hidden" }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: handleImageClick, className: "bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Upload Image" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
          /* @__PURE__ */ jsx(
            ToastContainer,
            {
              position: "top-center",
              autoClose: 5e3,
              hideProgressBar: false,
              newestOnTop: false,
              closeOnClick: false,
              rtl: false,
              pauseOnFocusLoss: true,
              draggable: true,
              pauseOnHover: true,
              theme: "light",
              transition: Bounce
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: loading || loadingUpload,
              className: `w-full cursor-pointer font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md transform
                                ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]"}`,
              children: [
                loadingUpload ? "Uploading..." : "",
                loading ? "Submitting..." : isEdit ? "Update Product" : "Add Product"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-8 card-shadow", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: "Recent Products" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Preview" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actual Price" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Offer Price" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Sell Price" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Description" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Category" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: products.length > 0 ? products.map((product) => {
          var _a;
          return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50", children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("img", { src: product.Image, alt: product.Name + " product image", className: "h-10 w-10 rounded-md object-cover" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: product.Name }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: [
              "Rp. ",
              product.ActualPrice
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: [
              "Rp. ",
              product.OfferPrice
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: [
              "Rp. ",
              product.SellPrice
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: product.Description }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: ((_a = categories.find((c) => c.id === product.CategoryID)) == null ? void 0 : _a.Name) ?? "-" }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: (e) => handleEditProduct(product.id, e), className: "bg-gray-500 px-4 py-1 text-white rounded-l-lg cursor-pointer", children: "Edit" }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: (e) => handleDeleteProduct(product.id, e), className: "bg-red-500 px-4 py-1 text-white rounded-r-lg cursor-pointer", children: "Delete" })
            ] })
          ] }, product.id);
        }) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider", children: "No data available" }) }) })
      ] }) })
    ] })
  ] });
}
const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
const paymentOptions = ["waiting", "down payment", "paid"];
const purchaseOptions = ["purchased", "not purchased"];
function OrdersList({ activeTab }) {
  var _a;
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, "orders"),
        orderBy("CreatedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc2) => ({
        id: doc2.id,
        ...doc2.data()
      }));
    } catch (err) {
      toast.error("Error fetching orders");
      return [];
    }
  };
  const handleStatusChange = async (id, newStatus) => {
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, { Status: newStatus });
      setOrders(
        (prevOrders) => prevOrders.map(
          (order) => order.id === id ? { ...order, Status: newStatus } : order
        )
      );
      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };
  const handlePaymentChange = async (id, newPayment) => {
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, { Payment: newPayment });
      setOrders(
        (prevOrders) => prevOrders.map(
          (order) => order.id === id ? { ...order, Payment: newPayment } : order
        )
      );
      toast.success("Payment updated");
    } catch (err) {
      toast.error("Failed to update payment");
    }
  };
  const handlePurchaseChange = async (id, itemId, newPurchase) => {
    try {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        alert("Order not found");
        return;
      }
      const orderData = orderSnap.data();
      const items = orderData.Items || [];
      const updatedItems = items.map(
        (item) => item.id === itemId ? { ...item, Purchase: newPurchase } : item
      );
      await updateDoc(orderRef, { Items: updatedItems });
      setOrders(
        (prevOrders) => prevOrders.map(
          (order) => order.id === id ? { ...order, Items: updatedItems } : order
        )
      );
      if ((selectedOrder == null ? void 0 : selectedOrder.id) === id) {
        setSelectedOrder({
          ...selectedOrder,
          Items: updatedItems
        });
      }
      toast.success("Item purchase status updated!");
    } catch (err) {
      toast.error("Failed to update item purchase status");
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchOrders();
      setOrders(data);
    };
    fetchData();
  }, []);
  return /* @__PURE__ */ jsxs("div", { id: "orders", className: `tab-content ${activeTab === "orders" ? "active" : ""}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-8 card-shadow", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: "Customer Orders" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Order ID" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Customer" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Phone" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Amount" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }),
          /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Payment" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { id: "ordersTableBody", className: "bg-white divide-y divide-gray-200", children: orders.map((order) => {
          var _a2;
          return /* @__PURE__ */ jsxs("tr", { className: `hover:bg-gray-50 cursor-pointer ${getStatusColor(order.Status)}`, children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", onClick: () => setSelectedOrder(order), children: order.id }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", onClick: () => {
              setOpen(true);
              setSelectedOrder(order);
            }, children: order.FullName }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: order.PhoneNumber }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: (_a2 = order.CreatedAt) == null ? void 0 : _a2.toDate().toLocaleDateString("en-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              day: "2-digit",
              month: "long",
              year: "numeric"
            }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: formatRupiah(order.Total) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx(
              "select",
              {
                value: order.Status,
                onChange: (e) => handleStatusChange(order.id, e.target.value),
                className: "mt-1 border rounded px-2 py-1",
                children: statusOptions.map((status) => /* @__PURE__ */ jsx("option", { value: status, children: status.charAt(0).toUpperCase() + status.slice(1) }, status))
              }
            ) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx(
              "select",
              {
                value: order.Payment,
                onChange: (e) => handlePaymentChange(order.id, e.target.value),
                className: "mt-1 border rounded px-2 py-1",
                children: paymentOptions.map((payment) => /* @__PURE__ */ jsx("option", { value: payment, children: payment.charAt(0).toUpperCase() + payment.slice(1) }, payment))
              }
            ) })
          ] }, order.id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Dialog, { open, onClose: setOpen, className: "relative z-10", children: [
      /* @__PURE__ */ jsx(
        DialogBackdrop,
        {
          transition: true,
          className: "fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16", children: /* @__PURE__ */ jsxs(
        DialogPanel,
        {
          transition: true,
          className: "pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700",
          children: [
            /* @__PURE__ */ jsx(TransitionChild, { children: /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 -ml-8 flex pt-4 pr-2 duration-500 ease-in-out data-closed:opacity-0 sm:-ml-10 sm:pr-4", children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setOpen(false),
                className: "relative rounded-md text-gray-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "absolute -inset-2.5" }),
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close panel" }),
                  /* @__PURE__ */ jsx(XMarkIcon, { "aria-hidden": "true", className: "size-6" })
                ]
              }
            ) }) }),
            /* @__PURE__ */ jsxs("div", { className: "relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl", children: [
              /* @__PURE__ */ jsx("div", { className: "px-4 sm:px-6", children: /* @__PURE__ */ jsx(DialogTitle, { className: "text-base font-semibold text-gray-900", children: "Order Detail" }) }),
              /* @__PURE__ */ jsxs("div", { className: "relative mt-6 flex-1 px-4 sm:px-6", children: [
                /* @__PURE__ */ jsxs("table", { className: "table-auto w-full", children: [
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsx("strong", { children: "Name" }) }),
                    /* @__PURE__ */ jsx("td", { children: ":" }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: selectedOrder == null ? void 0 : selectedOrder.FullName })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsx("strong", { children: "Phone" }) }),
                    /* @__PURE__ */ jsx("td", { children: ":" }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: selectedOrder == null ? void 0 : selectedOrder.PhoneNumber })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsx("strong", { children: "Status" }) }),
                    /* @__PURE__ */ jsx("td", { children: ":" }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: selectedOrder == null ? void 0 : selectedOrder.Status })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsx("strong", { children: "Total" }) }),
                    /* @__PURE__ */ jsx("td", { children: ":" }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: selectedOrder ? formatRupiah(selectedOrder.Total) : "" })
                  ] }),
                  /* @__PURE__ */ jsxs("tr", { children: [
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsx("strong", { children: "Created At" }) }),
                    /* @__PURE__ */ jsx("td", { children: ":" }),
                    /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: (_a = selectedOrder == null ? void 0 : selectedOrder.CreatedAt) == null ? void 0 : _a.toDate().toLocaleString("en-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("h3", { className: "font-semibold mt-4 mb-2", children: "Items:" }),
                /* @__PURE__ */ jsx("ul", { className: "space-y-1 overflow-y-auto", children: selectedOrder == null ? void 0 : selectedOrder.Items.map((item) => /* @__PURE__ */ jsx("li", { className: "border p-2 rounded", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-25 w-25 overflow-hidden rounded-lg ms-2", children: /* @__PURE__ */ jsx("img", { src: item.Image ?? "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/36cbede6-cca8-4f15-8343-4a6656da4493.png", alt: "Product thumbnail", className: "h-full w-full object-cover" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "ms-10", children: [
                    /* @__PURE__ */ jsxs("p", { children: [
                      item.Name,
                      " × ",
                      item.Quantity
                    ] }),
                    /* @__PURE__ */ jsx("p", { children: formatRupiah(item.SellPrice) }),
                    /* @__PURE__ */ jsx(
                      "select",
                      {
                        value: item.Purchase || "not purchased",
                        className: "mt-2 px-6 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                        onChange: (e) => handlePurchaseChange(selectedOrder.id, item.id, e.target.value),
                        children: purchaseOptions.map((purchase) => /* @__PURE__ */ jsx("option", { value: purchase, children: purchase.charAt(0).toUpperCase() + purchase.slice(1) }, purchase))
                      }
                    )
                  ] })
                ] }) }, item.id)) })
              ] })
            ] })
          ]
        }
      ) }) }) })
    ] })
  ] });
}
const dashboard = UNSAFE_withComponentProps(function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/admin";
    }
  }, []);
  return /* @__PURE__ */ jsxs("div", {
    className: "container mx-auto px-4 py-12 max-w-6xl",
    children: [/* @__PURE__ */ jsx("button", {
      onClick: handleLogout,
      children: "Logout"
    }), /* @__PURE__ */ jsxs("header", {
      className: "mb-12 text-center",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-4xl font-bold text-gray-800 mb-3",
        children: "Product Management System"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-xl text-gray-600 max-w-2xl mx-auto",
        children: "Streamline your inventory management with our comprehensive product dashboard"
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "flex justify-center mb-8",
      children: /* @__PURE__ */ jsxs("div", {
        className: "bg-white rounded-full p-1 shadow-lg flex",
        children: [/* @__PURE__ */ jsx("button", {
          onClick: () => setActiveTab("products"),
          className: `tab-btn cursor-pointer px-6 py-2 rounded-full font-medium transition-all ${activeTab === "products" ? "bg-blue-600 text-white" : "hover:bg-blue-300 text-gray-600"}`,
          children: "Products"
        }), /* @__PURE__ */ jsx("button", {
          onClick: () => setActiveTab("categories"),
          className: `tab-btn cursor-pointer px-6 py-2 rounded-full font-medium transition-all ${activeTab === "categories" ? "bg-blue-600 text-white" : "hover:bg-blue-300 text-gray-600"}`,
          children: "Categories"
        }), /* @__PURE__ */ jsx("button", {
          onClick: () => setActiveTab("orders"),
          className: `tab-btn cursor-pointer px-6 py-2 rounded-full font-medium transition-all ${activeTab === "orders" ? "bg-blue-600 text-white" : "hover:bg-blue-300 text-gray-600"}`,
          children: "View Orders"
        })]
      })
    }), activeTab === "products" && /* @__PURE__ */ jsx(FormProduct, {}), activeTab === "categories" && /* @__PURE__ */ jsx(FormCategory, {}), activeTab === "orders" && /* @__PURE__ */ jsx(OrdersList, {})]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: dashboard
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BDkBQxDf.js", "imports": ["/assets/chunk-C37GKA54-Diq3WOR4.js", "/assets/index-Cw9McVtL.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-Iweh9_nK.js", "imports": ["/assets/chunk-C37GKA54-Diq3WOR4.js", "/assets/index-Cw9McVtL.js"], "css": ["/assets/root-nGegGaGM.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": "/", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-BEU0GwKt.js", "imports": ["/assets/chunk-C37GKA54-Diq3WOR4.js", "/assets/ReactToastify-F6lYrg9b.js", "/assets/firebaseConfig-CouTnxMF.js"], "css": ["/assets/ReactToastify-GNLSjkBZ.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin": { "id": "routes/admin", "parentId": "root", "path": "/admin", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/admin-B2OFR5fn.js", "imports": ["/assets/chunk-C37GKA54-Diq3WOR4.js", "/assets/firebaseConfig-CouTnxMF.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/admin/dashboard": { "id": "routes/admin/dashboard", "parentId": "root", "path": "/admin/dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/dashboard-BBjwqvKH.js", "imports": ["/assets/chunk-C37GKA54-Diq3WOR4.js", "/assets/firebaseConfig-CouTnxMF.js", "/assets/ReactToastify-F6lYrg9b.js", "/assets/index-Cw9McVtL.js"], "css": ["/assets/ReactToastify-GNLSjkBZ.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-dfe5c04c.js", "version": "dfe5c04c", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: "/",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/admin": {
    id: "routes/admin",
    parentId: "root",
    path: "/admin",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/admin/dashboard": {
    id: "routes/admin/dashboard",
    parentId: "root",
    path: "/admin/dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
