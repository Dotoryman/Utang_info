import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";
import { SiteFooter } from "../components/site/SiteFooter";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <Home />
    <SiteFooter />
  </StrictMode>,
);
