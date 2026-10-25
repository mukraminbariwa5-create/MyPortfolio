/* =========================================================
   MUKRAMIN.DEV — rendering + interactions + animations
   Content lives in js/data.js
   ========================================================= */
(function () {
  'use strict';
  var D = window.PORTFOLIO;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };


  /* ---------------- interface sounds (always on, made in the browser: no audio files) ---------------- */
  var SFX = (function () {
    var ctx = null, out = null, echo = null, on = false, last = {}, armed = false;
    // browsers only allow sound after the visitor's first click, tap or key press (hover and scroll don't count),
    // so the audio engine starts on that first interaction and every sound after it plays, hover included
    // sounds are switched off site-wide (a calm, quiet site); set this to true to bring them back
    on = false;
    var arm = function () { armed = true; };
    ['pointerdown', 'keydown', 'touchend'].forEach(function (t) { window.addEventListener(t, arm, { capture: true, passive: true }); });
    function init() {
      if (ctx) return true;
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      ctx = new AC();
      out = ctx.createGain(); out.gain.value = 0.8;
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; // keeps every sound at a steady, safe level
      // short digital echo gives the "inside a machine" feel
      echo = ctx.createDelay(0.5); echo.delayTime.value = 0.085;
      var fb = ctx.createGain(), wet = ctx.createGain(); fb.gain.value = 0.28; wet.gain.value = 0.22;
      var tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 3800;
      echo.connect(tone); tone.connect(fb); fb.connect(echo); tone.connect(wet); wet.connect(comp);
      out.connect(comp); out.connect(echo); comp.connect(ctx.destination);
      return true;
    }
    /* one synth voice: oscillator (optionally FM for a metallic, robotic tone) -> filter sweep -> fast envelope */
    function voice(o) {
      var t = ctx.currentTime + (o.at || 0), d = o.dur;
      var osc = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      osc.type = o.type || 'square';
      osc.frequency.setValueAtTime(o.f1, t);
      if (o.f2 && o.f2 !== o.f1) osc.frequency.exponentialRampToValueAtTime(o.f2, t + d);
      if (o.fm) { // frequency modulation
        var m = ctx.createOscillator(), mg = ctx.createGain();
        m.frequency.value = o.f1 * o.fm[0]; mg.gain.value = o.f1 * o.fm[1];
        m.connect(mg); mg.connect(osc.frequency); m.start(t); m.stop(t + d + 0.05);
      }
      f.type = o.ft || 'lowpass'; f.Q.value = o.q || 6;
      f.frequency.setValueAtTime(o.c1 || 4000, t);
      if (o.c2) f.frequency.exponentialRampToValueAtTime(o.c2, t + d);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(o.vol, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      osc.connect(f); f.connect(g); g.connect(out);
      osc.start(t); osc.stop(t + d + 0.05);
    }
    function noise(o) {
      var t = ctx.currentTime + (o.at || 0), n = Math.floor(ctx.sampleRate * o.dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), dd = buf.getChannelData(0);
      for (var i = 0; i < n; i++) dd[i] = (Math.random() * 2 - 1) * (o.swell ? Math.pow(Math.sin(Math.PI * i / n), 2) : Math.pow(1 - i / n, 2));
      var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = buf; f.type = 'bandpass'; f.Q.value = o.q || 2; g.gain.value = o.vol;
      f.frequency.setValueAtTime(o.freq || 3000, t);
      if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur);
      src.connect(f); f.connect(g); g.connect(out); src.start(t);
    }
    var pick = function (a) { return a[(Math.random() * a.length) | 0]; };
    var SOUNDS = {
      // hovering a button: a tiny robotic "bip-bip"
      hover: function () { var n = pick([1320, 1480, 1760]); voice({ f1: n, dur: 0.035, vol: 0.05, fm: [2.01, 0.6], c1: 5000, q: 2 }); voice({ f1: n * 1.5, dur: 0.035, vol: 0.04, fm: [2.01, 0.6], c1: 5000, q: 2, at: 0.045 }); },
      // hovering a menu link: a quick data chirp that matches the text scramble
      chirp: function () { [0, 1, 2].forEach(function (k) { voice({ f1: pick([1100, 1400, 1700, 2100, 2500]), dur: 0.028, vol: 0.04, fm: [3.01, 0.9], c1: 4500, q: 3, at: k * 0.034 }); }); },
      // clicking: a short laser "tchew"
      click: function () { noise({ dur: 0.012, vol: 0.12, freq: 4200 }); voice({ type: 'square', f1: 1150, f2: 210, dur: 0.12, vol: 0.09, c1: 4200, c2: 380, q: 10 }); },
      // switching screenshots: a glitchy data shift
      shift: function () { [0, 1, 2].forEach(function (k) { voice({ type: 'square', f1: pick([600, 900, 1300, 1800, 2400]), dur: 0.018, vol: 0.05, c1: 3500, q: 2, at: k * 0.022 }); }); },
      // opening a panel (viewer, menu, terminal): rising sweep + confirmation blips
      open: function () { voice({ type: 'sawtooth', f1: 160, f2: 1400, dur: 0.2, vol: 0.06, c1: 300, c2: 5000, q: 9 }); voice({ f1: 1760, dur: 0.05, vol: 0.05, fm: [2, 0.5], at: 0.17 }); voice({ f1: 2640, dur: 0.07, vol: 0.04, fm: [2, 0.5], at: 0.22 }); },
      // closing a panel: falling sweep
      close: function () { voice({ type: 'sawtooth', f1: 1300, f2: 140, dur: 0.18, vol: 0.055, c1: 5000, c2: 300, q: 9 }); },
      // typing in the terminal
      key: function () { voice({ type: 'square', f1: pick([1800, 2000, 2200, 2400]), dur: 0.016, vol: 0.035, c1: 4000, q: 1 }); noise({ dur: 0.01, vol: 0.05, freq: 5000 }); },
      // copying the email: "data saved"
      copy: function () { voice({ f1: 1320, dur: 0.05, vol: 0.06, fm: [2, 0.4] }); voice({ f1: 1980, dur: 0.05, vol: 0.06, fm: [2, 0.4], at: 0.06 }); voice({ f1: 2640, dur: 0.09, vol: 0.05, fm: [2, 0.4], at: 0.12 }); },
      // message sent: a bright synth arpeggio
      success: function () { [523, 659, 784, 1047, 1568].forEach(function (n, k) { voice({ type: 'square', f1: n, dur: 0.11, vol: 0.05, c1: 2800, c2: 1200, q: 4, at: k * 0.07 }); }); },
      // something is wrong: low robotic buzz
      error: function () { voice({ type: 'sawtooth', f1: 150, f2: 110, dur: 0.22, vol: 0.07, fm: [0.5, 2], c1: 1400, c2: 500, q: 6 }); },
      // turning sound on: system boot
      power: function () { voice({ type: 'sawtooth', f1: 90, f2: 1800, dur: 0.32, vol: 0.06, c1: 200, c2: 6000, q: 12 }); [0, 1, 2, 3].forEach(function (k) { voice({ f1: [880, 1320, 1760, 2640][k], dur: 0.05, vol: 0.045, fm: [2, 0.5], at: 0.3 + k * 0.05 }); }); },
      // a project appearing: a hologram "materializing" (filtered whoosh opening up) + a data blip as its title scrambles
      materialize: function () {
        noise({ dur: 0.55, vol: 0.09, freq: 400, f2: 5200, q: 3, swell: true });
        voice({ type: 'sawtooth', f1: 110, f2: 440, dur: 0.5, vol: 0.025, c1: 250, c2: 2600, q: 8 });
        voice({ f1: 1760, dur: 0.04, vol: 0.035, fm: [2.01, 0.6], at: 0.38 });
        voice({ f1: 2640, dur: 0.06, vol: 0.03, fm: [2.01, 0.6], at: 0.43 });
      },
      // entering a new section while scrolling: a soft radar ping
      ping: function () { voice({ type: 'sine', f1: 1900, f2: 1850, dur: 0.16, vol: 0.03, c1: 6000, q: 1 }); }
    };
    var GAP = { hover: 70, chirp: 110, key: 25, ping: 400, shift: 60, materialize: 350 };
    function run(name) { try { SOUNDS[name](); } catch (e) {} }
    function play(name) {
      if (!on || !armed || !init()) return;
      var now = Date.now();
      if (GAP[name] && now - (last[name] || 0) < GAP[name]) return;
      last[name] = now;
      if (ctx.state === 'suspended') { ctx.resume().then(function () { if (Date.now() - now < 300) run(name); }); return; }
      run(name);
    }
    function set(v) {
      on = v;
      $$('[data-sound-toggle]').forEach(function (b) {
        b.setAttribute('aria-pressed', v); b.classList.toggle('is-on', v);
        b.setAttribute('aria-label', v ? 'Turn interface sounds off' : 'Turn interface sounds on');
      });
      if (v) play('power');
    }
    return { play: play, set: set, isOn: function () { return on; } };
  })();

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var animate = hasGsap && !reduced;

  /* ---------------- content from data.js ---------------- */
  var C = D.contact;
  var linkFor = { email: 'mailto:' + C.email, github: C.github, linkedin: C.linkedin, facebook: C.facebook };
  $$('[data-link]').forEach(function (a) {
    var k = a.getAttribute('data-link');
    if (linkFor[k]) a.href = linkFor[k];
    if (k !== 'email') { a.target = '_blank'; a.rel = 'noopener'; }
  });
  $$('[data-text]').forEach(function (el) { el.textContent = C[el.getAttribute('data-text')] || ''; });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$('[data-d]').forEach(function (el) { el.textContent = D[el.getAttribute('data-d')] || ''; });
  var statEl = $('[data-stat="projects"]');
  if (statEl) statEl.textContent = pad(D.stats.projects);

  var ICONS = {
    front: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4M8 9l-2 2 2 2M16 9l2 2-2 2"/>',
    back: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    system: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
    client: '<path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM10 5h4v2h-4z"/><path d="M3 13h18"/>',
    ship: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    ai: '<path d="M10 3.5l1.6 4.4 4.4 1.6-4.4 1.6L10 15.5l-1.6-4.4L4 9.5l4.4-1.6z"/><path d="M18 13.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/><path d="M17.5 3v3M16 4.5h3"/>'
  };
  var GH = '<svg viewBox="0 0 24 24"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>';
  var tags = function (list) { return list.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join(''); };

  // Skills: four cards in a 2 x 2 grid + the security card
  var SHIELD = '<path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>';
  var drawable = function (svg) { return svg.replace(/<(rect|path|ellipse|circle)\b/g, '<$1 pathLength="100"'); };
  var html = '<div class="bento__grid">' + D.skills.map(function (s, i) {
    return '<article class="sk" data-card style="--i:' + i + '">' +
      '<div class="sk__top"><span class="sk__ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + drawable(ICONS[s.icon] || ICONS.front) + '</svg></span><span class="sk__num" aria-hidden="true">' + pad(i + 1) + '</span></div>' +
      '<h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p><div class="sk__foot">' + tags(s.tags) + '</div></article>';
  }).join('') + '</div>';
  if (D.security) html += '<article class="sk sk--sec" data-card style="--i:' + D.skills.length + '"><span class="sk__scan" aria-hidden="true"></span>' +
    '<div class="sk__top"><span class="sk__ico sk__ico--lg"><i class="sk__pulse"></i><i class="sk__pulse"></i><svg viewBox="0 0 24 24" aria-hidden="true">' + drawable(SHIELD) + '</svg></span><span class="sk__badge">EDGE</span></div>' +
    '<h3>' + esc(D.security.title) + '</h3><p>' + esc(D.security.text) + '</p>' +
    '<ul class="sk__checks">' + D.security.points.map(function (x, j) { return '<li style="--j:' + j + '">' + esc(x) + '</li>'; }).join('') + '</ul></article>';
  $('[data-skills]').innerHTML = html;
  (function () {
    var bento = $('[data-skills]');
    // cards rise in one after another, icons draw themselves, the security checks slide in
    if (!reduced && 'IntersectionObserver' in window) {
      bento.classList.add('will-reveal');
      var skio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { bento.classList.add('is-in'); skio.disconnect(); }
      }, { threshold: 0.12 });
      skio.observe(bento);
    }
    // a soft light follows the mouse across each card and its border
    if (finePointer) $$('.sk', bento).forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  })();

  // Now list
  var nowEl = $('[data-now]');
  if (nowEl && D.now) nowEl.innerHTML = D.now.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');
  $$('[data-updated]').forEach(function (el) { el.textContent = D.updated || ''; });

  // Toolkit: one card per group, each with its own small animated icon
  var TK_ICONS = {
    // code brackets that breathe apart, with a blinking slash
    front: '<path class="tk-l" d="M8 7l-5 5 5 5"/><path class="tk-r" d="M16 7l5 5-5 5"/><path class="tk-c" d="M13.5 5l-3 14"/>',
    // database whose layers light up one after another, like data moving through it
    back: '<ellipse class="tk-d0" cx="12" cy="5.5" rx="7" ry="2.6"/><path d="M5 5.5v13c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-13"/><path class="tk-d1" d="M5 10c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6"/><path class="tk-d2" d="M5 14.4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6"/>',
    // git branch: the branch line draws itself and the commits pulse in order
    tools: '<path d="M6 7.2v9.6"/><path class="tk-br" pathLength="100" d="M18 10.2c0 5-12 2.6-12 6.6"/><circle class="tk-n tk-n1" cx="6" cy="5" r="2.2"/><circle class="tk-n tk-n2" cx="18" cy="8" r="2.2"/><circle class="tk-n tk-n3" cx="6" cy="19" r="2.2"/>',
    // shield with a scan line passing through and a check that redraws
    security: '<path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6z"/><path class="tk-ok" pathLength="100" d="m8.8 12 2.2 2.2 4.2-4.4"/><path class="tk-scan" d="M7.5 8.5h9"/>'
  };
  var tkIcon = function (name) {
    var n = name.toLowerCase();
    return /secur/.test(n) ? 'security' : /tool|workflow/.test(n) ? 'tools' : /back|data/.test(n) ? 'back' : 'front';
  };
  var groups = D.toolkitGroups || [{ name: 'Toolkit', items: D.toolkit }];
  $('[data-toolkit]').innerHTML = groups.map(function (g, gi) {
    var all = (g.items || []).map(function (t) { return { t: t, fam: false }; }).concat((g.familiar || []).map(function (t) { return { t: t, fam: true }; }));
    var kind = tkIcon(g.name), nm = g.name.match(/^(.*?)\s*\((.+)\)\s*$/); // "Security (training & labs)" -> title + small subtitle
    return '<div class="stack__group tk tk--' + kind + '" style="--g:' + gi + '">' +
      '<div class="tk__head"><span class="tk__ico" aria-hidden="true"><svg viewBox="0 0 24 24">' + TK_ICONS[kind] + '</svg></span>' +
      '<h4>' + (nm ? esc(nm[1]) + '<small>' + esc(nm[2]) + '</small>' : esc(g.name)) + '</h4><span class="tk__count"><b>' + pad(all.length) + '</b><small>TOOLS</small></span></div>' +
      '<ul>' + all.map(function (x, k) { return '<li' + (x.fam ? ' class="is-fam"' : '') + ' style="--k:' + k + '">' + esc(x.t) + '</li>'; }).join('') + '</ul></div>';
  }).join('') + (groups.some(function (g) { return g.familiar && g.familiar.length; })
    ? '<p class="stack__legend"><span><i></i>Used in my projects</span><span><i class="is-fam"></i>Familiar / from training</span></p>' : '');
  (function () {
    var stack = $('.stack');
    if (!stack) return;
    // cards rise in, tool chips appear one by one, then the icons start moving
    if (!reduced && 'IntersectionObserver' in window) {
      stack.classList.add('will-reveal');
      var tkio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { stack.classList.add('is-in'); tkio.disconnect(); }
      }, { threshold: 0.12 });
      tkio.observe(stack);
    }
    if (finePointer) $$('.tk', stack).forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  })();

  // Live preview clip markup (the video loads only when its project nears the screen)
  var previewHtml = function (p) {
    if (!p.preview) return '';
    return '<video class="preview" data-preview data-src="' + esc(p.preview) + '" muted loop playsinline disablepictureinpicture preload="none" aria-hidden="true" tabindex="-1"></video>' +
      '<button type="button" class="preview__badge" data-preview-btn aria-label="Play live preview of ' + esc(p.name) + '" hidden><i></i><span class="preview__txt">LIVE PREVIEW</span></button>';
  };

  // Projects
  $('[data-projects]').innerHTML = D.projects.map(function (p, i) {
    var media;
    if (p.layout === 'app') {
      var pShot = Math.min(p.previewShot == null ? 1 : p.previewShot, p.shots.length - 1);
      media = '<div class="apps">' + p.shots.map(function (s, j) {
        return '<figure class="app" data-reveal-item><div class="cut"><div class="cut__in"><button type="button" class="app__open" data-app-shot="' + j + '" aria-label="Enlarge ' + esc(s.label) + ' screenshot"><img src="' + esc(s.src) + '" alt="' + esc(p.name + ' — ' + s.label) + '" loading="lazy"></button>' + (j === pShot ? previewHtml(p) : '') + '</div></div><span>' + esc(s.label) + '</span></figure>';
      }).join('') + '</div>';
    } else {
      media = '<div class="frame cut" data-frame><div class="cut__in">' +
        '<div class="frame__bar"><i></i><i></i><i></i><span class="frame__path">' + esc(p.path || '') + '</span><span class="frame__label" data-shot-label>' + esc(p.shots[0].label) + '</span></div>' +
        '<div class="frame__screen">' + p.shots.map(function (s, j) {
          var sm = s.tall ? '' : ' srcset="' + esc(s.src.replace('.webp', '-sm.webp')) + ' 640w, ' + esc(s.src) + ' 1200w" sizes="(max-width: 700px) 100vw, 640px"';
          return '<img src="' + esc(s.src) + '"' + sm + ' alt="' + esc(p.name + ' — ' + s.label) + '" loading="lazy" class="' + (s.tall ? 'is-tall ' : '') + (j === 0 ? 'is-on' : '') + '">';
        }).join('') + previewHtml(p) + '<button type="button" class="frame__zoom" data-zoom aria-label="Enlarge screenshot"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>ENLARGE</button></div></div></div>' +
        '<div class="thumbs" role="tablist" aria-label="' + esc(p.name) + ' screenshots">' + p.shots.map(function (s, j) {
          return '<button type="button" class="thumb' + (j === 0 ? ' is-on' : '') + '" data-shot="' + j + '" role="tab" aria-selected="' + (j === 0) + '" aria-label="Show ' + esc(s.label) + '"><img src="' + esc(s.src) + '" alt="" loading="lazy"></button>';
        }).join('') + '</div>';
    }
    var action = p.github
      ? '<a class="btn btn--solid" href="' + esc(p.github) + '" target="_blank" rel="noopener" data-magnetic>' + GH + ' VIEW CODE</a>'
      : '<span class="soon">REPO COMING SOON</span>';
    return '<article class="project' + (p.layout === 'app' ? ' project--app' : '') + (p.featured ? ' project--featured' : '') + '" data-project>' +
      '<div class="project__media">' + media + '</div>' +
      '<div class="project__body">' +
        '<div class="project__meta"><span class="project__num">' + pad(i + 1) + '</span>' + (p.featured ? '<span class="project__feat">FEATURED</span>' : '') + '<span class="project__kind">' + esc(p.kind) + '</span>' +
          (p.status ? '<span class="project__status"><i></i>' + esc(p.status) + '</span>' : '') + '</div>' +
        '<h3 data-scramble-view>' + esc(p.name) + '</h3>' +
        '<p class="project__desc">' + esc(p.desc) + '</p>' +
        (p.facts ? '<ul class="pfacts">' + p.facts.map(function (f) { return '<li><b>' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></li>'; }).join('') + '</ul>' : '') +
        '<ul class="feats' + (p.features.length > 2 ? ' is-collapsed' : '') + '">' + p.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
        (p.features.length > 2 ? '<button type="button" class="feats__more" aria-expanded="false">SHOW ALL ' + p.features.length + ' FEATURES</button>' : '') +
        '<div class="project__foot"><div class="project__tags">' + tags(p.tags) + '</div><div class="project__actions">' + action + '</div></div>' +
      '</div>' +
      (p.learned ? '<div class="learned"><span>WHAT I LEARNED //</span><p>' + esc(p.learned) + '</p></div>' : '') +
    '</article>';
  }).join('');

  // Feature list toggle (phones)
  $$('.feats__more').forEach(function (b) {
    var list = b.previousElementSibling, label = b.textContent;
    b.addEventListener('click', function () {
      var open = list.classList.toggle('is-collapsed') === false;
      b.setAttribute('aria-expanded', open); b.textContent = open ? 'SHOW FEWER' : label;
    });
  });

  // Gallery switching
  var activeShot = {};
  $$('[data-project]').forEach(function (proj, pi) {
    activeShot[pi] = 0;
    $$('[data-app-shot]', proj).forEach(function (b) { b.addEventListener('click', function () { openViewer(pi, +b.getAttribute('data-app-shot'), b); }); });
    var frame = $('[data-frame]', proj);
    if (!frame) return;
    var zoom = $('[data-zoom]', frame);
    zoom.addEventListener('click', function (e) { e.stopPropagation(); openViewer(pi, activeShot[pi], zoom); });
    $('.frame__screen', frame).addEventListener('click', function () { openViewer(pi, activeShot[pi], zoom); });
    var imgs = $$('.frame__screen img', frame), thumbs = $$('.thumb', proj), label = $('[data-shot-label]', frame);
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () {
        var j = +t.getAttribute('data-shot'); activeShot[pi] = j;
        imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === j); });
        thumbs.forEach(function (b, k) { b.classList.toggle('is-on', k === j); b.setAttribute('aria-selected', k === j); });
        var txt = D.projects[pi].shots[j].label;
        if (animate) scramble(label, txt.toUpperCase(), 0.5); else label.textContent = txt;
      });
    });
  });

  /* ---------------- live previews: short silent clips of each app working ----------------
     each clip plays by itself while its project is on screen, on desktop and phones alike,
     and pauses when it scrolls away (not with reduced motion or data saver).
     the LIVE PREVIEW badge also plays / pauses it by click, tap or keyboard */
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var previews = [];
  $$('[data-preview]').forEach(function (vid) {
    var host = vid.parentNode, btn = $('[data-preview-btn]', host);
    var proj = vid.closest('[data-project]'), pi = $$('[data-project]').indexOf(proj);
    var hoverEl = host.closest('.app') || host;
    var label = $('[data-shot-label]', proj), name = D.projects[pi].name;
    var ready = false, wanted = false, held = false;
    var pv = { vid: vid, host: hoverEl };
    var load = function () {
      if (vid.getAttribute('src')) return;
      vid.preload = 'auto'; vid.src = vid.getAttribute('data-src');
    };
    var setLive = function (on) {
      host.classList.toggle('is-live', on);
      btn.setAttribute('aria-label', (on ? 'Pause' : 'Play') + ' live preview of ' + name);
      btn.setAttribute('aria-pressed', on);
      if (label) label.textContent = on ? '● LIVE PREVIEW' : D.projects[pi].shots[activeShot[pi] || 0].label;
    };
    pv.play = function (byUser) {
      if (byUser) held = false;
      if (held) return;
      wanted = true; load();
      if (ready && !host.classList.contains('is-live')) { try { vid.currentTime = 0; } catch (e) {} }
      var pr = vid.play();
      if (pr && pr.catch) pr.catch(function () { setLive(false); });
    };
    pv.stop = function (byUser) {
      wanted = false; if (byUser) held = true;
      vid.pause();
    };
    var found = function () { if (ready) return; ready = true; btn.hidden = false; host.classList.add('has-preview'); };
    vid.addEventListener('loadedmetadata', found);
    vid.addEventListener('playing', function () { found(); if (wanted) setLive(true); else vid.pause(); });
    vid.addEventListener('pause', function () { setLive(false); });
    vid.addEventListener('error', function () { vid.remove(); btn.remove(); pv.play = pv.stop = function () {}; });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (host.classList.contains('is-live')) pv.stop(true); else pv.play(true);
    });
    // leaving the screen clears a manual pause, so the clip plays again next time it comes into view
    pv.leave = function () { held = false; pv.stop(); };
    // switching screenshots stops the clip so the chosen screenshot is visible
    $$('.thumb', proj).forEach(function (t) { t.addEventListener('click', function () { pv.stop(true); }); });
    previews.push(pv);
  });
  if (previews.length) {
    if ('IntersectionObserver' in window) {
      // start loading a clip a little before its project scrolls into view
      var pre = new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          if (!x.isIntersecting) return;
          previews.forEach(function (pv) { if (pv.host === x.target) { pv.vid.preload = 'metadata'; if (!pv.vid.getAttribute('src')) pv.vid.src = pv.vid.getAttribute('data-src'); } });
          pre.unobserve(x.target);
        });
      }, { rootMargin: '300px 0px' });
      previews.forEach(function (pv) { pre.observe(pv.host); });
      if (!reduced && !saveData) {
        var auto = new IntersectionObserver(function (en) {
          en.forEach(function (x) {
            previews.forEach(function (pv) {
              if (pv.host !== x.target) return;
              pv.inView = x.isIntersecting;
              if (x.isIntersecting) pv.play(); else pv.leave();
            });
          });
        }, { threshold: 0.5 });
        previews.forEach(function (pv) { auto.observe(pv.host); });
      }
    }
    document.addEventListener('visibilitychange', function () {
      previews.forEach(function (pv) { if (document.hidden) pv.stop(); else if (pv.inView) pv.play(); });
    });
  }

  // Education + timeline
  var E = D.education, CE = D.certifications || [];
  $('[data-education]').innerHTML =
    '<div class="edu cut" data-reveal-item><div class="cut__in">' +
      '<div class="edu__top"><span>EDUCATION</span><b>' + esc(E.years) + '</b></div>' +
      '<h3>' + esc(E.degree) + '</h3><p>' + esc(E.major) + '<br>' + esc(E.school) + '</p>' +
      '<div class="honor"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="6"/><path d="M8.5 13.8 7 22l5-3 5 3-1.5-8.2"/></svg><div><b>' + esc(E.honor.toUpperCase()) + '</b><small>' + esc(E.honorNote) + '</small></div></div>' +
      '<div class="awards">' + E.awards.map(function (a) { return '<span>' + esc(a) + '</span>'; }).join('') + '</div>' +
    '</div></div>' +
    (CE.length ? '<a class="cert" href="#certifications" data-reveal-item><span class="cert__ico"><svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg></span>' +
      '<div><small>CERTIFICATIONS</small><b>' + CE.length + ' verified security certificates</b><p>' + esc(CE.map(function (c) { return c.issuer.split(' · ')[0]; }).join(' · ')) + '</p></div></a>' : '');

  // Certifications
  var EXT = '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  $('[data-certs]').innerHTML = CE.map(function (c, i) {
    return '<article class="certcard cut" data-reveal-item><div class="cut__in">' +
      '<button type="button" class="certcard__img" data-cert="' + i + '" aria-label="View the ' + esc(c.title) + ' certificate"><img src="' + esc(c.thumb) + '" alt="' + esc(c.title + ' certificate') + '" loading="lazy"><span class="frame__zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>VIEW</span></button>' +
      '<span class="certcard__stamp" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-8"/></svg>VERIFIED</span>' +
      '<div class="certcard__body"><p class="certcard__meta"><span>' + esc(c.issuer) + '</span><b>' + esc(c.date) + '</b></p>' +
      '<h3>' + esc(c.title) + '</h3><p class="certcard__note">' + esc(c.note) + '</p>' +
      '<div class="card__tags">' + tags(c.tags) + '</div>' +
      (c.verify ? '<a class="btn btn--line certcard__verify" href="' + esc(c.verify) + '" target="_blank" rel="noopener"><span class="btn__ring">' + EXT + '</span>VERIFY</a>' : '') +
      '</div></div></article>';
  }).join('');

  // Why work with me
  $('[data-why]').innerHTML = (D.why || []).map(function (w, i) {
    return '<article class="whycard" data-reveal-item><span class="whycard__num">' + pad(i + 1) + '</span><h3>' + esc(w.title) + '</h3><p>' + esc(w.text) + '</p>' +
      '<a class="whycard__link" href="' + esc(w.link) + '"' + (/^https?:/.test(w.link) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(w.linkText) + ' <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></article>';
  }).join('');

  $('[data-timeline]').innerHTML = D.journey.map(function (it) {
    return '<li class="tl' + (it.live ? ' tl--live' : '') + '" data-tl><span class="tl__dot"></span>' +
      '<div class="tl__meta"><span class="tl__when">' + esc(it.when) + '</span><span class="tl__kind">' + esc(it.kind) + '</span></div>' +
      '<h3>' + esc(it.title) + '</h3><p class="tl__org">' + esc(it.org) + '</p><p class="tl__text">' + esc(it.text) + '</p>' +
      (it.bullets ? '<ul class="tl__bullets">' + it.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' : '') +
    '</li>';
  }).join('');

  /* ---------------- screenshot viewer ---------------- */
  var lb = $('.lightbox'), lbImg = $('.lightbox__fig img', lb), lbState = { name: '', list: [], i: 0, from: null };
  function showShot() {
    var s = lbState.list[lbState.i];
    lbImg.src = s.src; lbImg.alt = (s.name || lbState.name) + ' — ' + s.label;
    $('.lightbox__name', lb).textContent = s.name || lbState.name; $('.lightbox__label', lb).textContent = s.label;
    $('.lightbox__count', lb).textContent = (lbState.i + 1) + ' / ' + lbState.list.length;
    if (window.gsap && !reduced) window.gsap.fromTo(lbImg, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' });
  }
  function openList(name, list, i, from) {
    lbState = { name: name, list: list, i: i, from: from }; lb.hidden = false; showShot(); SFX.play('open');
    document.body.style.overflow = 'hidden'; if (lenis) lenis.stop();
    $('.lightbox__close', lb).focus();
  }
  function closeViewer() {
    SFX.play('close');
    lb.hidden = true; document.body.style.overflow = ''; if (lenis) lenis.start();
    if (lbState.from) lbState.from.focus();
  }
  function openViewer(p, i, from) { openList(D.projects[p].name, D.projects[p].shots, i, from); }
  function step(d) { var n = lbState.list.length; lbState.i = (lbState.i + d + n) % n; showShot(); }
  var certShots = CE.map(function (c) { return { src: c.img, label: c.issuer + ' · ' + c.date, name: c.title }; });
  $$('.frame__screen, .app__open, .certcard__img').forEach(function (el) { el.setAttribute('data-cursor', 'view'); });
  $$('[data-cert]').forEach(function (b) { b.addEventListener('click', function () { openList('Certificates', certShots, +b.getAttribute('data-cert'), b); }); });
  $('.lightbox__close', lb).addEventListener('click', closeViewer);
  var tx = 0, ty = 0, tOn = false;
  lb.addEventListener('touchstart', function (e) { if (e.touches.length !== 1) return; tOn = true; tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (!tOn) return; tOn = false;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.3) closeViewer();
  }, { passive: true });
  $('.lightbox__prev', lb).addEventListener('click', function () { step(-1); });
  $('.lightbox__next', lb).addEventListener('click', function () { step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox__fig')) closeViewer(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeViewer(); else if (e.key === 'ArrowLeft') { step(-1); SFX.play('shift'); } else if (e.key === 'ArrowRight') { step(1); SFX.play('shift'); }
    else if (e.key === 'Tab') { var f = $$('button', lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });

  /* ---------------- copy email + toast ---------------- */
  var toastEl = $('.toast'), toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200); }
  function legacyCopy(t) {
    var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); return ok;
  }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = C[b.getAttribute('data-copy')] || '';
      var done = function () { toast('EMAIL COPIED: ' + t); SFX.play('copy'); }, fail = function () { toast(legacyCopy(t) ? 'EMAIL COPIED: ' + t : 'COPY THIS: ' + t); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, fail); else fail();
    });
  });

  /* ---------------- footer: my local time + my latest public GitHub commit ----------------
     the time is always Pasig time (Asia/Manila); the commit comes from GitHub's public API
     and is remembered for 10 minutes; if GitHub can't be reached, that part simply stays hidden */
  (function () {
    var tEl = $('[data-localtime]'), cEl = $('[data-lastcommit]');
    if (tEl) {
      var tick = function () {
        try { tEl.textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' }).format(new Date()) + ' in Pasig'; } catch (e) {}
      };
      tick(); setInterval(tick, 30000);
    }
    if (!cEl || !window.fetch || !C.github) return;
    var user = C.github.replace(/\/+$/, '').split('/').pop();
    var ago = function (t) {
      var s = (Date.now() - t) / 1000, n;
      if (s < 3600) { n = Math.max(1, Math.round(s / 60)); return n + ' min ago'; }
      if (s < 86400) { n = Math.round(s / 3600); return n + ' h ago'; }
      n = Math.round(s / 86400); return n + (n === 1 ? ' day' : ' days') + ' ago';
    };
    var show = function (c) {
      cEl.innerHTML = 'last commit ' + esc(ago(c.t)) + ' · <a href="https://github.com/' + esc(c.full) + '" target="_blank" rel="noopener">' + esc(c.full.split('/').pop()) + '</a>';
      cEl.hidden = false;
    };
    var KEY = 'mk-lastcommit', cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (cached && Date.now() - cached.at < 600000) { show(cached); return; }
    fetch('https://api.github.com/users/' + encodeURIComponent(user) + '/events/public?per_page=30', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (ev) {
        var push = (ev || []).filter(function (e) { return e && e.type === 'PushEvent' && e.repo; })[0];
        if (!push) return;
        var c = { full: push.repo.name, t: new Date(push.created_at).getTime(), at: Date.now() };
        try { sessionStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
        show(c);
      })
      .catch(function () {});
  })();

  /* ---------------- terminal easter egg ( press ~ or ` ) ---------------- */
  var term = $('.term'), termOut = $('.term__out'), termIn = $('.term__in');
  function tprint(html, cls) { var l = document.createElement('div'); l.className = 'term__line' + (cls ? ' ' + cls : ''); l.innerHTML = html; termOut.appendChild(l); termOut.scrollTop = termOut.scrollHeight; }
  var CMDS = {
    help: function () {
      tprint('commands: <b>about</b> · <b>projects</b> · <b>skills</b> · <b>certs</b> · <b>now</b> · <b>contact</b> · <b>cv</b> · <b>resume</b> · <b>clear</b> · <b>exit</b>');
      tprint('extras: <b>matrix</b> · <b>hack</b> · <b>shortcuts</b> · <b>goto &lt;section&gt;</b>');
    },
    resume: function () { CMDS.cv(); },
    matrix: function () { tprint('entering the matrix…', 'term__ok'); setTimeout(function () { closeTerm(); matrixRain(); }, 350); },
    hack: function () { runHack(); },
    shortcuts: function () { closeTerm(); openKeys(); },
    certs: function () { CE.forEach(function (c) { tprint('<b>' + esc(c.title) + '</b> — ' + esc(c.issuer) + ', ' + esc(c.date)); }); },
    about: function () { tprint('Mukramin B. Ansao — web &amp; app developer, Pasig City. BSIT Cum Laude 2026, Major in Networking.'); },
    projects: function () { D.projects.forEach(function (p, i) { tprint(pad(i + 1) + '  <b>' + esc(p.name) + '</b> — ' + esc(p.kind)); }); tprint('type <b>goto projects</b> to see them'); },
    skills: function () { (D.toolkitGroups || []).forEach(function (g) { tprint('<b>' + esc(g.name) + '</b>  ' + esc((g.items || []).concat(g.familiar || []).join(' · '))); }); },
    now: function () { (D.now || []).forEach(function (n) { tprint('› ' + esc(n)); }); },
    contact: function () { tprint('email    ' + esc(C.email)); tprint('linkedin ' + esc(C.linkedin)); tprint('github   ' + esc(C.github)); },
    cv: function () { tprint('opening CV…'); window.open('assets/Mukramin_Ansao_CV.pdf?v=2026-10-25', '_blank'); },
    clear: function () { termOut.innerHTML = ''; },
    exit: function () { closeTerm(); },
    whoami: function () { tprint('a recruiter with good taste, probably.'); },
    'sudo hire mukramin': function () { tprint('access granted. redirecting to contact…', 'term__ok'); setTimeout(function () { closeTerm(); location.hash = 'contact'; var c = $('#contact'); if (c) c.scrollIntoView({ behavior: 'smooth' }); }, 700); }
  };
  function runCmd(raw) {
    var cmd = raw.trim().toLowerCase(); if (!cmd) return;
    tprint('<span class="term__prompt">guest@mukramin.dev:~$</span> ' + esc(raw));
    if (cmd.indexOf('goto ') === 0) { var t = $('#' + cmd.slice(5).trim()); if (t) { closeTerm(); t.scrollIntoView({ behavior: 'smooth' }); } else tprint('no such section', 'term__err'); return; }
    (CMDS[cmd] || function () { tprint('command not found: ' + esc(cmd) + ' — try <b>help</b>', 'term__err'); })();
  }
  function openTerm() {
    SFX.play('open');
    term.hidden = false; if (lenis) lenis.stop();
    if (!termOut.children.length) { tprint('MUKRAMIN.DEV terminal v1.0 — type <b>help</b> to begin', 'term__ok'); }
    setTimeout(function () { termIn.focus(); }, 30);
  }
  function closeTerm() { if (!term.hidden) SFX.play('close'); term.hidden = true; if (lenis) lenis.start(); }
  termIn.addEventListener('keydown', function (e) { if (e.key.length === 1 || e.key === 'Backspace') SFX.play('key'); else if (e.key === 'Enter') SFX.play('click'); });
  $('.term__form').addEventListener('submit', function (e) { e.preventDefault(); runCmd(termIn.value); termIn.value = ''; });
  $('.term__close').addEventListener('click', closeTerm);
  $$('[data-open-term]').forEach(function (b) { b.addEventListener('click', openTerm); });
  document.addEventListener('keydown', function (e) {
    var typing = /INPUT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName);
    if ((e.key === '`' || e.key === '~') && !typing) { e.preventDefault(); term.hidden ? openTerm() : closeTerm(); }
    else if (e.key === 'Escape' && !term.hidden) closeTerm();
  });

  /* ---------------- terminal extras: hack + matrix ---------------- */
  var hacking = false;
  function runHack() {
    if (hacking) return; hacking = true;
    var steps = [
      ['connecting to mukramin.dev mainframe…', 350],
      ['bypassing firewall  [                    ]', 0, 'bar'],
      ['decrypting portfolio.dat… done', 450],
      ['scanning skills: Laravel · React Native · PHP · MySQL · security', 450],
      ['<b>ACCESS GRANTED.</b> but honestly, you could just hire me ;)', 0, 'ok'],
      ['type <b>sudo hire mukramin</b> to continue', 0]
    ];
    var i = 0;
    (function next() {
      if (i >= steps.length) { hacking = false; return; }
      var st = steps[i++];
      if (st[2] === 'bar') {
        tprint('&gt; ' + st[0]); var line = termOut.lastChild, k = 0;
        (function fill() {
          k++; line.innerHTML = '&gt; bypassing firewall  [' + new Array(k + 1).join('█') + new Array(21 - k).join('&nbsp;') + '] ' + k * 5 + '%';
          SFX.play('key');
          if (k < 20) setTimeout(fill, 45); else setTimeout(next, 250);
        })();
        return;
      }
      tprint((st[2] === 'ok' ? '' : '&gt; ') + st[0], st[2] === 'ok' ? 'term__ok' : '');
      SFX.play(st[2] === 'ok' ? 'success' : 'shift');
      setTimeout(next, st[1] || 300);
    })();
  }
  function matrixRain() {
    if (reduced) { toast('MATRIX MODE IS OFF WITH REDUCED MOTION'); return; }
    var cv = document.createElement('canvas'), c = cv.getContext('2d'), w, h, cols, drops, size = 16, start = performance.now(), DUR = 4200;
    cv.className = 'matrix'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    var fit = function () { w = cv.width = innerWidth; h = cv.height = innerHeight; cols = Math.ceil(w / size); drops = []; for (var i = 0; i < cols; i++) drops[i] = Math.random() * -40; };
    fit();
    var chars = 'アカサタナハマヤラワ0123456789ABCDEF<>/{}[]=+*MUKRAMIN'.split('');
    var acc = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#22E5FF';
    SFX.play('open');
    var lastBlip = 0;
    (function frame(now) {
      var t = now - start;
      c.fillStyle = 'rgba(6,8,11,.18)'; c.fillRect(0, 0, w, h);
      c.font = '600 ' + size + 'px monospace';
      for (var i = 0; i < cols; i++) {
        var y = drops[i] * size;
        c.fillStyle = Math.random() < 0.06 ? '#E9FDFF' : acc;
        c.fillText(chars[(Math.random() * chars.length) | 0], i * size, y);
        if (y > h && Math.random() > 0.97) drops[i] = 0; else drops[i] += 1;
      }
      if (now - lastBlip > 220) { SFX.play('key'); lastBlip = now; }
      cv.style.opacity = t > DUR - 600 ? Math.max(0, (DUR - t) / 600) : 1;
      if (t < DUR) requestAnimationFrame(frame); else { cv.remove(); SFX.play('close'); }
    })(start);
  }

  /* ---------------- keyboard shortcuts: 1–8 jump to sections, ? shows the list ---------------- */
  var keysBox = $('.keys'), sectionsByKey = $$('main [data-section]');
  if (keysBox) {
    $('.keys__list', keysBox).innerHTML = sectionsByKey.map(function (sec, i) {
      var name = sec.id === 'home' ? 'Home' : sec.id === 'why' ? 'Why work with me' : sec.id.charAt(0).toUpperCase() + sec.id.slice(1);
      return '<li><kbd>' + (i + 1) + '</kbd><span>' + esc(name) + '</span></li>';
    }).join('') + '<li><kbd>~</kbd><span>Terminal</span></li><li><kbd>?</kbd><span>This list</span></li><li><kbd>Esc</kbd><span>Close</span></li>';
  }
  function openKeys() { if (!keysBox) return; keysBox.hidden = false; SFX.play('open'); $('.keys__close', keysBox).focus(); }
  function closeKeys() { if (!keysBox || keysBox.hidden) return; keysBox.hidden = true; SFX.play('close'); }
  if (keysBox) {
    $('.keys__close', keysBox).addEventListener('click', closeKeys);
    keysBox.addEventListener('click', function (e) { if (e.target === keysBox) closeKeys(); });
  }
  $$('[data-open-keys]').forEach(function (b) { b.addEventListener('click', openKeys); });
  function goToSection(sec) {
    if (lenis) lenis.scrollTo(sec, { offset: sec.id === 'home' ? 0 : -10, duration: 1 });
    else sec.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var el = document.activeElement;
    if (el && (/INPUT|TEXTAREA|SELECT/.test(el.tagName) || el.isContentEditable)) return;
    if (!term.hidden || !lb.hidden || document.body.classList.contains('menu-open')) return;
    if (e.key === 'Escape') { closeKeys(); return; }
    if (e.key === '?') { e.preventDefault(); keysBox && keysBox.hidden ? openKeys() : closeKeys(); return; }
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= sectionsByKey.length) { closeKeys(); SFX.play('shift'); goToSection(sectionsByKey[n - 1]); }
  });

  /* ---------------- tab title when the visitor switches away ---------------- */
  var baseTitle = document.title, titleT;
  document.addEventListener('visibilitychange', function () {
    clearTimeout(titleT);
    if (document.hidden) document.title = '⟡ Signal lost… come back';
    else { document.title = '⟡ Connection restored'; titleT = setTimeout(function () { document.title = baseTitle; }, 1600); }
  });

  /* ---------------- phone edge tab (mobile sidebar) ---------------- */
  var rail = $('.rail'), railBtn = $('.rail__toggle');
  function setRail(open) {
    rail.classList.toggle('is-open', open);
    railBtn.setAttribute('aria-expanded', open);
    railBtn.setAttribute('aria-label', open ? 'Hide social links' : 'Show social links');
  }
  railBtn.addEventListener('click', function (e) { e.stopPropagation(); setRail(!rail.classList.contains('is-open')); });
  document.addEventListener('click', function (e) { if (rail.classList.contains('is-open') && !rail.contains(e.target)) setRail(false); });
  var railY = 0;
  window.addEventListener('scroll', function () {
    if (!rail.classList.contains('is-open')) { railY = window.scrollY; return; }
    if (Math.abs(window.scrollY - railY) > 160) setRail(false);
  }, { passive: true });
  // phones: the side tab and the back-to-top button only appear after the hero
  var heroEl = $('#home'), toTop = $('.totop');
  var onScrollPast = function () {
    var past = window.scrollY > (heroEl ? heroEl.offsetHeight * 0.8 : 600);
    document.body.classList.toggle('past-hero', past);
    if (toTop) toTop.classList.toggle('is-on', window.scrollY > window.innerHeight * 1.2);
  };
  window.addEventListener('scroll', onScrollPast, { passive: true }); onScrollPast();
  if (toTop) toTop.addEventListener('click', function () { if (lenis) lenis.scrollTo(0, { duration: 1 }); else window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  /* ---------------- nav, menu ---------------- */
  var nav = $('.nav'), burger = $('.burger'), menu = $('.menu');
  var setMenu = function (open) {
    SFX.play(open ? 'open' : 'close');
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('.menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  var onScrollNav = function () { nav.classList.toggle('is-scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onScrollNav, { passive: true }); onScrollNav();

  // active section (nav + rail number)
  var sections = $$('[data-section]'), numEl = $('[data-section-num]');
  var setActive = function (sec) {
    var id = sec.id, num = sec.getAttribute('data-section');
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-nav') === id); });
    if (numEl && numEl.textContent !== num && numEl.textContent && id !== 'projects') SFX.play('ping');
    if (numEl && numEl.textContent !== num) { if (animate) scramble(numEl, num, 0.35); else numEl.textContent = num; }
  };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------------- network trace: every section is a hop ----------------
     each section label shows how long it took you to reach it, like traceroute;
     hops you have not reached yet show "* * *". Reaching Contact completes the trace. */
  (function () {
    var t0 = performance.now();
    var hops = $$('[data-section]');
    var maxScroll = function () { return Math.max(1, document.documentElement.scrollHeight - window.innerHeight); };
    var reach = function (sec) {
      var k = hops.indexOf(sec);
      if (k < 0 || sec.hasAttribute('data-reached')) return;
      sec.setAttribute('data-reached', '');
      var hop = $('.hop', sec);
      if (!hop) return;
      var secs = (performance.now() - t0) / 1000, em = $('em', hop);
      if (em) em.textContent = (secs < 10 ? secs.toFixed(2) : secs.toFixed(1)) + ' s';
      hop.classList.add('is-reached');
      if (sec.id === 'contact') {
        var done = document.createElement('span'); done.className = 'hop__done'; done.textContent = 'trace complete · connection established';
        hop.appendChild(done);
        requestAnimationFrame(function () { requestAnimationFrame(function () { hop.classList.add('is-done'); }); });
      }
    };
    if ('IntersectionObserver' in window) {
      var tio = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) reach(x.target); }); }, { rootMargin: '-30% 0px -45% 0px' });
      hops.forEach(function (s) { tio.observe(s); });
      // the last section can sit low on tall screens: reaching the bottom of the page counts as reaching it
      window.addEventListener('scroll', function () { if (window.scrollY >= maxScroll() - 4) reach(hops[hops.length - 1]); }, { passive: true });
    } else hops.forEach(reach);
  })();

  /* ---------------- contact form ---------------- */
  var form = $('.form'), status = $('.form__status'), sendBtn = $('.form__submit'), doneBox = $('.form-done');
  var msg = form.message, counter = $('[data-count-msg]'), MAX = +msg.getAttribute('maxlength');
  var updateCount = function () { counter.textContent = msg.value.length + ' / ' + MAX; };
  msg.addEventListener('input', updateCount); updateCount();
  var RULES = {
    name: function (v) { return v.length >= 2 ? '' : 'Please enter your full name.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please enter a valid email address, like name@company.com.'; },
    topic: function (v) { return v ? '' : 'Please choose what your message is about.'; },
    message: function (v) { return v.length >= 20 ? '' : 'Please write at least 20 characters so I can understand your request.'; }
  };
  function check(name) {
    var el = form[name], err = RULES[name](el.value.trim()), box = $('#err-' + name);
    el.setAttribute('aria-invalid', err ? 'true' : 'false');
    el.closest('.field').classList.toggle('is-invalid', !!err);
    box.textContent = err; return !err;
  }
  Object.keys(RULES).forEach(function (n) {
    form[n].addEventListener('blur', function () { if (form[n].value.trim()) check(n); });
    form[n].addEventListener('input', function () { if (form[n].closest('.field').classList.contains('is-invalid')) check(n); });
  });
  function setBusy(b) { sendBtn.disabled = b; sendBtn.classList.toggle('is-busy', b); $('.form__submit-label').textContent = b ? 'Sending…' : 'Send message'; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = ''; status.classList.remove('is-error');
    var firstBad = null;
    Object.keys(RULES).forEach(function (n) { if (!check(n) && !firstBad) firstBad = form[n]; });
    if (firstBad) { firstBad.focus(); SFX.play('error'); return; }
    if (form._gotcha.value) return; // spam bot filled the hidden field
    var data = { name: form.name.value.trim(), email: form.email.value.trim(), company: form.company.value.trim(), topic: form.topic.value, message: msg.value.trim() };
    if (C.formEndpoint) {
      setBusy(true);
      fetch(C.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(); form.hidden = true; doneBox.hidden = false; $('[data-done-name]').textContent = data.name.split(' ')[0]; doneBox.focus(); SFX.play('success'); track('contact-sent', 'Sent a contact message'); })
        .catch(function () { status.textContent = 'Your message could not be sent right now. Please try again, or email me directly at ' + C.email + '.'; status.classList.add('is-error'); SFX.play('error'); })
        .then(function () { setBusy(false); });
    } else {
      var subject = encodeURIComponent(data.topic + ' — ' + data.name + (data.company ? ' (' + data.company + ')' : ''));
      var body = encodeURIComponent(data.message + '\n\n' + data.name + '\n' + data.email + (data.company ? '\n' + data.company : ''));
      track('contact-email-app', 'Contact form opened email app');
      window.location.href = 'mailto:' + C.email + '?subject=' + subject + '&body=' + body;
      status.textContent = 'Your email app should open with this message filled in. If it doesn\u2019t, email me at ' + C.email + '.';
    }
  });
  $('[data-send-another]').addEventListener('click', function () { form.reset(); updateCount(); doneBox.hidden = true; form.hidden = false; form.name.focus(); });

  /* ---------------- text scramble ---------------- */
  var GLYPHS = '!<>-_\\/[]{}=+*^?#01ABXZ';
  function scramble(el, finalText, dur) {
    if (!el) return;
    var from = el.textContent, len = Math.max(from.length, finalText.length), start = performance.now(), ms = (dur || 0.6) * 1000;
    if (el._raf) cancelAnimationFrame(el._raf);
    (function tick(now) {
      var p = Math.min(1, (now - start) / ms), out = '';
      for (var i = 0; i < len; i++) {
        var reveal = i / len < p;
        out += reveal ? (finalText[i] || '') : (finalText[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]);
      }
      el.textContent = out;
      if (p < 1) el._raf = requestAnimationFrame(tick); else el.textContent = finalText;
    })(start);
  }

  /* ---------------- visitor stats: count a few important clicks as events (no personal data) ---------------- */
  function track(name, title) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: title || name, event: true }); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/\.pdf$/i.test(href)) track('cv-download', 'Downloaded CV');
    else if (a.classList.contains('certcard__verify')) track('cert-verify', 'Verified a certificate: ' + (a.closest('.certcard').querySelector('h3') || {}).textContent);
    else if (/github\.com\/[^/]+\/[^/]+/.test(href)) track('project-code', 'Opened project code: ' + href.split('/').pop());
    else if (a.classList.contains('nav__cta') || a.classList.contains('nav__hire')) track('hire-me', 'Clicked Hire Me');
    else if (/linkedin\.com/.test(href)) track('linkedin', 'Opened LinkedIn');
  });

  /* ---------------- general click / hover sounds ---------------- */
  var SILENT = '[data-sound-toggle], .lightbox, .term, .burger, .menu a, .thumb, .frame__screen, .app__open, .preview__badge, .certcard__img, .copybtn, .form__submit';
  document.addEventListener('click', function (e) {
    var t = e.target.closest('a, button, .thumb, label.chip');
    if (t && !t.closest(SILENT)) SFX.play('click');
  });
  $$('.lightbox__nav, .thumb').forEach(function (b) { b.addEventListener('click', function () { SFX.play('shift'); }); });
  if (finePointer) document.addEventListener('mouseover', function (e) {
    var t = e.target.closest('.nav__links a, .footer__links a, .btn, .thumb, .whycard__link, .socials a, .rail__icon, .links a, .snd, .certcard__img, .frame__screen, .app__open, .sk, .tk, .term-hint, .footer__top, .totop, .feats__more');
    if (t && !t.contains(e.relatedTarget)) SFX.play(t.closest('.nav__links, .footer__links') ? 'chirp' : 'hover');
  });

  // certificate cards get a VERIFIED stamp as they scroll into view
  var stamps = $$('.certcard');
  if ('IntersectionObserver' in window && !reduced) {
    var sio = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-stamped'); sio.unobserve(x.target); } }); }, { threshold: 0.45 });
    stamps.forEach(function (c) { sio.observe(c); });
  } else stamps.forEach(function (c) { c.classList.add('is-stamped'); });

  /* ---------------- no-animation path ---------------- */
  var lenis = null;
  var loader = $('.loader');
  if (!animate) {
    if (loader) loader.remove();
    return;
  }

  /* =========================================================
     ANIMATIONS (GSAP)
     ========================================================= */
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  document.documentElement.classList.add('is-anim');

  // smooth scrolling
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.15, smoothWheel: true, wheelMultiplier: 1.05 });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var t = $(id); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: id === '#home' ? 0 : -10, duration: 1 });
      });
    });
  }

  // click ripple + magnetic buttons + tilt (desktop pointers only)
  if (finePointer) {
    // the cursor is the normal system arrow (bigger, set in CSS, cyan over anything clickable);
    // every click sends out a small cyan ripple from the tip
    window.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      var r = document.createElement('span');
      r.className = 'click-ripple'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      r.addEventListener('animationend', function () { r.remove(); });
      setTimeout(function () { if (r.parentNode) r.remove(); }, 900);
    }, { passive: true });

    $$('[data-magnetic]').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'elastic.out(1,0.4)' }), yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'elastic.out(1,0.4)' });
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
      b.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });

    $$('[data-frame]').forEach(function (f) {
      gsap.set(f, { transformPerspective: 900 });
      var rY = gsap.quickTo(f, 'rotateY', { duration: 0.5, ease: 'power2.out' }), rX = gsap.quickTo(f, 'rotateX', { duration: 0.5, ease: 'power2.out' });
      f.addEventListener('mousemove', function (e) {
        var r = f.getBoundingClientRect();
        rY(((e.clientX - r.left) / r.width - 0.5) * 6); rX(-((e.clientY - r.top) / r.height - 0.5) * 6);
      });
      f.addEventListener('mouseleave', function () { rY(0); rX(0); });
    });

    $$('[data-scramble]').forEach(function (a) {
      var t = a.textContent;
      a.addEventListener('mouseenter', function () { scramble(a, t, 0.35); });
    });
  }

  // split section headings into masked lines
  $$('[data-split]').forEach(function (h) {
    var parts = h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML = parts.map(function (p) { return '<span class="split-line"><span>' + p + '</span></span>'; }).join('');
  });

  /* ---------- initial hidden states ---------- */
  var heroLetters = $$('.hero__letter');
  gsap.set(heroLetters, { yPercent: 110, opacity: 0 });
  gsap.set('.hero__figure img', { opacity: 0, y: 60, filter: 'blur(14px) drop-shadow(0 0 16px rgba(34,229,255,.25))' });
  gsap.set('[data-hero-copy]', { opacity: 0, y: 30 });
  gsap.set('[data-hero-hud]', { opacity: 0 });
  gsap.set('[data-statbar]', { opacity: 0, y: 40 });
  gsap.set('.nav, .rail', { opacity: 0 });
  gsap.set('.lineart path, .lineart rect', { strokeDasharray: 1400, strokeDashoffset: 1400 });

  /* ---------- loader → hero intro ---------- */
  var count = { v: 0 }, countEl = $('[data-count]');
  var intro = gsap.timeline({ paused: true });
  intro
    .to('.lineart path, .lineart rect', { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.03, clearProps: 'strokeDasharray,strokeDashoffset' }, 0)
    .to(heroLetters, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.07 }, 0.05)
    .to(heroLetters, { keyframes: [{ x: -6, skewX: 8, duration: 0.05 }, { x: 4, skewX: -6, duration: 0.05 }, { x: 0, skewX: 0, duration: 0.06 }], stagger: { each: 0.04, from: 'random' } }, 0.75)
    .to('.hero__figure img', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'expo.out' }, 0.35)
    .to('.nav, .rail', { opacity: 1, duration: 0.8 }, 0.6)
    .to('[data-hero-hud]', { opacity: 1, duration: 0.4, onStart: function () { var s = $('[data-scramble-in]'); if (s) scramble(s, s.textContent, 0.9); } }, 0.8)
    .to('[data-hero-copy]', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12 }, 0.85)
    .to('[data-statbar]', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 1.0)
    .add(function () {
      var b = $('[data-stat="projects"]'); if (b) { var n = { v: 0 }; gsap.to(n, { v: D.stats.projects, duration: 1.2, ease: 'power2.out', onUpdate: function () { b.textContent = pad(Math.round(n.v)); } }); }
      var h = $('[data-decode]'); if (h) scramble(h, h.getAttribute('data-decode'), 1.1);
    }, 1.15);

  var seen = true; // no boot screen: the hero intro starts straight away
  if (seen) {
    gsap.to(loader, { opacity: 0, duration: 0.35, onComplete: function () { loader.remove(); } });
    loader.style.animation = 'none';
    intro.play(0.1);
  }
  var boot = seen ? gsap.timeline({ paused: true }) : gsap.timeline({ onComplete: function () { loader.remove(); } });
  boot
    .to('[data-line]', { opacity: 1, duration: 0.01, stagger: 0.2 }, 0.05)
    .to('.loader__bar span', { width: '100%', duration: 0.55, ease: 'power2.inOut' }, 0)
    .to(count, { v: 100, duration: 0.55, ease: 'power2.inOut', onUpdate: function () { countEl.textContent = ('00' + Math.round(count.v)).slice(-3); } }, 0)
    .to('.loader__inner', { opacity: 0, y: -10, duration: 0.2 }, 0.6)
    .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.55, ease: 'expo.inOut' }, 0.65)
    .add(function () { intro.play(); }, 0.75);
  loader.style.animation = 'none';

  /* ---------- hero parallax on scroll (set up once the intro has finished) ---------- */
  intro.eventCallback('onComplete', function () {
    if (!window.matchMedia('(min-width: 981px)').matches) return;
    gsap.to('.hero__title', { yPercent: 28, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__figure', { y: -60, scale: 1.04, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.fromTo('.hero__copy, .hero__hud', { opacity: 1, y: 0 }, { opacity: 0, y: -40, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.hero', start: '20% top', end: '60% top', scrub: true } });
  });

  // rail progress
  gsap.to('.rail__progress', { scaleY: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ---------- section heads ---------- */
  $$('.section').forEach(function (sec) {
    var eye = $('.eyebrow span', sec), lines = $$('.split-line > span', sec);
    var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 78%' } });
    if (eye) tl.from(eye, { scaleX: 0, duration: 0.8, ease: 'expo.out' }, 0);
    tl.from($$('.eyebrow', sec), { opacity: 0, x: -14, duration: 0.6 }, 0);
    tl.from(lines, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.1 }, 0.1);
  });

  // generic reveals
  $$('[data-reveal]').forEach(function (el) {
    var clip = el.getAttribute('data-reveal') === 'clip';
    if (clip) gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath', scrollTrigger: { trigger: el, start: 'top 82%' } });
    else gsap.from(el, { opacity: 0, y: 34, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
  });
  $$('[data-reveal-group]').forEach(function (g) {
    gsap.from(g.children, { opacity: 0, y: 24, duration: 0.8, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: g, start: 'top 86%' } });
  });
  $$('[data-reveal-item]').forEach(function (el, i) {
    gsap.from(el, { opacity: 0, y: 40, duration: 1, ease: 'power3.out', delay: (i % 3) * 0.1, scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // skill cards

  // scroll speed, so fast scrolling past the projects stays silent
  var lastY = window.scrollY, lastT = performance.now(), scrollSpeed = 0;
  window.addEventListener('scroll', function () {
    var now = performance.now(), dt = now - lastT || 16;
    scrollSpeed = Math.abs(window.scrollY - lastY) / dt; lastY = window.scrollY; lastT = now;
  }, { passive: true });

  // projects: frame wipe + inner image zoom + body stagger + title scramble
  $$('[data-project]').forEach(function (p, i) {
    var frame = $('[data-frame]', p), body = $('.project__body', p);
    var tl = gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 75%' } });
    tl.add(function () { if (scrollSpeed < 2.5) SFX.play('materialize'); }, 0);
    if (frame) {
      tl.fromTo(frame, { clipPath: i % 2 ? 'inset(0 0% 0 100%)' : 'inset(0 100% 0 0%)' }, { clipPath: 'inset(0 0% 0 0%)', duration: 1.3, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
        .from($('.frame__screen', frame), { scale: 1.15, duration: 1.8, ease: 'expo.out' }, 0.3)
        .from($$('.thumb', p), { opacity: 0, y: 14, stagger: 0.06, duration: 0.6 }, 0.8);
    }
    tl.from(body.children, { opacity: 0, x: i % 2 ? -30 : 30, duration: 0.9, ease: 'power3.out', stagger: 0.07 }, 0.25)
      .add(function () { var h = $('[data-scramble-view]', p); if (h) scramble(h, h.textContent, 0.8); }, 0.35);
  });
  $$('.apps').forEach(function (a) {
    gsap.from($$('.app', a), { opacity: 0, y: 80, rotate: function (k) { return [-4, 0, 4][k] || 0; }, duration: 1.2, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: a, start: 'top 80%' } });
    gsap.to($$('.app', a), { y: function (k) { return [-24, 18, -12][k] || 0; }, ease: 'none', scrollTrigger: { trigger: a, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // project numbers count up when they scroll into view (only whole numbers like 44, 72)
  $$('.pfacts b').forEach(function (b) {
    var txt = b.textContent; if (!/^\d+$/.test(txt) || +txt < 3) return;
    var n = { v: 0 }, end = +txt; b.textContent = '0';
    ST.create({ trigger: b, start: 'top 90%', once: true, onEnter: function () {
      gsap.to(n, { v: end, duration: 1.3, ease: 'power2.out', onUpdate: function () { b.textContent = Math.round(n.v); } });
    } });
  });

  // the "Now" list types itself out like a terminal
  var nowItems = $$('.now__list li');
  if (nowItems.length) {
    var full = nowItems.map(function (li) { return li.textContent; });
    // an invisible copy keeps each line's space, so nothing jumps while the text types in
    var live = nowItems.map(function (li, k) {
      li.innerHTML = '<span class="ty__ghost">' + esc(full[k]) + '</span><span class="ty__live" aria-hidden="true"></span>';
      li.classList.add('is-typing-wait'); return $('.ty__live', li);
    });
    ST.create({ trigger: '.now', start: 'top 82%', once: true, onEnter: function () {
      var i = 0;
      (function nextLine() {
        if (i >= nowItems.length) return;
        var li = nowItems[i], out = live[i], text = full[i], c = 0;
        li.classList.remove('is-typing-wait'); li.classList.add('is-typing');
        (function typeChar() {
          c += 2; out.textContent = text.slice(0, c);
          if (c < text.length) setTimeout(typeChar, 16);
          else { li.classList.remove('is-typing'); li.classList.add('is-typed'); i++; setTimeout(nextLine, 90); }
        })();
      })();
    } });
  }

  // timeline line draws with scroll, dots light up
  gsap.fromTo('.timeline__line span', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: 0.4 } });
  $$('[data-tl]').forEach(function (li) {
    ST.create({ trigger: li, start: 'top 68%', onEnter: function () { li.classList.add('is-on'); }, onLeaveBack: function () { li.classList.remove('is-on'); } });
    gsap.from(li, { opacity: 0, x: 30, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 86%' } });
  });

  // background line art in sections drifts slightly
  gsap.to('.hero__glow', { opacity: 0.55, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  window.addEventListener('load', function () { ST.refresh(); });
})();
