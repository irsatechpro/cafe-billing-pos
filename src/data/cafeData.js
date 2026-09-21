export const CAFE_INFO = {
  name: "TRIO BEAN CAFÉ",
  tagline: "FRESH • TASTY • MADE DAILY",
  heroHeadline: "CRAFTED COFFEE.\nPREMIUM EXPERIENCE.",
  heroSubtitle: "Fresh coffee, delicious shakes, artisanal bites, and beautiful moments made daily.",
  address: "742 Evergreen Avenue, Arts District, Metropolis",
  phone: "+91 98765 43210",
  email: "hello@triobeancafe.com",
  currency: "₹",
  socials: {
    instagram: "https://instagram.com/triobeancafe",
    facebook: "https://facebook.com/triobeancafe",
    twitter: "https://twitter.com/triobeancafe",
  },
  openingHours: [
    { days: "Monday – Friday", hours: "08:00 AM – 10:30 PM" },
    { days: "Saturday – Sunday", hours: "08:00 AM – 11:30 PM" },
  ],
};

export const MENU_CATEGORIES = [
  { id: "all", label: "ALL MENU" },
  { id: "coffee", label: "COFFEE" },
  { id: "burgers", label: "SANDWICHES & BURGERS" },
  { id: "shakes", label: "SHAKES & SMOOTHIES" },
  { id: "juices", label: "FRESH JUICES" },
  { id: "mocktails", label: "MOCKTAILS" },
  { id: "snacks", label: "SNACKS" },
  { id: "desserts", label: "DESSERTS" },
];

