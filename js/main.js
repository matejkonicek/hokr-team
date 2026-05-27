'use strict';

/* ── HERO ANIMATIONS ─────────────────────────────────────── */
function initHeroAnimations() {
  document.querySelectorAll('.hero-eyebrow, .hero-headline, .hero-sub, .hero-btns')
    .forEach(el => el.classList.add('animate'));
}

// Spustit hned bez loading screen
document.addEventListener('DOMContentLoaded', initHeroAnimations);

/* ── NAVBAR ──────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Aktivní odkaz podle scrollu
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
    const target   = parseInt(el.dataset.count, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1600;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(eased * target) + suffix;
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
      const body   = trigger.nextElementSibling;
      const isOpen = trigger.classList.contains('open');

      // Zavřít vše
      triggers.forEach(t => {
        t.classList.remove('open');
        t.setAttribute('aria-expanded', 'false');
        const b = t.nextElementSibling;
        if (b) b.style.maxHeight = '0';
      });

      // Otevřít kliknutý (pokud nebyl otevřen)
      if (!isOpen) {
        trigger.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
})();

/* ── CONTACT FORM ────────────────────────────────────────── */
(function initForm() {
  const form    = document.getElementById('contact-form');
  const success = document.querySelector('.form-success');
  const error   = document.querySelector('.form-error');
  if (!form) return;

  function showSuccess(text) {
    if (success) { success.textContent = text; success.style.display = 'block'; }
  }

  function showError(text) {
    if (error) { error.textContent = text; error.style.display = 'block'; }
  }

  function clearMessages() {
    if (success) success.style.display = 'none';
    if (error)   error.style.display   = 'none';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearMessages();

    const formData = new FormData(form);
    const name     = formData.get('name')?.trim();
    const email    = formData.get('email')?.trim();
    const message  = formData.get('message')?.trim();

    if (!name || !email || !message) {
      showError('Prosím vyplňte všechna povinná pole.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Zadejte platnou e-mailovou adresu.');
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    const origText = btn.textContent;
    btn.textContent = 'Odesílám…';
    btn.disabled = true;

    try {
      const res  = await fetch('send.php', { method: 'POST', body: formData });
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

/* ── SMOOTH SCROLL pro anchor links ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── PORTFOLIO VIDEO hover ───────────────────────────────── */
document.querySelectorAll('.portfolio-item').forEach(item => {
  const video = item.querySelector('video');
  if (!video) return;

  item.addEventListener('mouseenter', () => {
    video.play().catch(() => {});
  });

  item.addEventListener('mouseleave', () => {
    video.pause();
  });
});
