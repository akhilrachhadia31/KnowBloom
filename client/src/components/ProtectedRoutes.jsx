import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// 🔐 Protect routes for authenticated users (like My Learning, My Profile)
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((store) => store.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 🔓 Allow only unauthenticated users (like Login, Signup)
export const AuthenticatedUser = ({ children }) => {
  const { isAuthenticated } = useSelector((store) => store.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// 🔐 Instructor routes with instructor role check
// renamed from “instructorRoute” to “InstructorRoute” (PascalCase!)
export const InstructorRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((store) => store.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "instructor") {
    return <Navigate to="/" replace />;
  }

  return children;
};

// 🔥 👇 Optional: Add GuestOnlyRoute (same as AuthenticatedUser for clarity)
export const GuestOnlyRoute = AuthenticatedUser;
