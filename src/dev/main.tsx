import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");
if (!root) {
    throw new Error("Root element #root was not found in index.html.");
}

createRoot(root).render(
    <StrictMode>
        <p>Find My Way dev harness</p>
    </StrictMode>
);
