/* =========================================================
   ShakeWatch MX — interacciones de la landing
   ========================================================= */
(function () {
  'use strict';

  /** Compatibilidad: NodeList → Array */
  function all(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
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
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
