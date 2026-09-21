import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, MapPin, Coffee } from 'lucide-react';
import Hero3DCanvas from './3d/Hero3DCanvas';
import { CAFE_INFO } from '../data/cafeData';

export default function Hero({ onExploreMenu }) {
  return (
    <section id="home" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16 bg-[#FDFBF7] text-[#1F120C]">
      
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C8963E]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-[#EFE6D8]/80 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 grain-overlay pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[70vh]">
          
          {/* Left Column: Headline, Brand & Editorial Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-start space-y-6 text-left"
          >
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#F5EFE6] border border-[#C8963E]/50 text-[#B8860B] text-[11px] font-sans tracking-[0.25em] uppercase font-extrabold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C8963E] animate-pulse" />
              <span>FRESH • TASTY • MADE DAILY</span>
            </div>

            {/* Main Hero Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1F120C] leading-[1.08]">
              CRAFTED COFFEE.<br />
              <span className="text-[#C8963E] italic font-normal">
                PREMIUM EXPERIENCE.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#4E342E] font-sans font-semibold max-w-xl leading-relaxed">
              {CAFE_INFO.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreMenu}
                className="group relative inline-flex items-center space-x-3 bg-[#C8963E] hover:bg-[#B8860B] text-[#FDFBF7] px-8 py-4 rounded-full font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 transform hover:-translate-y-1 shadow-[0_10px_25px_rgba(200,150,62,0.4)] shine-effect"
              >
                <span>EXPLORE OUR MENU</span>
                <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
              </button>

              <a
                href="#contact"
                className="inline-flex items-center space-x-2 text-[#1F120C] hover:text-[#C8963E] px-7 py-4 rounded-full border-2 border-[#C8963E]/40 hover:border-[#C8963E] text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 bg-[#F5EFE6] shadow-sm"
              >
                <MapPin className="w-4 h-4 text-[#C8963E]" />
                <span>VISIT TRIO BEAN</span>
              </a>
            </div>

            {/* Quick Feature Badges */}
            <div className="pt-6 border-t border-[#C8963E]/30 w-full max-w-lg grid grid-cols-3 gap-4 text-xs font-sans text-[#4E342E] font-semibold">
              <div>
                <span className="block font-serif text-2xl text-[#B8860B] font-bold">100%</span>
                <span>Fresh & Natural</span>
              </div>
              <div>
                <span className="block font-serif text-2xl text-[#B8860B] font-bold">₹69 ONWARD</span>
                <span>Affordable Specialty</span>
              </div>
              <div>
                <span className="block font-serif text-2xl text-[#B8860B] font-bold">DAILY</span>
                <span>Freshly Prepared</span>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Dedicated 3D Canvas Box (Zero Text Overlap Guaranteed) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative w-full"
          >
            <div className="relative rounded-3xl glass-card border-2 border-[#C8963E]/40 p-4 shadow-2xl bg-[#FDFBF7]/90 overflow-hidden h-[450px] md:h-[500px]">
              
              {/* 3D WebGL Canvas */}
              <Hero3DCanvas />

              {/* Floating Badge on 3D Container */}
              <div className="absolute top-4 right-4 bg-[#F5EFE6] border border-[#C8963E]/40 px-3.5 py-1.5 rounded-full shadow-md flex items-center space-x-2">
                <Coffee className="w-4 h-4 text-[#C8963E]" />
                <span className="text-[10px] uppercase font-sans font-extrabold text-[#B8860B] tracking-widest">
                  3D INTERACTIVE CUP
                </span>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.a
        href="#intro"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1 }, y: { repeat: Infinity, duration: 2 } }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 text-[#4E342E] hover:text-[#C8963E] transition-colors z-20 text-[10px] tracking-[0.25em] font-sans uppercase font-bold"
      >
        <span>SCROLL TO EXPLORE</span>
        <ChevronDown className="w-4 h-4 text-[#C8963E]" />
      </motion.a>

    </section>
  );
}
