import { createServer } from "http";
import { readFile } from "fs/promises";
import { join, extname, normalize, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const DEFAULT_FILE = "index.html";

const server = createServer(async (req, res) => {
  try {
    let path = req.url === "/" ? DEFAULT_FILE : req.url;

    path = path.split("?")[0];

    const safePath = normalize(path).replace(/^(\.\.[\/\\])+/, "");

    const filePath = join(__dirname, safePath);

    const rootDir = resolve(__dirname);
    const resolvedPath = resolve(filePath);

    if (!resolvedPath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const ext = extname(filePath);

    const data = await readFile(filePath);

    res.setHeader("Content-Type", MIME_TYPES[ext] || "text/plain");
    res.writeHead(200);
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404);
      res.end("File not found");
      return;
    }

    console.error(error);
    res.writeHead(500);
    res.end("Internal server error");
  }
});

server.listen(PORT, () => {
  console.log(`Static file server running at http://localhost:${PORT}`);
});
