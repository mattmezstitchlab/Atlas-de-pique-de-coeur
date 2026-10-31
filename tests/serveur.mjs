// Un serveur statique pour les tests : il applique vercel.json comme Vercel (cleanUrls, redirections, réécritures, 404.html).
// Usage : node tests/serveur.mjs [port]   (8090 par défaut), depuis la racine du dépôt.
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const racine = process.cwd(), port = +(process.argv[2] || 8090);
const v = JSON.parse(fs.readFileSync(path.join(racine, "vercel.json"), "utf8"));
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".json": "application/json; charset=utf-8", ".woff2": "font/woff2" };
const motif = s => new RegExp("^" + s.replace(/\./g, "\\.").replace(/:([a-z]+)/gi, "(?<$1>[^/]+)") + "$");
const fichier = p => { const f = path.join(racine, p); return f.startsWith(racine) && fs.existsSync(f) && fs.statSync(f).isFile() ? f : null; };
http.createServer((req, res) => {
  const u = new URL(req.url, "http://x"); let p = decodeURIComponent(u.pathname);
  for (const r of v.redirects ?? []) if (motif(r.source).test(p)) { res.writeHead(r.permanent ? 308 : 307, { Location: r.destination + u.search }); return res.end(); }
  if (v.cleanUrls && p.endsWith(".html")) { res.writeHead(308, { Location: p.replace(/(index)?\.html$/, "") + u.search }); return res.end(); }
  for (const r of v.rewrites ?? []) { const m = motif(r.source).exec(p); if (m) { p = r.destination; break; } }
  let f = fichier(p) || (v.cleanUrls && fichier(p + ".html")) || fichier(path.join(p, "index.html")), code = 200;
  if (!f) { f = path.join(racine, "404.html"); code = 404; }
  res.writeHead(code, { "content-type": types[path.extname(f)] ?? "application/octet-stream", "access-control-allow-origin": "*" });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log("prêt", port));
