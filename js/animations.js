/* ============================================================
   HOKR TEAM — animations.js
   Particles, parallax, ambient glow
   ============================================================ */

'use strict';

/* ── PARTICLES ───────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const GOLD   = 'oklch(72% 0.12 68)';
  const COUNT  = window.innerWidth < 768 ? 30 : 60;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomParticle() {
    const size = Math.random() * 1.5 + 0.3;
    const alpha = Math.random() * 0.5 + 0.1;
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r:  size,
      a:  alpha,
      baseA: alpha,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, randomParticle);
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += p.speed;
      p.a = p.baseA * (0.5 + 0.5 * Math.sin(p.phase));

      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.fillStyle = '#c89040';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize, { passive: true });
  init();
  animate();
})();

/* ── PARALLAX HERO ───────────────────────────────────────── */
(function initParallax() {
  const heroContent = document.querySelector('.hero-content');
  const heroBg      = document.querySelector('.hero-video-wrap');
  if (!heroContent || !heroBg) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
          heroBg.style.transform     = `translateY(${scrollY * 0.35}px)`;
          heroContent.style.transform = `translateY(${scrollY * 0.12}px)`;
          heroContent.style.opacity   = Math.max(0, 1 - scrollY / (window.innerHeight * 0.6));
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ── AMBIENT GLOW MOUSE TRACK ────────────────────────────── */
(function initGlowTrack() {
  const glows = document.querySelectorAll('.ambient-glow');
  if (!glows.length || window.matchMedia('(max-width: 768px)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let curX = mouseX, curY = mouseY;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    curX = lerp(curX, mouseX, 0.04);
    curY = lerp(curY, mouseY, 0.04);

    glows.forEach((g, i) => {
      const factor = 1 - i * 0.2;
      const rect = g.closest('section')?.getBoundingClientRect();
      if (!rect || rect.top > window.innerHeight || rect.bottom < 0) return;
      const relX = curX - rect.left;
      const relY = curY - rect.top;
      g.style.left = relX * factor + 'px';
      g.style.top  = relY * factor + 'px';
      g.style.transform = 'translate(-50%, -50%)';
    });

    requestAnimationFrame(tick);
  }

  tick();
})();

/* ── PORTFOLIO HOVER TILT ────────────────────────────────── */
(function initTilt() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  document.querySelectorAll('.portfolio-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
      card.style.transition = 'transform 400ms cubic-bezier(0.23,1,0.32,1)';
      setTimeout(() => { card.style.transition = ''; }, 400);
    });
  });
})();
