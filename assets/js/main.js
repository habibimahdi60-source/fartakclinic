// Fartak Beauty Clinic — shared behaviors
document.addEventListener('DOMContentLoaded', function () {

  /* ---- floating quick-contact buttons (call + whatsapp) ---- */
  var quick = document.createElement('div');
  quick.id = 'quick-contact';
  quick.innerHTML =
    '<a href="https://wa.me/989933951614" class="qc-whatsapp" target="_blank" rel="noopener" aria-label="واتساپ">' +
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.5 0 9.96-4.46 9.96-9.96C21.99 6.46 17.54 2 12.04 2Zm5.8 14.16c-.24.68-1.4 1.3-1.93 1.37-.5.07-1.05.1-3.15-.68-2.65-1.03-4.36-3.72-4.5-3.9-.13-.18-1.08-1.44-1.08-2.75 0-1.3.68-1.94.93-2.2.24-.27.53-.33.7-.33h.5c.16 0 .38-.03.59.45.24.55.79 1.93.86 2.07.07.14.11.3.02.48-.09.18-.14.29-.27.45-.14.16-.29.35-.41.47-.14.14-.28.28-.12.55.16.27.71 1.17 1.53 1.9 1.05.94 1.93 1.23 2.2 1.37.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.25.09 1.58.75 1.85.88.27.14.45.2.52.32.07.11.07.65-.17 1.33Z"/></svg>' +
    '</a>' +
    '<a href="tel:+989933951614" class="qc-call" aria-label="تماس تلفنی">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 14l5 2v4a2 2 0 0 1-2 2C9.5 22 2 14.5 2 7a2 2 0 0 1 2-2Z"/></svg>' +
    '</a>';
  document.body.appendChild(quick);


  /* ---- intro animation (home page only, once per browser tab) ---- */
  var intro = document.getElementById('intro');
  if (intro) {
    var seen = sessionStorage.getItem('fartak-intro-seen');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduced) {
      intro.remove();
    } else {
      document.body.classList.add('intro-active');
      window.setTimeout(function () {
        intro.classList.add('fade-out');
        sessionStorage.setItem('fartak-intro-seen', '1');
        window.setTimeout(function () {
          intro.remove();
          document.body.classList.remove('intro-active');
        }, 750);
      }, 2400);
    }
  }

  /* ---- sticky header on scroll ---- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 40) header.classList.add('is-solid');
      else header.classList.remove('is-solid');
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  /* ---- mobile nav toggle ---- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      var open = links.classList.contains('open');
      toggle.textContent = open ? '\u2715' : '\u2630';
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.textContent = '\u2630';
      });
    });
  }

  /* ---- before/after gallery filter ---- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var baCards = document.querySelectorAll('.ba-card');
  if (filterBtns.length && baCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.dataset.filter;
        baCards.forEach(function (card) {
          var show = (cat === 'all' || card.dataset.cat === cat);
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---- lightbox ---- */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    document.querySelectorAll('[data-lightbox]').forEach(function (el) {
      el.addEventListener('click', function () {
        lbImg.src = el.dataset.lightbox;
        lbImg.alt = el.dataset.alt || '';
        lightbox.classList.add('open');
      });
    });
    lightbox.addEventListener('click', function () {
      lightbox.classList.remove('open');
    });
  }

  /* ---- simple contact form (no backend — friendly confirmation) ---- */
  var form = document.querySelector('form.booking');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('form-success');
      if (msg) msg.style.display = 'block';
      form.reset();
    });
  }

});
