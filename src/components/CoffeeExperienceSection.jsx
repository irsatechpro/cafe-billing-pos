import React, { useState, useEffect } from 'react';
import { Sparkles, Thermometer, Flame, Droplets, Award } from 'lucide-react';
import CoffeeBeanScene3D from './3d/CoffeeBeanScene3D';

export default function CoffeeExperienceSection() {
  const [activeTab, setActiveTab] = useState('coffee');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('experience3d');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const items = [
    {
      id: 'coffee',
      label: '☕ 3D COFFEE CUP',
      title: '100% Arabica Specialty Espresso',
      metric1: 'Roast Temp: 205°C',
      metric2: 'Ratio: 1:2 Ristretto',
      metric3: 'Crema: Velvet Foam',
      icon: Thermometer
    },
    {
      id: 'burger',
      label: '🍔 3D GOURMET BURGER',
      title: 'Flame-Grilled Double Cheeseburger',
      metric1: 'Patty: Flame Grilled',
      metric2: 'Cheese: Melted Cheddar',
      metric3: 'Bun: Artisanal Sourdough',
      icon: Flame
    },
    {
      id: 'shake',
      label: '🥤 3D COLD DRINK',
      title: 'Chilled Blue Lagoon & Oreo Shake',
      metric1: 'Temp: -4°C Chilled',
      metric2: 'Blend: Fresh Nectar',
      metric3: 'Ice: Crystal Spheres',
      icon: Droplets
    },
    {
      id: 'dessert',
      label: '🍰 3D MOLTEN DESSERT',
      title: 'Molten Chocolate Lava Cake',
      metric1: 'Core: 70% Dark Cacao',
      metric2: 'Served: Warm With Ice Cream',
      metric3: 'Bake: Daily Fresh 6:30 AM',
      icon: Award
    }
  ];

  const currentItem = items.find(item => item.id === activeTab);

  return (
    <section id="experience3d" className="relative py-32 bg-[#F5EFE6] overflow-hidden text-[#1F120C] border-y border-[#C8963E]/25">
      
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C8963E]/10 via-[#FDFBF7] to-[#F5EFE6] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#FDFBF7] border border-[#C8963E]/50 text-[#B8860B] text-[11px] font-sans tracking-[0.3em] uppercase font-extrabold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C8963E]" />
            <span>INTERACTIVE 3D ITEM EXPERIENCE</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#1F120C]">
            EXPLORE TRIO BEAN IN 3D
          </h2>

          <p className="text-lg sm:text-xl font-serif italic text-[#B8860B] font-semibold">
            Rotate & inspect our specialty coffees, burgers, shakes, and desserts in real-time 3D.
          </p>
        </div>

        {/* Interactive 3D Model Switcher Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-3 mb-8">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-6 py-3 rounded-full text-xs font-sans tracking-widest uppercase transition-all duration-300 font-extrabold ${
                activeTab === item.id
                  ? 'bg-[#C8963E] text-[#FDFBF7] shadow-lg scale-105'
                  : 'bg-[#FDFBF7] text-[#1F120C] hover:text-[#C8963E] border border-[#C8963E]/30 shadow-sm'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 3D WebGL Canvas Container */}
        <div className="relative rounded-3xl glass-card border-2 border-[#C8963E]/40 overflow-hidden shadow-2xl p-6 md:p-10 bg-[#FDFBF7]">
          
          {/* Active 3D WebGL Model */}
          <CoffeeBeanScene3D activeTab={activeTab} scrollProgress={scrollProgress} />

          {/* 3D Model Title & Metrics Bar */}
          <div className="pt-6 border-t border-[#C8963E]/20">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-widest font-sans font-extrabold text-[#B8860B]">
                3D MODEL INSPECTOR
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F120C] mt-1">
                {currentItem.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              
              <div className="flex items-center space-x-4 bg-[#F5EFE6] p-4 rounded-2xl border border-[#C8963E]/30 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#C8963E]/15 flex items-center justify-center text-[#B8860B] shrink-0 font-bold">
                  ✦
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4E342E] font-sans font-bold">CRAFT DETAIL</span>
                  <p className="font-serif text-base font-bold text-[#1F120C]">{currentItem.metric1}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-[#F5EFE6] p-4 rounded-2xl border border-[#C8963E]/30 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#C8963E]/15 flex items-center justify-center text-[#B8860B] shrink-0 font-bold">
                  ★
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4E342E] font-sans font-bold">PREPARATION</span>
                  <p className="font-serif text-base font-bold text-[#1F120C]">{currentItem.metric2}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-[#F5EFE6] p-4 rounded-2xl border border-[#C8963E]/30 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#C8963E]/15 flex items-center justify-center text-[#B8860B] shrink-0 font-bold">
                  👑
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4E342E] font-sans font-bold">QUALITY</span>
                  <p className="font-serif text-base font-bold text-[#1F120C]">{currentItem.metric3}</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
