/**
 * UniLive Agency — main interaction & motion
 * GSAP ScrollTrigger + form + magnetic
 * Native scroll for better performance
 */

(function () {
  'use strict';

  // Performance: Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Skip all animations for reduced motion
    console.log('Reduced motion enabled - skipping animations');
    return;
  }

  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

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

  // ---------- Enhanced magnetic buttons (desktop only) ----------
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouch) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const magneticStrength = 0.35;
      const returnEase = 'elastic.out(1, 0.5)';
      
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(el, {
          x: x * magneticStrength,
          y: y * magneticStrength,
          duration: 0.3,
          ease: 'power2.out'
        });
        
        // Add glow effect on hover
        gsap.to(el, {
          boxShadow: '0 0 30px rgba(255, 45, 85, 0.4)',
          duration: 0.3
        });
      });
      
      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: returnEase
        });
        
        // Remove glow
        gsap.to(el, {
          boxShadow: '0 0 0px transparent',
          duration: 0.3
        });
      });
    });
  }

  // ---------- Hero entrance - Cinematic reveal ----------
  // Set initial states first
  gsap.set('.hero-line', { 
    y: '120%', 
    rotationX: -45,
    opacity: 0,
    transformOrigin: 'center top'
  });
  gsap.set('.hero-eyebrow', { 
    y: -40, 
    opacity: 0,
    clipPath: 'inset(0 100% 0 0)'
  });
  gsap.set('.hero-desc', { 
    y: 60, 
    opacity: 0,
    scale: 0.95,
    rotation: 2
  });
  gsap.set('.hero-cta', { 
    y: 50, 
    opacity: 0,
    x: -30,
    rotation: -3
  });
  gsap.set('.hero-stats', { 
    y: 40, 
    opacity: 0,
    scale: 0.9
  });

  const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  heroTl
    .to('.hero-eyebrow', { 
      opacity: 1, 
      y: 0, 
      clipPath: 'inset(0 0% 0 0)',
      duration: 1, 
      delay: 0.2 
    })
    .to('.hero-line', {
      y: 0,
      rotationX: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.15,
      ease: 'expo.out'
    }, '-=0.6')
    .to('.hero-desc', { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotation: 0,
      duration: 0.9,
      ease: 'back.out(1.2)'
    }, '-=0.6')
    .to('.hero-cta', { 
      opacity: 1, 
      y: 0, 
      x: 0,
      rotation: 0,
      duration: 0.85,
      ease: 'elastic.out(1, 0.6)'
    }, '-=0.5')
    .to('.hero-stats', { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      duration: 0.9,
      stagger: 0.1
    }, '-=0.5');

  // SVG path draw
  gsap.to('.hero-path', {
    strokeDashoffset: 0,
    duration: 2.4,
    ease: 'power2.inOut',
    stagger: 0.25,
    delay: 0.3
  });

  // SVG divider animations
  gsap.to('.wave-path', {
    scrollTrigger: {
      trigger: '.wave-path',
      start: 'top 90%',
      toggleActions: 'play none none none'
    },
    strokeDashoffset: 0,
    duration: 2,
    ease: 'power2.inOut'
  });

  gsap.to('.wave-path-2', {
    scrollTrigger: {
      trigger: '.wave-path-2',
      start: 'top 90%',
      toggleActions: 'play none none none'
    },
    strokeDashoffset: 0,
    duration: 2,
    ease: 'power2.inOut',
    delay: 0.2
  });

  gsap.to('.diagonal-path', {
    scrollTrigger: {
      trigger: '.diagonal-path',
      start: 'top 90%',
      toggleActions: 'play none none none'
    },
    strokeDashoffset: 0,
    duration: 1.8,
    ease: 'power2.inOut'
  });

  // ---------- Scroll-triggered reveals - Cinematic variations ----------
  
  // Feature cards - Different animation per card with lazy initialization
  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    const animations = [
      // Card 1: Rotate and slide from diagonal
      { x: -100, y: 80, rotation: -5, scale: 0.9 },
      // Card 2: Scale from center with blur
      { scale: 0.85, opacity: 0, filter: 'blur(10px)' },
      // Card 3: Slide from right with rotation
      { x: 100, y: -40, rotation: 3 },
      // Card 4: Clip-path reveal from bottom
      { y: 100, clipPath: 'inset(100% 0 0 0)' },
      // Card 5: 3D perspective slide
      { y: 120, rotationX: 15, scale: 0.95, transformOrigin: 'center bottom' }
    ];
    
    const anim = animations[i % animations.length];
    
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
        onEnter: () => card.style.willChange = 'transform, opacity',
        onLeave: () => card.style.willChange = 'auto',
        onEnterBack: () => card.style.willChange = 'transform, opacity',
        onLeaveBack: () => card.style.willChange = 'auto'
      },
      ...anim,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      clearProps: 'filter,clipPath,will-change',
      onComplete: () => card.style.willChange = 'auto'
    });
  });

  // Case cards - Pinned horizontal scroll (desktop only)
  if (window.innerWidth >= 768) {
    const casesSection = document.getElementById('cases');
    const casesTrack = document.querySelector('.cases-track');
    
    if (casesSection && casesTrack) {
      // Set initial width for horizontal scroll
      gsap.set(casesTrack, { width: '300%' });
      
      // Pin the section and animate horizontal scroll
      ScrollTrigger.create({
        trigger: casesSection,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          gsap.to(casesTrack, {
            xPercent: -66 * self.progress,
            ease: 'none',
            duration: 0
          });
        }
      });
    }
  }

  // Case cards - Horizontal stagger with different directions (mobile fallback)
  gsap.utils.toArray('.case-card').forEach((card, i) => {
    const isEven = i % 2 === 0;
    
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      x: isEven ? -150 : 150,
      y: 60,
      rotation: isEven ? -3 : 3,
      opacity: 0,
      scale: 0.92,
      duration: 1.1,
      ease: 'expo.out'
    });
  });

  // Why items - Alternating slide directions with stagger
  gsap.utils.toArray('.why-item').forEach((item, i) => {
    const isEven = i % 2 === 0;
    
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      x: isEven ? -80 : 80,
      y: 30,
      opacity: 0,
      rotation: isEven ? -2 : 2,
      duration: 0.7,
      ease: 'power3.out'
    });
  });

  // Team cards - 3D flip entrance
  gsap.utils.toArray('.team-card').forEach((card, i) => {
    gsap.set(card, { 
      transformOrigin: 'center center',
      rotationY: -45,
      scale: 0.85,
      opacity: 0
    });
    
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      rotationY: 0,
      scale: 1,
      opacity: 1,
      duration: 1,
      delay: i * 0.15,
      ease: 'back.out(1.5)'
    });
  });

  // Section headings - Kinetic typography reveal
  gsap.utils.toArray('h2').forEach((heading) => {
    gsap.from(heading, {
      scrollTrigger: {
        trigger: heading,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      y: 60,
      opacity: 0,
      rotationX: -15,
      scale: 0.9,
      transformOrigin: 'center bottom',
      duration: 1,
      ease: 'power4.out'
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
  let ticking = false;
  const header = document.getElementById('site-header');

  window.addEventListener('scroll', () => {
    if (!header) return;
    
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScroll = window.pageYOffset;
        
        // Hide/show based on scroll direction
        if (currentScroll > lastScroll && currentScroll > 120) {
          header.style.transform = 'translateY(-100%)';
        } else {
          header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
        header.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        ticking = false;
      });
      
      ticking = true;
    }
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

  // ---------- Simplified parallax (removed for performance) ----------
  // Parallax effects disabled to prevent scroll lag

})();
