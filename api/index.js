import fs from "fs";
import path from "path";

function readData(filename, fallback) {
  try {
    const fullPath = path.join(process.cwd(), "src/data", filename);
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, "utf8"));
    }
  } catch (e) {
    // ignore
  }
  return fallback;
}

const DEFAULT_USERS = [
  {
    id: "usr_mub1covl_5dri",
    email: "triobean3@gmail.com",
    name: "Trio Bean Admin",
    password: "trio@2205",
    role: "ADMIN",
    cafe_id: "cafe_mub1covl_9uws",
    created_at: "2026-09-21T09:21:19.860Z"
  }
];

const DEFAULT_CAFES = [
  {
    id: "cafe_mub1covl_9uws",
    slug: "trio-bean",
    name: "Trio Bean",
    tagline: "Fresh • Tasty • Made Daily",
    logo_url: "https://img.magnific.com/premium-vector/logo-featuring-word-cafe-various-typography-styles-trendy-cafe-brand-experiment-with-different-typography-styles-minimalist-cafe-logo_538213-64008.jpg?semt=ais_hybrid&w=740&q=80",
    theme: "coffee",
    currency: "₹",
    owner_id: "usr_mub1covl_5dri",
    owner_email: "triobean3@gmail.com",
    created_at: "2026-09-21T09:21:19.859Z",
    updated_at: "2026-09-21T11:23:43.824Z"
  }
];

let users = readData("users_store.json", DEFAULT_USERS);
if (!users || users.length === 0) users = [...DEFAULT_USERS];

let cafes = readData("cafes_store.json", DEFAULT_CAFES);
if (!cafes || cafes.length === 0) cafes = [...DEFAULT_CAFES];

let menuStore = readData("menu_store.json", { categories: [], items: [] });

