import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Check, Info } from 'lucide-react';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/cafeData';

export default function FeaturedMenu({ onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [milkOption, setMilkOption] = useState('Standard');
  const [sweetnessOption, setSweetnessOption] = useState('100% Standard');
  const [addedToast, setAddedToast] = useState(false);

  const filteredItems = activeCategory === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => item.category === activeCategory);

  const handleOpenItem = (item) => {
    setSelectedItem(item);
    setMilkOption('Standard');
    setSweetnessOption('100% Standard');
  };

  const handleConfirmAdd = () => {
    if (!selectedItem) return;
    onAddToCart({
      ...selectedItem,
      milk: milkOption,
      sweetness: sweetnessOption,
    });
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      setSelectedItem(null);
    }, 1200);
  };

  return (
    <section id="menu" className="relative py-28 bg-parchment-50 text-espresso-950 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-gold/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading matching uploaded menu */}
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-parchment-100 border border-gold/40 text-gold-dark text-[11px] font-sans tracking-[0.25em] uppercase font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRIO BEAN MENU</span>
          </div>
          
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-espresso-950">
            OUR SPECIALTY MENU
          </h2>
          
          <p className="text-sm sm:text-base text-espresso-600 font-sans font-light">
            Fresh • Tasty • Made Daily. Prepared fresh to order by our artisans.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-14">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-sans tracking-[0.15em] uppercase transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-gold text-parchment-50 font-bold shadow-md'
                  : 'bg-parchment-100 text-espresso-800 hover:text-gold hover:border-gold/40 border border-gold/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              onClick={() => handleOpenItem(item)}
              className="group cursor-pointer rounded-2xl glass-card glass-card-hover overflow-hidden flex flex-col justify-between shine-effect"
            >
              <div>
                {/* Item Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-parchment-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/40 via-transparent to-transparent opacity-60" />

                  {/* Badge */}
                  {item.badge && (
                    <span className="absolute top-4 left-4 bg-gold text-parchment-50 font-sans font-bold text-[10px] tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
                      {item.badge}
                    </span>
                  )}

                  {/* Price Badge in Rupees ₹ */}
                  <span className="absolute bottom-4 right-4 font-serif text-lg font-bold text-gold-dark bg-parchment-50/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-gold/40 shadow-sm">
                    ₹{item.price}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-2">
                  <h3 className="font-serif text-xl font-bold text-espresso-950 group-hover:text-gold transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-espresso-600 font-sans leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-gold/20">
                <span className="text-[11px] font-sans tracking-widest text-gold-dark uppercase font-semibold flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Order Fresh</span>
                </span>
                <div className="w-8 h-8 rounded-full bg-gold/15 group-hover:bg-gold text-gold-dark group-hover:text-parchment-50 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Item Customization & Order Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-parchment-50 border border-gold/30 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative"
            >
              {/* Modal Image Header */}
              <div className="relative h-56 bg-parchment-200">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-parchment-50 via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-parchment-50/90 text-espresso-950 flex items-center justify-center hover:bg-gold hover:text-parchment-50 transition-colors shadow-md"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-serif text-2xl font-bold text-espresso-950">
                      {selectedItem.name}
                    </h3>
                    <span className="font-serif text-2xl font-bold text-gold-dark">
                      ₹{selectedItem.price}
                    </span>
                  </div>
                  <p className="text-xs text-espresso-600 font-sans leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Option 1: Preferences */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-espresso-900 font-sans font-semibold">
                    Preparation Preference
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Standard', 'Extra Spice', 'Mild'].map((pref) => (
                      <button
                        key={pref}
                        onClick={() => setMilkOption(pref)}
                        className={`py-2 px-3 rounded-xl text-xs font-sans font-medium transition-colors ${
                          milkOption === pref
                            ? 'bg-gold text-parchment-50 font-bold'
                            : 'bg-parchment-200 text-espresso-900 hover:bg-parchment-300'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  onClick={handleConfirmAdd}
                  className="w-full py-4 rounded-full bg-gold hover:bg-gold-dark text-parchment-50 font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-lg"
                >
                  {addedToast ? (
                    <>
                      <Check className="w-4 h-4 text-parchment-50" />
                      <span>ADDED TO ORDER!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-parchment-50" />
                      <span>ADD TO ORDER — ₹{selectedItem.price}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
