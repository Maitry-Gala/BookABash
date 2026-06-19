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
          className="text-xl font-bold text-purple-700 cursor-pointer tracking-tight"
        >
          BookABash
        </span>

        {isAuthenticated && (
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
        )}
      </div>
    </nav>
  );
};

export default Navbar;