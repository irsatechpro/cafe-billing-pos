import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_IMAGES } from '../data/cafeData';

export default function GallerySection() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Coffee', 'Burgers', 'Shakes', 'Mocktails', 'Snacks', 'Desserts'];

  const filteredImages = activeFilter === 'All'
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter(img => img.category === activeFilter);

  const handlePrev = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? filteredImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === filteredImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="gallery" className="relative py-28 bg-parchment-50 text-espresso-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.3em] font-sans text-gold-dark font-bold">
            VISUAL GALLERY
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-espresso-950">
            THE TRIO BEAN GALLERY
          </h2>
          <p className="text-sm text-espresso-600 font-sans">
            Fresh sips, delicious bites, and beautiful cafe moments.
          </p>
        </div>

        {/* Gallery Filter Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-sans tracking-widest uppercase transition-all ${
                activeFilter === cat
                  ? 'bg-gold text-parchment-50 font-bold shadow-md'
                  : 'bg-parchment-100 text-espresso-800 hover:text-gold border border-gold/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Image Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredImages.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              onClick={() => setSelectedImageIndex(idx)}
              className="group relative rounded-2xl overflow-hidden glass-card cursor-pointer break-inside-avoid shadow-md border border-gold/20"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-auto object-cover transform group-hover:scale-108 transition-transform duration-700"
              />
              
              {/* Light Dark Overlay */}
              <div className="absolute inset-0 bg-espresso-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-parchment-50">
                <span className="text-[10px] uppercase tracking-widest font-sans text-gold-light font-bold">
                  {item.category}
                </span>
                <h4 className="font-serif text-lg font-bold">
                  {item.title}
                </h4>
                <div className="mt-2 flex items-center space-x-1 text-gold-light text-xs font-sans">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Expand Photo</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-950/90 backdrop-blur-xl p-4">
            
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-parchment-50 text-espresso-950 flex items-center justify-center hover:bg-gold hover:text-parchment-50 transition-colors z-50 shadow-xl"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={handlePrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-parchment-50 text-espresso-950 flex items-center justify-center hover:bg-gold hover:text-parchment-50 transition-colors z-50 shadow-xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-parchment-50 text-espresso-950 flex items-center justify-center hover:bg-gold hover:text-parchment-50 transition-colors z-50 shadow-xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            >
              <img
                src={filteredImages[selectedImageIndex].image}
                alt={filteredImages[selectedImageIndex].title}
                className="max-h-[75vh] w-auto object-contain rounded-2xl border border-gold/30 shadow-2xl"
              />
              <div className="mt-4 text-center">
                <span className="text-xs uppercase tracking-widest text-gold-light font-bold font-sans">
                  {filteredImages[selectedImageIndex].category}
                </span>
                <h3 className="font-serif text-2xl font-bold text-parchment-50 mt-1">
                  {filteredImages[selectedImageIndex].title}
                </h3>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
