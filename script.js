/* ==========================================================================
   Kaze Webdesign — script.js
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';

  document.addEventListener('DOMContentLoaded', function () {
    if (hasGSAP && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
    initNav();
    initReveals();
    initHero();
    initMultiStepForm();
    initContactForm();
    initActiveNav();
    updateCopyrightYear();
  });

  /* ----------------------------- Navigation ----------------------------- */
  function initNav() {
    var nav = document.getElementById('nav');
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    var overlay = document.getElementById('navOverlay');

    function onScroll() {
      if (window.scrollY > 60) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    function openMenu() {
      links.classList.add('open');
      toggle.classList.add('open');
      overlay.hidden = false;
      requestAnimationFrame(function () { overlay.classList.add('open'); });
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Menü schließen');
      // Ensure links are clickable
      links.style.pointerEvents = 'auto';
    }
    function closeMenu() {
      links.classList.remove('open');
      toggle.classList.remove('open');
      overlay.classList.remove('open');
      setTimeout(function () { overlay.hidden = true; }, 350);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menü öffnen');
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (links.classList.contains('open')) closeMenu();
        else openMenu();
      });
    }
    if (overlay) overlay.addEventListener('click', closeMenu);

    // Close menu on link click
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (links.classList.contains('open')) closeMenu();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) closeMenu();
    });
  }

  /* ----------------------------- Smooth scroll ----------------------------- */
  // Native CSS scroll-behavior handles anchors; nothing extra needed.

  /* ----------------------------- Reveal animations ----------------------------- */
  function initReveals() {
    var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!reveals.length) return;

    if (prefersReducedMotion || !hasGSAP || !window.ScrollTrigger) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); el.style.opacity = '1'; });
      return;
    }

    reveals.forEach(function (el) {
      gsap.set(el, { y: 40, opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: function () {
          gsap.to(el, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' });
        }
      });
    });

    // Stagger timeline steps a bit
    var tSteps = document.querySelectorAll('.timeline-step');
    tSteps.forEach(function (el, i) {
      gsap.set(el, { x: -30, opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          gsap.to(el, { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: (i % 3) * 0.06 });
        }
      });
    });
  }

  /* ----------------------------- Hero intro ----------------------------- */
  function initHero() {
    if (prefersReducedMotion || !hasGSAP) return;
    var label = document.getElementById('heroLabel');
    var lines = document.querySelectorAll('.hero h1 .inner');
    var sub = document.getElementById('heroSub');
    var actions = document.getElementById('heroActions');
    var trust = document.getElementById('heroTrust');
    var visual = document.querySelector('.hero-visual');

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (label) tl.from(label, { y: 20, opacity: 0, duration: 0.6 });
    if (lines.length) tl.from(lines, { yPercent: 110, opacity: 0, duration: 0.8, stagger: 0.12 }, '-=0.2');
    if (sub) tl.from(sub, { y: 20, opacity: 0, duration: 0.6 }, '-=0.35');
    if (actions) tl.from(actions, { y: 20, opacity: 0, duration: 0.6 }, '-=0.35');
    if (trust) tl.from(trust, { y: 15, opacity: 0, duration: 0.5 }, '-=0.35');
    if (visual) tl.from(visual, { opacity: 0, scale: 0.94, duration: 1.0, ease: 'power2.out' }, '-=0.9');
  }

  /* ----------------------------- Active nav (IntersectionObserver) ----------------------------- */
  function initActiveNav() {
    var sections = document.querySelectorAll('main section[id]');
    var navMap = {};
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
      navMap[a.getAttribute('href').slice(1)] = a;
    });
    if (!('IntersectionObserver' in window) || !sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          Object.keys(navMap).forEach(function (id) { navMap[id].classList.remove('active'); });
          var link = navMap[entry.target.id];
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ----------------------------- Validation helpers ----------------------------- */
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  function showError(field, show) {
    var err = field.querySelector('[data-error]');
    var input = field.querySelector('input, textarea');
    if (err) err.classList.toggle('show', show);
    if (input) input.classList.toggle('invalid', show);
  }

  function validateField(field) {
    var input = field.querySelector('input[required], textarea[required]');
    if (!input) return true;
    var val = input.value.trim();
    var ok = true;
    if (!val) ok = false;
    else if (input.type === 'email' && !isEmail(val)) ok = false;
    showError(field, !ok);
    return ok;
  }

  /* ----------------------------- Multi-step form ----------------------------- */
  function initMultiStepForm() {
    var form = document.getElementById('anfrageForm');
    if (!form) return;
    var stepsWrap = document.getElementById('formSteps');
    var steps = Array.prototype.slice.call(stepsWrap.querySelectorAll('.form-step'));
    var total = steps.length;
    var current = 0;

    var stepNow = document.getElementById('stepNow');
    var stepTitle = document.getElementById('stepTitle');
    var progressFill = document.getElementById('progressFill');
    var btnBack = document.getElementById('btnBack');
    var btnNext = document.getElementById('btnNext');
    var btnSubmit = document.getElementById('btnSubmit');
    var successBox = document.getElementById('formSuccess');

    function updateProgress() {
      var pct = ((current + 1) / total) * 100;
      if (hasGSAP && !prefersReducedMotion) {
        gsap.to(progressFill, { width: pct + '%', duration: 0.4, ease: 'power2.out' });
      } else {
        progressFill.style.width = pct + '%';
      }
      stepNow.textContent = current + 1;
      stepTitle.textContent = steps[current].getAttribute('data-title');
      btnBack.style.visibility = current === 0 ? 'hidden' : 'visible';
      var last = current === total - 1;
      btnNext.style.display = last ? 'none' : 'inline-flex';
      btnSubmit.style.display = last ? 'inline-flex' : 'none';
    }

    function goTo(index, dir) {
      var currentEl = steps[current];
      var nextEl = steps[index];
      if (hasGSAP && !prefersReducedMotion) {
        gsap.to(currentEl, {
          x: dir > 0 ? -60 : 60, opacity: 0, duration: 0.28, ease: 'power2.in',
          onComplete: function () {
            currentEl.classList.remove('active');
            currentEl.style.transform = '';
            nextEl.classList.add('active');
            gsap.fromTo(nextEl, { x: dir > 0 ? 60 : -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.34, ease: 'power2.out' });
            current = index;
            updateProgress();
            focusFirst(nextEl);
          }
        });
      } else {
        currentEl.classList.remove('active');
        nextEl.classList.add('active');
        current = index;
        updateProgress();
        focusFirst(nextEl);
      }
    }

    function focusFirst(el) {
      var f = el.querySelector('input:not([type=hidden]), textarea');
      if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
    }

    function validateStep(el) {
      var fields = el.querySelectorAll('.field');
      var valid = true;
      fields.forEach(function (field) {
        if (field.querySelector('[required]')) {
          if (!validateField(field)) valid = false;
        }
      });
      return valid;
    }

    btnNext.addEventListener('click', function () {
      if (!validateStep(steps[current])) return;
      if (current < total - 1) goTo(current + 1, 1);
    });
    btnBack.addEventListener('click', function () {
      if (current > 0) goTo(current - 1, -1);
    });

    // Live-clear errors
    form.addEventListener('input', function (e) {
      var field = e.target.closest('.field');
      if (field && field.querySelector('[data-error].show')) validateField(field);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStep(steps[current])) return;
      submitForm(form, function () {
        form.style.display = 'none';
        document.getElementById('progressHead').style.display = 'none';
        successBox.classList.add('show');
        if (hasGSAP && !prefersReducedMotion) {
          gsap.from(successBox, { y: 24, opacity: 0, duration: 0.6, ease: 'power2.out' });
        }
        successBox.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
      }, btnSubmit);
    });

    updateProgress();
  }

  /* ----------------------------- Simple contact form ----------------------------- */
  function initContactForm() {
    var form = document.getElementById('kontaktForm');
    if (!form) return;
    var successBox = document.getElementById('kontaktSuccess');
    var submitBtn = form.querySelector('button[type=submit]');

    form.addEventListener('input', function (e) {
      var field = e.target.closest('.field');
      if (field && field.querySelector('[data-error].show')) validateField(field);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('.field');
      var valid = true;
      fields.forEach(function (field) {
        if (field.querySelector('[required]')) { if (!validateField(field)) valid = false; }
      });
      if (!valid) return;

      submitForm(form, function () {
        form.style.display = 'none';
        successBox.classList.add('show');
        if (hasGSAP && !prefersReducedMotion) {
          gsap.from(successBox, { y: 24, opacity: 0, duration: 0.6, ease: 'power2.out' });
        }
      }, submitBtn);
    });
  }

  /* ----------------------------- Copyright Year ----------------------------- */
  function updateCopyrightYear() {
    var yearEls = document.querySelectorAll('.copyright-year');
    var currentYear = new Date().getFullYear();
    yearEls.forEach(function(el) { el.textContent = currentYear; });
  }

  /* ----------------------------- Formspree submit ----------------------------- */
  function submitForm(form, onSuccess, btn) {
    var originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Wird gesendet …'; }

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      if (response.ok) {
        onSuccess();
      } else {
        response.json().then(function (data) {
          var msg = (data && data.errors) ? data.errors.map(function (x) { return x.message; }).join(', ')
            : 'Beim Senden ist ein Fehler aufgetreten. Bitte versuche es später erneut oder schreibe direkt an aydinintel@gmail.com.';
          alert(msg);
        }).catch(function () {
          alert('Beim Senden ist ein Fehler aufgetreten. Bitte versuche es später erneut oder schreibe direkt an aydinintel@gmail.com.');
        });
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
      }
    }).catch(function () {
      alert('Verbindung fehlgeschlagen. Bitte prüfe deine Internetverbindung oder schreibe direkt an aydinintel@gmail.com.');
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    });
  }

})();
