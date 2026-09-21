import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function menuApiPlugin() {
  const storePath = path.resolve(__dirname, 'src/data/menu_store.json');
  const cafesPath = path.resolve(__dirname, 'src/data/cafes_store.json');
  const usersPath = path.resolve(__dirname, 'src/data/users_store.json');
  const uploadsDir = path.resolve(__dirname, 'public/uploads');
  const sseClients = new Set();

  function broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(payload);
      } catch (e) {
        sseClients.delete(client);
      }
    }
  }

  function readStore() {
    try {
      if (fs.existsSync(storePath)) {
        return JSON.parse(fs.readFileSync(storePath, 'utf8'));
      }
    } catch (e) {}
    return { categories: [], items: [] };
  }

  function writeStore(data) {
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf8');
    broadcast('menu_updated', data);
  }

  function readCafes() {
    try {
      if (fs.existsSync(cafesPath)) {
        return JSON.parse(fs.readFileSync(cafesPath, 'utf8'));
      }
    } catch (e) {}
    return [];
  }

  function writeCafes(data) {
    fs.writeFileSync(cafesPath, JSON.stringify(data, null, 2), 'utf8');
    broadcast('cafe_updated', data);
  }

  function readUsers() {
    try {
      if (fs.existsSync(usersPath)) {
        return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      }
    } catch (e) {}
    return [];
  }

  function writeUsers(data) {
    fs.writeFileSync(usersPath, JSON.stringify(data, null, 2), 'utf8');
  }

  return {
    name: 'menu-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const host = req.headers.host || 'localhost:3002';
        const parsedUrl = new URL(req.url, `http://${host}`);
        const pathname = parsedUrl.pathname;

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        // 1. SSE Stream for universal real-time live sync across phones & PCs
        if (pathname === '/api/menu/stream' && req.method === 'GET') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          });
          res.write('retry: 2000\n\n');
          sseClients.add(res);
          req.on('close', () => sseClients.delete(res));
          return;
        }

        // AUTH: POST /api/auth/register
        if (pathname === '/api/auth/register' && req.method === 'POST') {
          let body = '';
          req.on('data', c => { body += c; });
          req.on('end', () => {
            try {
              const parsedBody = JSON.parse(body);
              const { id, cafe_id, email, password, name, cafeName } = parsedBody;
              const cleanEmail = (email || '').trim().toLowerCase();
              const cleanPass = (password || '').trim();
              const cleanCafe = (cafeName || '').trim() || `${cleanEmail}'s Cafe`;
              const cleanName = (name || '').trim() || cleanCafe;

              if (!cleanEmail) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Please enter an email or username.' }));
              }
              if (cleanPass.length < 6) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Password must be at least 6 characters long.' }));
              }

              const users = readUsers();
              if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: `The account "${cleanEmail}" is already registered. Please sign in.` }));
              }

              const userId = (parsedBody.id && String(parsedBody.id).trim()) || ('usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6));
              const cafeId = (parsedBody.cafe_id && String(parsedBody.cafe_id).trim()) || (crypto.randomUUID ? crypto.randomUUID() : ('cafe_' + Date.now().toString(36)));

              // Guaranteed unique cafe slug
              const cafes = readCafes();
              let baseSlug = cleanCafe.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cafe-${Date.now()}`;
              let uniqueSlug = baseSlug;
              let counter = 1;
              while (cafes.some(c => c.slug === uniqueSlug)) {
                uniqueSlug = `${baseSlug}-${counter++}`;
              }

              const newCafe = {
                id: cafeId,
                slug: uniqueSlug,
                name: cleanCafe,
                tagline: 'Fresh • Tasty • Made Daily',
                logo_url: '',
                theme: 'coffee',
                currency: '₹',
                owner_id: userId,
                owner_email: cleanEmail,
                created_at: new Date().toISOString()
              };
              cafes.push(newCafe);
              writeCafes(cafes);

              // Save User
              const newUser = {
                id: userId,
                email: cleanEmail,
                name: cleanName,
                password: cleanPass,
                role: 'ADMIN',
                cafe_id: cafeId,
                created_at: new Date().toISOString()
              };
              users.push(newUser);
              writeUsers(users);

              // Auto-seed starter menu items for the new cafe so client demo shows active menu immediately
              const store = readStore();
              const cat1Id = `cat_${cafeId}_bev`;
              const cat2Id = `cat_${cafeId}_bites`;
              const cat3Id = `cat_${cafeId}_sweet`;

              const starterCats = [
                { id: cat1Id, cafe_id: cafeId, name: 'Specialty Brews', description: 'Freshly brewed coffees & coolers', display_order: 1, is_active: true },
                { id: cat2Id, cafe_id: cafeId, name: 'Artisan Bites', description: 'Crispy snacks & warm sandwiches', display_order: 2, is_active: true },
                { id: cat3Id, cafe_id: cafeId, name: 'Desserts & Bakes', description: 'Freshly made sweet treats', display_order: 3, is_active: true }
              ];

              const starterItems = [
                { id: `item_${cafeId}_1`, category_id: cat1Id, cafe_id: cafeId, name: `${cleanCafe} Signature Coffee`, description: 'Our house specialty freshly roasted espresso brew', price: 45, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', is_available: true, display_order: 1 },
                { id: `item_${cafeId}_2`, category_id: cat1Id, cafe_id: cafeId, name: 'Cardamom Spiced Tea', description: 'Hot fragrant milk tea infused with green cardamom', price: 25, image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', is_available: true, display_order: 2 },
                { id: `item_${cafeId}_3`, category_id: cat2Id, cafe_id: cafeId, name: 'Crispy Golden Fries', description: 'Salted crunchy potato fries with house mayo dip', price: 55, image_url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80', is_available: true, display_order: 1 },
                { id: `item_${cafeId}_4`, category_id: cat2Id, cafe_id: cafeId, name: 'Grilled Cheese Sandwich', description: 'Toasted buttery bread stuffed with melted cheese and herbs', price: 89, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80', is_available: true, display_order: 2 },
                { id: `item_${cafeId}_5`, category_id: cat3Id, cafe_id: cafeId, name: 'Warm Belgian Chocolate Croissant', description: 'Flaky pastry filled with melted dark chocolate ganache', price: 69, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80', is_available: true, display_order: 1 }
              ];

              store.categories.push(...starterCats);
              store.items.push(...starterItems);
              writeStore(store);

              const safeUser = { id: userId, email: cleanEmail, name: cleanName, role: 'ADMIN', cafe_id: cafeId };
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ user: safeUser, cafe: newCafe }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // AUTH: POST /api/auth/login
        if (pathname === '/api/auth/login' && req.method === 'POST') {
          let body = '';
          req.on('data', c => { body += c; });
          req.on('end', () => {
            try {
              const { email, password } = JSON.parse(body);
              const cleanEmail = (email || '').trim().toLowerCase();
              const cleanPass = (password || '').trim();

              const users = readUsers();
              const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPass);

              if (!matchedUser) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Invalid email or password. Please check your credentials.' }));
              }

              const cafes = readCafes();
              const userCafe = cafes.find(c => c.owner_id === matchedUser.id || c.id === matchedUser.cafe_id || c.owner_email?.toLowerCase() === cleanEmail) || {
                id: matchedUser.cafe_id || 'cafe-default-001',
                slug: 'trio-bean',
                name: 'Trio Bean Café',
                theme: 'coffee'
              };

              const safeUser = {
                id: matchedUser.id,
                email: matchedUser.email,
                name: matchedUser.name,
                role: matchedUser.role || 'ADMIN',
                cafe_id: matchedUser.cafe_id
              };

              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ user: safeUser, cafe: userCafe }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // AUTH: GET /api/users
        if (pathname === '/api/users' && req.method === 'GET') {
          const users = readUsers();
          const safeUsers = users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, cafe_id: u.cafe_id }));
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(safeUsers));
        }

        // 2. GET /api/cafes (List all registered cafe tenants)
        if (pathname === '/api/cafes' && req.method === 'GET') {
          const cafes = readCafes();
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(cafes));
        }

        // 3. GET /api/cafes/:id_or_slug
        const cafeMatch = pathname.match(/^\/api\/cafes\/([^/]+)$/);
        if (cafeMatch && req.method === 'GET') {
          const idOrSlug = decodeURIComponent(cafeMatch[1]);
          const cafes = readCafes();
          const found = cafes.find(c => c.id === idOrSlug || c.slug === idOrSlug);
          if (found) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(found));
          }
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Cafe not found' }));
        }

        // 4. POST /api/cafes (Create new cafe tenant)
        if (pathname === '/api/cafes' && req.method === 'POST') {
          let body = '';
          req.on('data', c => { body += c; });
          req.on('end', () => {
            try {
              const newCafe = JSON.parse(body);
              const cafes = readCafes();

              // Ensure guaranteed unique slug for every cafe
              let baseSlug = (newCafe.slug || newCafe.name || 'cafe')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || `cafe-${Date.now()}`;
              let uniqueSlug = baseSlug;
              let counter = 1;
              while (cafes.some(c => c.slug === uniqueSlug)) {
                uniqueSlug = `${baseSlug}-${counter++}`;
              }
              newCafe.slug = uniqueSlug;
              newCafe.id = newCafe.id || `cafe-${Date.now().toString(36)}`;

              cafes.push(newCafe);
              writeCafes(cafes);

              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify(newCafe));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 5. PUT /api/cafes/:id (Update cafe settings/branding/theme)
        if (cafeMatch && req.method === 'PUT') {
          const cafeId = decodeURIComponent(cafeMatch[1]);
          let body = '';
          req.on('data', c => { body += c; });
          req.on('end', () => {
            try {
              const updates = JSON.parse(body);
              const cafes = readCafes();
              const idx = cafes.findIndex(c => c.id === cafeId);
              if (idx !== -1) {
                cafes[idx] = { ...cafes[idx], ...updates, updated_at: new Date().toISOString() };
                writeCafes(cafes);
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(cafes[idx]));
              } else {
                cafes.push(updates);
                writeCafes(cafes);
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(updates));
              }
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 6. GET /api/menu?cafe=<slug_or_id>
        if (pathname === '/api/menu' && req.method === 'GET') {
          const cafeQuery = parsedUrl.searchParams.get('cafe') || 'trio-bean';
          const store = readStore();

          const cafes = readCafes();
          const targetCafe = cafes.find(c => c.id === cafeQuery || c.slug === cafeQuery);
          const targetCafeId = targetCafe ? targetCafe.id : cafeQuery;
          const isTrioBean = targetCafeId === 'cafe-default-001' || (targetCafe && targetCafe.slug === 'trio-bean') || cafeQuery === 'trio-bean';

          const filteredCategories = store.categories.filter(c => {
            if (isTrioBean) {
              return c.cafe_id === 'cafe-default-001' || c.cafe_id === 'cafe_mub1covl_9uws' || !c.cafe_id;
            }
            return c.cafe_id === targetCafeId || (targetCafe && (c.cafe_id === targetCafe.slug || c.cafe_id === targetCafe.id));
          });

          const filteredItems = store.items.filter(i => {
            if (isTrioBean) {
              return i.cafe_id === 'cafe-default-001' || i.cafe_id === 'cafe_mub1covl_9uws' || !i.cafe_id;
            }
            return i.cafe_id === targetCafeId || (targetCafe && (i.cafe_id === targetCafe.slug || i.cafe_id === targetCafe.id));
          });

          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            categories: filteredCategories,
            items: filteredItems
          }));
        }

        // 3. POST /api/upload
        if (pathname === '/api/upload' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { filename, base64Data } = JSON.parse(body);
              if (!base64Data) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'No image data provided' }));
              }
              const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
              let ext = 'jpg';
              let buffer;
              if (matches) {
                ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                buffer = Buffer.from(matches[2], 'base64');
              } else {
                buffer = Buffer.from(base64Data, 'base64');
              }

              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }

              const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
              const filePath = path.join(uploadsDir, safeName);
              fs.writeFileSync(filePath, buffer);

              const publicUrl = `/uploads/${safeName}`;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ url: publicUrl }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 4. PUT /api/menu/items/:id
        const itemUpdateMatch = pathname.match(/^\/api\/menu\/items\/([^/]+)$/);
        if (itemUpdateMatch && req.method === 'PUT') {
          const itemId = decodeURIComponent(itemUpdateMatch[1]);
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const updates = JSON.parse(body);
              const store = readStore();
              const idx = store.items.findIndex(i => String(i.id) === String(itemId));
              if (idx !== -1) {
                store.items[idx] = {
                  ...store.items[idx],
                  ...updates,
                  updated_at: new Date().toISOString()
                };
                writeStore(store);
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(store.items[idx]));
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Item not found' }));
              }
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST /api/menu/categories
        if (pathname === '/api/menu/categories' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const newCat = JSON.parse(body);
              const store = readStore();
              const created = {
                id: newCat.id || ('cat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6)),
                name: (newCat.name || 'General').trim(),
                display_order: newCat.display_order || (store.categories.length + 1),
                is_active: true,
                cafe_id: newCat.cafe_id,
                created_at: new Date().toISOString()
              };
              store.categories.push(created);
              writeStore(store);
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify(created));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 5. POST /api/menu/items
        if (pathname === '/api/menu/items' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const newItem = JSON.parse(body);
              const store = readStore();

              // If new_category_name or category_name is passed and category_id is missing or NEW, auto-create category
              if ((!newItem.category_id || newItem.category_id === 'NEW' || newItem.category_id === '') && (newItem.new_category_name || newItem.category_name)) {
                const catName = (newItem.new_category_name || newItem.category_name).trim();
                let matchedCat = store.categories.find(c => c.cafe_id === newItem.cafe_id && c.name.toLowerCase() === catName.toLowerCase());
                if (!matchedCat) {
                  matchedCat = {
                    id: 'cat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
                    name: catName,
                    display_order: store.categories.length + 1,
                    is_active: true,
                    cafe_id: newItem.cafe_id,
                    created_at: new Date().toISOString()
                  };
                  store.categories.push(matchedCat);
                }
                newItem.category_id = matchedCat.id;
              }

              const created = {
                id: 'm_' + Date.now(),
                ...newItem,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              store.items.push(created);
              writeStore(store);
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify(created));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 6. DELETE /api/menu/items/:id
        if (itemUpdateMatch && req.method === 'DELETE') {
          const itemId = decodeURIComponent(itemUpdateMatch[1]);
          const store = readStore();
          store.items = store.items.filter(i => String(i.id) !== String(itemId));
          writeStore(store);
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: true }));
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), menuApiPlugin()],
  server: {
    port: 3002,
    host: '0.0.0.0', // Expose on all network interfaces for universal mobile scanning
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  }
})
