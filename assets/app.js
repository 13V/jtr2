/* ============================================================
   JT-R GARAGE — theme interactions
   - reveal-on-scroll
   - cinematic mouse/scroll parallax (hero)
   - nav scroll-progress bar
   - interactive chassis filter for the apparel grid
   Runs against the whole document; safe to load with defer.
   ============================================================ */
(function () {
  function init() {
    var root = document;

    /* ---------- reveal on scroll ---------- */
    var els = Array.prototype.slice.call(root.querySelectorAll('.jtr-reveal'));
    els.forEach(function (e, i) { e.style.transitionDelay = (Math.min(i, 3) * 0.08) + 's'; });
    function reveal(e) { e.classList.add('jtr-in'); }
    function check() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      els.forEach(function (e) {
        if (e.classList.contains('jtr-in')) return;
        var r = e.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) reveal(e);
      });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); } });
      }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
      els.forEach(function (e) { io.observe(e); });
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    setTimeout(function () { els.forEach(reveal); }, 1400);

    /* ---------- parallax + nav progress ---------- */
    var mouseEls = Array.prototype.slice.call(root.querySelectorAll('[data-px-mouse]'));
    var progress = root.querySelector('[data-progress]');
    var hero = root.querySelector('#top') || root.querySelector('.jtr-hero');
    var tmx = 0, tmy = 0, mxv = 0, myv = 0;
    function onMove(e) {
      var t = hero || document.body;
      var r = t.getBoundingClientRect();
      tmx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2));
      tmy = Math.max(-1, Math.min(1, ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2));
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    function vp() { return window.innerHeight || document.documentElement.clientHeight; }
    function tick() {
      mxv += (tmx - mxv) * 0.07;
      myv += (tmy - myv) * 0.07;
      mouseEls.forEach(function (el) {
        var s = parseFloat(el.getAttribute('data-px-mouse')) || 12;
        el.style.transform = 'translate3d(' + (mxv * s).toFixed(2) + 'px,' + (myv * s).toFixed(2) + 'px,0)';
      });
      if (progress) {
        var h = document.documentElement.scrollHeight - vp();
        var p = h > 0 ? Math.min(1, Math.max(0, (window.scrollY || 0) / h)) : 0;
        progress.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    /* ---------- chassis filter ---------- */
    var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(root.querySelectorAll('.jtr-pcard'));
    var drop = root.querySelector('#drop');
    function applyFilter(f) {
      cards.forEach(function (c) {
        var tags = (c.getAttribute('data-tags') || '').split(/\s+/);
        var match = f === 'all' || String(f).split(/\s+/).some(function (x) { return tags.indexOf(x) !== -1; });
        c.classList.toggle('jtr-dim', !match);
      });
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        var filter = chip.getAttribute('data-filter');
        if (!filter) return; // chips without a filter behave as normal links
        e.preventDefault();
        var wasActive = chip.classList.contains('jtr-active') && filter !== 'all';
        chips.forEach(function (c) { c.classList.remove('jtr-active'); });
        if (wasActive) {
          var all = chips.filter(function (c) { return c.getAttribute('data-filter') === 'all'; })[0];
          if (all) all.classList.add('jtr-active');
          applyFilter('all');
        } else {
          chip.classList.add('jtr-active');
          applyFilter(filter);
        }
        if (drop) window.scrollTo({ top: drop.getBoundingClientRect().top + (window.scrollY || 0) - 80, behavior: 'smooth' });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
