import React from 'react';
import { Coffee, Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md', message = 'Loading...', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 space-y-3 ${className}`}>
      {/* Animated Trio Bean Coffee Emblem Indicator */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Outer Gold Halo */}
        <div className="absolute w-12 h-12 rounded-full bg-[#C8963E]/20 animate-ping" />
        
        {/* Spinning Gold Ring */}
        <div className="w-12 h-12 rounded-full border-3 border-[#EFE6D8] border-t-[#C8963E] border-r-[#C8963E] animate-spin" />
        
        {/* Center Cup */}
        <div className="absolute w-7 h-7 rounded-full bg-[#2C1A14] flex items-center justify-center text-[#E5C170] shadow-xs">
          <Coffee className="w-4 h-4" />
        </div>
      </div>

      {message && (
        <span className="font-serif text-xs font-bold tracking-wider text-[#2C1A14] uppercase">
          {message}
        </span>
      )}
    </div>
  );
}

export function PageLoader({ message = 'Loading Trio Bean Café...' }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FAF6F0] p-6 text-center">
      <div className="relative mb-4">
        {/* Outer Pulsing Glow */}
        <div className="absolute -inset-2 rounded-full bg-[#C8963E]/25 blur-md animate-pulse" />
        
        {/* Spinning Activity Ring */}
        <div className="relative w-16 h-16 rounded-full border-4 border-[#EFE6D8] border-t-[#C8963E] border-r-[#C8963E] animate-spin flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#2C1A14] flex items-center justify-center text-[#E5C170] shadow-md">
            <Coffee className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </div>

      <h3 className="font-serif font-bold text-base text-[#2C1A14] tracking-wide mb-1">
        TRIO BEAN CAFÉ
      </h3>
      <p className="text-xs text-[#6D4C41] font-medium tracking-wide">
        {message}
      </p>
    </div>
  );
}

export default LoadingSpinner;
