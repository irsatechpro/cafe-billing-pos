import React from 'react';
import { MapPin, Phone, Mail, Clock, Navigation, Calendar } from 'lucide-react';
import { CAFE_INFO } from '../data/cafeData';

export default function LocationContactSection({ onOpenReservation, onExploreMenu }) {
  return (
    <section id="contact" className="relative py-28 bg-parchment-100 text-espresso-950 overflow-hidden border-t border-gold/15">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Hero CTA Box */}
        <div className="glass-card p-8 sm:p-14 rounded-3xl border border-gold/30 text-center max-w-4xl mx-auto mb-20 shadow-xl relative overflow-hidden bg-parchment-50">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />

          <span className="text-xs uppercase tracking-[0.3em] font-sans text-gold-dark font-bold">
            YOUR TABLE IS READY
          </span>

          <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-espresso-950 mt-2 mb-4 leading-tight">
            YOUR NEXT COFFEE<br />
            <span className="italic font-normal text-gold-dark">IS WAITING.</span>
          </h2>

          <p className="text-base text-espresso-600 font-sans font-light max-w-lg mx-auto mb-8">
            Come by, slow down, and enjoy the Trio Bean Cafe experience.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(CAFE_INFO.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-gold hover:bg-gold-dark text-parchment-50 px-7 py-3.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all shadow-md"
            >
              <Navigation className="w-4 h-4 text-parchment-50" />
              <span>GET DIRECTIONS</span>
            </a>

            <a
              href={`tel:${CAFE_INFO.phone}`}
              className="inline-flex items-center space-x-2 border border-gold/40 hover:border-gold text-espresso-950 px-7 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all bg-parchment-100 shadow-sm"
            >
              <Phone className="w-4 h-4 text-gold-dark" />
              <span>CALL US</span>
            </a>

            <button
              onClick={onOpenReservation}
              className="inline-flex items-center space-x-2 bg-parchment-200 border border-gold/40 text-espresso-950 px-7 py-3.5 rounded-full text-xs uppercase tracking-widest font-semibold hover:border-gold transition-all"
            >
              <Calendar className="w-4 h-4 text-gold-dark" />
              <span>BOOK A TABLE</span>
            </button>
          </div>
        </div>

        {/* Contact Info & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact Details & Hours */}
          <div className="lg:col-span-5 space-y-8">
            
            <div>
              <h3 className="font-serif text-3xl font-bold text-espresso-950 mb-6">
                CAFÉ INFORMATION
              </h3>

              <div className="space-y-6">
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold-dark shrink-0 mt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-serif text-base font-bold text-espresso-950">ADDRESS</h5>
                    <p className="text-xs text-espresso-600 font-sans leading-relaxed mt-1">
                      {CAFE_INFO.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold-dark shrink-0 mt-1">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-serif text-base font-bold text-espresso-950">PHONE & ORDERS</h5>
                    <p className="text-xs text-espresso-600 font-sans mt-1">
                      {CAFE_INFO.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold-dark shrink-0 mt-1">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-serif text-base font-bold text-espresso-950">EMAIL</h5>
                    <p className="text-xs text-espresso-600 font-sans mt-1">
                      {CAFE_INFO.email}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Hours Table */}
            <div className="glass-card p-6 rounded-2xl border border-gold/30 space-y-4 bg-parchment-50">
              <div className="flex items-center space-x-2 text-gold-dark font-serif font-bold text-lg">
                <Clock className="w-5 h-5" />
                <span>OPENING HOURS</span>
              </div>
              <div className="space-y-3 divide-y divide-gold/20 text-xs font-sans">
                {CAFE_INFO.openingHours.map((schedule) => (
                  <div key={schedule.days} className="pt-2 flex justify-between">
                    <span className="text-espresso-800 font-medium">{schedule.days}</span>
                    <span className="text-gold-dark font-bold">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Interactive Map Container */}
          <div className="lg:col-span-7 h-full min-h-[420px] rounded-3xl overflow-hidden glass-card border border-gold/30 relative shadow-md">
            <iframe
              title="Trio Bean Cafe Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52890.00760431267!2d-118.273683!3d34.052235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDAzJzA4LjAiTiAxMTLCsDE0JzM3LjIiVw!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full min-h-[420px]"
            />
            
            {/* Map Overlay Badge */}
            <div className="absolute bottom-4 left-4 bg-parchment-50 border border-gold/40 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-xl">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <span className="text-xs font-serif font-bold text-espresso-950 block">TRIO BEAN CAFÉ</span>
                <span className="text-[10px] text-gold-dark uppercase tracking-widest font-sans font-bold">Open Daily</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
