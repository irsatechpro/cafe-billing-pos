import React from 'react';
import { motion } from 'framer-motion';
import AmbientSoundPlayer from './AmbientSoundPlayer';

export default function CafeExperienceSection() {
  return (
    <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden bg-parchment-100">
      
      {/* Background Image with Slow Cinematic Zoom */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        className="absolute inset-0 z-0"
      >
        <img
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1600&auto=format&fit=crop"
          alt="Trio Bean Cafe Warm Atmosphere"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-parchment-50 via-parchment-50/75 to-parchment-50/85" />
      </motion.div>

      {/* Grain texture overlay */}
      <div className="absolute inset-0 grain-overlay pointer-events-none" />

      {/* Overlay Text Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 space-y-6">
        <span className="text-xs uppercase tracking-[0.35em] font-sans text-gold-dark font-bold">
          AN ATMOSPHERIC RESPUTE
        </span>

        <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-espresso-950 leading-[1.08]">
          A PLACE TO PAUSE.<br />
          <span className="italic font-normal text-gold-dark">A PLACE TO CONNECT.</span>
        </h2>

        <p className="text-base sm:text-lg text-espresso-600 font-sans font-light max-w-xl mx-auto leading-relaxed">
          Surrounded by warm parchment tones, fresh aromas of coffee, and welcoming hospitality.
        </p>

        {/* Interactive Sound Player Toggle */}
        <div className="pt-4 flex justify-center">
          <AmbientSoundPlayer />
        </div>
      </div>

    </section>
  );
}
