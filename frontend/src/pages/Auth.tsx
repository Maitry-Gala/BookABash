import { useState, useEffect } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const Auth = () => {
   const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  setIsLogin(searchParams.get("mode") !== "signup");
}, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await api.post(endpoint, payload);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 w-full max-w-md p-8">

        {/* header */}
        <h1 className="text-2xl font-bold text-indigo-900 mb-1">
          {isLogin ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {isLogin ? "Sign in to book your seats" : "Sign up to get started"}
        </p>

        {/* fields */}
        <div className="flex flex-col gap-3">
          {!isLogin && (
            <div className="flex gap-3">
              <input
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* error */}
        {error && (
          <p className="text-sm text-red-500 mt-3">{error}</p>
        )}

        {/* submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Please wait..." : isLogin ? "Sign in" : "Sign up"}
        </button>

        {/* toggle */}
        <p className="text-sm text-center text-gray-500 mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-purple-600 font-medium cursor-pointer hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;