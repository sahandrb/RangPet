(function () {
  'use strict';

  function isHomePage() {
    if (window.BrooklynNav && typeof window.BrooklynNav.isHomePage === 'function') {
      return window.BrooklynNav.isHomePage();
    }
    var path = (window.location.pathname || '').replace(/\\/g, '/');
    var file = path.split('/').pop() || '';
    return file === '' || file === 'index.html' || file === 'index.htm';
  }

  function rewriteHashLinks() {
    if (isHomePage()) return;

    var links = document.querySelectorAll('[data-nav-link]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href') || '';
      if (href.charAt(0) === '#') {
        links[i].setAttribute('href', 'index.html' + href);
      }
    }
  }

  function initNav() {
    if (!window.BrooklynNav) return;
    if (typeof window.BrooklynNav.reinit === 'function') {
      window.BrooklynNav.reinit();
    } else {
      window.BrooklynNav.init();
    }
  }

  function loadHeader() {
    var mount = document.getElementById('header-mount');
    if (!mount) return Promise.resolve(false);

    return fetch('header.html', { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('Header fetch failed: ' + res.status);
        return res.text();
      })
      .then(function (html) {
        mount.innerHTML = html;
        rewriteHashLinks();
        initNav();
        return true;
      })
      .catch(function (err) {
        if (typeof console !== 'undefined' && console.error) {
          console.error('[Brooklyn] load-header:', err);
        }
        return false;
      });
  }

  window.BrooklynLoadHeader = {
    load: loadHeader,
    rewriteHashLinks: rewriteHashLinks
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
  } else {
    loadHeader();
  }
})();
