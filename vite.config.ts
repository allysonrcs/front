import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [
            react(),
            svgr(),
            viteStaticCopy({
                targets: [
                    {
                        src: "web.config",
                        dest: ".",
                    },
                ],
            }),
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
            extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
        server: {
            host: "0.0.0.0",
            port: parseInt(env.PORT, 10) || 7000,
        },
        preview: {
            port: parseInt(env.PORT, 10) || 7000,
        },
        build: {
            outDir: "dist",
            sourcemap: false,
            minify: "esbuild",
            chunkSizeWarningLimit: 1000,
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ["react", "react-dom"],
                    },
                },
            },
        },
        esbuild: {
            loader: "tsx",
            include: /src\/.*\.[tj]sx?$/,
            exclude: /node_modules/,
        },
    };
});
