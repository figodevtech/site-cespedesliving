// Read-only HTTP fixture for frontend contract verification. Never writes to Supabase.
import http from "node:http";
http.createServer((request, response) => {
  response.setHeader("Content-Type", "application/json");
  if (request.url.startsWith("/api/public/imoveis?") || request.url === "/api/public/imoveis") response.end(JSON.stringify({ items: [], total: 0, page: 1, pageSize: 12 }));
  else { response.statusCode = 404; response.end(JSON.stringify({ error: "Not found" })); }
}).listen(3002, "127.0.0.1", () => console.log("Read-only empty ERP fixture: 3002"));
