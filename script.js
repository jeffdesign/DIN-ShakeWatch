/* =========================================================
   ShakeWatch MX — interacciones de la landing
   ========================================================= */
(function () {
  'use strict';

  /** Compatibilidad: NodeList → Array */
  function all(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Sombra de nav al hacer scroll ────────────────── */
  var navEl = document.getElementById('nav');
  if (navEl) {
    var onNavScroll = function () {
      navEl.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onNavScroll();
    window.addEventListener('scroll', onNavScroll, { passive: true });
  }

  /* ── Parallax del celular con el mouse (hero) ────── */
  var heroSection = document.querySelector('.hero');
  var phoneWrap = document.querySelector('.hero__phone-wrap');
  var canHoverPrecisely =
    window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (heroSection && phoneWrap && !reduce && canHoverPrecisely) {
    var heroRect = null;
    var pendingEvent = null;
    var parallaxTicking = false;
    var MAX_SHIFT_X = 16; // px
    var MAX_SHIFT_Y = 10; // px

    var measureHero = function () {
      heroRect = heroSection.getBoundingClientRect();
    };
    measureHero();
    window.addEventListener('resize', measureHero);

    var applyParallax = function () {
      parallaxTicking = false;
      if (!heroRect || !pendingEvent) return;
      var relX = (pendingEvent.clientX - heroRect.left) / heroRect.width - 0.5;
      var relY = (pendingEvent.clientY - heroRect.top) / heroRect.height - 0.5;
      var x = relX * MAX_SHIFT_X * 2;
      var y = relY * MAX_SHIFT_Y * 2;
      phoneWrap.style.transform = 'translate3d(' + x.toFixed(2) + 'px, ' + y.toFixed(2) + 'px, 0)';
    };

    heroSection.addEventListener('mousemove', function (e) {
      pendingEvent = e;
      if (!parallaxTicking) {
        parallaxTicking = true;
        requestAnimationFrame(applyParallax);
      }
    });

    heroSection.addEventListener('mouseleave', function () {
      pendingEvent = null;
      phoneWrap.style.transform = '';
    });
  }

  /* ── Cuenta regresiva decorativa (feature 01) ────── */
  var countdownTime = document.querySelector('.countdown__time');
  var countdownDigits = countdownTime && countdownTime.querySelector('b');
  if (countdownTime && countdownDigits && !reduce) {
    var count = 10;
    setInterval(function () {
      count = count > 0 ? count - 1 : 10;
      countdownDigits.textContent = '0:00:' + (count < 10 ? '0' + count : count);
      countdownTime.classList.toggle('countdown__time--alert', count > 0 && count <= 3);

      countdownDigits.classList.remove('tick');
      // Fuerza reflow para reiniciar la animación de "tick" cada segundo.
      void countdownDigits.offsetWidth;
      countdownDigits.classList.add('tick');
    }, 1000);
  }

  /* ── Carrusel infinito de testimonios ────────────── */
  var voicesTrack = document.querySelector('.voices__track');
  var voicesDupFirst = voicesTrack && voicesTrack.querySelector('.voices__dup > :first-child');
  var MARQUEE_SPEED = 42; // px por segundo

  function updateMarqueeDistance() {
    if (!voicesTrack || !voicesDupFirst) return;
    // La distancia entre el inicio del track y el primer ítem duplicado
    // es exactamente un ciclo completo (incluye anchos + gaps reales).
    // Se mide así en vez de usar translateX(-50%) porque el ancho de las
    // tarjetas cambia por breakpoint y el 50% no coincide con un ciclo
    // exacto cuando hay "gap" de por medio (deja un salto visible).
    var trackLeft = voicesTrack.getBoundingClientRect().left;
    var dupLeft = voicesDupFirst.getBoundingClientRect().left;
    var distance = dupLeft - trackLeft;
    if (distance <= 0) return;

    voicesTrack.style.setProperty('--marquee-distance', '-' + distance + 'px');
    voicesTrack.style.setProperty('--marquee-duration', distance / MARQUEE_SPEED + 's');
  }

  if (voicesTrack && voicesDupFirst) {
    updateMarqueeDistance();
    window.addEventListener('load', updateMarqueeDistance);

    var marqueeResizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(marqueeResizeTimer);
      marqueeResizeTimer = setTimeout(updateMarqueeDistance, 150);
    });
  }

  /* ── Menú móvil ──────────────────────────────────── */
  var burger = document.getElementById('nav-burger');
  var menu = document.getElementById('nav-menu');

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ── Verificador de cobertura ────────────────────── */
  var estado = document.getElementById('estado');
  var si = document.getElementById('coverage-yes');
  var no = document.getElementById('coverage-no');

  if (estado && si && no) {
    estado.addEventListener('change', function () {
      var v = estado.value;
      si.hidden = v !== '1';
      no.hidden = v !== '0';
    });
  }

  /* ── FAQ: sólo una respuesta abierta a la vez ────── */
  var faqs = all('.faq__item');
  faqs.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqs.forEach(function (otro) {
        if (otro !== item) otro.open = false;
      });
    });
  });

  /* ── Modal de video de testimonios ───────────────── */
  var videoModal = document.getElementById('video-modal');
  var videoPlayer = document.getElementById('video-modal-player');
  var videoLastFocused = null;

  function openVideoModal(card) {
    if (!videoModal || !videoPlayer) return;
    var src = card.getAttribute('data-video');
    var poster = card.getAttribute('data-poster');
    videoLastFocused = document.activeElement;

    if (poster) videoPlayer.setAttribute('poster', poster);
    if (src) videoPlayer.setAttribute('src', src);

    videoModal.hidden = false;
    document.body.classList.add('modal-open');
    videoModal.querySelector('.video-modal__close').focus();
    videoPlayer.play().catch(function () {});
  }

  function closeVideoModal() {
    if (!videoModal || !videoPlayer || videoModal.hidden) return;
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoPlayer.load();
    videoModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (videoLastFocused) videoLastFocused.focus();
  }

  if (videoModal && videoPlayer) {
    all('[data-close]', videoModal).forEach(function (el) {
      el.addEventListener('click', closeVideoModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeVideoModal();
    });

    all('.voices__track > .voices__video[data-video]').forEach(function (card) {
      card.addEventListener('click', function () {
        openVideoModal(card);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openVideoModal(card);
        }
      });
    });
  }

  /* ── Formularios → página de gracias ─────────────── */
  all('form[action="gracias.html"]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var params = new URLSearchParams();
      var nombre = form.querySelector('[name="nombre"]');
      var email = form.querySelector('[name="email"]');

      if (nombre && nombre.value) params.set('nombre', nombre.value.trim());
      if (email && email.value) params.set('email', email.value.trim());
      params.set('origen', form.dataset.origen || 'form');

      // Aquí se conectaría el envío real (API / CRM / Mailchimp) antes de redirigir.
      window.location.href = 'gracias.html?' + params.toString();
    });
  });

  /* ── Reveal al hacer scroll ──────────────────────── */
  var reveals = all('.reveal');

  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { io.observe(el); });
  }
})();
