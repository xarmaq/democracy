/* Better Democracy — page interactions.
   Motion rules follow skills/emil-design-eng: strong ease-out curves,
   sub-300ms UI, transform/opacity only, interruptible transitions,
   reduced-motion and hover gating. */

(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------- Theme toggle ---------- */

  var themeToggle = $('#themeToggle');
  themeToggle.addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';

    function apply() {
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('bd-theme', next); } catch (e) { /* private mode */ }
    }

    // circular sweep from the toggle (View Transitions; plain swap elsewhere)
    if (document.startViewTransition && !reduceMotion.matches) {
      var r = themeToggle.getBoundingClientRect();
      document.documentElement.style.setProperty('--vt-x', (r.left + r.width / 2) + 'px');
      document.documentElement.style.setProperty('--vt-y', (r.top + r.height / 2) + 'px');
      document.startViewTransition(apply);
    } else {
      apply();
    }
  });

  /* ---------- Header state + scroll progress (one rAF-throttled handler) ---------- */

  var header = $('#siteHeader');
  var progress = $('#scrollProgress');
  var scrollScheduled = false;
  var lastY = window.scrollY;

  function onScroll() {
    scrollScheduled = false;
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 12);

    // duck the header while reading down; first upward scroll brings it back
    var menuOpen = mobileMenu && mobileMenu.classList.contains('is-open');
    if (!menuOpen) {
      if (y > 420 && y > lastY + 4) header.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 420) header.classList.remove('is-hidden');
    }
    lastY = y;

    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? y / max : 0;
    progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
  }

  window.addEventListener('scroll', function () {
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */

  var menuToggle = $('#menuToggle');
  var mobileMenu = $('#mobileMenu');

  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', function () {
    var open = mobileMenu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  $$('a', mobileMenu).forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---------- Scroll reveal (stagger inside [data-reveal-group]) ---------- */

  $$('[data-reveal-group]').forEach(function (group) {
    $$('[data-reveal]', group).forEach(function (el, i) {
      el.style.setProperty('--reveal-delay', Math.min(i, 8) * 60 + 'ms');
    });
  });

  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  $$('[data-reveal]').forEach(function (el) { revealIO.observe(el); });

  // Bug fix: when the page opens mid-document (anchor link, restored scroll),
  // anything at or above the viewport must not stay invisible forever.
  function revealAboveFold() {
    $$('[data-reveal]:not(.is-revealed)').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.5) {
        el.classList.add('is-revealed');
        revealIO.unobserve(el);
      }
    });
  }
  revealAboveFold();
  window.addEventListener('load', revealAboveFold);
  window.addEventListener('pageshow', revealAboveFold);
  setTimeout(revealAboveFold, 400);

  /* ---------- Number tickers ---------- */

  function runTicker(el) {
    var target = parseInt(el.dataset.ticker, 10);
    var suffix = el.dataset.tickerSuffix || '';
    if (reduceMotion.matches) {
      el.textContent = target.toLocaleString('en-US') + suffix;
      return;
    }
    var start = performance.now();
    var dur = 1400;
    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = Math.round(target * eased).toLocaleString('en-US') + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var tickerIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        runTicker(entry.target);
        tickerIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  $$('.ticker').forEach(function (el) { tickerIO.observe(el); });

  /* ---------- Countdown to Sofia ---------- */

  var EVENT_DATE = new Date('2026-09-18T09:00:00+03:00');
  var cd = {
    d: $('#cdDays'), h: $('#cdHours'), m: $('#cdMins'), s: $('#cdSecs')
  };
  var cdReady = false;

  function pad(n) { return String(n).padStart(2, '0'); }

  // digits roll up when they change (skipped on first paint / reduced motion)
  function setNum(el, val) {
    if (el.textContent === val) return;
    el.textContent = val;
    if (cdReady && !reduceMotion.matches && el.animate) {
      el.animate(
        [
          { transform: 'translateY(0.4em)', opacity: 0.1 },
          { transform: 'translateY(0)', opacity: 1 }
        ],
        { duration: 240, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
      );
    }
  }

  function updateCountdown() {
    var diff = Math.max(0, EVENT_DATE - Date.now());
    var secs = Math.floor(diff / 1000);
    setNum(cd.d, String(Math.floor(secs / 86400)));
    setNum(cd.h, pad(Math.floor((secs % 86400) / 3600)));
    setNum(cd.m, pad(Math.floor((secs % 3600) / 60)));
    setNum(cd.s, pad(secs % 60));
    cdReady = true;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- 3D tilt cards (decorative — smoothed, hover-gated) ---------- */

  if (finePointer.matches && !reduceMotion.matches) {
    $$('[data-tilt]').forEach(function (card) {
      var raf = 0, tx = 0, ty = 0, cx = 0, cy = 0, active = false;

      function loop() {
        // lerp toward the cursor target so the motion has momentum
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        card.style.transform =
          'rotateX(' + cy.toFixed(2) + 'deg) rotateY(' + cx.toFixed(2) + 'deg)';
        if (active) raf = requestAnimationFrame(loop);
      }

      card.addEventListener('pointerenter', function () {
        active = true;
        card.style.transition = 'none';
        raf = requestAnimationFrame(loop);
      });

      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tx = px * 9;    // rotateY
        ty = -py * 7;   // rotateX
      });

      card.addEventListener('pointerleave', function () {
        active = false;
        cancelAnimationFrame(raf);
        tx = ty = cx = cy = 0;
        card.style.transition = ''; // back to the 500ms ease-out from CSS
        card.style.transform = '';
      });
    });
  }

  /* ---------- Practice ballot (hero) ---------- */

  function countTo(el, target, suffix, dur) {
    if (reduceMotion.matches) {
      el.textContent = target.toLocaleString('en-US') + suffix;
      return;
    }
    var start = performance.now();
    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var ballot = $('.ballot');
  if (ballot) {
    var tally = { yes: 673, no: 574 };
    var voted = false;

    $$('.ballot__opt', ballot).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (voted) return;
        voted = true;
        tally[btn.dataset.vote]++;

        btn.classList.add('is-chosen');
        $$('.ballot__opt', ballot).forEach(function (b) { b.disabled = true; });
        ballot.classList.add('is-voted');

        var total = tally.yes + tally.no;
        var yes = Math.round((tally.yes / total) * 100);
        $('.ballot__fill--yes', ballot).style.transform = 'scaleX(' + yes / 100 + ')';
        $('.ballot__fill--no', ballot).style.transform = 'scaleX(' + (100 - yes) / 100 + ')';
        countTo($('#pctYes'), yes, '%', 900);
        countTo($('#pctNo'), 100 - yes, '%', 900);
        countTo($('#ballotTotal'), total, '', 900);
      });
    });
  }

  /* ---------- Magnetic CTAs (decorative — smoothed, hover-gated) ---------- */

  if (finePointer.matches && !reduceMotion.matches) {
    $$('.btn--mag').forEach(function (btn) {
      var raf = 0, tx = 0, ty = 0, x = 0, y = 0, s = 1, active = false;

      function clamp(v, m) { return Math.max(-m, Math.min(m, v)); }

      function render() {
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        btn.style.transform =
          'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s + ')';
        if (active) raf = requestAnimationFrame(render);
      }

      btn.addEventListener('pointerenter', function () {
        active = true;
        btn.style.transition = 'background-color 200ms ease, color 200ms ease, border-color 200ms ease';
        raf = requestAnimationFrame(render);
      });

      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        tx = clamp((e.clientX - (r.left + r.width / 2)) * 0.22, 10);
        ty = clamp((e.clientY - (r.top + r.height / 2)) * 0.34, 8);
      });

      btn.addEventListener('pointerdown', function () { s = 0.97; });
      btn.addEventListener('pointerup', function () { s = 1; });

      btn.addEventListener('pointerleave', function () {
        active = false;
        cancelAnimationFrame(raf);
        tx = ty = x = y = 0;
        s = 1;
        btn.style.transition = '';
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Segmented tabs (register + schedule days) ---------- */

  function initSegTabs(seg, panels, order, attr, onShow) {
    var active = order[0];

    function set(name) {
      if (!panels[name] || name === active) return;
      var dir = order.indexOf(name) > order.indexOf(active) ? 'right' : 'left';
      var oldPanel = panels[active];
      var newPanel = panels[name];
      active = name;

      seg.dataset.active = name;
      $$('.seg__btn', seg).forEach(function (btn) {
        var on = btn.dataset[attr] === name;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-selected', String(on));
      });

      oldPanel.hidden = true;
      oldPanel.classList.remove('is-active');
      newPanel.hidden = false;
      newPanel.classList.add('is-active');

      if (!reduceMotion.matches) {
        newPanel.classList.add('is-entering-' + dir);
        void newPanel.offsetWidth; // flush so the entry transition can play
        newPanel.classList.remove('is-entering-right', 'is-entering-left');
      }

      if (onShow) onShow(newPanel);
    }

    $$('.seg__btn', seg).forEach(function (btn) {
      btn.addEventListener('click', function () { set(btn.dataset[attr]); });
    });

    return set;
  }

  var setRegisterTab = initSegTabs(
    $('.register .seg'),
    { participant: $('#panelParticipant'), speaker: $('#panelSpeaker') },
    ['participant', 'speaker'],
    'tab'
  );

  // index the rows so the switch cascade can stagger them
  $$('.sched__panel').forEach(function (panel) {
    $$('.sched__item', panel).forEach(function (item, i) {
      item.style.setProperty('--i', i);
    });
  });

  initSegTabs(
    $('.seg--sched'),
    { day1: $('#schedDay1'), day2: $('#schedDay2') },
    ['day1', 'day2'],
    'day',
    function (panel) {
      if (reduceMotion.matches) return;
      panel.classList.add('is-switching');
      setTimeout(function () { panel.classList.remove('is-switching'); }, 900);
    }
  );

  // Hero CTAs and "You?" card preselect a tab before scrolling to #register
  $$('[data-tab-link]').forEach(function (link) {
    link.addEventListener('click', function () { setRegisterTab(link.dataset.tabLink); });
  });

  /* ---------- Schedule: expandable sessions ---------- */

  $$('.sched__item[data-sched]').forEach(function (item) {
    var row = $('.sched__row', item);
    row.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      row.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Schedule: day map (proportional timeline strip) ---------- */

  $$('.sched__map').forEach(function (map) {
    var panel = map.closest('.sched__panel');
    var items = $$('.sched__item', panel);
    var caption = $('.sched__map-caption', map);
    var home = caption.textContent;

    $$('.sched__map-block', map).forEach(function (block, bi) {
      block.style.setProperty('--i', bi); // stagger index for the reveal rise
      var item = items[+block.dataset.jump];
      if (!item) return;

      function preview() { caption.textContent = block.getAttribute('aria-label'); }
      function restore() { caption.textContent = home; }
      block.addEventListener('mouseenter', preview);
      block.addEventListener('focus', preview);
      block.addEventListener('mouseleave', restore);
      block.addEventListener('blur', restore);

      block.addEventListener('click', function () {
        if (item.hasAttribute('data-sched') && !item.classList.contains('is-open')) {
          item.classList.add('is-open');
          $('.sched__row', item).setAttribute('aria-expanded', 'true');
        }
        item.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
        item.classList.remove('is-hit');
        void item.offsetWidth; // restart the pulse when re-clicked
        item.classList.add('is-hit');
      });
    });
  });

  $$('.sched__item').forEach(function (item) {
    item.addEventListener('animationend', function (e) {
      if (e.animationName === 'hitPulse') item.classList.remove('is-hit');
    });
  });

  /* ---------- Side rail: scrollspy ---------- */

  var railLinks = $$('.rail a');
  if (railLinks.length) {
    var railById = {};
    railLinks.forEach(function (a) {
      railById[a.getAttribute('href').slice(1)] = a;
    });

    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        railLinks.forEach(function (a) { a.classList.remove('is-active'); });
        var link = railById[entry.target.id];
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    Object.keys(railById).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spyIO.observe(section);
    });
  }

  /* ---------- Marquee: inertia skew from scroll velocity (decorative) ---------- */

  if (!reduceMotion.matches) {
    var skewEl = $('#marqueeSkew');
    if (skewEl) {
      var skVel = 0, skTarget = 0, skLast = window.scrollY, skRunning = false;

      function skLoop() {
        skVel += (skTarget - skVel) * 0.14;
        skTarget *= 0.85; // decay back to rest
        skewEl.style.transform = 'skewX(' + skVel.toFixed(2) + 'deg)';
        if (Math.abs(skVel) > 0.03 || Math.abs(skTarget) > 0.03) {
          requestAnimationFrame(skLoop);
        } else {
          skRunning = false;
          skewEl.style.transform = '';
        }
      }

      window.addEventListener('scroll', function () {
        var y = window.scrollY;
        skTarget = Math.max(-4, Math.min(4, (y - skLast) * 0.12));
        skLast = y;
        if (!skRunning) {
          skRunning = true;
          requestAnimationFrame(skLoop);
        }
      }, { passive: true });
    }
  }

  /* ---------- Forms: submission flow ---------- */

  function setupForm(form) {
    var panel = form.closest('.panel');
    var success = $('.success', panel);
    var submitBtn = $('.btn--submit', form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // enforce validity with visible feedback
      if (!form.checkValidity()) {
        $$(':invalid', form).forEach(function (field) {
          field.classList.add('is-invalid');
        });
        form.classList.add('is-error');
        form.addEventListener('animationend', function () {
          form.classList.remove('is-error');
        }, { once: true });
        form.reportValidity();
        return;
      }

      var words = $('input[name="name"]', form).value.trim()
        .split(/\s+/)
        .filter(function (w) { return !/^(dr|prof|mr|ms|mrs|mx)\.?$/i.test(w); });
      var name = words[0] || 'friend';
      var email = $('input[name="email"]', form).value.trim();

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');

      // confirmation delay keeps the state change readable
      setTimeout(function () {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        form.hidden = true;

        $('[data-success-name]', success).textContent = name;
        $('[data-success-email]', success).textContent = email;
        success.hidden = false;
        void success.offsetWidth;
        success.classList.add('is-shown');

        toast('Application received', 'Confirmation sent to ' + email + '.');
      }, 1400);
    });

    // clear the invalid highlight as soon as the user fixes a field
    form.addEventListener('input', function (e) {
      if (e.target.classList) e.target.classList.remove('is-invalid');
    });

    $('[data-reset-form]', panel).addEventListener('click', function () {
      success.classList.remove('is-shown');
      success.hidden = true;
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      form.reset();
      form.hidden = false;
    });
  }

  setupForm($('#formParticipant'));
  setupForm($('#formSpeaker'));

  // cap interests at 3
  var interests = $('#pInterests');
  interests.addEventListener('change', function (e) {
    var checked = $$('input:checked', interests);
    if (checked.length > 3) {
      e.target.checked = false;
      toast('Easy there', 'Pick at most 3 interests.');
    }
  });

  /* ---------- Toasts (transitions → interruptible, asymmetric timing) ---------- */

  var toastRegion = $('#toastRegion');

  function toast(title, text) {
    var el = document.createElement('div');
    el.className = 'toast toast--pre';
    el.setAttribute('role', 'status');
    el.innerHTML = '<span class="toast__dot"></span><div><b></b><span></span></div>';
    $('b', el).textContent = title;
    $('div > span', el).textContent = text;
    toastRegion.appendChild(el);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.remove('toast--pre'); // enter: 400ms ease
      });
    });

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      el.classList.add('toast--leaving'); // exit: 200ms — snappier than enter
      el.addEventListener('transitionend', function () { el.remove(); }, { once: true });
      setTimeout(function () { el.remove(); }, 400); // safety net
    }

    el.addEventListener('click', dismiss);
    setTimeout(dismiss, 5200);
  }

  /* ---------- Cookie consent ---------- */

  var cookieConsent = $('#cookieConsent');
  var cookiePanel = $('#cookiePanel');
  var cookieSettings = $('#cookieSettings');
  var cookiePrefs = $('#cookiePrefs');
  var cookieAnalytics = $('#cookieAnalytics');
  var cookieManage = $('[data-cookie-manage]', cookieConsent);
  var COOKIE_KEY = 'bd-cookie-consent';
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

  function getCookie(name) {
    var parts = document.cookie ? document.cookie.split('; ') : [];
    for (var i = 0; i < parts.length; i++) {
      var pair = parts[i].split('=');
      if (decodeURIComponent(pair[0]) === name) {
        try {
          return JSON.parse(decodeURIComponent(pair.slice(1).join('=')));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  function setCookie(name, value) {
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(JSON.stringify(value)) +
      '; Max-Age=' + COOKIE_MAX_AGE + '; Path=/; SameSite=Lax' + secure;
  }

  function readCookieChoice() {
    var savedCookie = getCookie(COOKIE_KEY);
    if (savedCookie) return savedCookie;
    try {
      return JSON.parse(localStorage.getItem(COOKIE_KEY));
    } catch (e) {
      return null;
    }
  }

  function storeCookieChoice(choice) {
    var saved = {
      essential: true,
      preferences: !!choice.preferences,
      analytics: !!choice.analytics,
      savedAt: new Date().toISOString()
    };
    setCookie(COOKIE_KEY, saved);
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify(saved));
    } catch (e) {
      /* private mode */
    }
  }

  function setCookiePanel(open) {
    cookiePanel.hidden = !open;
    cookieManage.setAttribute('aria-expanded', String(open));
  }

  function showCookieConsent(expand) {
    var saved = readCookieChoice();
    cookiePrefs.checked = !!(saved && saved.preferences);
    cookieAnalytics.checked = !!(saved && saved.analytics);
    cookieConsent.hidden = false;
    setCookiePanel(!!expand);
    requestAnimationFrame(function () {
      cookieConsent.classList.add('is-visible');
    });
  }

  function hideCookieConsent() {
    cookieConsent.classList.remove('is-visible');
    cookieConsent.addEventListener('transitionend', function () {
      if (!cookieConsent.classList.contains('is-visible')) cookieConsent.hidden = true;
    }, { once: true });
    setTimeout(function () {
      if (!cookieConsent.classList.contains('is-visible')) cookieConsent.hidden = true;
    }, 360);
  }

  if (cookieConsent && cookieSettings) {
    if (!readCookieChoice()) {
      setTimeout(function () { showCookieConsent(false); }, 700);
    }

    cookieSettings.addEventListener('click', function () {
      showCookieConsent(true);
    });

    $('[data-cookie-accept]', cookieConsent).addEventListener('click', function () {
      storeCookieChoice({ preferences: true, analytics: true });
      hideCookieConsent();
      toast('Cookie choices saved', 'All optional cookies are enabled for this browser.');
    });

    $('[data-cookie-reject]', cookieConsent).addEventListener('click', function () {
      storeCookieChoice({ preferences: false, analytics: false });
      hideCookieConsent();
      toast('Essential only', 'Only required cookies remain active.');
    });

    $('[data-cookie-save]', cookieConsent).addEventListener('click', function () {
      storeCookieChoice({
        preferences: cookiePrefs.checked,
        analytics: cookieAnalytics.checked
      });
      hideCookieConsent();
      toast('Cookie choices saved', 'Your preferences have been updated.');
    });

    cookieManage.addEventListener('click', function () {
      setCookiePanel(cookiePanel.hidden);
    });
  }

  /* ---------- FAQ accordion (grid-rows collapse, JS-sequenced) ---------- */

  $$('.faq__item').forEach(function (item) {
    var summary = $('summary', item);
    var body = $('.faq__body', item);

    summary.addEventListener('click', function (e) {
      e.preventDefault();

      if (item.classList.contains('is-open')) {
        item.classList.remove('is-open');
        if (reduceMotion.matches) {
          item.open = false;
        } else {
          body.addEventListener('transitionend', function () {
            if (!item.classList.contains('is-open')) item.open = false;
          }, { once: true });
        }
      } else {
        item.open = true;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            item.classList.add('is-open');
          });
        });
      }
    });
  });
})();
