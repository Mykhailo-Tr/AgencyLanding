/**
 * UniLive Agency — main interaction & motion
 * Lenis + GSAP ScrollTrigger + form + magnetic
 */

(function () {
  'use strict';

  // ---------- Lenis smooth scroll ----------
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.4
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync Lenis with ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // ---------- Mobile menu ----------
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  let menuOpen = false;

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuOpen = !menuOpen;
      menuToggle.classList.toggle('open', menuOpen);
      mobileMenu.classList.toggle('open', menuOpen);
      document.body.style.overflow = menuOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        menuOpen = false;
        menuToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---------- Magnetic buttons (desktop only) ----------
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouch) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          x: x * 0.25,
          y: y * 0.25,
          duration: 0.4,
          ease: 'power3.out'
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }

  // ---------- Hero entrance ----------
  // Set initial states first
  gsap.set('.hero-line', { y: '110%', opacity: 0 });
  gsap.set(['.hero-eyebrow', '.hero-desc', '.hero-cta', '.hero-stats'], {
    y: 30,
    opacity: 0
  });

  const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  heroTl
    .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, delay: 0.15 })
    .to('.hero-line', {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.12
    }, '-=0.5')
    .to('.hero-desc', { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
    .to('.hero-cta', { opacity: 1, y: 0, duration: 0.7 }, '-=0.45')
    .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');

  // SVG path draw
  gsap.to('.hero-path', {
    strokeDashoffset: 0,
    duration: 2.4,
    ease: 'power2.inOut',
    stagger: 0.25,
    delay: 0.3
  });

  // ---------- Scroll-triggered reveals ----------
  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none'
      },
      y: 60,
      opacity: 0,
      duration: 0.9,
      delay: i * 0.06,
      ease: 'power3.out'
    });
  });

  gsap.utils.toArray('.case-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 80,
      opacity: 0,
      duration: 1,
      delay: i * 0.08,
      ease: 'power3.out'
    });
  });

  gsap.utils.toArray('.why-item').forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 92%',
        toggleActions: 'play none none none'
      },
      x: -24,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.04,
      ease: 'power2.out'
    });
  });

  gsap.utils.toArray('.team-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none'
      },
      y: 50,
      opacity: 0,
      duration: 0.85,
      delay: i * 0.1,
      ease: 'power3.out'
    });
  });

  // Section headings
  gsap.utils.toArray('h2').forEach((heading) => {
    gsap.from(heading, {
      scrollTrigger: {
        trigger: heading,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out'
    });
  });

  // Earnings big numbers subtle scale
  const earningsSection = document.getElementById('earnings');
  if (earningsSection) {
    gsap.from(earningsSection.querySelector('h2'), {
      scrollTrigger: {
        trigger: earningsSection,
        start: 'top 75%',
        toggleActions: 'play none none none'
      },
      scale: 0.92,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out'
    });
  }

  // ---------- Header hide/show on scroll ----------
  let lastScroll = 0;
  const header = document.getElementById('site-header');

  lenis.on('scroll', ({ scroll }) => {
    if (!header) return;
    if (scroll > lastScroll && scroll > 120) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }
    lastScroll = scroll;
    header.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  // ---------- Form handling ----------
  const form = document.getElementById('leadForm');
  const submitBtn = document.getElementById('submitBtn');
  const formMessage = document.getElementById('formMessage');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(form));

      // Honeypot
      if (data.website) {
        formMessage.textContent = '';
        formMessage.className = 'text-sm text-center min-h-[1.5rem] text-green-400';
        formMessage.textContent = 'Заявку надіслано. Очікуй дзвінка.';
        form.reset();
        return;
      }

      // Basic client validation
      if (!data.name || data.name.trim().length < 2) {
        showError("Вкажи ім'я (мінімум 2 символи)");
        return;
      }
      if (!data.age || Number(data.age) < 18) {
        showError('Вік має бути від 18 років');
        return;
      }
      if (!data.contact || data.contact.trim().length < 5) {
        showError('Вкажи Telegram або номер телефону');
        return;
      }

      // UI loading state
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');
      btnText.classList.add('hidden');
      btnLoading.classList.remove('hidden');
      submitBtn.disabled = true;

      try {
        // Replace with your real backend endpoint
        const endpoint = 'https://api.yourdomain.com/lead';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name.trim(),
            age: Number(data.age),
            tiktok: (data.tiktok || '').trim(),
            instagram: (data.instagram || '').trim(),
            contact: data.contact.trim(),
            website: '' // honeypot empty
          })
        });

        if (!res.ok) throw new Error('Network error');

        formMessage.className = 'text-sm text-center min-h-[1.5rem] text-green-400';
        formMessage.textContent = 'Заявку надіслано. Менеджер звʼяжеться протягом 24 годин.';
        form.reset();
      } catch (err) {
        // For demo / offline: simulate success so UX can be tested
        console.warn('API unreachable, simulating success for demo', err);
        formMessage.className = 'text-sm text-center min-h-[1.5rem] text-green-400';
        formMessage.textContent = 'Заявку надіслано. Менеджер звʼяжеться протягом 24 годин.';
        form.reset();
      } finally {
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        submitBtn.disabled = false;
      }
    });
  }

  function showError(msg) {
    if (!formMessage) return;
    formMessage.className = 'text-sm text-center min-h-[1.5rem] text-red-400';
    formMessage.textContent = msg;
  }

  // ---------- Soft parallax on ambient elements ----------
  if (!isTouch) {
    gsap.to('.ambient-bloom', {
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5
      },
      y: 200,
      ease: 'none'
    });
  }

})();
