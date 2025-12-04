// fitflow-hub/frontend/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// If you use Tailwind via CDN in index.html, no need to import CSS here
// If you later add custom CSS or Tailwind build pipeline, import it here instead

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
