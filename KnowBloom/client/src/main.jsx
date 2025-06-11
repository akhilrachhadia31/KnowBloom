// src/index.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import { appStore } from "./app/store";
import { ThemeProvider } from "./components/ThemeProvider";
import { UserContext } from "./context/UserContext";
import LoadingScreen from "./loadingscreen";
import { useLoadUserQuery } from "./features/api/authApi";

// must be defined in top-level .env as VITE_GOOGLE_CLIENT_ID=…
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AuthLoader = ({ children }) => {
  // never auto-fetch on public auth routes:
  const skip = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].some((p) => window.location.pathname.startsWith(p));

  const { data, isLoading } = useLoadUserQuery(undefined, { skip });

  if (isLoading) return <LoadingScreen />;

  return (
    <UserContext.Provider value={{ user: data?.user }}>
      {children}
    </UserContext.Provider>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Provider store={appStore}>
          <AuthLoader>
            <App />
            <Toaster />
          </AuthLoader>
        </Provider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </StrictMode>
);
