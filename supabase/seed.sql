-- Trio Bean Cafe Initial Seed Data

-- Clear existing data
TRUNCATE categories, menu_items, tables RESTART IDENTITY CASCADE;

-- Insert Tables (Table 01 to Table 10)
INSERT INTO tables (table_number, name, qr_token, is_active) VALUES
('01', 'Table 01', 'tb-tbl-01-token', true),
('02', 'Table 02', 'tb-tbl-02-token', true),
('03', 'Table 03', 'tb-tbl-03-token', true),
('04', 'Table 04', 'tb-tbl-04-token', true),
('05', 'Table 05', 'tb-tbl-05-token', true),
('06', 'Table 06', 'tb-tbl-06-token', true),
('07', 'Table 07', 'tb-tbl-07-token', true),
('08', 'Table 08', 'tb-tbl-08-token', true),
('09', 'Table 09', 'tb-tbl-09-token', true),
('10', 'Table 10', 'tb-tbl-10-token', true);

-- Insert Categories
INSERT INTO categories (id, name, description, display_order, is_active) VALUES
('c1000000-0000-0000-0000-000000000001', 'Coffee', 'Freshly brewed artisan coffees and aromatic teas', 1, true),
('c1000000-0000-0000-0000-000000000002', 'Fries', 'Golden crispy fries & delicious crispy bites', 2, true),
('c1000000-0000-0000-0000-000000000003', 'Momos', 'Steamed juicy dumplings served with spicy chutney', 3, true),
('c1000000-0000-0000-0000-000000000004', 'Snacks & Desserts', 'Butter croissants, warm buns and divine desserts', 4, true),
('c1000000-0000-0000-0000-000000000005', 'Waffles', 'Golden crisp waffles drenched in chocolate & toppings', 5, true),
('c1000000-0000-0000-0000-000000000006', 'Maggie', 'Comforting hot noodles cooked in house spices', 6, true),
('c1000000-0000-0000-0000-000000000007', 'Add On', 'Delicious extra toppings, dips and treats', 7, true),
('c1000000-0000-0000-0000-000000000008', 'Sandwiches & Burgers', 'Gourmet toasted sandwiches & juicy signature burgers', 8, true),
('c1000000-0000-0000-0000-000000000009', 'Milk Shakes', 'Thick creamy shakes blended to perfection', 9, true),
('c1000000-0000-0000-0000-000000000010', 'Fresh Juices', '100% natural, freshly squeezed fruit juices', 10, true),
('c1000000-0000-0000-0000-000000000011', 'Mojitos', 'Sparkling ice coolers infused with fresh mint & fruit', 11, true);

-- Insert Menu Items (Exact 60 Trio Bean items with curated imagery)
INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, display_order) VALUES

