import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from '../data/cafeData';

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  return (
    <section className="relative py-28 bg-parchment-100 text-espresso-950 overflow-hidden border-t border-gold/15">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-sans text-gold-dark font-bold">
            GUEST REVIEWS
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-espresso-950">
            WHAT OUR GUESTS SAY
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto relative">
          
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 sm:p-12 rounded-3xl border border-gold/30 shadow-lg relative bg-parchment-50"
          >
            <Quote className="w-12 h-12 text-gold/20 absolute top-8 right-8 pointer-events-none" />

            {/* Rating Stars */}
            <div className="flex items-center space-x-1 text-gold mb-6">
              {[...Array(TESTIMONIALS[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-gold text-gold" />
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="font-serif text-xl sm:text-2xl text-espresso-950 leading-relaxed italic mb-8">
              "{TESTIMONIALS[currentIndex].text}"
            </p>

            {/* Customer Details */}
            <div className="flex items-center space-x-4">
              <img
                src={TESTIMONIALS[currentIndex].avatar}
                alt={TESTIMONIALS[currentIndex].name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gold shadow-md"
              />
              <div>
                <h4 className="font-serif text-lg font-bold text-espresso-950">
                  {TESTIMONIALS[currentIndex].name}
                </h4>
                <p className="text-xs text-gold-dark font-sans font-bold uppercase tracking-widest">
                  {TESTIMONIALS[currentIndex].role}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center space-x-2">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === idx ? 'w-8 bg-gold' : 'w-2 bg-parchment-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full bg-parchment-50 border border-gold/30 text-espresso-950 flex items-center justify-center hover:bg-gold hover:text-parchment-50 transition-colors shadow-sm"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full bg-parchment-50 border border-gold/30 text-espresso-950 flex items-center justify-center hover:bg-gold hover:text-parchment-50 transition-colors shadow-sm"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
