import { extendTheme } from "@chakra-ui/react";
//import { createSystem, defaultConfig } from "@chakra-ui/react";

export const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});
// export const system = createSystem(defaultConfig, {
//   theme: {
//     tokens: {
//       fonts: {
//         heading: { value: `'Figtree', sans-serif` },
//         body: { value: `'Figtree', sans-serif` },
//       },
//       config: {
//         initialColorMode: { value: `dark` },
//         useSystemColorMode: { value: false },
//       },
//     },
//   },
// });