async function parseBody(req) {
  if (req.body) {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch (e) {
        return {};
      }
    }
    return req.body;
  }
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

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

  const rawUrl = req.url || "/";
  const pathname = rawUrl.split("?")[0];
  const searchParams = new URLSearchParams(rawUrl.includes("?") ? rawUrl.split("?")[1] : "");

  const body = (req.method === "POST" || req.method === "PUT") ? await parseBody(req) : {};

  // 1. AUTH: POST /api/auth/login
  if (pathname.endsWith("/api/auth/login") || pathname === "/api/auth/login") {
    if (req.method === "POST") {
      const { email, password } = body;
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanPass = (password || "").trim();

      const matchedUser = users.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPass
      );
      if (!matchedUser) {
        return res.status(401).json({ error: "Invalid email or password. Please check your credentials." });
      }

      const userCafe = cafes.find(
        (c) =>
          c.owner_id === matchedUser.id ||
          c.id === matchedUser.cafe_id ||
          c.owner_email?.toLowerCase() === cleanEmail
      ) || {
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
  }

  // 2. AUTH: POST /api/auth/register
  if (pathname.endsWith("/api/auth/register") || pathname === "/api/auth/register") {
    if (req.method === "POST") {
      const { id, cafe_id, email, password, name, cafeName } = body;
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanPass = (password || "").trim();
      const cleanCafe = (cafeName || "").trim() || `${cleanEmail}'s Cafe`;
      const cleanName = (name || "").trim() || cleanCafe;

      if (!cleanEmail) return res.status(400).json({ error: "Please enter an email or username." });
      if (cleanPass.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters long." });

      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return res.status(400).json({ error: `The account "${cleanEmail}" is already registered. Please sign in.` });
      }

      const userId = (id && String(id).trim()) || ("usr_" + Date.now().toString(36));
      const cafeId = (cafe_id && String(cafe_id).trim()) || ("cafe_" + Date.now().toString(36));

      let baseSlug =
        cleanCafe
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `cafe-${Date.now()}`;
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (cafes.some((c) => c.slug === uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter++}`;
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

      const cat1Id = `cat_${cafeId}_bev`;
      const cat2Id = `cat_${cafeId}_bites`;
      const cat3Id = `cat_${cafeId}_sweet`;

      menuStore.categories.push(
        { id: cat1Id, cafe_id: cafeId, name: "Specialty Brews", description: "Freshly brewed coffees & coolers", display_order: 1, is_active: true },
        { id: cat2Id, cafe_id: cafeId, name: "Artisan Bites", description: "Crispy snacks & warm sandwiches", display_order: 2, is_active: true },
        { id: cat3Id, cafe_id: cafeId, name: "Desserts & Bakes", description: "Freshly made sweet treats", display_order: 3, is_active: true }
      );

      menuStore.items.push(
        { id: `item_${cafeId}_1`, category_id: cat1Id, cafe_id: cafeId, name: `${cleanCafe} Signature Coffee`, description: "House specialty freshly roasted espresso brew", price: 45, image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80", is_available: true, display_order: 1 },
        { id: `item_${cafeId}_2`, category_id: cat1Id, cafe_id: cafeId, name: "Cardamom Spiced Tea", description: "Hot fragrant milk tea infused with green cardamom", price: 25, image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80", is_available: true, display_order: 2 },
        { id: `item_${cafeId}_3`, category_id: cat2Id, cafe_id: cafeId, name: "Crispy Golden Fries", description: "Salted crunchy potato fries with house dip", price: 55, image_url: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80", is_available: true, display_order: 1 }
      );

      const safeUser = { id: userId, email: cleanEmail, name: cleanName, role: "ADMIN", cafe_id: cafeId };
      return res.status(200).json({ user: safeUser, cafe: newCafe });
    }
  }

  // 3. GET /api/users
  if (pathname.endsWith("/api/users") || pathname === "/api/users") {
    if (req.method === "GET") {
      const safeUsers = users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, cafe_id: u.cafe_id }));
      return res.status(200).json(safeUsers);
    }
  }

  // 4. GET /api/cafes
  if (pathname === "/api/cafes" || pathname.endsWith("/api/cafes")) {
    if (req.method === "GET") {
      return res.status(200).json(cafes);
    }
  }

  // 5. GET /api/cafes/:id_or_slug
  const cafeMatch = pathname.match(/\/api\/cafes\/([^/]+)$/);
  if (cafeMatch && req.method === "GET") {
    const idOrSlug = decodeURIComponent(cafeMatch[1]);
    const found = cafes.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
    if (found) return res.status(200).json(found);
    return res.status(404).json({ error: "Cafe not found" });
  }

  // 6. PUT /api/cafes/:id
  if (cafeMatch && req.method === "PUT") {
    const cafeId = decodeURIComponent(cafeMatch[1]);
    const updates = body || {};
    const idx = cafes.findIndex((c) => c.id === cafeId);
    if (idx !== -1) {
      cafes[idx] = { ...cafes[idx], ...updates, updated_at: new Date().toISOString() };
      return res.status(200).json(cafes[idx]);
    }
    cafes.push(updates);
    return res.status(200).json(updates);
  }

  // 7. GET /api/menu?cafe=<slug_or_id>
  if (pathname.endsWith("/api/menu") || pathname === "/api/menu") {
    if (req.method === "GET") {
      const cafeQuery = searchParams.get("cafe") || "trio-bean";
      const targetCafe = cafes.find((c) => c.id === cafeQuery || c.slug === cafeQuery);
      const targetCafeId = targetCafe ? targetCafe.id : cafeQuery;
      const isTrioBean =
        targetCafeId === "cafe-default-001" ||
        targetCafeId === "cafe_mub1covl_9uws" ||
        (targetCafe && targetCafe.slug === "trio-bean") ||
        cafeQuery === "trio-bean";

      const filteredCategories = (menuStore.categories || []).filter((c) => {
        if (isTrioBean) return c.cafe_id === "cafe-default-001" || c.cafe_id === "cafe_mub1covl_9uws" || !c.cafe_id;
        return c.cafe_id === targetCafeId || (targetCafe && (c.cafe_id === targetCafe.slug || c.cafe_id === targetCafe.id));
      });

      const filteredItems = (menuStore.items || []).filter((i) => {
        if (isTrioBean) return i.cafe_id === "cafe-default-001" || i.cafe_id === "cafe_mub1covl_9uws" || !i.cafe_id;
        return i.cafe_id === targetCafeId || (targetCafe && (i.cafe_id === targetCafe.slug || i.cafe_id === targetCafe.id));
      });

      return res.status(200).json({ categories: filteredCategories, items: filteredItems });
    }
  }

  // 8. POST /api/upload
  if (pathname.endsWith("/api/upload") || pathname === "/api/upload") {
    if (req.method === "POST") {
      const { base64Data } = body;
      return res.status(200).json({ url: base64Data || "" });
    }
  }

  return res.status(200).json({ status: "ok", message: "Trio Bean API Active" });
}
