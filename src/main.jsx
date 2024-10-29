import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import appStore from "./store/store.js";
// import { theme } from "./theme.js";
// import { ChakraProvider } from "@chakra-ui/react";

createRoot(document.getElementById("root")).render(
  <Provider store={appStore}>
    <App />
  </Provider>,
);