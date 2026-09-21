import React from 'react';
import { Crown } from 'lucide-react';

export default function Logo({ size = 'md', className = '' }) {
  const isHero = size === 'hero';
  const isLarge = size === 'lg' || isHero;

  return (
    <a href="#home" className={`group flex flex-col items-center text-center focus:outline-none ${className}`}>
      
      {/* Crown + TB Monogram Emblem */}
      <div className="relative flex items-center justify-center mb-1.5">
        <div className={`rounded-full border-2 border-[#C8963E] flex flex-col items-center justify-center bg-[#F5EFE6] group-hover:border-[#B8860B] transition-all shadow-md ${
          isHero ? 'w-20 h-20 border-3' : isLarge ? 'w-14 h-14' : 'w-11 h-11'
        }`}>
          <Crown className={`text-[#C8963E] font-bold fill-[#C8963E]/30 ${
            isHero ? 'w-7 h-7 -mt-1' : isLarge ? 'w-5 h-5 -mt-0.5' : 'w-3.5 h-3.5 -mt-0.5'
          }`} />
          <span className={`font-serif font-extrabold text-[#1F120C] leading-none tracking-tighter ${
            isHero ? 'text-2xl' : isLarge ? 'text-base' : 'text-xs'
          }`}>
            TB
          </span>
        </div>
      </div>

      {/* Brand Text */}
      <span className={`font-serif font-black tracking-[0.18em] text-[#1F120C] group-hover:text-[#C8963E] transition-colors leading-none ${
        isHero ? 'text-4xl sm:text-5xl md:text-6xl text-[#1F120C]' : isLarge ? 'text-3xl' : 'text-2xl'
      }`}>
        TRIO BEAN
      </span>
      <span className={`uppercase tracking-[0.4em] font-sans font-extrabold text-[#B8860B] ${
        isHero ? 'text-sm sm:text-base mt-1.5' : 'text-[10px] mt-0.5'
      }`}>
        C A F É
      </span>
    </a>
  );
}
