import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, ArrowUp, Send, Check } from 'lucide-react';
import Logo from './Logo';
import { CAFE_INFO } from '../data/cafeData';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setNewsletterEmail('');
    }, 3000);
  };

  return (
    <footer className="relative bg-parchment-100 text-espresso-950 border-t border-gold/20 overflow-hidden pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-gold/20">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Logo size="lg" className="!items-start !text-left" />

            <p className="text-xs text-espresso-600 font-sans leading-relaxed max-w-sm">
              Fresh • Tasty • Made Daily. Trio Bean Cafe is a cozy sanctuary serving handcrafted coffees, fresh fruit juices, thick shakes, sandwiches, burgers, and delicious desserts.
            </p>

            <p className="font-serif italic text-sm text-gold-dark font-semibold">
              "{CAFE_INFO.tagline}"
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4 pt-2">
              <a
                href={CAFE_INFO.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-parchment-50 border border-gold/30 text-espresso-950 hover:text-gold hover:border-gold flex items-center justify-center transition-all shadow-sm"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={CAFE_INFO.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-parchment-50 border border-gold/30 text-espresso-950 hover:text-gold hover:border-gold flex items-center justify-center transition-all shadow-sm"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={CAFE_INFO.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full bg-parchment-50 border border-gold/30 text-espresso-950 hover:text-gold hover:border-gold flex items-center justify-center transition-all shadow-sm"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-espresso-950">NAVIGATION</h4>
            <ul className="space-y-2.5 text-xs font-sans text-espresso-600">
              <li><a href="#home" className="hover:text-gold transition-colors">Home</a></li>
              <li><a href="#menu" className="hover:text-gold transition-colors">Our Menu</a></li>
              <li><a href="#about" className="hover:text-gold transition-colors">About Us</a></li>
              <li><a href="#specialties" className="hover:text-gold transition-colors">Specialties</a></li>
              <li><a href="#experience3d" className="hover:text-gold transition-colors">3D Experience</a></li>
              <li><a href="#gallery" className="hover:text-gold transition-colors">Gallery</a></li>
              <li><a href="#contact" className="hover:text-gold transition-colors">Contact & Location</a></li>
            </ul>
          </div>

          {/* Hours & Contact */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-espresso-950">HOURS & CONTACT</h4>
            <div className="space-y-2 text-xs font-sans text-espresso-600">
              <p><span className="text-gold-dark font-bold">Mon – Fri:</span> 08:00 AM – 10:30 PM</p>
              <p><span className="text-gold-dark font-bold">Sat – Sun:</span> 08:00 AM – 11:30 PM</p>
              <p className="pt-2 text-espresso-900 font-medium">{CAFE_INFO.address}</p>
              <p className="text-espresso-900 font-medium">{CAFE_INFO.phone}</p>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-espresso-950">BEAUTIFUL MOMENTS</h4>
            <p className="text-xs text-espresso-600 font-sans leading-relaxed">
              Subscribe for special offers, seasonal menus, and fresh updates.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-parchment-50 border border-gold/40 rounded-full py-2.5 px-4 text-xs text-espresso-950 placeholder-espresso-600/50 focus:outline-none focus:border-gold pr-10 shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-gold text-parchment-50 flex items-center justify-center hover:bg-gold-dark transition-colors"
                >
                  {subscribed ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
              {subscribed && (
                <p className="text-[10px] text-gold-dark font-sans font-bold">
                  ✓ Welcome to Trio Bean Cafe Society!
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-espresso-600">
          <p>© {new Date().getFullYear()} TRIO BEAN CAFÉ. ALL RIGHTS RESERVED.</p>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-2 text-espresso-800 hover:text-gold transition-colors focus:outline-none"
          >
            <span>BACK TO TOP</span>
            <div className="w-7 h-7 rounded-full bg-parchment-50 border border-gold/30 flex items-center justify-center shadow-sm">
              <ArrowUp className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

      </div>
    </footer>
  );
}
