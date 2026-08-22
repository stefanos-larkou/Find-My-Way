import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        react(),
        dts({
            tsconfigPath: "tsconfig.app.json",
            include: ["src"],
            exclude: ["src/dev", "**/*.test.ts", "**/*.test.tsx", "src/test-setup.ts"]
        })

    ],
    build: {
        copyPublicDir: false,
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: "find-my-way"
        },
        rollupOptions: {
            external: [/^react($|\/)/, /^react-dom($|\/)/, /^@mui\//, /^@emotion\//, /^@stefanos-larkou\//]
        }
    },
    test: {
        environment: "jsdom",
        setupFiles: "./src/test-setup.ts"
    }
});
