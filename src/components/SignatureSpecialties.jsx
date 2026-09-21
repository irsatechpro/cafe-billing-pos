import React from 'react';
import { motion } from 'framer-motion';
import { SIGNATURE_SPECIALTIES } from '../data/cafeData';

export default function SignatureSpecialties() {
  return (
    <section id="specialties" className="relative py-28 bg-parchment-50 text-espresso-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-gold/20">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-sans text-gold-dark font-bold">
              FRESH & DELICIOUS
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-espresso-950 mt-2">
              SIGNATURE SELECTIONS
            </h2>
          </div>
          <p className="text-sm text-espresso-600 font-sans max-w-md mt-4 md:mt-0">
            Fresh ingredients, crafted sips, and delicious bites prepared with precision.
          </p>
        </div>

        {/* Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SIGNATURE_SPECIALTIES.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group relative rounded-3xl overflow-hidden glass-card glass-card-hover flex flex-col justify-end min-h-[480px] p-8 shine-effect border border-gold/25"
            >
              {/* Card Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/40 to-transparent" />
              </div>

              {/* Card Tag Badge */}
              <div className="relative z-10 mb-auto">
                <span className="inline-block bg-gold text-parchment-50 text-[10px] font-sans font-bold tracking-[0.25em] uppercase px-3.5 py-1 rounded-full shadow-md">
                  {item.tag}
                </span>
              </div>

              {/* Text Info */}
              <div className="relative z-10 space-y-2 text-parchment-50">
                <span className="text-xs font-sans tracking-widest text-gold-light font-semibold uppercase block">
                  {item.subtitle}
                </span>
                <h3 className="font-serif text-2xl font-bold text-parchment-50 group-hover:text-gold-light transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-parchment-100/90 font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
