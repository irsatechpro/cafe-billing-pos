import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Calendar, PhoneCall } from 'lucide-react';
import Logo from './Logo';
import { CAFE_INFO } from '../data/cafeData';

export default function Navbar({ onOpenOrder, onOpenReservation, cartCount = 0 }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'HOME', href: '#home' },
    { name: 'OUR MENU', href: '#menu' },
    { name: 'ABOUT US', href: '#about' },
    { name: 'SPECIALTIES', href: '#specialties' },
    { name: '3D EXPERIENCE', href: '#experience3d' },
    { name: 'GALLERY', href: '#gallery' },
    { name: 'CONTACT', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#FDFBF7]/95 backdrop-blur-md py-2.5 shadow-md border-b border-[#C8963E]/30'
          : 'bg-[#FDFBF7]/85 backdrop-blur-sm py-4 border-b border-[#C8963E]/15'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo with Crown Monogram */}
          <Logo size="md" />

          {/* Desktop Nav Links - Dark High Contrast */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-[0.2em] font-sans text-[#1F120C] hover:text-[#C8963E] font-extrabold transition-colors py-1 relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#C8963E] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            
            {/* Table Reservation Button */}
            <button
              onClick={onOpenReservation}
              className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#1F120C] hover:text-[#C8963E] font-bold border-2 border-[#C8963E]/50 hover:border-[#C8963E] px-4 py-2.5 rounded-full transition-all duration-300 bg-[#F5EFE6] shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C8963E]" />
              <span>Reserve Table</span>
            </button>

            {/* Menu & Cart Button */}
            <button
              onClick={onOpenOrder}
              className="relative flex items-center space-x-2 bg-[#C8963E] hover:bg-[#B8860B] text-[#FDFBF7] font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full hover:shadow-[0_0_20px_rgba(200,150,62,0.35)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-4 h-4 text-[#FDFBF7]" />
              <span>VIEW MENU</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1F120C] text-[#FDFBF7] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FDFBF7]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center space-x-3 lg:hidden">
            <button
              onClick={onOpenOrder}
              aria-label="View Order Cart"
              className="relative p-2 text-[#1F120C] hover:text-[#C8963E] focus:outline-none"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#C8963E] text-[#FDFBF7] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="p-2 text-[#1F120C] hover:text-[#C8963E] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-7 h-7 text-[#C8963E]" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[70px] bg-[#FDFBF7] z-50 flex flex-col justify-between p-8 border-t border-[#C8963E]/30 animate-fadeIn">
          <div className="flex flex-col space-y-5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-serif tracking-widest text-[#1F120C] font-bold hover:text-[#C8963E] transition-colors flex items-center justify-between border-b border-[#E5DCCB] pb-3"
              >
                <span>{link.name}</span>
                <span className="text-[#C8963E] text-xs">→</span>
              </a>
            ))}
          </div>

          <div className="flex flex-col space-y-3 pt-6 border-t border-[#E5DCCB]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReservation();
              }}
              className="w-full py-3.5 rounded-full border-2 border-[#C8963E] text-[#1F120C] text-xs uppercase tracking-widest font-bold flex items-center justify-center space-x-2 bg-[#F5EFE6]"
            >
              <Calendar className="w-4 h-4 text-[#C8963E]" />
              <span>RESERVE A TABLE</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOrder();
              }}
              className="w-full py-3.5 rounded-full bg-[#C8963E] text-[#FDFBF7] text-xs uppercase tracking-widest font-bold flex items-center justify-center space-x-2 shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>EXPLORE MENU & ORDER</span>
            </button>
            <a
              href={`tel:${CAFE_INFO.phone}`}
              className="w-full py-3 text-center text-[#4E342E] hover:text-[#C8963E] text-xs tracking-widest flex items-center justify-center space-x-2 font-bold"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>CALL CAFÉ: {CAFE_INFO.phone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
