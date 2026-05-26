/* ============================================================
   HOKR TEAM — main.js
   Core interactivity: cursor, navbar, accordion, form, scroll
   ============================================================ */

'use strict';

/* ── LOADING SCREEN ──────────────────────────────────────── */
(function initLoader() {
  const screen = document.getElementById('loading-screen');
  const bar    = document.querySelector('.loader-bar');
  const pct    = document.querySelector('.loader-pct');
  if (!screen || !bar) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18 + 5;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    bar.style.width = progress + '%';
    if (pct) pct.textContent = Math.round(progress) + '%';
    if (progress >= 100) {
      setTimeout(() => {
        screen.classList.add('hidden');
        document.body.style.overflow = '';
        initHeroAnimations();
      }, 300);
    }
  }, 120);

  document.body.style.overflow = 'hidden';
})();


/* ── NAVBAR ──────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const burger = document.querySelector('.hamburger');
  const overlay = document.querySelector('.nav-overlay');
  const overlayLinks = document.querySelectorAll('.nav-overlay .nav-link');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  if (burger && overlay) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      overlay.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    overlayLinks.forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link[data-section]');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => obs.observe(s));
})();

/* ── HERO ANIMATIONS ─────────────────────────────────────── */
function initHeroAnimations() {
  const els = document.querySelectorAll('.hero-eyebrow, .hero-headline, .hero-sub, .hero-btns, .scroll-indicator');
  els.forEach(el => el.classList.add('animate'));
}

/* ── SCROLL REVEAL ───────────────────────────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ── ANIMATED COUNTERS ───────────────────────────────────── */
(function initCounters() {
  const items = document.querySelectorAll('[data-count]');
  if (!items.length) return;

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  items.forEach(el => obs.observe(el));
})();

/* ── ACCORDION ───────────────────────────────────────────── */
(function initAccordion() {
  const triggers = document.querySelectorAll('.accordion-trigger');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const body  = trigger.nextElementSibling;
      const isOpen = trigger.classList.contains('open');

      // Close all
      triggers.forEach(t => {
        t.classList.remove('open');
        const b = t.nextElementSibling;
        if (b) b.style.maxHeight = '0';
      });

      // Toggle clicked
      if (!isOpen) {
        trigger.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
})();

/* ── CONTACT FORM ────────────────────────────────────────── */
(function initForm() {
  // Podporuje obě ID — contact-form i contactForm
  const form    = document.getElementById('contact-form') || document.getElementById('contactForm');
  const success = document.querySelector('.form-success');
  const error   = document.querySelector('.form-error');
  const msgEl   = document.getElementById('msg');
  if (!form) return;

  function showSuccess(text) {
    if (success) { success.textContent = text; success.style.display = 'block'; }
    if (msgEl)   { msgEl.className = 'msg success'; msgEl.textContent = '✓ ' + text; }
  }

  function showError(text) {
    if (error) { error.textContent = text; error.style.display = 'block'; }
    if (msgEl) { msgEl.className = 'msg error'; msgEl.textContent = '✗ ' + text; }
  }

  function clearMessages() {
    if (success) success.style.display = 'none';
    if (error)   error.style.display   = 'none';
    if (msgEl)   msgEl.className = 'msg';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearMessages();

    const formData = new FormData(form);

    // Validace na straně klienta
    const name    = formData.get('name')?.trim();
    const email   = formData.get('email')?.trim();
    const message = formData.get('message')?.trim();

    if (!name || !email || !message) {
      showError('Prosím vyplňte všechna povinná pole.');
      return;
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email)) {
      showError('Zadejte platnou e-mailovou adresu.');
      return;
    }

    const btn = form.querySelector('[type="submit"]') || document.getElementById('btn');
    const origText = btn.textContent;
    btn.textContent = 'Odesílám...';
    btn.disabled = true;

    try {
      // Posíláme jako FormData — send.php čte $_POST
      const res = await fetch('send.php', { method: 'POST', body: formData });
      const json = await res.json();

      if (json.success) {
        showSuccess('Zpráva odeslána. Ozveme se vám co nejdříve!');
        form.reset();
      } else {
        showError(json.error || 'Chyba při odesílání. Zkuste to znovu.');
      }
    } catch {
      showError('Chyba při odesílání. Zkuste to prosím znovu.');
    }

    btn.textContent = origText;
    btn.disabled = false;
  });
})();

/* ── SCROLL-TO-TOP ───────────────────────────────────────── */
(function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── SMOOTH SCROLL for anchor links ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Vybere všechny položky portfolia
const portfolioItems = document.querySelectorAll('.portfolio-item');

portfolioItems.forEach(item => {
    const video = item.querySelector('video');

    // Spuštění při najetí
    item.addEventListener('mouseenter', () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.log("Video čeká na interakci:", error));
        }
    });

    // Zastavení při odjezdu
    item.addEventListener('mouseleave', () => {
        video.pause();
    });
});

