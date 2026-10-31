// Un faux lemondeaime.com pour les tests : il fait ce que fera la configuration Vercel de LEMONDEAIME.
// /atlas → /atlas/ ; /atlas/… est servi depuis ATLAS (une réécriture : les réponses d’ATLAS, redirections comprises, repassent telles quelles) ;
// le reste est une page de Le Monde AIME. Usage : ATLAS=http://localhost:8090 node tests/lemondeaime.mjs 8092
import http from "node:http";
const port = +(process.argv[2] || 8092), atlas = (process.env.ATLAS || "http://localhost:8090").replace(/\/$/, "");
const passe = ["content-type", "location", "cache-control", "access-control-allow-origin"];
http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname === "/atlas") { res.writeHead(308, { Location: "/atlas/" + u.search }); return res.end(); }
  if (u.pathname.startsWith("/atlas/")) {
    const r = await fetch(atlas + u.pathname.slice(6) + u.search, { redirect: "manual" }), h = {};
    for (const k of passe) if (r.headers.get(k)) h[k] = r.headers.get(k);
    res.writeHead(r.status, h); return res.end(Buffer.from(await r.arrayBuffer()));
  }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end("<!doctype html><html lang=\"fr\"><title>Le Monde AIME</title><p>Le Monde AIME (page de test : on est sorti d’ATLAS).</p></html>");
}).listen(port, () => console.log("prêt", port));
