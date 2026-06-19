import { Navigate, Route, Routes ,BrowserRouter} from "react-router-dom";
import { useAuth ,AuthProvider} from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { Auth } from "./pages/Auth";
import { EventList } from "./pages/EventList";
import { EventDetail } from "./pages/EventDetail";
import { BookingConfirm } from "./pages/BookingComfirm";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/auth"
          element={!isAuthenticated ? <Auth /> : <Navigate to="/" replace />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <EventList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/confirm"
          element={
            <ProtectedRoute>
              <BookingConfirm />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
