(function () {
  'use strict';

  const FOCUSABLE =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  let initialized = false;
  let isOpen = false;
  let previouslyFocused = null;
  let toggleEl = null;
  let navEl = null;
  let overlayEl = null;
  let headerEl = null;

  function getFocusable(container) {
    return Array.prototype.slice.call(container.querySelectorAll(FOCUSABLE)).filter(function (el) {
      return !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true';
    });
  }

  function getHeaderOffset() {
    if (!headerEl) return 80;
    return headerEl.getBoundingClientRect().height + 12;
  }

  function setOpenState(open) {
    isOpen = open;

    if (toggleEl) {
      toggleEl.classList.toggle('is-active', open);
      toggleEl.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggleEl.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
    }

    if (navEl) {
      navEl.classList.toggle('is-open', open);
      navEl.setAttribute('aria-hidden', open ? 'false' : 'true');
      navEl.setAttribute('aria-modal', open ? 'true' : 'false');
      if (open) {
        navEl.removeAttribute('inert');
      } else {
        navEl.setAttribute('inert', '');
      }
    }

    if (overlayEl) {
      overlayEl.classList.toggle('is-open', open);
      overlayEl.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    document.body.classList.toggle('nav-open', open);
  }

  function open() {
    if (isOpen || !navEl) return;
    previouslyFocused = document.activeElement;
    setOpenState(true);

    requestAnimationFrame(function () {
      var focusables = getFocusable(navEl);
      if (focusables.length) {
        focusables[0].focus();
      } else if (toggleEl) {
        toggleEl.focus();
      }
    });
  }

  function close() {
    if (!isOpen) return;
    setOpenState(false);

    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    } else if (toggleEl) {
      toggleEl.focus();
    }
    previouslyFocused = null;
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  function onKeyDown(e) {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    if (e.key !== 'Tab' || !navEl) return;

    var focusables = getFocusable(navEl);
    if (!focusables.length) {
      e.preventDefault();
      if (toggleEl) toggleEl.focus();
      return;
    }

    // Keep toggle in the trap while menu is open (it sits above the drawer)
    var trap = focusables.slice();
    if (toggleEl && trap.indexOf(toggleEl) === -1) {
      trap.unshift(toggleEl);
    }

    var first = trap[0];
    var last = trap[trap.length - 1];
    var active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || !navEl.contains(active) && active !== toggleEl) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function scrollToHash(hash) {
    if (!hash || hash === '#') return;
    var id = hash.replace(/^#/, '');
    var target = document.getElementById(id);
    if (!target) return;

    var top = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  }

  function onNavLinkClick(e) {
    var link = e.currentTarget;
    var href = link.getAttribute('href') || '';

    if (href.charAt(0) !== '#') {
      close();
      return;
    }

    e.preventDefault();
    close();

    // Allow close transition to start before scrolling
    requestAnimationFrame(function () {
      scrollToHash(href);
      if (history && history.pushState) {
        history.pushState(null, '', href);
      }
    });
  }

  function onResize() {
    if (window.matchMedia('(min-width: 900px)').matches && isOpen) {
      close();
    }
  }

  function bind() {
    toggleEl = document.getElementById('menuToggle');
    navEl = document.getElementById('mobileNav');
    overlayEl = document.getElementById('navOverlay');
    headerEl = document.getElementById('siteHeader') || document.querySelector('.header');

    if (!toggleEl || !navEl || !overlayEl) return false;

    toggleEl.addEventListener('click', function (e) {
      e.preventDefault();
      toggle();
    });

    overlayEl.addEventListener('click', function () {
      close();
    });

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    var links = document.querySelectorAll('[data-nav-link]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', onNavLinkClick);
    }

    // Ensure closed defaults after inject
    setOpenState(false);
    return true;
  }

  function init() {
    if (initialized) return;
    if (!bind()) return;
    initialized = true;
  }

  window.BrooklynNav = {
    init: init,
    open: open,
    close: close,
    toggle: toggle
  };
})();
