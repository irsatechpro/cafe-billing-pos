import fs from "fs";
import path from "path";

function readData(filename, fallback) {
  try {
    const fullPath = path.join(process.cwd(), "src/data", filename);
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, "utf8"));
    }
  } catch (e) {
    console.warn("Could not read " + filename, e);
  }
  return fallback;
}

let users = readData("users_store.json", []);
let cafes = readData("cafes_store.json", []);
let menuStore = readData("menu_store.json", { categories: [], items: [] });

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, \x60http://\x24{req.headers.host || "localhost"}\x60);
  const pathname = url.pathname;

  // 1. AUTH: POST /api/auth/login
  if (pathname === "/api/auth/login" && req.method === "POST") {
    const { email, password } = req.body || {};
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPass);
    if (!matchedUser) {
      return res.status(401).json({ error: "Invalid email or password. Please check your credentials." });
    }

    const userCafe = cafes.find(c => c.owner_id === matchedUser.id || c.id === matchedUser.cafe_id || c.owner_email?.toLowerCase() === cleanEmail) || {
      id: matchedUser.cafe_id || "cafe_mub1covl_9uws",
      slug: "trio-bean",
      name: "Trio Bean",
      theme: "coffee"
    };

    const safeUser = {
      id: matchedUser.id,
      email: matchedUser.email,
      name: matchedUser.name,
      role: matchedUser.role || "ADMIN",
      cafe_id: matchedUser.cafe_id
    };

    return res.status(200).json({ user: safeUser, cafe: userCafe });
  }

  // 2. AUTH: POST /api/auth/register
  if (pathname === "/api/auth/register" && req.method === "POST") {
    const { id, cafe_id, email, password, name, cafeName } = req.body || {};
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();
    const cleanCafe = (cafeName || "").trim() || \x60\x24{cleanEmail}'s Cafe\x60;
    const cleanName = (name || "").trim() || cleanCafe;

    if (!cleanEmail) return res.status(400).json({ error: "Please enter an email or username." });
    if (cleanPass.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters long." });

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ error: \x60The account "\x24{cleanEmail}" is already registered. Please sign in.\x60 });
    }

    const userId = (id && String(id).trim()) || ("usr_" + Date.now().toString(36));
    const cafeId = (cafe_id && String(cafe_id).trim()) || ("cafe_" + Date.now().toString(36));

    let baseSlug = cleanCafe.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || \x60cafe-\x24{Date.now()}\x60;
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (cafes.some(c => c.slug === uniqueSlug)) {
      uniqueSlug = \x60\x24{baseSlug}-\x24{counter++}\x60;
    }

    const newCafe = {
      id: cafeId,
      slug: uniqueSlug,
      name: cleanCafe,
      tagline: "Fresh • Tasty • Made Daily",
      logo_url: "",
      theme: "coffee",
      currency: "₹",
      owner_id: userId,
      owner_email: cleanEmail,
      created_at: new Date().toISOString()
    };
    cafes.push(newCafe);

    const newUser = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      password: cleanPass,
      role: "ADMIN",
      cafe_id: cafeId,
      created_at: new Date().toISOString()
    };
    users.push(newUser);

    // Seed starter menu for new cafe
    const cat1Id = \x60cat_\x24{cafeId}_bev\x60;
    const cat2Id = \x60cat_\x24{cafeId}_bites\x60;
    const cat3Id = \x60cat_\x24{cafeId}_sweet\x60;

    menuStore.categories.push(
      { id: cat1Id, cafe_id: cafeId, name: "Specialty Brews", description: "Freshly brewed coffees & coolers", display_order: 1, is_active: true },
      { id: cat2Id, cafe_id: cafeId, name: "Artisan Bites", description: "Crispy snacks & warm sandwiches", display_order: 2, is_active: true },
      { id: cat3Id, cafe_id: cafeId, name: "Desserts & Bakes", description: "Freshly made sweet treats", display_order: 3, is_active: true }
    );

    menuStore.items.push(
      { id: \x60item_\x24{cafeId}_1\x60, category_id: cat1Id, cafe_id: cafeId, name: \x60\x24{cleanCafe} Signature Coffee\x60, description: "Our house specialty freshly roasted espresso brew", price: 45, image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80", is_available: true, display_order: 1 },
      { id: \x60item_\x24{cafeId}_2\x60, category_id: cat1Id, cafe_id: cafeId, name: "Cardamom Spiced Tea", description: "Hot fragrant milk tea infused with green cardamom", price: 25, image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80", is_available: true, display_order: 2 },
      { id: \x60item_\x24{cafeId}_3\x60, category_id: cat2Id, cafe_id: cafeId, name: "Crispy Golden Fries", description: "Salted crunchy potato fries with house mayo dip", price: 55, image_url: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80", is_available: true, display_order: 1 },
      { id: \x60item_\x24{cafeId}_4\x60, category_id: cat2Id, cafe_id: cafeId, name: "Grilled Cheese Sandwich", description: "Toasted buttery bread stuffed with melted cheese and herbs", price: 89, image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80", is_available: true, display_order: 2 },
      { id: \x60item_\x24{cafeId}_5\x60, category_id: cat3Id, cafe_id: cafeId, name: "Warm Belgian Chocolate Croissant", description: "Flaky pastry filled with melted dark chocolate ganache", price: 69, image_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80", is_available: true, display_order: 1 }
    );

    const safeUser = { id: userId, email: cleanEmail, name: cleanName, role: "ADMIN", cafe_id: cafeId };
    return res.status(200).json({ user: safeUser, cafe: newCafe });
  }

  // 3. GET /api/users
  if (pathname === "/api/users" && req.method === "GET") {
    const safeUsers = users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, cafe_id: u.cafe_id }));
    return res.status(200).json(safeUsers);
  }

  // 4. GET /api/cafes
  if (pathname === "/api/cafes" && req.method === "GET") {
    return res.status(200).json(cafes);
  }

  // 5. GET /api/cafes/:id_or_slug
  const cafeMatch = pathname.match(/^\/api\/cafes\/([^/]+)\x24/);
  if (cafeMatch && req.method === "GET") {
    const idOrSlug = decodeURIComponent(cafeMatch[1]);
    const found = cafes.find(c => c.id === idOrSlug || c.slug === idOrSlug);
    if (found) return res.status(200).json(found);
    return res.status(404).json({ error: "Cafe not found" });
  }

  // 6. PUT /api/cafes/:id
  if (cafeMatch && req.method === "PUT") {
    const cafeId = decodeURIComponent(cafeMatch[1]);
    const updates = req.body || {};
    const idx = cafes.findIndex(c => c.id === cafeId);
    if (idx !== -1) {
      cafes[idx] = { ...cafes[idx], ...updates, updated_at: new Date().toISOString() };
      return res.status(200).json(cafes[idx]);
    }
    cafes.push(updates);
    return res.status(200).json(updates);
  }

  // 7. GET /api/menu?cafe=<slug_or_id>
  if (pathname === "/api/menu" && req.method === "GET") {
    const cafeQuery = url.searchParams.get("cafe") || "trio-bean";
    const targetCafe = cafes.find(c => c.id === cafeQuery || c.slug === cafeQuery);
    const targetCafeId = targetCafe ? targetCafe.id : cafeQuery;
    const isTrioBean = targetCafeId === "cafe-default-001" || targetCafeId === "cafe_mub1covl_9uws" || (targetCafe && targetCafe.slug === "trio-bean") || cafeQuery === "trio-bean";

    const filteredCategories = menuStore.categories.filter(c => {
      if (isTrioBean) return c.cafe_id === "cafe-default-001" || c.cafe_id === "cafe_mub1covl_9uws" || !c.cafe_id;
      return c.cafe_id === targetCafeId || (targetCafe && (c.cafe_id === targetCafe.slug || c.cafe_id === targetCafe.id));
    });

    const filteredItems = menuStore.items.filter(i => {
      if (isTrioBean) return i.cafe_id === "cafe-default-001" || i.cafe_id === "cafe_mub1covl_9uws" || !i.cafe_id;
      return i.cafe_id === targetCafeId || (targetCafe && (i.cafe_id === targetCafe.slug || i.cafe_id === targetCafe.id));
    });

    return res.status(200).json({ categories: filteredCategories, items: filteredItems });
  }

  // 8. POST /api/menu/categories
  if (pathname === "/api/menu/categories" && req.method === "POST") {
    const newCat = req.body || {};
    const created = {
      id: newCat.id || ("cat_" + Date.now().toString(36)),
      name: (newCat.name || "General").trim(),
      display_order: newCat.display_order || (menuStore.categories.length + 1),
      is_active: true,
      cafe_id: newCat.cafe_id,
      created_at: new Date().toISOString()
    };
    menuStore.categories.push(created);
    return res.status(200).json(created);
  }

  // 9. POST /api/menu/items
  if (pathname === "/api/menu/items" && req.method === "POST") {
    const newItem = req.body || {};
    const created = {
      id: "m_" + Date.now(),
      ...newItem,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    menuStore.items.push(created);
    return res.status(200).json(created);
  }

  // 10. PUT or DELETE /api/menu/items/:id
  const itemMatch = pathname.match(/^\/api\/menu\/items\/([^/]+)\x24/);
  if (itemMatch && req.method === "PUT") {
    const itemId = decodeURIComponent(itemMatch[1]);
    const updates = req.body || {};
    const idx = menuStore.items.findIndex(i => String(i.id) === String(itemId));
    if (idx !== -1) {
      menuStore.items[idx] = { ...menuStore.items[idx], ...updates, updated_at: new Date().toISOString() };
      return res.status(200).json(menuStore.items[idx]);
    }
    return res.status(404).json({ error: "Item not found" });
  }

  if (itemMatch && req.method === "DELETE") {
    const itemId = decodeURIComponent(itemMatch[1]);
    menuStore.items = menuStore.items.filter(i => String(i.id) !== String(itemId));
    return res.status(200).json({ success: true });
  }

  // 11. POST /api/upload
  if (pathname === "/api/upload" && req.method === "POST") {
    const { base64Data } = req.body || {};
    return res.status(200).json({ url: base64Data || "" });
  }

  return res.status(404).json({ error: "API endpoint not found" });
}