-- 1. COFFEE
('c1000000-0000-0000-0000-000000000001', 'Coffee', 'Rich freshly brewed South Indian specialty roast filter coffee', 30.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', true, 1),
('c1000000-0000-0000-0000-000000000001', 'Cardamom Tea', 'Fragrant hot milk tea infused with freshly ground green cardamom', 20.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', true, 2),
('c1000000-0000-0000-0000-000000000001', 'Lemon Tea', 'Zesty black tea brewed with fresh lemon juice and honey', 20.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80', true, 3),
('c1000000-0000-0000-0000-000000000001', 'Cold Coffee', 'Chilled espresso blended with thick milk and dark cocoa syrup', 49.00, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80', true, 4),
('c1000000-0000-0000-0000-000000000001', 'Dalgona Coffee', 'Whipped velvety coffee foam atop chilled sweet whole milk', 59.00, 'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?w=600&auto=format&fit=crop&q=80', true, 5),
('c1000000-0000-0000-0000-000000000001', 'Hot Chocolate', 'Decadent melted Belgian chocolate whisked with warm milk', 49.00, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80', true, 6),

-- 2. FRIES
('c1000000-0000-0000-0000-000000000002', 'French Fries', 'Golden salted crispy potato fries served with dip', 49.00, 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&auto=format&fit=crop&q=80', true, 1),
('c1000000-0000-0000-0000-000000000002', 'Peri Peri Fries', 'Crispy fries tossed in spicy fiery peri peri seasoning', 59.00, 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&auto=format&fit=crop&q=80', true, 2),
('c1000000-0000-0000-0000-000000000002', 'Chicken Popcorn', 'Bite-sized crunchy seasoned fried chicken pops with mayo', 120.00, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80', true, 3),
('c1000000-0000-0000-0000-000000000002', 'Loaded Fries (Chicken)', 'Crispy fries topped with melted cheese sauce & spicy chicken bites', 150.00, 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80', true, 4),

-- 3. MOMOS
('c1000000-0000-0000-0000-000000000003', 'Momos (Veg)', 'Steamed Tibetan dumplings filled with finely chopped seasoned veggies', 89.00, 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=600&auto=format&fit=crop&q=80', true, 1),
('c1000000-0000-0000-0000-000000000003', 'Momos (Chicken)', 'Juicy steamed dumplings stuffed with minced spicy chicken', 89.00, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', true, 2),

-- 4. SNACKS & DESSERTS
('c1000000-0000-0000-0000-000000000004', 'Croissant', 'Warm flaky French butter croissant baked fresh daily', 49.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80', true, 1),
('c1000000-0000-0000-0000-000000000004', 'KitKat Croissant', 'Warm buttery croissant loaded with crushed KitKat & dark chocolate', 69.00, 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600&auto=format&fit=crop&q=80', true, 2),
('c1000000-0000-0000-0000-000000000004', 'Korean Cheese Bun', 'Soft garlic bread bun filled with sweetened cream cheese lava', 69.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', true, 3),
('c1000000-0000-0000-0000-000000000004', 'Brownie with Ice Cream', 'Warm fudgy chocolate brownie paired with a scoop of vanilla ice cream', 89.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', true, 4),
('c1000000-0000-0000-0000-000000000004', 'Cookies Dip (8 pcs)', 'Crunchy butter cookies served with rich chocolate ganache dip', 89.00, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80', true, 5),
('c1000000-0000-0000-0000-000000000004', 'Scoop Cookies', 'Generous cookie dough scoop baked gooey soft with chocolate chips', 130.00, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80', true, 6),

-- 5. WAFFLES
('c1000000-0000-0000-0000-000000000005', 'Death By Chocolate', 'Crispy dark waffle drizzled with double Belgian chocolate fudge', 79.00, 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80', true, 1),
('c1000000-0000-0000-0000-000000000005', 'Cookies & Cream', 'Golden waffle topped with crushed cookies & sweet cream spread', 79.00, 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=600&auto=format&fit=crop&q=80', true, 2),
('c1000000-0000-0000-0000-000000000005', 'Oreo Fudge', 'Fresh crisp waffle layered with crushed Oreos and melted chocolate fudge', 79.00, 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=600&auto=format&fit=crop&q=80', true, 3),
('c1000000-0000-0000-0000-000000000005', 'White Choco', 'Classic golden waffle smothered in silky white chocolate glaze', 79.00, 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600&auto=format&fit=crop&q=80', true, 4),
('c1000000-0000-0000-0000-000000000005', 'Biscoff', 'Signature waffle topped with authentic Lotus Biscoff spread & biscuit crumble', 99.00, 'https://images.unsplash.com/photo-1504113076330-118f2c026e34?w=600&auto=format&fit=crop&q=80', true, 5),
('c1000000-0000-0000-0000-000000000005', 'Loaded Waffles', 'Monster waffle feast loaded with ice cream, nuts, sprinkles and chocolate drizzle', 189.00, 'https://images.unsplash.com/photo-1575853121743-60c24f0a7502?w=600&auto=format&fit=crop&q=80', true, 6),
('c1000000-0000-0000-0000-000000000005', 'Flavored Waffles', 'Warm crisp waffle tailored with your choice of fruit flavor syrups', 120.00, 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80', true, 7),

-- 6. MAGGIE
('c1000000-0000-0000-0000-000000000006', 'Veg Maggie', 'Classic masala noodles tossed with crisp onions, peas & carrots', 59.00, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80', true, 1),
('c1000000-0000-0000-0000-000000000006', 'Cheese Maggie', 'Piping hot masala Maggie topped with melted mozzarella cheese', 69.00, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80', true, 2),
('c1000000-0000-0000-0000-000000000006', 'White Sauce Maggie', 'Creamy Italian-style white sauce noodles seasoned with herbs & garlic', 89.00, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281318?w=600&auto=format&fit=crop&q=80', true, 3),

-- 7. ADD ON
('c1000000-0000-0000-0000-000000000007', 'Ice Cream', 'Single scoop of rich vanilla cream', 20.00, 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&auto=format&fit=crop&q=80', true, 1),
('c1000000-0000-0000-0000-000000000007', 'Dark Choco Chips', 'Premium dark chocolate chips topping', 20.00, 'https://images.unsplash.com/photo-1582176647444-3e915443a5fb?w=600&auto=format&fit=crop&q=80', true, 2),
('c1000000-0000-0000-0000-000000000007', 'White Choco Chips', 'Creamy sweet white chocolate chips', 20.00, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80', true, 3),
('c1000000-0000-0000-0000-000000000007', 'Rainbow Sprinkles', 'Fun colorful dessert sprinkles', 20.00, 'https://images.unsplash.com/photo-1516559828984-fb3b99548b21?w=600&auto=format&fit=crop&q=80', true, 4),
('c1000000-0000-0000-0000-000000000007', 'Choco Stick', 'Crispy chocolate wafer roll stick', 20.00, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80', true, 5),

-- 8. SANDWICHES & BURGERS
('c1000000-0000-0000-0000-000000000008', 'Cheesy Paneer Sandwich', 'Toasted bread packed with spicy marinated paneer cubes & melted cheese', 89.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80', true, 1),
('c1000000-0000-0000-0000-000000000008', 'Cheesy Corn Sandwich', 'Sweet sweetcorn and molten cheese grilled in buttered bread slices', 89.00, 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=600&auto=format&fit=crop&q=80', true, 2),
('c1000000-0000-0000-0000-000000000008', 'Chicken Tandoori Sandwich', 'Grilled chicken tossed in smoky Indian tandoori spices and cheese', 119.00, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80', true, 3),
('c1000000-0000-0000-0000-000000000008', 'Mexican Chicken Sandwich', 'Spicy chicken, jalapenos, bell peppers & tangy salsa grilled to perfection', 119.00, 'https://images.unsplash.com/photo-1619860842164-174f17576c62?w=600&auto=format&fit=crop&q=80', true, 4),
('c1000000-0000-0000-0000-000000000008', 'Club Sandwich', 'Triple decker toast with fresh veggies, cheese, spicy patty & mayo', 149.00, 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=600&auto=format&fit=crop&q=80', true, 5),
('c1000000-0000-0000-0000-000000000008', 'Classic Veg Burger', 'Crispy vegetable patty in soft bun with lettuce, tomatoes & sauce', 89.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80', true, 6),
('c1000000-0000-0000-0000-000000000008', 'Classic Chicken Burger', 'Crispy fried chicken patty, melted cheese slice, lettuce & house mayo', 119.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true, 7),
('c1000000-0000-0000-0000-000000000008', 'Crazy Tiger Burger', 'Double patty beast burger stuffed with double cheese & tiger fiery sauce', 129.00, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80', true, 8),

-- 9. MILK SHAKES
('c1000000-0000-0000-0000-000000000009', 'Oreo Shake', 'Thick chilled milk blended with original Oreo cookies & vanilla ice cream', 89.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80', true, 1),
('c1000000-0000-0000-0000-000000000009', 'Black Current Shake', 'Creamy shake blended with sweet black currant berries', 89.00, 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=600&auto=format&fit=crop&q=80', true, 2),
('c1000000-0000-0000-0000-000000000009', 'Mango Shake', 'Lush Alphonso mango pulp blended with chilled cream & milk', 89.00, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80', true, 3),
('c1000000-0000-0000-0000-000000000009', 'Strawberry Shake', 'Refreshing fresh strawberry puree blended into creamy ice cream shake', 89.00, 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&auto=format&fit=crop&q=80', true, 4),
('c1000000-0000-0000-0000-000000000009', 'Choco Almond Shake', 'Rich cocoa milkshake blended with toasted roasted almond crunch', 89.00, 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80', true, 5),
('c1000000-0000-0000-0000-000000000009', 'Peanut Shake', 'Nutty thick peanut butter blended shake topped with crushed nuts', 89.00, 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&auto=format&fit=crop&q=80', true, 6),
('c1000000-0000-0000-0000-000000000009', 'KitKat Brownie Shake', 'Ultimate indulgence shake with fudgy brownie chunks & crushed KitKat', 119.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80', true, 7),
('c1000000-0000-0000-0000-000000000009', 'Biscoff Shake', 'Creamy milkshake infused with caramelized Lotus Biscoff speculoos', 119.00, 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&auto=format&fit=crop&q=80', true, 8),
('c1000000-0000-0000-0000-000000000009', 'Milo Shake', 'Malt chocolate Milo blended shake dusted with extra crunchy Milo powder', 119.00, 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&auto=format&fit=crop&q=80', true, 9),

-- 10. FRESH JUICES
('c1000000-0000-0000-0000-000000000010', 'Avocado Juice', 'Creamy fresh avocado blended with honey and chilled milk', 120.00, 'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=600&auto=format&fit=crop&q=80', true, 1),
('c1000000-0000-0000-0000-000000000010', 'Tender Coconut Juice', 'Naturally hydrating tender coconut water & fresh coconut flesh juice', 120.00, 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600&auto=format&fit=crop&q=80', true, 2),
('c1000000-0000-0000-0000-000000000010', 'Grape Juice', 'Freshly pressed black seedless grape juice served over crushed ice', 89.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80', true, 3),
('c1000000-0000-0000-0000-000000000010', 'Mango Juice', 'Sweet 100% natural Alphonso mango fresh juice', 89.00, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80', true, 4),
('c1000000-0000-0000-0000-000000000010', 'Pineapple Juice', 'Tangy sweet freshly squeezed golden pineapple juice', 89.00, 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=600&auto=format&fit=crop&q=80', true, 5),
('c1000000-0000-0000-0000-000000000010', 'Chikku Juice', 'Rich caramel-sweet Sapota fruit (Chikku) freshly blended juice', 89.00, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80', true, 6),

-- 11. MOJITOS
('c1000000-0000-0000-0000-000000000011', 'Blue Curacao Mojito', 'Electric blue citrus mocktail with fresh mint, lime & sparkling soda', 59.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', true, 1),
('c1000000-0000-0000-0000-000000000011', 'Lime Mint Mojito', 'Classic refreshing cooler with muddled garden mint, fresh lime & soda', 59.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80', true, 2),
('c1000000-0000-0000-0000-000000000011', 'Black Current Mojito', 'Spiced dark berry black currant syrup crushed with lime and mint', 59.00, 'https://images.unsplash.com/photo-1546171386-2ed8270929b0?w=600&auto=format&fit=crop&q=80', true, 3),
('c1000000-0000-0000-0000-000000000011', 'Orange Mojito', 'Sunny fresh orange citrus muddled with mint leaves & fizzy soda', 59.00, 'https://images.unsplash.com/photo-1609951651556-5334e2706168?w=600&auto=format&fit=crop&q=80', true, 4),
('c1000000-0000-0000-0000-000000000011', 'Strawberry Mojito', 'Sweet strawberry crush muddled with fresh mint sprigs & bubbly soda', 59.00, 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=600&auto=format&fit=crop&q=80', true, 5);