export const MENU_ITEMS = [
  // COFFEE
  {
    id: "espresso",
    name: "Espresso",
    category: "coffee",
    price: 69,
    badge: "Classic 3D",
    description: "Rich concentrated shot of pure espresso extracted from freshly ground coffee beans.",
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "americano",
    name: "Americano",
    category: "coffee",
    price: 79,
    description: "Smooth espresso diluted with hot spring water for a clean, rich flavor profile.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    category: "coffee",
    price: 89,
    badge: "Bestseller",
    description: "Equal parts espresso, steamed milk, and thick velvety foam, dusted with cocoa.",
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "latte",
    name: "Latte",
    category: "coffee",
    price: 99,
    badge: "Popular",
    description: "Silky double shot espresso blended with steamed milk and delicate rosette latte art.",
    image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "mocha",
    name: "Mocha",
    category: "coffee",
    price: 109,
    description: "Decadent espresso combined with rich chocolate sauce and silky steamed milk.",
    image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "caramel-latte",
    name: "Caramel Latte",
    category: "coffee",
    price: 109,
    description: "Espresso and steamed milk infused with artisanal sweet caramel drizzle.",
    image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "hazelnut-latte",
    name: "Hazelnut Latte",
    category: "coffee",
    price: 109,
    description: "Signature espresso with velvety steamed milk infused with nutty roasted hazelnut.",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cold-coffee",
    name: "Cold Coffee",
    category: "coffee",
    price: 119,
    badge: "Chilled Favorite",
    description: "Creamy chilled coffee blended with vanilla ice cream and dark chocolate drizzle.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=800&auto=format&fit=crop",
  },

  // SANDWICHES & BURGERS
  {
    id: "veg-sandwich",
    name: "Veg Sandwich",
    category: "burgers",
    price: 99,
    description: "Fresh farm vegetables, cucumber, tomato, and green chutney layered in crisp bread.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cheese-sandwich",
    name: "Cheese Sandwich",
    category: "burgers",
    price: 119,
    description: "Gooey melted cheddar and mozzarella cheese toasted to golden perfection.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "grilled-sandwich",
    name: "Grilled Sandwich",
    category: "burgers",
    price: 129,
    badge: "Chef Special",
    description: "Triple layered buttered toast grilled crisp with seasoned veggies and spiced Mayo.",
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "paneer-sandwich",
    name: "Paneer Sandwich",
    category: "burgers",
    price: 139,
    description: "Marinated cottage cheese cubes tossed with bell peppers and house herb spice blend.",
    image: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "chicken-sandwich",
    name: "Chicken Sandwich",
    category: "burgers",
    price: 149,
    badge: "Non-Veg",
    description: "Tender shredded grilled chicken breast tossed in smoked pepper aioli and lettuce.",
    image: "https://images.unsplash.com/photo-1621800098777-a859e21df90e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "veg-burger",
    name: "Veg Burger",
    category: "burgers",
    price: 139,
    description: "Crispy herb potato veggie patty with fresh tomato, onion, lettuce and signature burger sauce.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "chicken-burger",
    name: "Chicken Burger",
    category: "burgers",
    price: 159,
    badge: "Non-Veg",
    description: "Juicy fried chicken fillet topped with melted cheese, gherkins and garlic mayo bun.",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop",
  },

  // SHAKES & SMOOTHIES
  {
    id: "chocolate-shake",
    name: "Chocolate Shake",
    category: "shakes",
    price: 129,
    badge: "Rich & Thick",
    description: "Creamy cocoa shake whipped with dark chocolate ice cream and Hershey's syrup.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "vanilla-shake",
    name: "Vanilla Shake",
    category: "shakes",
    price: 129,
    description: "Classic smooth Madagascan vanilla bean shake topped with whipped cream.",
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "strawberry-shake",
    name: "Strawberry Shake",
    category: "shakes",
    price: 129,
    description: "Refreshing sweet strawberry blend made with real fruit pulp and ice cream.",
    image: "https://images.unsplash.com/photo-1553787499-6f9133860278?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "oreo-shake",
    name: "Oreo Shake",
    category: "shakes",
    price: 139,
    badge: "Bestseller",
    description: "Crushed Oreo cookies blended into vanilla milk shake with crunchy chocolate bits.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "mango-shake",
    name: "Mango Shake",
    category: "shakes",
    price: 139,
    description: "Tropical Alphonso mango pulp blended with chilled milk and ice cream.",
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bcc4?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "banana-smoothie",
    name: "Banana Smoothie",
    category: "shakes",
    price: 129,
    description: "Fresh banana blended with Greek yogurt, honey, and a hint of cinnamon.",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "blueberry-smoothie",
    name: "Blueberry Smoothie",
    category: "shakes",
    price: 129,
    description: "Antioxidant-rich wild blueberries blended smooth with yogurt and chilled almond milk.",
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop",
  },

  // FRESH JUICES
  {
    id: "orange-juice",
    name: "Orange Juice",
    category: "juices",
    price: 99,
    description: "Freshly squeezed Valencia oranges packed with natural Vitamin C.",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "watermelon-juice",
    name: "Watermelon Juice",
    category: "juices",
    price: 99,
    badge: "Hydrating",
    description: "Cold-pressed fresh sweet watermelon juice chilled over ice.",
    image: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "pineapple-juice",
    name: "Pineapple Juice",
    category: "juices",
    price: 99,
    description: "Tangy sweet fresh pineapple juice extracted pure with mint leaves.",
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "mosambi-juice",
    name: "Mosambi Juice",
    category: "juices",
    price: 99,
    description: "Refreshing sweet lime juice squeezed fresh with a dash of black salt.",
    image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "lime-juice",
    name: "Lime Juice",
    category: "juices",
    price: 89,
    description: "Classic fresh lemon mint cooler served sweet or salted.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop",
  },

  // MOCKTAILS
  {
    id: "mojito",
    name: "Mojito",
    category: "mocktails",
    price: 129,
    badge: "Refresher",
    description: "Classic mint leaves crushed with lime juice, sugar syrup, and sparkling soda.",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "blue-lagoon",
    name: "Blue Lagoon",
    category: "mocktails",
    price: 129,
    badge: "Signature Drink",
    description: "Vibrant blue curaçao syrup layered with lemon juice, mint, and bubbly sprite.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "green-apple-cooler",
    name: "Green Apple Cooler",
    category: "mocktails",
    price: 129,
    description: "Crisp green apple syrup with fresh lime, ice spheres, and club soda.",
    image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "passion-fruit-mojito",
    name: "Passion Fruit Mojito",
    category: "mocktails",
    price: 129,
    description: "Exotic passion fruit nectar muddled with mint, lime, and fizzy soda.",
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=800&auto=format&fit=crop",
  },

  // SNACKS
  {
    id: "french-fries",
    name: "French Fries",
    category: "snacks",
    price: 99,
    description: "Golden crispy potato fries lightly salted, served with tomato ketchup.",
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cheesy-fries",
    name: "Cheesy Fries",
    category: "snacks",
    price: 119,
    badge: "Gooey Delight",
    description: "Crispy fries smothered in warm liquid cheese sauce and jalapeno herbs.",
    image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "peri-peri-fries",
    name: "Peri Peri Fries",
    category: "snacks",
    price: 119,
    description: "Hot crispy fries tossed generously in fiery African peri peri spice.",
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "nachos-with-salsa",
    name: "Nachos with Salsa",
    category: "snacks",
    price: 129,
    description: "Crunchy corn tortilla chips served with fresh tomato salsa dip and cheese.",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=800&auto=format&fit=crop",
  },

  // DESSERTS
  {
    id: "chocolate-brownie",
    name: "Chocolate Brownie",
    category: "desserts",
    price: 109,
    description: "Warm fudgy dark chocolate brownie baked with crushed walnuts.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "chocolate-lava-cake",
    name: "Chocolate Lava Cake",
    category: "desserts",
    price: 129,
    badge: "Warm Melting",
    description: "Decadent chocolate sponge cake with a molten warm chocolate center.",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "cheesecake",
    name: "Cheesecake",
    category: "desserts",
    price: 149,
    badge: "Chef Special",
    description: "New York style baked cheesecake on a buttery graham cracker crust.",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "ice-cream-scoop",
    name: "Ice Cream (Scoop)",
    category: "desserts",
    price: 59,
    description: "Single scoop choice of Vanilla, Belgian Chocolate, or Alphonso Mango.",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800&auto=format&fit=crop",
  }
];

