(function () {
  'use strict';

  const OFFER_END = new Date('2026-08-14T23:59:59+03:30').getTime();
  const DISMISS_KEY = 'brooklyn_offer_dismissed_at';
  const STICKY_HIDE_KEY = 'brooklyn_offer_sticky_hidden';
  const DISMISS_TTL_MS = 24 * 60 * 60 * 1000;
  const OPEN_DELAY_MS = 800;
  const PHONE_HREF = 'tel:09928292995';

  let timerId = null;
  let lastSeconds = null;
  let overlayEl = null;
  let stickyEl = null;
  let previouslyFocused = null;

  function toFaDigits(value) {
    return String(value).replace(/\d/g, function (d) {
      return '۰۱۲۳۴۵۶۷۸۹'[d];
    });
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function isExpired() {
    return Date.now() >= OFFER_END;
  }

  function isModalDismissed() {
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (!raw) return false;
      const ts = parseInt(raw, 10);
      if (Number.isNaN(ts)) return false;
      return Date.now() - ts < DISMISS_TTL_MS;
    } catch (e) {
      return false;
    }
  }

  function markModalDismissed() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (e) { /* ignore */ }
  }

  function isStickyHidden() {
    try {
      return localStorage.getItem(STICKY_HIDE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function markStickyHidden() {
    try {
      localStorage.setItem(STICKY_HIDE_KEY, '1');
    } catch (e) { /* ignore */ }
  }

  function getRemaining() {
    const diff = Math.max(0, OFFER_END - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { diff, days, hours, minutes, seconds };
  }

  function syncInlineStrip() {
    const strip = document.querySelector('.brooklyn-offer-inline');
    if (!strip) return;
    if (isExpired()) {
      strip.hidden = true;
      strip.setAttribute('hidden', '');
    } else {
      strip.hidden = false;
      strip.removeAttribute('hidden');
    }
  }

  function updateTimers(tickSeconds) {
    const { diff, days, hours, minutes, seconds } = getRemaining();

    if (diff <= 0) {
      closeModal(false);
      hideSticky();
      syncInlineStrip();
      stopTimer();
      return;
    }

    const map = {
      days: toFaDigits(days),
      hours: toFaDigits(pad2(hours)),
      minutes: toFaDigits(pad2(minutes)),
      seconds: toFaDigits(pad2(seconds))
    };

    Object.keys(map).forEach(function (key) {
      document.querySelectorAll('[data-offer-' + key + ']').forEach(function (el) {
        if (tickSeconds && key === 'seconds' && lastSeconds !== null && lastSeconds !== seconds) {
          el.classList.remove('is-tick');
          void el.offsetWidth;
          el.classList.add('is-tick');
        }
        el.textContent = map[key];
      });
    });

    const stickyClock = document.querySelector('[data-offer-sticky-clock]');
    if (stickyClock) {
      stickyClock.textContent =
        toFaDigits(days) + ' روز و ' +
        toFaDigits(pad2(hours)) + ':' +
        toFaDigits(pad2(minutes)) + ':' +
        toFaDigits(pad2(seconds));
    }

    lastSeconds = seconds;
  }

  function startTimer() {
    stopTimer();
    updateTimers(false);
    timerId = window.setInterval(function () {
      updateTimers(true);
    }, 1000);
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function lockScroll(lock) {
    document.body.classList.toggle('brooklyn-offer-lock', !!lock);
  }

  function onKeydown(e) {
    if (e.key === 'Escape' && overlayEl && overlayEl.classList.contains('is-open')) {
      closeModal(true);
    }
  }

  function buildModal() {
    overlayEl = document.createElement('div');
    overlayEl.className = 'brooklyn-offer-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.setAttribute('aria-labelledby', 'brooklyn-offer-title');
    overlayEl.innerHTML =
      '<div class="brooklyn-offer-modal">' +
        '<div class="brooklyn-offer-handle" aria-hidden="true"></div>' +
        '<button type="button" class="brooklyn-offer-close" aria-label="بستن" data-offer-close>×</button>' +
        '<span class="brooklyn-offer-badge">۱۵٪ تخفیف</span>' +
        '<h2 class="brooklyn-offer-title" id="brooklyn-offer-title">تخفیف ویژه Brooklyn</h2>' +
        '<p class="brooklyn-offer-subtitle">فرصت محدود — رنگ پت با ۱۵٪ تخفیف، فقط تا پایان مهلت</p>' +
        '<div class="brooklyn-offer-body">' +
          '<img class="brooklyn-offer-image" src="productnum1.png" width="104" height="104" alt="رنگ موی حیوانات Brooklyn">' +
          '<div class="brooklyn-offer-prices">' +
            '<div class="brooklyn-offer-old">۱٬۹۵۰٬۰۰۰ تومان</div>' +
            '<div class="brooklyn-offer-new">۱٬۶۵۰٬۰۰۰ <span>تومان</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="brooklyn-offer-timer" aria-live="polite">' +
          '<div class="brooklyn-offer-unit"><strong data-offer-days>۰</strong><span>روز</span></div>' +
          '<div class="brooklyn-offer-unit"><strong data-offer-hours>۰۰</strong><span>ساعت</span></div>' +
          '<div class="brooklyn-offer-unit"><strong data-offer-minutes>۰۰</strong><span>دقیقه</span></div>' +
          '<div class="brooklyn-offer-unit"><strong data-offer-seconds>۰۰</strong><span>ثانیه</span></div>' +
        '</div>' +
        '<div class="brooklyn-offer-actions">' +
          '<a class="brooklyn-offer-cta" href="' + PHONE_HREF + '">سفارش با تخفیف</a>' +
          '<button type="button" class="brooklyn-offer-later" data-offer-close>بعداً</button>' +
        '</div>' +
      '</div>';

    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl) closeModal(true);
    });
    overlayEl.querySelectorAll('[data-offer-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeModal(true);
      });
    });

    document.body.appendChild(overlayEl);
  }

  function buildSticky() {
    stickyEl = document.createElement('div');
    stickyEl.className = 'brooklyn-offer-sticky';
    stickyEl.setAttribute('role', 'region');
    stickyEl.setAttribute('aria-label', 'تخفیف ویژه');
    stickyEl.innerHTML =
      '<div class="brooklyn-offer-sticky-text">' +
        '<strong>۱۵٪ تخفیف Brooklyn</strong>' +
        '<span data-offer-sticky-clock>—</span>' +
      '</div>' +
      '<a class="brooklyn-offer-sticky-cta" href="' + PHONE_HREF + '">تماس</a>' +
      '<button type="button" class="brooklyn-offer-sticky-close" aria-label="بستن نوار تخفیف" data-sticky-close>×</button>';

    stickyEl.querySelector('[data-sticky-close]').addEventListener('click', function () {
      markStickyHidden();
      hideSticky();
    });

    document.body.appendChild(stickyEl);
  }

  function openModal() {
    if (!overlayEl || isExpired()) return;
    previouslyFocused = document.activeElement;
    overlayEl.classList.add('is-open');
    lockScroll(true);
    document.addEventListener('keydown', onKeydown);
    const closeBtn = overlayEl.querySelector('.brooklyn-offer-close');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
    startTimer();
  }

  function closeModal(persistDismiss) {
    if (!overlayEl) return;
    const wasOpen = overlayEl.classList.contains('is-open');
    overlayEl.classList.remove('is-open');
    lockScroll(false);
    document.removeEventListener('keydown', onKeydown);
    if (persistDismiss) markModalDismissed();
    if (wasOpen && !isExpired() && !isStickyHidden()) {
      showSticky();
    }
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      try { previouslyFocused.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
  }

  function showSticky() {
    if (!stickyEl || isExpired() || isStickyHidden()) return;
    stickyEl.classList.add('is-visible');
    startTimer();
  }

  function hideSticky() {
    if (!stickyEl) return;
    stickyEl.classList.remove('is-visible');
  }

  function init() {
    syncInlineStrip();

    if (isExpired()) {
      return;
    }

    buildModal();
    buildSticky();
    startTimer();

    if (isModalDismissed()) {
      if (!isStickyHidden()) showSticky();
      return;
    }

    window.setTimeout(openModal, OPEN_DELAY_MS);
  }

  window.BrooklynOffer = { init: init };
})();
