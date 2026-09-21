import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Flame, Award } from 'lucide-react';

export default function SignatureIntro() {
  return (
    <section id="intro" className="relative py-28 bg-parchment-100 overflow-hidden text-espresso-950 border-y border-gold/15">
      
      {/* Background Subtle Accents */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Editorial Typography */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-8"
          >
            <div className="inline-flex items-center space-x-3 text-gold-dark text-xs font-sans tracking-[0.3em] uppercase font-bold">
              <span className="w-8 h-[1px] bg-gold" />
              <span>OUR PROMISE</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-espresso-950 leading-[1.1]">
              FRESH • TASTY.<br />
              <span className="italic font-normal text-gold-dark">MADE DAILY FOR YOU.</span>
            </h2>

            <p className="text-base sm:text-lg text-espresso-600 font-sans font-light leading-relaxed">
              At Trio Bean Cafe, we bring together fresh specialty coffees, handcrafted cold drinks, artisanal burgers, grilled sandwiches, and delicious desserts under one warm roof.
            </p>

            <p className="text-sm text-espresso-800 font-sans leading-relaxed border-l-2 border-gold pl-4 italic bg-parchment-200/50 py-2 rounded-r-lg">
              "Thank you for choosing Trio Bean Cafe — where every cup and plate is prepared with love and high quality."
            </p>

            {/* Three Pillars */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gold/20">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-parchment-50 border border-gold/40 flex items-center justify-center text-gold shadow-sm">
                  <Coffee className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-base font-bold text-espresso-950">COFFEE</h4>
                <p className="text-xs text-espresso-600 font-sans">Freshly pulled espresso & ice cold brews.</p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-parchment-50 border border-gold/40 flex items-center justify-center text-gold shadow-sm">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-base font-bold text-espresso-950">BITES</h4>
                <p className="text-xs text-espresso-600 font-sans">Grilled sandwiches, burgers & snacks.</p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-parchment-50 border border-gold/40 flex items-center justify-center text-gold shadow-sm">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-base font-bold text-espresso-950">SIPS</h4>
                <p className="text-xs text-espresso-600 font-sans">Thick shakes, fresh juices & mocktails.</p>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Cafe Photography Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative"
          >
            <div className="grid grid-cols-2 gap-4">
              
              <div className="relative rounded-2xl overflow-hidden shadow-xl group border border-gold/20 aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800&auto=format&fit=crop"
                  alt="Specialty Cappuccino"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-parchment-50">
                  <span className="text-[10px] font-sans tracking-widest text-gold-light uppercase font-semibold">CRAFTED DAILY</span>
                  <p className="font-serif text-sm font-medium">Specialty Coffee & Latte Art</p>
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="relative rounded-2xl overflow-hidden shadow-xl group border border-gold/20 aspect-square">
                  <img
                    src="https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=800&auto=format&fit=crop"
                    alt="Grilled Sandwich"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-parchment-50">
                    <p className="font-serif text-xs">Fresh Sandwiches & Burgers</p>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-xl group border border-gold/20 aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop"
                    alt="Oreo Chocolate Shake"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-parchment-50">
                    <p className="font-serif text-xs">Thick Shakes & Smoothies</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Floating Crown Badge */}
            <div className="absolute -bottom-6 -left-6 bg-parchment-50 border border-gold/40 p-4 rounded-2xl backdrop-blur-md shadow-xl hidden sm:flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-serif text-lg font-bold">
                TB
              </div>
              <div>
                <p className="text-xs font-serif font-bold text-espresso-950">TRIO BEAN CAFÉ</p>
                <p className="text-[10px] text-gold-dark font-sans font-semibold">100% Fresh • Made Daily</p>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
