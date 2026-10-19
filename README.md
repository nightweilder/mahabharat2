# Mahabharata Atlas

A website with a Node.js backend and a three.js front end.

## Run it
1. Install Node.js (version 16 or newer).
2. In this folder run:  node server.js
3. Open http://localhost:3000

No packages to install. three.js is included in public/three.min.js, so it also works offline.

## Files
- server.js        backend: serves the pages and a JSON API
- data.js          all the content (58 characters, weapons, 18 parvas, war, writer's toolkit)
- public/index.html, style.css   page and design
- public/app.js    front end: 3D portraits, family tree, tabs, search, detail window
- public/layout.js places every person on the horizontal family tree

## API
/api/characters, /api/characters/:id (with parents, spouses, children, siblings),
/api/weapons, /api/story, /api/warfare, /api/writer, /api/search?q=word

## Add a character
Add one line to data.js: P('id', 'Name', 'house', 'role', 'about', 'fate', L(...look...), { p: [parents], lp: 'layout parent' }).
