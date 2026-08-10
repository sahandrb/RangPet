(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-9VJZMGSMFP';

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID, { send_page_view: true });

  window.trackEvent = function (name, params) {
    if (typeof gtag === 'function') {
      gtag('event', name, params || {});
    }
  };

  function closest(el, selector) {
    if (!el) return null;
    if (typeof el.closest === 'function') return el.closest(selector);
    while (el && el.nodeType === 1) {
      if (el.matches && el.matches(selector)) return el;
      el = el.parentElement;
    }
    return null;
  }

  document.addEventListener(
    'click',
    function (e) {
      var target = e.target;
      if (!target) return;

      var offerCta = closest(target, '.brooklyn-offer-cta, .brooklyn-offer-sticky-cta');
      if (offerCta) {
        window.trackEvent('offer_cta_click', {
          link_url: offerCta.getAttribute('href') || '',
          link_text: (offerCta.textContent || '').trim()
        });
        return;
      }

      var buyLink = closest(target, 'a.index-faq-btn, a.faq-contact-btn');
      if (buyLink) {
        var href = buyLink.getAttribute('href') || '';
        if (href.indexOf('tel:') === 0) {
          window.trackEvent('phone_click', {
            link_url: href,
            link_text: (buyLink.textContent || '').trim()
          });
        } else {
          window.trackEvent('buy_click', {
            link_url: href,
            link_text: (buyLink.textContent || '').trim()
          });
        }
        return;
      }

      var telLink = closest(target, 'a[href^="tel:"]');
      if (telLink) {
        window.trackEvent('phone_click', {
          link_url: telLink.getAttribute('href') || '',
          link_text: (telLink.textContent || '').trim()
        });
      }
    },
    true
  );
})();
