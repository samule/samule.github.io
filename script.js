/* ============================================================
   SANTIAGO MULÉ — PERSONAL WEBSITE
   script.js — Neubrutalism Edition

   TABLE OF CONTENTS
   1.  Utility Helpers
   2.  Navigation — Scroll State & Active Link
   3.  Navigation — Mobile Hamburger Menu
   4.  Scroll Reveal (IntersectionObserver)
   5.  Hero Section — Staggered Entry Animation
   6.  Copy Email Button
   7.  Footer Year
   8.  Smooth Scroll with Nav Offset
   9.  Toast Notification System
   10. Placeholder Link Handler (Resume + Projects)
   11. Init
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. UTILITY HELPERS
     ============================================================ */

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }


  /* ============================================================
     2. NAVIGATION — SCROLL STATE & ACTIVE LINK
     ============================================================ */

  var nav      = $('#nav');
  var navLinks = $$('.nav-link');
  var sections = $$('section[id]');

  /**
   * Highlight the nav link whose section is currently in view.
   * Note: Neubrutalism nav doesn't change its background on scroll
   * (it's always black) — we only update the active link color.
   */
  function updateActiveNavLink() {
    var navH     = nav ? nav.offsetHeight : 60;
    var scrollPos = window.scrollY + navH + 40;

    sections.forEach(function (section) {
      var top    = section.offsetTop;
      var bottom = top + section.offsetHeight;
      var id     = section.getAttribute('id');
      var link   = $('[href="#' + id + '"]', nav);

      if (link) {
        if (scrollPos >= top && scrollPos < bottom) {
          navLinks.forEach(function (l) { l.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      }
    });
  }

  /* Throttle scroll handler via rAF */
  var scrollTick = false;
  function onScroll() {
    if (!scrollTick) {
      window.requestAnimationFrame(function () {
        updateActiveNavLink();
        scrollTick = false;
      });
      scrollTick = true;
    }
  }


  /* ============================================================
     3. NAVIGATION — MOBILE HAMBURGER MENU
     ============================================================ */

  var hamburger    = $('#hamburger');
  var navLinksList = $('#nav-links');
  var navOverlay   = $('#nav-overlay');

  function openMenu() {
    if (!hamburger || !navLinksList) return;
    hamburger.classList.add('is-open');
    navLinksList.classList.add('is-open');
    if (navOverlay) navOverlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    if (!hamburger || !navLinksList) return;
    hamburger.classList.remove('is-open');
    navLinksList.classList.remove('is-open');
    if (navOverlay) navOverlay.classList.remove('is-visible');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      navLinksList && navLinksList.classList.contains('is-open') ? closeMenu() : openMenu();
    });
  }

  if (navOverlay) navOverlay.addEventListener('click', closeMenu);

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });


  /* ============================================================
     4. SCROLL REVEAL (IntersectionObserver)
     ============================================================ */

  var revealEls = $$('.reveal');

  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          /* Small stagger for items entering at the same time */
          setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealEls.forEach(function (el) { observer.observe(el); });
  }


  /* ============================================================
     5. HERO — STAGGERED ENTRY ANIMATION
     Triggers hero .reveal elements immediately on page load
     with sequential delays so each element pops in sharply.
     ============================================================ */

  function initHeroAnimation() {
    $$('.hero .reveal').forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('is-visible');
      }, 120 + i * 130);
    });
  }


  /* ============================================================
     6. COPY EMAIL BUTTON
     ============================================================ */

  function initCopyEmail() {
    var btn     = $('#copy-email-btn');
    var emailEl = $('#contact-email');
    if (!btn || !emailEl) return;

    btn.addEventListener('click', function () {
      var email = emailEl.textContent.trim();

      function onSuccess() {
        btn.classList.add('is-copied');
        var label = $('span', btn);
        if (label) label.textContent = 'Copied ✓';
        setTimeout(function () {
          btn.classList.remove('is-copied');
          if (label) label.textContent = 'Copy';
        }, 2600);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(onSuccess).catch(function () {
          fallbackCopy(email, onSuccess);
        });
      } else {
        fallbackCopy(email, onSuccess);
      }
    });
  }

  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;top:0;left:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); if (cb) cb(); } catch (e) { /* silent */ }
    document.body.removeChild(ta);
  }


  /* ============================================================
     7. FOOTER YEAR
     ============================================================ */

  function initFooterYear() {
    var el = $('#footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }


  /* ============================================================
     8. SMOOTH SCROLL WITH NAV OFFSET
     Overrides default anchor behavior to account for fixed nav height.
     ============================================================ */

  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var sel = a.getAttribute('href');
        if (!sel || sel === '#') return;
        var target = $(sel);
        if (!target) return;
        e.preventDefault();
        var navH   = nav ? nav.offsetHeight : 60;
        var top    = target.getBoundingClientRect().top + window.pageYOffset - navH - 16;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
    });
  }


  /* ============================================================
     9. TOAST NOTIFICATION SYSTEM
     Uses the .toast CSS class from styles.css (Neubrutalism styled).
     ============================================================ */

  var activeToast = null;

  function showToast(message, duration) {
    duration = duration || 3400;

    if (activeToast) {
      activeToast.remove();
      activeToast = null;
    }

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
    activeToast = toast;

    /* Animate in on next two frames for reliable transition */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('is-visible');
      });
    });

    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        if (toast.parentNode) toast.remove();
        if (activeToast === toast) activeToast = null;
      }, 280);
    }, duration);
  }


  /* ============================================================
     10. PLACEHOLDER LINK HANDLER
     Shows a friendly toast when placeholder '#' links are clicked.
     EDIT: Remove the handler for a link once you add a real URL.
     ============================================================ */

  function initPlaceholderLinks() {

    /* Resume download buttons */
    $$('#download-resume-hero, #download-resume-contact').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (!btn.getAttribute('href') || btn.getAttribute('href') === '#') {
          e.preventDefault();
          showToast('Resume PDF coming soon — connect on LinkedIn!');
        }
      });
    });

    /* AI Project buttons (GitHub + Demo) */
    $$('.project-btn[data-placeholder="true"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (!btn.getAttribute('href') || btn.getAttribute('href') === '#') {
          e.preventDefault();
          var msg = btn.classList.contains('project-btn--primary')
            ? 'Live demo coming soon — actively building!'
            : 'GitHub repo coming soon — stay tuned!';
          showToast(msg);
        }
      });
    });

    /* Testimonial LinkedIn links (placeholder until real URLs are added) */
    $$('.testimonial-link[data-placeholder="true"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (!btn.getAttribute('href') || btn.getAttribute('href') === '#') {
          e.preventDefault();
          showToast('LinkedIn recommendation link coming soon!');
        }
      });
    });
  }


  /* ============================================================
     10a. TIMELINE DRAG-TO-SCROLL  (with momentum / inertia)
     ============================================================ */
  function initTimelineDragScroll() {
    var el = document.querySelector('.timeline');
    if (!el) return;

    var isDragging  = false;
    var startX      = 0;
    var startScroll = 0;
    var velX        = 0;   /* px per frame, smoothed */
    var prevX       = 0;
    var prevTime    = 0;
    var raf         = null;

    /* ---- momentum loop ---- */
    function runMomentum() {
      velX *= 0.92;                /* friction — tweak 0.90-0.95 for feel */
      el.scrollLeft -= velX;
      raf = (Math.abs(velX) > 0.4) ? requestAnimationFrame(runMomentum) : null;
    }

    function stopMomentum() {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    /* ---- pointer down ---- */
    el.addEventListener('mousedown', function (e) {
      stopMomentum();
      isDragging  = true;
      startX      = e.clientX;
      startScroll = el.scrollLeft;
      velX        = 0;
      prevX       = e.clientX;
      prevTime    = performance.now();
      el.classList.add('is-dragging');
      e.preventDefault();
    });

    /* ---- pointer move — attached to window so fast sweeps don't break ---- */
    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;

      var now  = performance.now();
      var dt   = Math.max(now - prevTime, 1);
      var dx   = e.clientX - prevX;

      /* exponential moving average keeps velocity smooth */
      velX = velX * 0.6 + (dx / dt) * 16 * 0.4;

      /* absolute offset — no drift accumulation */
      el.scrollLeft = startScroll - (e.clientX - startX);

      prevX    = e.clientX;
      prevTime = now;
    });

    /* ---- pointer up — release with momentum ---- */
    window.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      el.classList.remove('is-dragging');
      raf = requestAnimationFrame(runMomentum);
    });
  }


  /* ============================================================
     10b. TESTIMONIAL CAROUSEL
     ============================================================ */
  function initTestimonialCarousel() {

    var track    = document.getElementById('testimonial-track');
    var prevBtn  = document.getElementById('carousel-prev');
    var nextBtn  = document.getElementById('carousel-next');
    var dots     = $$('.carousel-dot');

    if (!track || !prevBtn || !nextBtn) return;

    var slides   = track.querySelectorAll('.testimonial-slide');
    var total    = slides.length;
    var current  = 0;
    var autoTimer;

    /* Move to a specific slide index */
    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';

      dots.forEach(function (dot, i) {
        var active = i === current;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', String(active));
      });
    }

    /* Auto-advance every 6 seconds */
    function startAuto() {
      stopAuto();
      autoTimer = setInterval(function () { goTo(current + 1); }, 6000);
    }

    function stopAuto() {
      clearInterval(autoTimer);
    }

    /* Button controls */
    prevBtn.addEventListener('click', function () {
      goTo(current - 1);
      startAuto();
    });

    nextBtn.addEventListener('click', function () {
      goTo(current + 1);
      startAuto();
    });

    /* Dot controls */
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.getAttribute('data-index'), 10));
        startAuto();
      });
    });

    /* Keyboard: left/right arrows when carousel is focused */
    track.closest('.testimonial-carousel').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { goTo(current - 1); startAuto(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); startAuto(); }
    });

    /* Pause auto-play on hover */
    track.closest('.testimonial-carousel').addEventListener('mouseenter', stopAuto);
    track.closest('.testimonial-carousel').addEventListener('mouseleave', startAuto);

    /* Touch/swipe support */
    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 40) {
        dx < 0 ? goTo(current + 1) : goTo(current - 1);
        startAuto();
      }
    }, { passive: true });

    /* Kick off */
    goTo(0);
    startAuto();
  }


  /* ============================================================
     11. INIT — Run everything on DOMContentLoaded
     ============================================================ */

  document.addEventListener('DOMContentLoaded', function () {

    /* Nav */
    window.addEventListener('scroll', onScroll, { passive: true });
    updateActiveNavLink();

    /* Reveals */
    initScrollReveal();

    /* Hero entry — slight delay so observer is registered first */
    setTimeout(initHeroAnimation, 40);

    /* UI */
    initCopyEmail();
    initFooterYear();
    initSmoothScroll();
    initPlaceholderLinks();
    initTimelineDragScroll();
    initTestimonialCarousel();

  });

})();
