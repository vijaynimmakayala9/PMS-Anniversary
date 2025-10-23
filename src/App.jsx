import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Code, Zap, Users, Trophy, Sparkles } from 'lucide-react';
import Age from './Age';

export default function App() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);
  const rocketRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null, radius: 100 });

  // Company details
  const company = {
    name: "PixelmindSolutions Private Limited",
    foundingDate: new Date('2024-12-25T00:00:00'),
    anniversaryDate: new Date('2025-12-25T00:00:00'),
    logo: "/logo.png"
  };

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        radius: 120 // interaction radius
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = {
        x: null,
        y: null,
        radius: 120
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = company.anniversaryDate.getTime() - now;
      const totalTime = company.anniversaryDate.getTime() - company.foundingDate.getTime();
      const elapsed = now - company.foundingDate.getTime();
      const progressPercent = (elapsed / totalTime) * 100;
      setProgress(Math.min(progressPercent, 100));

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [company.foundingDate, company.anniversaryDate]);

  // Particle System with mouse interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const particleCount = 200;
    const particleProps = {
      radius: { min: 0.5, max: 1.2 }, // slightly larger particles
      speed: 0.2,                     // gentle floating
      connectDistance: 100,           // lines connect nearby particles
      opacity: 0.8,                   // soft glow
      mouseRepelForce: 20,            // subtle repulsion
      twinkle: true,                  // twinkling effect
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * particleProps.speed;
        this.vy = (Math.random() - 0.5) * particleProps.speed;
        this.radius = Math.random() * (particleProps.radius.max - particleProps.radius.min) + particleProps.radius.min;
        this.originalX = this.x;
        this.originalY = this.y;
      }

      update() {
        // Apply mouse repulsion if mouse is near
        const mouse = mouseRef.current;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            // Repel force
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle) * force * (particleProps.mouseRepelForce / 60);
            this.vy += Math.sin(angle) * force * (particleProps.mouseRepelForce / 60);
          }
        }

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Friction to prevent runaway speed
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Boundary bounce with damping
        if (this.x < 0) {
          this.x = 0;
          this.vx = -this.vx * 0.7;
        } else if (this.x > canvas.width) {
          this.x = canvas.width;
          this.vx = -this.vx * 0.7;
        }

        if (this.y < 0) {
          this.y = 0;
          this.vy = -this.vy * 0.7;
        } else if (this.y > canvas.height) {
          this.y = canvas.height;
          this.vy = -this.vy * 0.7;
        }
      }

      draw() {
  ctx.beginPath();
  const flicker = particleProps.twinkle ? Math.random() * 0.3 : 0;
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${220 + Math.random()*35}, ${220 + Math.random()*35}, 255, ${particleProps.opacity - flicker})`;
  ctx.fill();
}

    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < particleProps.connectDistance) {
            const opacity = 1 - distance / particleProps.connectDistance;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(192, 132, 252, ${opacity * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    particlesRef.current = particles;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Rocket Travel Animation (continuous loop)
  useEffect(() => {
    const rocket = rocketRef.current;
    if (!rocket) return;

    const animateRocket = () => {
      const duration = 25000;
      const startTime = performance.now();

      const update = (timestamp) => {
        const elapsed = timestamp - startTime;
        const t = (elapsed % duration) / duration;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const radius = Math.min(window.innerWidth, window.innerHeight) * 0.45;
        const angle = t * Math.PI * 2;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const nextAngle = ((t * Math.PI * 2) + 0.05) % (Math.PI * 2);
        const dx = Math.cos(nextAngle) - Math.cos(angle);
        const dy = Math.sin(nextAngle) - Math.sin(angle);
        const rotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

        rocket.style.left = `${x}px`;
        rocket.style.top = `${y}px`;
        rocket.style.transform = `rotate(${rotation}deg)`;
        rocket.style.display = 'block';

        animationRef.current = requestAnimationFrame(update);
      };

      animationRef.current = requestAnimationFrame(update);
    };

    animateRocket();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const milestones = [
    { icon: <Users className="w-7 h-7" />, text: "20+ Happy Clients", color: "from-indigo-500 to-purple-500" },
    { icon: <Code className="w-7 h-7" />, text: "30+ Projects Delivered", color: "from-pink-500 to-rose-500" },
    { icon: <Zap className="w-7 h-7" />, text: "15+ Team Members", color: "from-amber-400 to-orange-500" },
    // { icon: <Trophy className="w-7 h-7" />, text: "5 Industry Awards", color: "from-emerald-500 to-green-600" }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-900 to-gray-950 text-white overflow-hidden relative">
      {/* Canvas for interactive particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 w-full h-full"
        style={{ background: 'transparent' }}
      />

      {/* Traveling Rocket */}
      <div
        ref={rocketRef}
        className="absolute z-10 pointer-events-none opacity-90 hidden"
        style={{ transition: 'transform 0.1s linear' }}
      >
        <div className="relative">
          <Rocket className="w-8 h-8 text-purple-300 drop-shadow-lg" />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-5 bg-yellow-400 rounded-full animate-pulse opacity-80">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full animate-ping opacity-70"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 py-12">
        {/* Header with Logo and Company Name */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex flex-col items-center mb-6">
            <div className="mb-4 p-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 shadow-lg">
              <img
                src={company.logo}
                alt={`${company.name} Logo`}
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div
                className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                style={{ display: 'none' }}
              >
                {company.name}
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              {company.name}
            </h2>
          </div>

          <div className="inline-block mb-4 relative">
            <Rocket className="w-16 h-16 mx-auto text-purple-400 animate-bounce" />
            <Sparkles className="w-6 h-6 absolute -top-2 -right-2 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            1 Year Journey
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            Celebrating Innovation & Excellence
          </p>
        </div>

        {/* Progress Bar */}
        {/* <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-full h-8 overflow-hidden border border-purple-500/30 shadow-lg">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-1000 ease-out flex items-center justify-end pr-4"
              style={{ width: `${progress}%` }}
            >
              <span className="text-sm font-bold">{progress.toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-center mt-2 text-gray-400">Year Progress</p>
        </div> */}

        {/* Countdown Timer */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-transparent bg-clip-text">
            Time Until Anniversary
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds }
            ].map((item, idx) => (
              <div
                key={item.label}
                className="relative group text-center"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Soft Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-30 blur-2xl rounded-3xl group-hover:opacity-50 transition-opacity"></div>

                {/* Glass Card */}
                <div className="relative bg-white/10 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/20 shadow-lg group-hover:shadow-purple-500/30 transition-transform transform group-hover:-translate-y-1 group-hover:scale-[1.05] flex flex-col items-center">

                  {/* Countdown Number */}
                  <div className="text-5xl md:text-7xl font-extrabold bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent tracking-wide">
                    {String(item.value).padStart(2, '0')}
                  </div>

                  {/* Label */}
                  <div className="text-sm md:text-base text-gray-200 uppercase tracking-wider mt-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            Our Achievements
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {milestones.map((milestone, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer text-center"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                {/* Soft gradient ring glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${milestone.color} opacity-25 blur-2xl rounded-xl group-hover:opacity-40 transition-all`}
                ></div>

                {/* Glassmorphic Card */}
                <div className="relative bg-white/10 dark:bg-slate-900/40 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-white/20 shadow-lg group-hover:shadow-purple-500/20 transition-transform duration-300 transform group-hover:-translate-y-1 group-hover:scale-[1.04] flex flex-col items-center">

                  {/* Icon Centered */}
                  <div className={`flex justify-center items-center p-4 sm:p-5 rounded-xl bg-gradient-to-r ${milestone.color} mb-5 shadow-md group-hover:shadow-lg transition-all text-white`}>
                    {milestone.icon}
                  </div>

                  {/* Milestone Text */}
                  <p className="text-base sm:text-lg font-semibold text-gray-100 tracking-wide group-hover:text-white transition-colors">
                    {milestone.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-block relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <button
              onClick={() => setIsModalOpen(true)}
              className="relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Know Fun Facts About You 🎉
            </button>
          </div>
        </div>

      </div>

      <Age
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}