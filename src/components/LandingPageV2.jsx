import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ArrowRight, Zap, Lock, TrendingUp, FileText, Sparkles, Brain } from 'lucide-react';

const LandingPageV2 = ({ onEnter }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [cardRotations, setCardRotations] = useState({});
  const observerRef = useRef(null);
  const cardsRef = useRef({});

  // 3D Mouse Tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouse({ x: e.clientX, y: e.clientY });
      
      // Update card rotations based on mouse position
      Object.keys(cardsRef.current).forEach((cardId) => {
        const card = cardsRef.current[cardId];
        if (card) {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const rotateX = (e.clientY - centerY) * 0.02;
          const rotateY = (e.clientX - centerX) * -0.02;
          setCardRotations(prev => ({
            ...prev,
            [cardId]: { rotateX, rotateY }
          }));
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll Reveal Animation dengan Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'slideUpFade 0.8s ease-out forwards';
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach((el) => (el.style.opacity = '0', el.style.transform = 'translateY(40px)'));
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* Scroll Reveal Animation Keyframes */}
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap');
        
        * {
          font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes infiniteScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes parallax {
          0% { transform: translateZ(-50px); }
          100% { transform: translateZ(50px); }
        }

        .glass-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
          transform-style: preserve-3d;
          perspective: 1000px;
        }

        .glass-card:hover {
          border: 1px solid rgba(26, 66, 139, 0.3);
          box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.2), 0 8px 32px rgba(26, 66, 139, 0.15);
          transform: translateY(-4px);
          background: linear-gradient(135deg, rgba(26, 66, 139, 0.05) 0%, rgba(26, 66, 139, 0.02) 100%);
        }

        .glow-button {
          position: relative;
          overflow: hidden;
        }

        .glow-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          width: 100px;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-50%) skewX(-20deg);
          animation: glow 3s ease-in-out infinite;
        }

        .marquee-container {
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%);
        }

        .marquee-scroll {
          display: flex;
          animation: infiniteScroll 30s linear infinite;
          gap: 4rem;
        }

        .marquee-scroll:hover {
          animation-play-state: paused;
        }

        .gradient-text {
          background: linear-gradient(144.5deg, white 28%, rgba(0,0,0,0) 115%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .code-editor {
          background: #09090b;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .code-editor::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }

        .traffic-lights {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .traffic-light {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .traffic-red { background: #ff5f56; }
        .traffic-yellow { background: #ffbd2e; }
        .traffic-green { background: #27c93f; }

        .code-content {
          padding: 1.5rem;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #e0e0e0;
          overflow-x: auto;
        }

        .keyword { color: #f07178; font-weight: 600; }
        .class { color: #e5c07b; font-weight: 600; }
        .string { color: #c3e88d; }
        .comment { color: #6b7280; }
        .boolean { color: #89ddff; font-weight: 600; }

        .ambient-blur {
          position: absolute;
          width: 800px;
          height: 800px;
          background: rgba(255,255,255,0.02);
          filter: blur(120px);
          border-radius: 50%;
          pointer-events: none;
        }

        .grid-pattern {
          background-image: 
            linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 800px 400px at center, black, transparent);
        }
      `}</style>

      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative w-full h-screen flex flex-col overflow-hidden">
        {/* Fullscreen Video */}
        <video
          autoPlay
          muted
          playsInline
          loop
          className="absolute inset-0 w-full h-full object-cover"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23000'/%3E%3C/svg%3E"
        >
          <source 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4"
            type="video/mp4"
          />
        </video>

        {/* 50% Black Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* 300px Gradient Fade at Bottom */}
        <div className="absolute bottom-0 w-full h-[300px] bg-gradient-to-b from-transparent to-black" />

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-[120px] py-5" data-reveal>
          {/* Logo - Bea Cukai DJBC */}
          <div className="flex items-center gap-3" style={{ color: '#1A428B' }}>
            <div className="text-2xl font-bold" style={{ color: '#1A428B' }}>🏛️</div>
            <div className="flex flex-col">
              <div className="text-white font-bold text-sm tracking-tight">CEISA DOC GEN</div>
              <div className="text-xs text-white/60">Bea Cukai DJBC</div>
            </div>
          </div>

          {/* Nav Links - Hidden on Mobile */}
          <div className="hidden lg:flex items-center gap-[30px]">
            {['Features', 'Capabilities', 'Resources'].map((link) => (
              <div key={link} className="flex items-center gap-2 cursor-pointer group">
                <span className="text-white text-sm font-medium">{link}</span>
                <ChevronDown size={14} className="text-white opacity-50 group-hover:opacity-100 transition" />
              </div>
            ))}
          </div>

          {/* Right CTA */}
          <button className="glow-button relative px-[29px] py-[11px] rounded-full border-[0.6px] font-medium hover:bg-opacity-90 transition duration-300" style={{ borderColor: '#1A428B', backgroundColor: '#1A428B', color: 'white' }}>
            <span className="relative z-10">Get Started</span>
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 pt-[200px] md:pt-[280px]">
          {/* Badge */}
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-[20px] border font-medium mb-8"
            data-reveal
            style={{ borderColor: '#1A428B', backgroundColor: 'rgba(26, 66, 139, 0.1)', color: '#1A428B' }}
          >
            <Sparkles size={14} />
            <span className="text-xs md:text-sm">Powered by AI-Assisted Documentation</span>
          </div>

          {/* Main Heading */}
          <h1 
            className="text-5xl md:text-7xl font-medium text-center max-w-4xl leading-[1.28] mb-6 gradient-text"
            data-reveal
          >
            Automated Project Documentation for Bea Cukai
          </h1>

          {/* Subtitle */}
          <p 
            className="text-base md:text-lg text-white/70 text-center max-w-3xl mb-8"
            data-reveal
          >
            Generate comprehensive project documentation with AI-powered section filling. Control token usage, maintain compliance, and deliver professional documentation in minutes.
          </p>

          {/* CTA Button */}
          <button 
            className="relative px-[29px] py-[14px] rounded-full border-[0.6px] text-sm font-medium hover:opacity-90 transition duration-300"
            onClick={onEnter}
            data-reveal
            style={{ borderColor: '#1A428B', backgroundColor: '#1A428B', color: 'white' }}
          >
            <span className="relative z-10">Launch Application</span>
          </button>
        </div>
      </section>

      {/* ─── 2. TRUSTED BY TICKER ─── */}
      <section className="relative w-full py-16 bg-black overflow-hidden border-y border-white/5" data-reveal>
        <div className="marquee-container">
          <div className="marquee-scroll">
            {['Bea Cukai DJBC', 'AI Technology', 'Doc Generation', 'Smart Budget', 'Compliance First'].map((brand, idx) => (
              <React.Fragment key={idx}>
                <div className={`text-white/40 font-medium tracking-wide whitespace-nowrap ${idx % 2 === 0 ? 'italic' : 'tracking-widest'}`}>
                  {brand}
                </div>
                <div className="text-white/40">•</div>
              </React.Fragment>
            ))}
            {['Bea Cukai DJBC', 'AI Technology', 'Doc Generation', 'Smart Budget', 'Compliance First'].map((brand, idx) => (
              <React.Fragment key={`repeat-${idx}`}>
                <div className={`text-white/40 font-medium tracking-wide whitespace-nowrap ${idx % 2 === 0 ? 'italic' : 'tracking-widest'}`}>
                  {brand}
                </div>
                <div className="text-white/40">•</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. FEATURES BENTO BOX ─── */}
      <section className="relative w-full py-24 bg-black px-4 md:px-8">
        {/* Ambient Blur */}
        <div className="absolute ambient-blur top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10" style={{ background: 'rgba(26, 66, 139, 0.1)' }} />

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-16" data-reveal>
            <h2 className="text-5xl md:text-6xl font-medium bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent mb-4">
              Intelligent Documentation at Scale
            </h2>
            <p className="text-white/50 text-lg">
              AI-powered section filling with complete control and transparency
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-reveal>
            {/* Large Card 1 - AI Filling */}
            <div 
              ref={(el) => { cardsRef.current['card1'] = el; }}
              className="glass-card md:col-span-2 p-8 rounded-lg relative overflow-hidden group cursor-pointer transition-all"
              style={{
                transform: cardRotations['card1'] ? `perspective(1000px) rotateX(${cardRotations['card1'].rotateX}deg) rotateY(${cardRotations['card1'].rotateY}deg)` : 'perspective(1000px) rotateX(0) rotateY(0)',
                transitionDuration: '0.1s'
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -z-10" style={{ background: 'rgba(26, 66, 139, 0.2)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <Brain size={28} style={{ color: '#1A428B' }} />
                  <h3 className="text-2xl md:text-3xl font-medium">AI-Powered Filling</h3>
                </div>
                <p className="text-white/60">Auto-generate research, requirements, and specifications with intelligent AI, while maintaining complete control and budget transparency.</p>
              </div>
            </div>

            {/* Small Card 2 - Budget Control */}
            <div 
              ref={(el) => { cardsRef.current['card2'] = el; }}
              className="glass-card p-8 rounded-lg cursor-pointer transition-all"
              style={{
                transform: cardRotations['card2'] ? `perspective(1000px) rotateX(${cardRotations['card2'].rotateX}deg) rotateY(${cardRotations['card2'].rotateY}deg)` : 'perspective(1000px) rotateX(0) rotateY(0)',
                transitionDuration: '0.1s'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} style={{ color: '#1A428B' }} />
                <h3 className="text-xl md:text-2xl font-medium">Smart Budget</h3>
              </div>
              <p className="text-white/60 text-sm">$1 hard cap per document with real-time cost tracking and per-section control.</p>
            </div>

            {/* Small Card 3 - Government Compliance */}
            <div 
              ref={(el) => { cardsRef.current['card3'] = el; }}
              className="glass-card p-8 rounded-lg cursor-pointer transition-all"
              style={{
                transform: cardRotations['card3'] ? `perspective(1000px) rotateX(${cardRotations['card3'].rotateX}deg) rotateY(${cardRotations['card3'].rotateY}deg)` : 'perspective(1000px) rotateX(0) rotateY(0)',
                transitionDuration: '0.1s'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Lock size={20} style={{ color: '#1A428B' }} />
                <h3 className="text-xl md:text-2xl font-medium">Government Grade</h3>
              </div>
              <p className="text-white/60 text-sm">Compliant with Bea Cukai standards and Indonesian government documentation requirements.</p>
            </div>

            {/* Large Card 4 - Comprehensive Sections */}
            <div 
              ref={(el) => { cardsRef.current['card4'] = el; }}
              className="glass-card md:col-span-2 p-8 rounded-lg relative overflow-hidden group cursor-pointer transition-all"
              style={{
                transform: cardRotations['card4'] ? `perspective(1000px) rotateX(${cardRotations['card4'].rotateX}deg) rotateY(${cardRotations['card4'].rotateY}deg)` : 'perspective(1000px) rotateX(0) rotateY(0)',
                transitionDuration: '0.1s'
              }}
            >
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl -z-10" style={{ background: 'rgba(26, 66, 139, 0.2)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <FileText size={28} style={{ color: '#1A428B' }} />
                  <h3 className="text-2xl md:text-3xl font-medium">15 Critical Sections</h3>
                </div>
                <p className="text-white/60">Cover UAW, UUCW, BRD, FSD, Charter, and Kajian with automatic priority filling for research-focused documentation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. METRICS SECTION ─── */}
      <section className="relative w-full py-16 bg-black border-y border-white/5 backdrop-blur-md bg-black/50" data-reveal>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-white/10">
            {[
              { metric: '92%', label: 'Cost Reduction vs Manual' },
              { metric: '<$0.01', label: 'Per Document Average' },
              { metric: '15', label: 'Auto-Fillable Sections' },
            ].map((item, idx) => (
              <div key={idx} className="py-8 px-8 text-center">
                <div className="gradient-text text-5xl md:text-6xl font-medium mb-2" style={{ backgroundImage: `linear-gradient(144.5deg, #1A428B 28%, rgba(26, 66, 139, 0) 115%)` }}>
                  {item.metric}
                </div>
                <p className="text-white/50 text-sm md:text-base">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. DEVELOPER SECTION ─── */}
      <section className="relative w-full py-32 bg-black grid-pattern" data-reveal>
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
          {/* Developer Badge */}
          <div className="px-4 py-2 rounded-full border border-white/15 text-white/60 text-xs uppercase tracking-widest font-medium mb-8" style={{ borderColor: '#1A428B', color: '#1A428B' }}>
            Developer First
          </div>

          {/* Heading */}
          <h2 className="text-5xl md:text-6xl font-medium text-center mb-6">
            Section-Level AI Control
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-2xl text-white/50 text-center max-w-2xl mb-8">
            Click "Fill with AI" per section. Real-time budget tracking. Maximum $1 per document.
          </p>

          {/* Documentation Link */}
          <a 
            href="#docs"
            className="group flex items-center gap-2 text-white/70 hover:text-white transition mb-16 cursor-pointer"
          >
            <span>View Documentation</span>
            <ArrowRight size={16} className="group-hover:translate-x-2 transition" />
          </a>

          {/* Code Editor */}
          <div className="relative w-full max-w-2xl">
            {/* Ambient Glow */}
            <div className="absolute inset-0 rounded-lg opacity-30 -z-10" style={{ background: 'rgba(26, 66, 139, 0.3)', filter: 'blur(3rem)' }} />

            <div className="code-editor">
              {/* Header with Traffic Lights */}
              <div className="flex items-center justify-between bg-black/80 border-b border-white/5">
                <div className="traffic-lights">
                  <div className="traffic-light traffic-red" />
                  <div className="traffic-light traffic-yellow" />
                  <div className="traffic-light traffic-green" />
                </div>
                <span className="text-white/50 text-xs mx-auto">usage.ts</span>
                <div className="w-16" />
              </div>

              {/* Code Content */}
              <div className="code-content">
{`<span className="keyword">// 1. Upload document</span>
<span className="keyword">const</span> <span className="class">document</span> = <span className="keyword">await</span> <span className="class">uploadFile</span>();

<span className="keyword">// 2. Click "Fill with AI" button</span>
<span className="keyword">const</span> <span className="class">heroSection</span> = <span className="keyword">await</span> <span className="class">fillSectionWithAI</span>({
  <span className="class">section</span>: <span className="string">'actors'</span>,
  <span className="class">budget</span>: <span className="string">'1.00'</span>
});

<span className="keyword">// 3. Monitor real-time cost</span>
<span className="keyword">if</span> (budgetUsed > <span className="string">'0.80'</span>) {
  <span className="class">showWarning</span>(<span className="string">'Approaching budget'</span>);
}

<span className="comment">// Full control, zero surprises</span>`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. BOTTOM CTA ─── */}
      <section className="relative w-full py-32 bg-black flex flex-col items-center justify-center overflow-hidden" data-reveal>
        {/* Massive Radial Blur with Bea Cukai color */}
        <div className="absolute w-[600px] h-[400px] rounded-full blur-[100px] -z-10" style={{ background: 'rgba(26, 66, 139, 0.2)' }} />

        {/* Content */}
        <div className="max-w-3xl text-center px-4">
          <h2 className="text-6xl md:text-7xl font-medium mb-6 gradient-text">
            Start Generating Docs Today
          </h2>
          <p className="text-lg md:text-xl text-white/70 mb-12">
            Join project managers and documentation specialists at Bea Cukai who are saving hours with AI-powered section filling and complete budget control.
          </p>
          <button 
            className="relative px-[36px] py-[14px] rounded-full border-[0.6px] text-sm font-medium hover:opacity-90 transition duration-300"
            onClick={onEnter}
            style={{ borderColor: '#1A428B', backgroundColor: '#1A428B', color: 'white' }}
          >
            <span className="relative z-10">Launch Application</span>
          </button>
        </div>
      </section>

      {/* ─── 7. FOOTER ─── */}
      <footer className="relative w-full py-12 bg-black border-t border-white/10 px-8" data-reveal>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2" style={{ color: '#1A428B' }}>
              <span className="text-2xl font-bold">🏛️</span>
              <div>
                <div className="text-white font-bold text-sm">CEISA DOC GEN</div>
                <div className="text-xs text-white/60">Bea Cukai DJBC</div>
              </div>
            </div>

            {/* Center Links */}
            <div className="flex gap-8 text-center md:text-left">
              {['Documentation', 'Support', 'GitHub', 'Contact'].map((link) => (
                <a 
                  key={link}
                  href="#"
                  className="text-sm text-white/50 hover:text-white transition cursor-pointer"
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-sm text-white/30">
              © 2024 CEISA. Bea Cukai DJBC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageV2;
