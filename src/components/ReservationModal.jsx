import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, CheckCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReservationModal({ isOpen, onClose }) {
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState('2026-09-12');
  const [time, setTime] = useState('17:00');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#C8963E', '#F5EFE6']
    });
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      setName('');
      setPhone('');
      onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/50 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-parchment-50 border border-gold/30 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-8 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-parchment-100 text-espresso-950 hover:text-gold flex items-center justify-center border border-gold/20 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {confirmed ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gold/20 text-gold-dark mx-auto flex items-center justify-center border border-gold">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-3xl font-bold text-espresso-950">
                  RESERVATION CONFIRMED!
                </h3>
                <p className="text-xs text-espresso-600 font-sans max-w-xs mx-auto">
                  We look forward to welcoming you to Trio Bean Cafe on <span className="text-gold-dark font-bold">{date}</span> at <span className="text-gold-dark font-bold">{time}</span> for <span className="text-gold-dark font-bold">{guests} guests</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-2 text-gold-dark text-[11px] font-sans tracking-[0.25em] uppercase font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>TABLE RESERVATION</span>
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-espresso-950">
                    RESERVE YOUR TABLE
                  </h3>
                </div>

                {/* Guest Count */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-espresso-900 font-sans font-semibold flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gold-dark" />
                    <span>Number of Guests</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuests(num)}
                        className={`flex-1 py-2 rounded-xl text-xs font-sans font-bold transition-all ${
                          guests === num
                            ? 'bg-gold text-parchment-50 shadow-md'
                            : 'bg-parchment-200 text-espresso-900 hover:bg-parchment-300'
                        }`}
                      >
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-espresso-900 font-sans font-semibold flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-gold-dark" />
                      <span>Date</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-parchment-100 border border-gold/30 rounded-xl px-4 py-2.5 text-xs text-espresso-950 focus:outline-none focus:border-gold font-sans"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-espresso-900 font-sans font-semibold flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-gold-dark" />
                      <span>Time</span>
                    </label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-parchment-100 border border-gold/30 rounded-xl px-4 py-2.5 text-xs text-espresso-950 focus:outline-none focus:border-gold font-sans"
                    >
                      <option value="09:00">09:00 AM — Morning Brew</option>
                      <option value="12:00">12:00 PM — Artisanal Lunch</option>
                      <option value="15:00">03:00 PM — Afternoon Tasting</option>
                      <option value="17:00">05:00 PM — Twilight Lounge</option>
                      <option value="19:30">07:30 PM — Evening Dessert</option>
                    </select>
                  </div>
                </div>

                {/* Contact Inputs */}
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-parchment-100 border border-gold/30 rounded-xl px-4 py-3 text-xs text-espresso-950 placeholder-espresso-600/50 focus:outline-none focus:border-gold font-sans"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (+91)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-parchment-100 border border-gold/30 rounded-xl px-4 py-3 text-xs text-espresso-950 placeholder-espresso-600/50 focus:outline-none focus:border-gold font-sans"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-gold hover:bg-gold-dark text-parchment-50 font-bold text-xs uppercase tracking-widest transition-all shadow-md"
                >
                  CONFIRM RESERVATION
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
