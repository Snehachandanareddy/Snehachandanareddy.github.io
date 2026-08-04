/* ============================================
   PORTFOLIO — Sneha Chandana Reddy
   JS: navigation, scroll effects, form, reveals,
       interactive effects (spotlight, tilt, magnetic)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('is-open');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('is-open'));
    });
  }

  /* ---------- Nav shadow on scroll ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 20) nav.classList.add('nav--scrolled');
    else nav.classList.remove('nav--scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll progress bar ---------- */
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    let ticking = false;
    const updateProgress = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (window.scrollY / docHeight) : 0;
      progress.style.transform = `scaleX(${pct})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    updateProgress();
  }

  /* ---------- Active section highlight in nav ---------- */
  const navLinks = document.querySelectorAll('.nav__links a');
  const sections = document.querySelectorAll('section[id], header[id]');
  if (navLinks.length && sections.length) {
    const linkMap = {};
    navLinks.forEach(link => {
      const id = link.getAttribute('href');
      if (id && id.startsWith('#')) linkMap[id.slice(1)] = link;
    });

    const setActive = (id) => {
      navLinks.forEach(l => l.classList.remove('is-active'));
      if (linkMap[id]) linkMap[id].classList.add('is-active');
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      // Pick the entry closest to the viewport top that is intersecting
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => sectionObserver.observe(s));
  }

  /* ---------- Reveal-on-scroll animation ---------- */
  const revealTargets = document.querySelectorAll(
    '.section__header, .about__grid, .timeline__item, .skill-card, .project, .edu-item, .contact__grid'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------- Animated number counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (prefersReducedMotion) {
            entry.target.textContent = entry.target.dataset.count + (entry.target.dataset.suffix || '');
          } else {
            animateCount(entry.target);
          }
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => countObserver.observe(c));
  }

  /* ---------- Cursor spotlight on hero ---------- */
  const hero = document.querySelector('.hero');
  if (hero && !isTouch && !prefersReducedMotion) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--mx', x + '%');
      hero.style.setProperty('--my', y + '%');
      hero.classList.add('hero--lit');
    });
    hero.addEventListener('mouseleave', () => {
      hero.classList.remove('hero--lit');
    });
  }

  /* ---------- 3D tilt on cards ---------- */
  const tiltTargets = document.querySelectorAll('.project, .skill-card, .timeline__item');
  if (!isTouch && !prefersReducedMotion) {
    const easeOut = 'cubic-bezier(0.4, 0, 0.2, 1)';
    tiltTargets.forEach(card => {
      let raf = null;
      const onEnter = () => {
        card.style.transition = `transform 0.12s linear, box-shadow 0.3s ${easeOut}, border-color 0.3s ${easeOut}`;
      };
      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const x = e.clientX - rect.left - cx;
        const y = e.clientY - rect.top - cy;
        const max = 5; // max degrees
        const rx = (-y / cy) * max;
        const ry = (x / cx) * max;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform =
            `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`;
        });
      };
      const onLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transition = `transform 0.45s ${easeOut}, box-shadow 0.3s ${easeOut}, border-color 0.3s ${easeOut}`;
        card.style.transform = '';
      };
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  /* ---------- Magnetic primary buttons ---------- */
  const magnetic = document.querySelectorAll('.btn--primary');
  if (!isTouch && !prefersReducedMotion) {
    magnetic.forEach(btn => {
      const strength = 0.25;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * strength;
        const y = (e.clientY - rect.top - rect.height / 2) * strength;
        btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Contact form handling ---------- */
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        note.textContent = '⚠ Please fill in your name, email, and message.';
        note.style.color = '#f5a623';
        return;
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        note.textContent = '⚠ Please enter a valid email address.';
        note.style.color = '#f5a623';
        return;
      }

      const subject = encodeURIComponent(form.subject.value || `Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`Hi Sneha,\n\n${message}\n\nFrom, ${name}\n${email}`);
      window.location.href = `mailto:Kothakapureddy1999@gmail.com?subject=${subject}&body=${body}`;

      note.textContent = '✓ Opening your email app… thanks for getting in touch!';
      note.style.color = '';
      form.reset();
    });
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
