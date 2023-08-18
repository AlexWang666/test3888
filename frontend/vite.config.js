import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import {api_ip_address, api_port} from "../deployment/local_deployment_config.json";
import { api_ip_address, api_port } from "../deployment/deployment_config.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    manifest: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        // target: "http://localhost:5000/",
        target: "http://".concat(api_ip_address, ":", api_port, "/"),
        //target: "http://127.0.0.1:5000/",
        // target: "http://23.23.197.126:5000/",

        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },

    watch: {
      usePolling: true,
    },
  },
  // watch: {
  //   usePolling: true,
  // },
});
