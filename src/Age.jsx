import React, { useState } from "react";

export default function FunFactsModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [funFacts, setFunFacts] = useState(null);

  const calculateFunFacts = (dobString) => {
    const dobDate = new Date(dobString);
    const now = new Date();
    const diffMs = now - dobDate;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor(diffMs / (1000 * 60));
    const seconds = Math.floor(diffMs / 1000);

    const approxSunsets = days;
    const approxBreaths = minutes * 16;
    const heartbeats = hours * 70;
    const meals = days * 3;
    const steps = days * 7500;
    const laughs = days * 15;
    const dreamHours = hours / 3;

    return [
      `You’ve been alive for ${days.toLocaleString()} days!`,
      `You’ve seen approximately ${approxSunsets.toLocaleString()} sunsets!`,
      `You’ve taken around ${approxBreaths.toLocaleString()} breaths!`,
      `Your heart has beaten about ${heartbeats.toLocaleString()} times!`,
      `You’ve enjoyed roughly ${meals.toLocaleString()} meals!`,
      `You’ve walked about ${steps.toLocaleString()} steps!`,
      `You’ve laughed around ${laughs.toLocaleString()} times!`,
      `You’ve spent ${Math.floor(dreamHours).toLocaleString()} hours dreaming!`,
      `That’s roughly ${hours.toLocaleString()} hours of adventures!`,
      `Or about ${minutes.toLocaleString()} minutes of memories!`,
      `And ${seconds.toLocaleString()} seconds of pure existence!`
    ];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !dob) return;
    setFunFacts(calculateFunFacts(dob));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl w-full max-w-lg p-6 relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white text-2xl font-bold transition"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Fun Facts About You!
        </h2>

        {!funFacts ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 backdrop-blur-sm border border-white/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
              required
            />
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 backdrop-blur-sm border border-white/20 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-xl text-white font-bold hover:scale-105 transform transition"
            >
              Show Fun Facts
            </button>
          </form>
        ) : (
          <div className="mt-4 flex flex-col h-[400px]">
            <p className="text-lg text-gray-200 mb-4 text-center">
              Hey <span className="text-purple-400 font-semibold">{name}</span>, check these out:
            </p>
            
            <div className="flex-1 overflow-hidden">
              <ul className="space-y-3 pr-1 h-full overflow-y-auto hide-scrollbar">
                {funFacts.map((fact, idx) => (
                  <li
                    key={idx}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-white font-medium transition hover:bg-white/15"
                  >
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
            
            <button
              onClick={() => setFunFacts(null)}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-xl text-white font-bold hover:scale-105 transform transition"
            >
              Calculate Again
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}