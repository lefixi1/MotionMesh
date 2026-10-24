import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ScrollToTop from "./components/ScrollToTop.tsx";

const CLIENT_ID =
  "320586673006-3bosb9mr30smg22f3bprpsu8o8b5no16.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
