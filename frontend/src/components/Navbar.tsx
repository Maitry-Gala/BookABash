import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <nav className="bg-white border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <span
          onClick={() => navigate("/")}
          className="flex items-center gap-2text-xl font-bold text-purple-700 cursor-pointer tracking-tight"
        >
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScp4NpOUYQtbAc0sQVtiPU8l-yzeE3Yp4zGymZebZE6g&s=10" alt="logo" className="w-10"/>
          BookABash
        </span>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-indigo-900">
              Hey, <span className="font-semibold">{user?.firstName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-1.5 rounded-full border border-purple-300 text-purple-700 hover:bg-purple-50 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="text-sm px-4 py-1.5 rounded-full border border-purple-300 text-purple-700 hover:bg-purple-50 transition"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="text-sm px-4 py-1.5 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
