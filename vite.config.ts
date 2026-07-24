import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import soolouChat from "./api/soolou-chat";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.GEMINI_API_KEY ??= env.GEMINI_API_KEY;

  return {
    plugins: [
      react(),
      {
        name: "soolou-chat-local-api",
        configureServer(server) {
          server.middlewares.use("/api/soolou-chat", async (request, response) => {
            const chunks: Uint8Array[] = [];

            for await (const chunk of request) {
              chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            }

            const body = chunks.length ? Buffer.concat(chunks) : undefined;
            const apiResponse = await soolouChat.fetch(new Request("http://localhost/api/soolou-chat", {
              method: request.method,
              headers: request.headers as HeadersInit,
              body,
            }));

            response.statusCode = apiResponse.status;
            apiResponse.headers.forEach((value, name) => response.setHeader(name, value));
            response.end(Buffer.from(await apiResponse.arrayBuffer()));
          });
        },
      },
    ],
  };
});
