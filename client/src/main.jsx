import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import appStore from "./store/store.js";
import { theme } from "./theme.js";
// import { Provider as ChakraProvider } from "./components/ui/provider";
import { ChakraProvider } from "@chakra-ui/react";

createRoot(document.getElementById("root")).render(
  <ChakraProvider theme={theme}>
    <Provider store={appStore}>
      <App />
    </Provider>
  </ChakraProvider>,
);
