import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router";
import { auth, db } from "firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simple authentication logic
        // if (username === 'admin' && password === 'password') {
        //     localStorage.setItem('isAuthenticated', 'true');
        //     navigate('/admin/dashboard'); // Redirect to dashboard on successful login
        // } else {
        //     setError('Invalid email or password');
        // }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
      
            // Check if user is an admin
            const adminRef = doc(db, "admins", user.email!);
            const adminSnap = await getDoc(adminRef);
      
            if (adminSnap.exists()) {
                const token = await user.getIdToken();
                localStorage.setItem("adminToken", token);
                navigate("/admin/dashboard");
              } else {
                setError("Access denied. Not an admin.");
              }
        } catch (err: any) {
            setError("Login failed: " + err.message);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-10">
                <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Admin Portal</h1>
                <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
                </div>
                
                {/* Login Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                
                <div className="p-8">
                    {/* Error Message */}
                    {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                        Email
                        </label>
                        <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="admin@example.com"
                            required
                        />
                        </div>
                    </div>
                    
                    {/* Password Field */}
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                        Password
                        </label>
                        <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                            placeholder="••••••••"
                            required
                        />
                        </div>
                    </div>
                    
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 flex items-center justify-center"
                    >
                        {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        </>
                        ) : 'Sign In'}
                    </button>
                    </form>
                    
                    {/* Demo Credentials */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-600">
                            Demo credentials: <span className="font-medium">admin@example.com</span> / <span className="font-medium">admin123</span>
                        </p>
                    </div>
                </div>
                </div>
                
                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                <p>© 2023 Admin Portal. All rights reserved.</p>
                </div>
            </div>
        </div>
        // <div className="min-h-screen flex items-center justify-center bg-gray-100">
        //     <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        //         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
                
        //         {error && (
        //         <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
        //             {error}
        //         </div>
        //         )}
                
        //         <form onSubmit={handleSubmit}>
        //         <div className="mb-4">
        //             <label htmlFor="username" className="block text-gray-700 mb-2">Username</label>
        //             <input
        //             type="text"
        //             id="username"
        //             name="username"
        //             value={username}
        //             onChange={(e) => setUsername(e.target.value)}
        //             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        //             placeholder="admin@example.com"
        //             required
        //             />
        //         </div>
                
        //         <div className="mb-6">
        //             <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
        //             <input
        //             type="password"
        //             id="password"
        //             name="password"
        //             value={password}
        //             onChange={(e) => setPassword(e.target.value)}
        //             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        //             placeholder="••••••••"
        //             required
        //             />
        //         </div>
                
        //         <button
        //             type="submit"
        //             className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
        //         >
        //             Sign In
        //         </button>
        //         </form>
                
        //         <div className="mt-4 text-center text-sm text-gray-600">
        //         <p>Use credentials: admin@example.com / admin123</p>
        //         </div>
        //     </div>
        // </div>
        // <div>
        //     <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        //         <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        //         <div className="mb-4">
        //         <label className="block text-gray-700" htmlFor="username">Username</label>
        //         <input
        //             type="text"
        //             id="username"
        //             value={username}
        //             onChange={(e) => setUsername(e.target.value)}
        //             className="mt-1 block w-full p-2 border border-gray-300 rounded"
        //             required
        //         />
        //         </div>
        //         <div className="mb-4">
        //         <label className="block text-gray-700" htmlFor="password">Password</label>
        //         <input
        //             type="password"
        //             id="password"
        //             value={password}
        //             onChange={(e) => setPassword(e.target.value)}
        //             className="mt-1 block w-full p-2 border border-gray-300 rounded"
        //             required
        //         />
        //         </div>
        //         <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        //         Login
        //         </button>
        //     </form>
        // </div>
    )
}