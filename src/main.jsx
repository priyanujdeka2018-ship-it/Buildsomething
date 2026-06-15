import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { installStorageShim } from "./storageShim";
import CareerOS from "./CareerOS.jsx";

installStorageShim();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CareerOS />
  </React.StrictMode>
);