export const SIGNATURE_SPECIALTIES = [
  {
    title: "SIGNATURE COFFEE",
    subtitle: "Brewed To Perfection. Made For You.",
    description: "Freshly roasted Arabica beans extracted into silky cappuccinos, caramel lattes, and ice cold coffees.",
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=1000&auto=format&fit=crop",
    tag: "COFFEE CRAFT"
  },
  {
    title: "SHAKES & REFRESHERS",
    subtitle: "Freshness In Every Sip",
    description: "Decadent thick Oreo and Chocolate shakes, fresh fruit juices, and vibrant sparkling Blue Lagoon mocktails.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=1000&auto=format&fit=crop",
    tag: "CHILLED CRAFT"
  },
  {
    title: "SAVORY BITES & DESSERTS",
    subtitle: "Fresh • Tasty • Made Daily",
    description: "Gourmet grilled sandwiches, crispy burgers, cheesy peri peri fries, and warm chocolate lava cakes.",
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000&auto=format&fit=crop",
    tag: "DELICIOUS PAIRINGS"
  }
];

export const TIMELINE_STEPS = [
  {
    number: "01",
    title: "FRESH INGREDIENTS",
    description: "Sourcing premium coffee beans, fresh dairy, and daily farm produce for genuine taste."
  },
  {
    number: "02",
    title: "HANDCRAFTED RECIPES",
    description: "Every coffee, shake, burger, and dessert is prepared fresh to order with perfection."
  },
  {
    number: "03",
    title: "WARM AMBIANCE",
    description: "Creating a cozy, welcoming cafe setting with soft warm parchment tones and comfortable seating."
  },
  {
    number: "04",
    title: "PREMIUM EXPERIENCE",
    description: "Delivering delicious sips and joyful moments every single day."
  }
];

export const GALLERY_IMAGES = [
  { id: 1, title: "Signature Latte Art", category: "Coffee", image: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=1000&auto=format&fit=crop" },
  { id: 2, title: "Cheesy Grilled Sandwich", category: "Burgers", image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000&auto=format&fit=crop" },
  { id: 3, title: "Thick Chocolate Oreo Shake", category: "Shakes", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=1000&auto=format&fit=crop" },
  { id: 4, title: "Fresh Lime & Blue Lagoon", category: "Mocktails", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000&auto=format&fit=crop" },
  { id: 5, title: "Crispy Peri Peri Fries", category: "Snacks", image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=1000&auto=format&fit=crop" },
  { id: 6, title: "Molten Chocolate Lava Cake", category: "Desserts", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1000&auto=format&fit=crop" },
  { id: 7, title: "Trio Cafe Warm Lounge", category: "Interior", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop" },
  { id: 8, title: "Juicy Chicken Burger", category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop" },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Rohan Sharma",
    role: "Regular Guest",
    rating: 5,
    text: "Trio Bean Cafe has the best Cappuccino and Grilled Sandwiches in town! The parchment menu ambiance is so cozy and inviting.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Ananya Patel",
    role: "Food Blogger",
    rating: 5,
    text: "The Chocolate Lava Cake paired with their Cold Coffee is pure perfection. Highly recommend their fresh juices too!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Vikram Malhotra",
    role: "Coffee Enthusiast",
    rating: 5,
    text: "Amazing value and top quality! Everything is fresh and tasty. Their Blue Lagoon mocktail and Peri Peri fries are fantastic.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
  }
];
