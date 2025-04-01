import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Globalcontext from "./context/Globalcontext.jsx";

createRoot(document.getElementById("root")).render(
  <Globalcontext>
    <App />
  </Globalcontext>
);
