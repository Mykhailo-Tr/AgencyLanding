/**
 * Exlive agency — main interaction & motion
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

  // ---------- Portfolio Carousel Loader ----------
  const portfolioFiles = [
    'assets/videos/IMG_0743.mp4',
    'assets/videos/IMG_1284.mp4',
    'assets/videos/IMG_1285.mp4',
    'assets/videos/IMG_1286.mp4',
    'assets/videos/IMG_3552.mp4'
  ];

  // Convert all extensions to lowercase for consistent checking
  const normalizedPortfolioFiles = portfolioFiles.map(file => {
    const parts = file.split('.');
    const extension = parts.pop().toLowerCase();
    return parts.join('.') + '.' + extension;
  });

  // Filter out HEIC files (not supported in browsers) and keep only supported formats
  const supportedPortfolioFiles = normalizedPortfolioFiles.filter(file => {
    const extension = file.split('.').pop().toLowerCase();
    return ['mov', 'mp4', 'webm', 'png', 'jpg', 'jpeg'].includes(extension);
  });

  console.log('Portfolio files:', portfolioFiles);
  console.log('Normalized files:', normalizedPortfolioFiles);
  console.log('Supported files:', supportedPortfolioFiles);

  let carouselDisplay;
  let carouselItems = [];
  let currentIndex = 0;
  let isAnimating = false;
  let isMuted = true; // Global sound state - starts muted

  function loadPortfolioCarousel() {
    carouselDisplay = document.getElementById('carousel-display');
    const loading = document.getElementById('portfolio-loading');
    const error = document.getElementById('portfolio-error');
    const progressContainer = document.getElementById('carousel-progress');

    if (!carouselDisplay) {
      console.error('Carousel display not found');
      return;
    }

    console.log('Loading carousel with files:', supportedPortfolioFiles);

    // Hide loading state
    if (loading) loading.style.display = 'none';

    // Check if we have any files to display
    if (supportedPortfolioFiles.length === 0) {
      console.error('No supported portfolio files found');
      if (error) {
        error.classList.remove('hidden');
        error.querySelector('p').textContent = 'Немає доступних файлів для відображення.';
      }
      return;
    }

    // Create carousel items
    supportedPortfolioFiles.forEach((file, index) => {
      const isVideo = file.toLowerCase().endsWith('.mov') || file.toLowerCase().endsWith('.mp4') || file.toLowerCase().endsWith('.webm');
      const isImage = file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg');
      
      console.log(`Processing file ${index}: ${file}, isVideo: ${isVideo}, isImage: ${isImage}`);
      
      const card = document.createElement('div');
      card.className = 'carousel-item group relative hidden';
      card.dataset.index = index;

      if (isVideo) {
        card.innerHTML = `
          <div class="relative w-full h-full bg-black/50 flex items-center justify-center">
            <video 
              src="${file}" 
              class="carousel-video w-full h-full object-contain"
              muted
              loop
              playsinline
              preload="metadata"
              onerror="console.error('Video error:', '${file}'); this.parentElement.parentElement.classList.add('error');"
            ></video>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <button class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" onclick="toggleVideoPlay(this)">
              <svg class="w-12 h-12 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <button class="absolute bottom-4 right-4 w-10 h-10 flex items-center justify-center rounded-full glass-card text-white/80 hover:text-pink-400 transition-all duration-300 z-20" onclick="toggleVideoMute(this)" title="Увімкнути звук">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            </button>
          </div>
        `;
      } else if (isImage) {
        card.innerHTML = `
          <div class="relative w-full h-full bg-black/50">
            <img 
              src="${file}" 
              alt="Portfolio work ${index + 1}" 
              class="carousel-image transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onerror="console.error('Image error:', '${file}'); this.parentElement.parentElement.classList.add('error');"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        `;
      } else {
        console.warn('Unsupported file type:', file);
        return;
      }

      carouselDisplay.appendChild(card);
      carouselItems.push(card);
    });

    console.log(`Successfully loaded ${carouselItems.length} carousel items`);

    if (carouselItems.length === 0) {
      if (error) {
        error.classList.remove('hidden');
        error.querySelector('p').textContent = 'Не вдалося завантажити файли.';
      }
      return;
    }

    // Create progress dots
    if (progressContainer) {
      supportedPortfolioFiles.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'carousel-progress-dot';
        dot.dataset.index = index;
        dot.addEventListener('click', () => goToSlide(index));
        progressContainer.appendChild(dot);
      });
    }

    // Setup navigation
    setupCarouselNavigation();

    // Show first item
    showItem(0);

    // Add entrance animation
    gsap.from('#carousel-display', {
      scrollTrigger: {
        trigger: '#portfolio',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: 60,
      opacity: 0,
      scale: 0.95,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  function setupCarouselNavigation() {
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (!isAnimating) {
          goToSlide(currentIndex - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!isAnimating) {
          goToSlide(currentIndex + 1);
        }
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && !isAnimating) {
        goToSlide(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && !isAnimating) {
        goToSlide(currentIndex + 1);
      }
    });

    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carouselDisplay.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselDisplay.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold && !isAnimating) {
        if (diff > 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      }
    }
  }

  function showItem(index) {
    // Ensure index is within bounds
    if (index < 0) {
      index = carouselItems.length - 1;
    } else if (index >= carouselItems.length) {
      index = 0;
    }

    isAnimating = true;

    // Hide all items
    carouselItems.forEach(item => {
      item.classList.add('hidden');
      item.classList.remove('active');

      // Pause all videos
      const video = item.querySelector('video');
      if (video) {
        video.pause();
      }
    });

    // Show current item
    const currentItem = carouselItems[index];
    currentItem.classList.remove('hidden');
    currentItem.classList.add('active');

    // Update progress dots
    updateProgressDots(index);

    // Handle video playback
    const video = currentItem.querySelector('video');
    if (video) {
      video.currentTime = 0;
      video.muted = isMuted; // Preserve global mute state
      video.play().catch(e => console.log('Autoplay prevented:', e));

      // Update mute button icon to match current state
      const muteButton = currentItem.querySelector('button[onclick="toggleVideoMute(this)"]');
      if (muteButton) {
        muteButton.title = isMuted ? 'Увімкнути звук' : 'Вимкнути звук';
        muteButton.innerHTML = isMuted ? `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        ` : `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        `;
      }
    }

    currentIndex = index;
    isAnimating = false;
  }

  function goToSlide(index) {
    showItem(index);
  }

  function updateProgressDots(index) {
    const dots = document.querySelectorAll('.carousel-progress-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  // Video play/pause toggle function
  window.toggleVideoPlay = function(button) {
    const video = button.parentElement.querySelector('video');
    if (video) {
      if (video.paused) {
        video.play();
        button.innerHTML = `
          <svg class="w-12 h-12 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        `;
      } else {
        video.pause();
        button.innerHTML = `
          <svg class="w-12 h-12 text-white/90" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
      }
    }
  };

  // Video mute/unmute toggle function
  window.toggleVideoMute = function(button) {
    const video = button.parentElement.querySelector('video');
    if (video) {
      isMuted = !isMuted; // Update global state
      video.muted = isMuted;
      button.title = isMuted ? 'Увімкнути звук' : 'Вимкнути звук';
      button.innerHTML = isMuted ? `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      ` : `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      `;
    }
  };

  // Initialize portfolio carousel when DOM is ready
  document.addEventListener('DOMContentLoaded', loadPortfolioCarousel);

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
          boxShadow: '0 0 30px rgba(236, 72, 153, 0.4)',
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
  gsap.set('.hero-logo', {
    y: -30,
    scale: 0.9
  });
  gsap.set('.hero-eyebrow', {
    y: -40,
    clipPath: 'inset(0 100% 0 0)'
  });
  gsap.set('.hero-logo + p', {
    y: -20
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
    .to('.hero-logo', {
      y: 0,
      scale: 1,
      duration: 0.8,
      delay: 0.1
    })
    .to('.hero-logo + p', {
      y: 0,
      duration: 0.6
    }, '-=0.4')
    .to('.hero-eyebrow', {
      y: 0,
      clipPath: 'inset(0 0% 0 0)',
      duration: 1,
      delay: 0.2
    }, '-=0.4')
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
        scrub: 0.5,
        onUpdate: (self) => {
          gsap.to(casesTrack, {
            xPercent: -66 * self.progress,
            ease: 'none',
            duration: 0
          });
        }
      });
    }
  } else {
    // Mobile fallback - regular stagger animations
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
  }

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

  // ---------- Fixed Scrolling Monograms with Path Movement ----------
  const fixedMonograms = document.querySelectorAll('.fixed-monogram');
  
  if (fixedMonograms.length > 0) {
    // Get initial positions to maintain them during animation
    const initialStyles = new Map();
    fixedMonograms.forEach((monogram) => {
      initialStyles.set(monogram, {
        left: monogram.style.left,
        right: monogram.style.right,
        top: monogram.style.top,
        bottom: monogram.style.bottom
      });
    });
    
    // Define diverse movement paths for each monogram (no rotation)
    const paths = {
      'circle': (progress) => ({
        x: Math.cos(progress * Math.PI * 2) * 25,
        y: Math.sin(progress * Math.PI * 2) * 25
      }),
      'figure-eight': (progress) => ({
        x: Math.sin(progress * Math.PI * 2) * 35,
        y: Math.sin(progress * Math.PI * 4) * 20
      }),
      'triangle': (progress) => {
        const points = [
          { x: 0, y: -30 },
          { x: 26, y: 15 },
          { x: -26, y: 15 }
        ];
        const segment = Math.floor(progress * 3);
        const segmentProgress = (progress * 3) % 1;
        const current = points[segment];
        const next = points[(segment + 1) % 3];
        return {
          x: current.x + (next.x - current.x) * segmentProgress,
          y: current.y + (next.y - current.y) * segmentProgress
        };
      },
      'star': (progress) => {
        const points = 5;
        const outerRadius = 30;
        const innerRadius = 12;
        const angle = progress * Math.PI * 2;
        const isOuter = Math.floor(progress * points * 2) % 2 === 0;
        const radius = isOuter ? outerRadius : innerRadius;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        };
      },
      'zigzag': (progress) => {
        const width = 40;
        const height = 30;
        const segments = 4;
        const segment = Math.floor(progress * segments);
        const segmentProgress = (progress * segments) % 1;
        const startX = -width / 2;
        const x = startX + (width / segments) * (segment + segmentProgress);
        const y = (segment % 2 === 0) ? -height / 2 : height / 2;
        return { x, y };
      },
      'spiral': (progress) => {
        const maxRadius = 35;
        const angle = progress * Math.PI * 4; // 2 full rotations
        const radius = (progress * maxRadius);
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        };
      },
      'random': (progress) => {
        // Random-like movement using sine waves with different frequencies
        const x = Math.sin(progress * Math.PI * 7) * 20 + Math.cos(progress * Math.PI * 3) * 15;
        const y = Math.cos(progress * Math.PI * 5) * 18 + Math.sin(progress * Math.PI * 9) * 12;
        return { x, y };
      },
      'lissajous': (progress) => {
        // Lissajous curve for complex smooth movement
        const x = Math.sin(progress * Math.PI * 3) * 28;
        const y = Math.sin(progress * Math.PI * 4) * 22;
        return { x, y };
      }
    };
    
    let lastTime = 0;
    let animationProgress = 0;
    
    function animateMonograms(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      
      // Update progress based on time - much slower for subtlety
      animationProgress += deltaTime * 0.00002;
      if (animationProgress > 1) animationProgress = 0;
      
      fixedMonograms.forEach((monogram, index) => {
        const pathType = monogram.dataset.path;
        const speed = parseFloat(monogram.dataset.speed) || 0.01;
        const localProgress = (animationProgress * speed * 100 + index * 0.25) % 1; // Offset each monogram
        
        if (paths[pathType]) {
          const movement = paths[pathType](localProgress);
          // Apply movement while keeping original positioning - no rotation
          const initial = initialStyles.get(monogram);
          monogram.style.left = initial.left;
          monogram.style.right = initial.right;
          monogram.style.top = initial.top;
          monogram.style.bottom = initial.bottom;
          monogram.style.transform = `translate(${movement.x}px, ${movement.y}px)`;
        }
      });
      
      lastTime = timestamp;
      requestAnimationFrame(animateMonograms);
    }
    
    // Start animation loop
    requestAnimationFrame(animateMonograms);
  }

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

  // ---------- Lightweight parallax effects (non-blocking) ----------
  if (!isTouch) {
    // Hero title - subtle parallax
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const heroTitle = heroSection.querySelector('h1');
      if (heroTitle) {
        gsap.to(heroTitle, {
          scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5
          },
          yPercent: -10,
          ease: 'none'
        });
      }
    }

    // Earnings section SVG - subtle movement
    const earningsSection = document.getElementById('earnings');
    if (earningsSection) {
      const svgBg = earningsSection.querySelector('svg');
      if (svgBg) {
        gsap.to(svgBg, {
          scrollTrigger: {
            trigger: earningsSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8
          },
          y: -40,
          ease: 'none'
        });
      }
    }
  }

})();
