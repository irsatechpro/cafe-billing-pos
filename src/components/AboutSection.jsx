import React from 'react';
import { motion } from 'framer-motion';
import { TIMELINE_STEPS } from '../data/cafeData';

export default function AboutSection() {
  return (
    <section id="about" className="relative py-28 bg-parchment-100 text-espresso-950 overflow-hidden border-t border-gold/15">
      
      {/* Glow */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Story Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6"
          >
            <span className="text-xs uppercase tracking-[0.3em] font-sans text-gold-dark font-bold">
              ABOUT TRIO BEAN CAFÉ
            </span>
            
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-espresso-950 leading-[1.15]">
              FRESH • TASTY • MADE DAILY
            </h2>

            <p className="text-base text-espresso-600 font-sans font-light leading-relaxed">
              Trio Bean Cafe is a cozy specialty coffee sanctuary where great sips and delicious food come together. We prepare our signature coffees, fresh juices, thick shakes, sandwiches, burgers, and desserts fresh every day.
            </p>

            <p className="text-sm text-espresso-800 font-sans leading-relaxed border-l-2 border-gold pl-4 italic bg-parchment-200/50 py-2.5 rounded-r-lg">
              "We take pride in high quality ingredients, quick friendly service, and creating a space you will love coming back to."
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=600&auto=format&fit=crop"
                alt="Fresh Coffee Espresso"
                className="rounded-2xl shadow-md object-cover h-48 w-full border border-gold/20"
              />
              <img
                src="https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop"
                alt="Oreo Chocolate Shake"
                className="rounded-2xl shadow-md object-cover h-64 w-full border border-gold/20"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=600&auto=format&fit=crop"
                alt="Grilled Sandwich"
                className="rounded-2xl shadow-md object-cover h-64 w-full border border-gold/20"
              />
              <img
                src="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600&auto=format&fit=crop"
                alt="Chocolate Lava Cake"
                className="rounded-2xl shadow-md object-cover h-48 w-full border border-gold/20"
              />
            </div>
          </motion.div>

        </div>

        {/* Timeline Component */}
        <div className="pt-12 border-t border-gold/20">
          <div className="text-center mb-14">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-espresso-950">
              OUR CRAFT PROCESS
            </h3>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-dark mt-2 font-sans font-bold">
              Quality From Kitchen To Table
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-gold/10 via-gold/50 to-gold/10 -translate-y-6 z-0" />

            {TIMELINE_STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative z-10 glass-card p-6 rounded-2xl border border-gold/25 space-y-3 hover:border-gold transition-colors bg-parchment-50"
              >
                <div className="w-12 h-12 rounded-full bg-parchment-100 border border-gold text-gold-dark font-serif text-xl font-bold flex items-center justify-center shadow-sm">
                  {step.number}
                </div>
                <h4 className="font-serif text-xl font-bold text-espresso-950">
                  {step.title}
                </h4>
                <p className="text-xs text-espresso-600 font-sans leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}

          </div>
        </div>

      </div>
    </section>
  );
}
