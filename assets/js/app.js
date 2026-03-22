/* Moon Coffee — Smooth scroll + Pop reveals */

/* ─── 1. LENIS smooth scroll ─────────────────
   Replaces the browser's native scroll with a
   silky momentum-based version.                */
const lenis = new Lenis({
  lerp:         0.075,   // lower = smoother momentum (0–1)
  smoothWheel:  true,
  syncTouch:    false,   // keep native touch on mobile
});

// Tick Lenis inside rAF so GSAP stays in sync
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ─── 2. GSAP + ScrollTrigger setup ──────────*/
gsap.registerPlugin(ScrollTrigger);

// Tell ScrollTrigger to use Lenis scroll position
lenis.on('scroll', ScrollTrigger.update);

/* ─── 3. Nav scroll state ────────────────────*/
const nav = document.getElementById('nav');
lenis.on('scroll', ({ scroll }) => {
  const past = scroll > window.innerHeight * 0.85;
  nav.classList.toggle('scrolled', past);
  nav.classList.toggle('on-hero',  !past);
});
nav.classList.add('on-hero');

/* ─── 4. Smooth anchor links ─────────────────*/
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -68, duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
  });
});

/* ─── 5. Section pop reveals ─────────────────
   Each section content "pops up" from below
   with a spring overshoot (back.out easing).   */

// ── Quality section: whole content block pops
gsap.from('.quality-content', {
  y:        100,
  opacity:  0,
  scale:    0.93,
  duration: 1.5,
  ease:     'back.out(1.6)',
  scrollTrigger: {
    trigger: '.quality',
    start:   'top 80%',
    once:    true,
  },
});

// ── Quality text: staggered upward pop after the block
gsap.from(['.quality-label', '.quality-heading', '.quality-body', '.quality-marks'], {
  y:        50,
  opacity:  0,
  stagger:  0.1,
  duration: 1.1,
  ease:     'back.out(1.5)',
  scrollTrigger: {
    trigger: '.quality-content',
    start:   'top 72%',
    once:    true,
  },
});

// ── Slash transition: scales in from left
gsap.from('.st-slash', {
  scaleX:   0,
  duration: 1.3,
  ease:     'expo.out',
  transformOrigin: 'left center',
  scrollTrigger: {
    trigger: '.st-slash',
    start:   'top 90%',
    once:    true,
  },
});

// ── Story: left column slides & pops from left
gsap.from('.story-left', {
  y:        80,
  opacity:  0,
  scale:    0.95,
  duration: 1.4,
  ease:     'back.out(1.5)',
  scrollTrigger: {
    trigger: '.story',
    start:   'top 78%',
    once:    true,
  },
});

// ── Story: right video panel pops from right, slightly delayed
gsap.from('.story-right', {
  y:        80,
  opacity:  0,
  scale:    0.95,
  duration: 1.4,
  delay:    0.18,
  ease:     'back.out(1.4)',
  scrollTrigger: {
    trigger: '.story',
    start:   'top 78%',
    once:    true,
  },
});

// ── Story: inner text blocks stagger in
gsap.from(['.story-top', '.story-pillars', '.story-quote'], {
  y:        40,
  opacity:  0,
  stagger:  0.14,
  duration: 1.0,
  ease:     'back.out(1.4)',
  scrollTrigger: {
    trigger: '.story-left',
    start:   'top 70%',
    once:    true,
  },
});

// ── Footer fades up
gsap.from('.footer-inner', {
  y:        30,
  opacity:  0,
  duration: 1.0,
  ease:     'power3.out',
  scrollTrigger: {
    trigger: '.footer',
    start:   'top 90%',
    once:    true,
  },
});
