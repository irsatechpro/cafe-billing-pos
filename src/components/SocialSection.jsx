import React from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import { CAFE_INFO } from '../data/cafeData';

export default function SocialSection() {
  const instagramPosts = [
    { id: 1, image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=600&auto=format&fit=crop", likes: "1.2k" },
    { id: 2, image: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop", likes: "2.4k" },
    { id: 3, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop", likes: "1.8k" },
    { id: 4, image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=600&auto=format&fit=crop", likes: "3.1k" },
  ];

  return (
    <section className="relative py-24 bg-parchment-50 text-espresso-950 border-t border-gold/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-sans text-gold-dark font-bold">
              INSTAGRAM JOURNAL
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-espresso-950 mt-1">
              FOLLOW THE TRIO BEAN EXPERIENCE
            </h2>
          </div>

          <a
            href={CAFE_INFO.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-gold hover:bg-gold-dark text-parchment-50 font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full hover:shadow-md transition-all"
          >
            <Instagram className="w-4 h-4" />
            <span>FOLLOW @TRIOBEANCAFE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Instagram Post Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href={CAFE_INFO.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl overflow-hidden glass-card aspect-square border border-gold/20 shadow-sm"
            >
              <img
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-espresso-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center space-y-2 text-parchment-50">
                <Instagram className="w-8 h-8 text-gold animate-bounce" />
                <span className="text-xs font-sans font-bold">
                  ♥ {post.likes}
                </span>
                <span className="text-[10px] text-gold-light font-sans uppercase tracking-widest">
                  View on Instagram
                </span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
