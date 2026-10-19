// server.js - the backend. Plain Node.js, no packages needed.
// Run:  node server.js     then open  http://localhost:3000

var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var D = require('./data');

var PORT = process.env.PORT || 3000;
var PUBLIC = path.join(__dirname, 'public');
var TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};

function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
  res.end(JSON.stringify(obj));
}

function relatives(id) {
  var me = null, i;
  for (i = 0; i < D.characters.length; i++) if (D.characters[i].id === id) me = D.characters[i];
  if (!me) return null;
  var out = { parents: [], spouses: [], children: [], siblings: [] };
  D.characters.forEach(function (c) {
    if (me.p && me.p.indexOf(c.id) >= 0) out.parents.push(c.id);
    if (c.p && c.p.indexOf(id) >= 0) out.children.push(c.id);
    if (c.so === id || me.so === c.id || (me.so && c.so === me.so && c.id !== id)) out.spouses.push(c.id);
    if (c.id !== id && me.p && c.p && c.p.some(function (x) { return me.p.indexOf(x) >= 0; })) out.siblings.push(c.id);
  });
  return { character: me, relatives: out };
}

function search(q) {
  q = (q || '').toLowerCase().trim();
  var res = [];
  if (q.length < 2) return res;
  D.characters.forEach(function (c) {
    if ((c.n + ' ' + c.r + ' ' + c.b).toLowerCase().indexOf(q) >= 0) res.push({ type: 'character', id: c.id, name: c.n, note: c.r });
  });
  D.weapons.forEach(function (w) {
    if ((w.n + ' ' + w.d + ' ' + w.o).toLowerCase().indexOf(q) >= 0) res.push({ type: 'weapon', id: w.id, name: w.n, note: w.t });
  });
  D.story.parvas.forEach(function (p) {
    if ((p.name + ' ' + p.s).toLowerCase().indexOf(q) >= 0) res.push({ type: 'parva', id: String(p.n), name: p.name, note: 'Parva ' + p.n });
  });
  return res.slice(0, 12);
}

function serveStatic(res, pathname) {
  if (pathname === '/') pathname = '/index.html';
  var file = path.normalize(path.join(PUBLIC, pathname));
  if (file.indexOf(PUBLIC) !== 0) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, function (err, data) {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

var server = http.createServer(function (req, res) {
  var u = url.parse(req.url, true);
  var p = u.pathname;

  if (p === '/api/health') return sendJson(res, 200, { ok: true });
  if (p === '/api/characters') return sendJson(res, 200, D.characters);
  if (p.indexOf('/api/characters/') === 0) {
    var found = relatives(decodeURIComponent(p.slice(16)));
    return found ? sendJson(res, 200, found) : sendJson(res, 404, { error: 'No such character' });
  }
  if (p === '/api/weapons') return sendJson(res, 200, D.weapons);
  if (p === '/api/story') return sendJson(res, 200, D.story);
  if (p === '/api/warfare') return sendJson(res, 200, D.warfare);
  if (p === '/api/writer') return sendJson(res, 200, D.writer);
  if (p === '/api/search') return sendJson(res, 200, search(u.query.q));
  if (p.indexOf('/api/') === 0) return sendJson(res, 404, { error: 'Unknown API route' });

  serveStatic(res, p);
});

server.listen(PORT, function () {
  console.log('Mahabharata site running at http://localhost:' + PORT);
});
