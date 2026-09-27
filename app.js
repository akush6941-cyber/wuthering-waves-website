/**
 * RESONANCE CHRONICLES — 300-Frame Interactive Engine
 * Silky smooth Lerp scrubbing, responsive HiDPI canvas, and dynamic ambient soundscape
 */

(function () {
  'use strict';

  // --- CONFIGURATION ---
  const TOTAL_FRAMES_PART1 = 300; // 300 frames (Resonance Saga)
  const TOTAL_FRAMES_ENDING = 203; // 203 frames (Celestial Portal Epilogue)
  const TOTAL_FRAMES = TOTAL_FRAMES_PART1 + TOTAL_FRAMES_ENDING; // 503 frames total

  // Determine paths
  const isDirectFolder = window.location.pathname.toLowerCase().includes('ezgif');
  const DIR_FRAMES_PART1 = isDirectFolder ? '../ezgif-856d9e2a14aa858a-jpg/' : './frames/';
  const DIR_FRAMES_ENDING = './frames_ending/';
  const FRAME_PREFIX = 'ezgif-frame-';
  const FRAME_EXT = '.jpg';

  // Chapters across all 503 frames
  const CHAPTERS = [
    { id: 1, title: 'Overview', frame: 0, range: [0, 44] },
    { id: 2, title: 'II. Encounter', frame: 45, range: [45, 149] },
    { id: 3, title: 'III. Serenade', frame: 150, range: [150, 224] },
    { id: 4, title: 'IV. Male Rover', frame: 225, range: [225, 274] },
    { id: 5, title: 'Finale', frame: 285, range: [275, 299] },
    { id: 6, title: 'VI. Gateway', frame: 300, range: [300, 502] },
  ];

  // --- ENGINE STATE ---
  const state = {
    imagesPart1: [],
    imagesEnding: [],
    loadedCount: 0,
    isLoaded: false,
    currentFrame: 0,
    targetFrame: 0,
    scrollProgress: 0,
    isPlaying: false,
    playSpeed: 1,
    lastPlayTime: 0,
    viewMode: 'cover',
    hudVisible: false,
    captionsVisible: true,
    audioEnabled: false,
    lastScrollY: 0,
    scrollVelocity: 0,
    fps: 60,
    lastFrameTime: performance.now(),
    frameCount: 0,
    isDraggingTimeline: false,
    cinemaFxEnabled: true,
  };

  // --- DOM ELEMENTS ---
  const canvas = document.getElementById('animCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const viewport = document.getElementById('canvasViewport');
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loaderBar');
  const loaderPercentage = document.getElementById('loaderPercentage');
  const loaderCounter = document.getElementById('loaderCounter');

  // Cinematic FX Elements
  const godRays = document.getElementById('godRays');
  const anamorphicFlare = document.getElementById('anamorphicFlare');
  const cinemaParticlesCanvas = document.getElementById('cinemaParticlesCanvas');
  const cursorSpotlight = document.getElementById('cursorSpotlight');
  const chromaFx = document.getElementById('chromaFx');
  const fxToggleBtn = document.getElementById('fxToggleBtn');
  const fxBtnText = document.getElementById('fxBtnText');
  const hudFxStatus = document.getElementById('hudFxStatus');

  // Timeline & Dock
  const timelineTrack = document.getElementById('timelineTrack');
  const timelineProgress = document.getElementById('timelineProgress');
  const timelineThumb = document.getElementById('timelineThumb');
  const timelineTooltip = document.getElementById('timelineTooltip');
  const tooltipFrameText = document.getElementById('tooltipFrameText');
  const tooltipActText = document.getElementById('tooltipActText');
  const currentFrameDisplay = document.getElementById('currentFrameDisplay');
  const frameSubTag = document.getElementById('frameSubTag');
  const autoPlayBtn = document.getElementById('autoPlayBtn');
  const dockPlayBtn = document.getElementById('dockPlayBtn');
  const playBtnText = document.getElementById('playBtnText');
  const stepBackBtn = document.getElementById('stepBackBtn');
  const stepForwardBtn = document.getElementById('stepForwardBtn');
  const speedPills = document.querySelectorAll('.speed-pill');
  const fitCoverBtn = document.getElementById('fitCoverBtn');
  const fitContainBtn = document.getElementById('fitContainBtn');
  const filterSelect = document.getElementById('filterSelect');
  const toggleCaptionsBtn = document.getElementById('toggleCaptionsBtn');
  const controlDock = document.getElementById('controlDock');
  const mainNav = document.getElementById('mainNav');

  // HUD
  const hudTelemetry = document.getElementById('hudTelemetry');
  const hudToggleBtn = document.getElementById('hudToggleBtn');
  const hudCloseBtn = document.getElementById('hudCloseBtn');
  const hudFps = document.getElementById('hudFps');
  const hudBuffer = document.getElementById('hudBuffer');
  const hudProgress = document.getElementById('hudProgress');
  const hudVelocity = document.getElementById('hudVelocity');
  const hudResolution = document.getElementById('hudResolution');
  const hudAudioState = document.getElementById('hudAudioState');

  // Navigation
  const actPillText = document.getElementById('actPillText');
  const partBadge = document.getElementById('partBadge');
  const chapButtons = document.querySelectorAll('.chap-btn');
  const storyStages = document.querySelectorAll('.story-stage');

  // Action Buttons
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioHint = document.getElementById('audioHint');
  const fsToggleBtn = document.getElementById('fsToggleBtn');
  const replayBtn = document.getElementById('replayBtn');
  const saveFrameBtn = document.getElementById('saveFrameBtn');

  function padZero(num, size) {
    let s = String(num);
    while (s.length < size) s = '0' + s;
    return s;
  }

  // --- PRELOAD SEQUENCE (503 TOTAL FRAMES: 300 PART 1 + 203 EPILOGUE) ---
  function preloadAllFrames() {
    let loaded = 0;
    state.imagesPart1 = new Array(TOTAL_FRAMES_PART1);
    state.imagesEnding = new Array(TOTAL_FRAMES_ENDING);

    function onImageFinish() {
      loaded++;
      state.loadedCount = loaded;
      const pct = Math.min(100, Math.floor((loaded / TOTAL_FRAMES) * 100));
      loaderBar.style.width = `${pct}%`;
      loaderPercentage.textContent = `${pct}%`;
      loaderCounter.textContent = `Buffered ${loaded} / ${TOTAL_FRAMES} frames`;

      if (loaded === TOTAL_FRAMES) {
        onAllImagesLoaded();
      }
    }

    // Preload Part 1: Resonance Saga (Frames 001 - 300)
    for (let i = 1; i <= TOTAL_FRAMES_PART1; i++) {
      const idx = i - 1;
      const img = new Image();
      img.src = `${DIR_FRAMES_PART1}${FRAME_PREFIX}${padZero(i, 3)}${FRAME_EXT}`;
      img.onload = onImageFinish;
      img.onerror = onImageFinish;
      state.imagesPart1[idx] = img;
    }

    // Preload Part 2: Celestial Portal Epilogue (Frames 001 - 203)
    for (let j = 1; j <= TOTAL_FRAMES_ENDING; j++) {
      const idx2 = j - 1;
      const img2 = new Image();
      img2.src = `${DIR_FRAMES_ENDING}${FRAME_PREFIX}${padZero(j, 3)}${FRAME_EXT}`;
      img2.onload = onImageFinish;
      img2.onerror = onImageFinish;
      state.imagesEnding[idx2] = img2;
    }
  }

  function onAllImagesLoaded() {
    state.isLoaded = true;
    if (hudBuffer) hudBuffer.textContent = `${TOTAL_FRAMES}/${TOTAL_FRAMES} Ready`;

    // Initial render
    renderFrame(0);

    setTimeout(() => {
      preloader.classList.add('fade-out');
      if (!state.audioEnabled) {
        audioHint.classList.remove('hidden');
        setTimeout(() => audioHint.classList.add('hidden'), 6000);
      }
    }, 450);
  }

  // --- CANVAS RESIZE & HI-DPI ---
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.scale(dpr, dpr);
    if (hudResolution) hudResolution.textContent = `${w}x${h} (@${dpr}x)`;
    if (typeof resizeCinemaParticlesCanvas === 'function') resizeCinemaParticlesCanvas();
    renderFrame(Math.round(state.currentFrame));
  }

  window.addEventListener('resize', resizeCanvas);

  // --- DRAW FRAME ON CANVAS ---
  function renderFrame(frameIndex) {
    const index = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIndex));
    
    // Choose active image from Part 1 or Epilogue
    let img = null;
    if (index < TOTAL_FRAMES_PART1) {
      img = state.imagesPart1[index];
    } else {
      img = state.imagesEnding[index - TOTAL_FRAMES_PART1];
    }
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    ctx.clearRect(0, 0, w, h);

    if (state.viewMode === 'cover') {
      const scale = Math.max(w / imgW, h / imgH);
      const renderW = imgW * scale;
      const renderH = imgH * scale;
      const offsetX = (w - renderW) / 2;
      const offsetY = (h - renderH) / 2;
      ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
    } else {
      const scale = Math.min(w / imgW, h / imgH);
      const renderW = imgW * scale;
      const renderH = imgH * scale;
      const offsetX = (w - renderW) / 2;
      const offsetY = (h - renderH) / 2;
      ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
    }

    // Update Counter Digits
    const globalNum = padZero(index + 1, 3);
    currentFrameDisplay.textContent = globalNum;

    if (index < TOTAL_FRAMES_PART1) {
      frameSubTag.textContent = `Frame [${globalNum}/503] • Resonance`;
      if (partBadge) {
        partBadge.textContent = 'PART 1: RESONANCE (300F)';
        partBadge.className = 'part-badge';
      }
    } else {
      const epilogueNum = padZero(index - TOTAL_FRAMES_PART1 + 1, 3);
      frameSubTag.textContent = `Frame [${globalNum}/503] • Epilogue [${epilogueNum}/203]`;
      if (partBadge) {
        partBadge.textContent = 'PART 2: CELESTIAL GATE (203F)';
        partBadge.className = 'part-badge part2';
      }
    }

    // Update Scrubber Position
    const progressPct = (index / (TOTAL_FRAMES - 1)) * 100;
    timelineProgress.style.width = `${progressPct}%`;
    timelineThumb.style.left = `${progressPct}%`;
    if (hudProgress) hudProgress.textContent = `${progressPct.toFixed(1)}%`;

    // Update Active Chapter and Cards
    updateActiveChapter(index);
  }

  function updateActiveChapter(frameIndex) {
    let currentChapter = CHAPTERS[0];
    for (const chap of CHAPTERS) {
      if (frameIndex >= chap.range[0] && frameIndex <= chap.range[1]) {
        currentChapter = chap;
        break;
      }
    }

    actPillText.textContent = currentChapter.title.toUpperCase();

    // Update Chapter Buttons
    chapButtons.forEach((btn) => {
      const targetF = parseInt(btn.getAttribute('data-frame'), 10);
      if (targetF === currentChapter.frame) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Story Stage Cards Visibility
    storyStages.forEach((stage) => {
      const cards = stage.querySelectorAll('.glass-card');
      const startF = parseInt(stage.getAttribute('data-frame-start'), 10);
      const endF = parseInt(stage.getAttribute('data-frame-end'), 10);

      cards.forEach((card) => {
        if (frameIndex >= startF && frameIndex <= endF) {
          card.classList.add('visible');
        } else {
          card.classList.remove('visible');
        }
      });
    });

    // Update Grand 3D Title Header (Weathering Waves)
    const grandHeader = document.getElementById('grandHeader');
    if (grandHeader) {
      if (frameIndex <= 48) {
        grandHeader.classList.remove('scrolled-out');
      } else {
        grandHeader.classList.add('scrolled-out');
      }
    }
  }

  // --- SCROLL HANDLING ---
  function onScroll() {
    if (state.isPlaying || state.isDraggingTimeline) return;

    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrollTop / maxScroll));

    state.scrollProgress = progress;
    state.targetFrame = progress * (TOTAL_FRAMES - 1);

    const deltaY = Math.abs(scrollTop - state.lastScrollY);
    state.scrollVelocity = deltaY;
    state.lastScrollY = scrollTop;
    hudVelocity.textContent = deltaY.toFixed(1);

    if (state.audioEnabled && synth) {
      synth.onScrollVelocity(deltaY);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // --- INTERACTIVE MOUSE PROXIMITY & 3D FLOATING PHYSICS ---
  const mouse = {
    x: window.innerWidth * 0.7,
    y: window.innerHeight * 0.4,
    targetX: window.innerWidth * 0.7,
    targetY: window.innerHeight * 0.4,
    isInside: false
  };

  // --- WUTHERING WAVES TERMINAL CHROMATIC GLITCH SYSTEM ---
  let lastGlitchTime = 0;
  const GLITCH_COOLDOWN = 650; // ms minimum cooldown between occasional glitch effects
  let prevMouseX = null;
  let prevMouseY = null;
  let prevMouseTime = null;

  function triggerTerminalGlitch() {
    const now = performance.now();
    if (now - lastGlitchTime < GLITCH_COOLDOWN) return;
    lastGlitchTime = now;

    document.body.classList.add('ww-terminal-glitch');
    if (state.audioEnabled && synth) {
      try { synth.playTerminalGlitchBeep(); } catch (e) {}
    }

    setTimeout(() => {
      document.body.classList.remove('ww-terminal-glitch');
    }, 280);
  }

  // Click trigger (Terminal interaction)
  window.addEventListener('pointerdown', (e) => {
    // Avoid triggering when interacting with dropdowns, sliders, inputs, or badge clicks
    if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT' || e.target.closest('#dockAudioBadge') || e.target.closest('#suzumeBadge') || e.target.closest('.timeline-track')) return;
    triggerTerminalGlitch();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.isInside = true;

    // Detect fast mouse swipe / flick gesture across screen
    const now = performance.now();
    if (prevMouseX !== null && prevMouseTime !== null) {
      const dt = now - prevMouseTime;
      if (dt > 10 && dt < 100) {
        const dist = Math.hypot(e.clientX - prevMouseX, e.clientY - prevMouseY);
        const velocity = dist / dt; // pixels per millisecond
        if (velocity > 2.3) { // High-speed swipe threshold
          triggerTerminalGlitch();
        }
      }
    }
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    prevMouseTime = now;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.isInside = false;
    prevMouseX = null;
    prevMouseY = null;
    prevMouseTime = null;
  });

  const cardPhysicsMap = new Map();

  function initCardPhysics() {
    let globalIndex = 0;
    storyStages.forEach((stage) => {
      const cards = stage.querySelectorAll('.glass-card');
      cards.forEach((card) => {
        cardPhysicsMap.set(card, {
          index: globalIndex++,
          currentTx: 0,
          currentTy: 0,
          currentTz: 0,
          currentRx: 0,
          currentRy: 0,
          currentScale: 1,
          targetTx: 0,
          targetTy: 0,
          targetTz: 0,
          targetRx: 0,
          targetRy: 0,
          targetScale: 1,
          proximity: 0,
          isHovered: false
        });

        card.addEventListener('mouseenter', () => {
          const phys = cardPhysicsMap.get(card);
          if (phys) phys.isHovered = true;
        });

        card.addEventListener('mouseleave', () => {
          const phys = cardPhysicsMap.get(card);
          if (phys) phys.isHovered = false;
        });
      });
    });
  }

  function updateCardPhysics(now) {
    // Lerp cursor position
    mouse.x += (mouse.targetX - mouse.x) * 0.16;
    mouse.y += (mouse.targetY - mouse.y) * 0.16;

    const time = now * 0.0016;

    cardPhysicsMap.forEach((phys, card) => {
      if (!card.classList.contains('visible')) return;

      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      // Distance from mouse to center of card
      const dx = mouse.x - cardCenterX;
      const dy = mouse.y - cardCenterY;
      const dist = Math.hypot(dx, dy);

      // Calibrated proximity threshold (380px) for high stability & no twitching
      const maxDist = 380;
      let rawP = 0;
      if (mouse.isInside && dist < maxDist) {
        rawP = 1 - (dist / maxDist);
      }
      // Smooth Hermite curve with gentle entry
      const p = rawP * rawP * (3 - 2 * rawP);
      phys.proximity = p;

      // Mouse reflection coords for subtle specular sheen
      const relX = ((mouse.x - rect.left) / rect.width) * 100;
      const relY = ((mouse.y - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${relX.toFixed(1)}%`);
      card.style.setProperty('--mouse-y', `${relY.toFixed(1)}%`);

      // Stabilized Micro-Tilt & Float Targets (Controlled, luxury, non-jittery)
      if (rawP > 0 || phys.isHovered) {
        const normX = Math.max(-1, Math.min(1, dx / (rect.width / 2)));
        const normY = Math.max(-1, Math.min(1, dy / (rect.height / 2)));
        const intensity = phys.isHovered ? 1.0 : p;

        // Controlled 3D tilt (max ~3.5° to 4.2° for crystal clear readability and stability)
        const maxTilt = phys.isHovered ? 4.2 : 3.0;
        phys.targetRx = -normY * maxTilt * intensity;
        phys.targetRy = normX * maxTilt * intensity;

        // Subtle, grounded magnetic shift (max 3.5px to 5px)
        const maxShift = phys.isHovered ? 5.0 : 3.2;
        phys.targetTx = normX * maxShift * intensity;
        phys.targetTy = normY * maxShift * intensity;
        phys.targetTz = intensity * (phys.isHovered ? 14 : 7);
        phys.targetScale = 1 + intensity * 0.012;
      } else {
        phys.targetRx = 0;
        phys.targetRy = 0;
        phys.targetTx = 0;
        phys.targetTy = 0;
        phys.targetTz = 0;
        phys.targetScale = 1;
      }

      // High-inertia heavy damping (butter smooth, zero jitter)
      const lerpSpeed = phys.isHovered ? 0.08 : 0.055;
      phys.currentRx += (phys.targetRx - phys.currentRx) * lerpSpeed;
      phys.currentRy += (phys.targetRy - phys.currentRy) * lerpSpeed;
      phys.currentTx += (phys.targetTx - phys.currentTx) * lerpSpeed;
      phys.currentTy += (phys.targetTy - phys.currentTy) * lerpSpeed;
      phys.currentTz += (phys.targetTz - phys.currentTz) * lerpSpeed;
      phys.currentScale += (phys.targetScale - phys.currentScale) * lerpSpeed;

      // Calm, grounded organic levitation wave (stable ~3.5px to 5px amplitude)
      const floatAmp = 3.2 + phys.proximity * 1.8;
      const floatFreq = 1.15;
      const floatY = Math.sin(time * floatFreq + phys.index * 1.5) * floatAmp;

      card.style.setProperty('--card-float-y', `${floatY.toFixed(2)}px`);
      card.style.setProperty('--card-tx', `${phys.currentTx.toFixed(2)}px`);
      card.style.setProperty('--card-ty', `${phys.currentTy.toFixed(2)}px`);
      card.style.setProperty('--card-tz', `${phys.currentTz.toFixed(2)}px`);
      card.style.setProperty('--card-rx', `${phys.currentRx.toFixed(2)}deg`);
      card.style.setProperty('--card-ry', `${phys.currentRy.toFixed(2)}deg`);
      card.style.setProperty('--card-scale', `${phys.currentScale.toFixed(3)}`);
    });
  }

  // --- CINEMATIC LIGHTING & ATMOSPHERE SUITE ---
  // Volumetric Celestial God Rays, Anamorphic Lens Flare, Ambient Bokeh Stardust
  let cinemaParticlesCtx = null;
  let cinemaParticles = [];

  function initCinemaParticles() {
    if (!cinemaParticlesCanvas) return;
    cinemaParticlesCtx = cinemaParticlesCanvas.getContext('2d');
    resizeCinemaParticlesCanvas();

    cinemaParticles = [];
    const count = 52;
    for (let i = 0; i < count; i++) {
      const typeRand = Math.random();
      const colorType = typeRand < 0.45 ? 'cyan' : typeRand < 0.8 ? 'gold' : 'rose';
      cinemaParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 1.2 + Math.random() * 2.8,
        speedY: -0.25 - Math.random() * 0.75,
        speedX: (Math.random() - 0.5) * 0.5,
        alpha: 0.2 + Math.random() * 0.65,
        baseAlpha: 0.2 + Math.random() * 0.65,
        pulseSpeed: 0.015 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
        colorType: colorType,
        depth: 0.5 + Math.random() * 0.8
      });
    }
  }

  function resizeCinemaParticlesCanvas() {
    if (!cinemaParticlesCanvas) return;
    cinemaParticlesCanvas.width = window.innerWidth;
    cinemaParticlesCanvas.height = window.innerHeight;
  }

  function updateCinemaAtmosphere(now) {
    if (!state.cinemaFxEnabled) return;

    // Progress across the entire 503-frame saga (0.0 to 1.0)
    const progress = state.scrollProgress || (state.currentFrame / (TOTAL_FRAMES - 1));
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // 1. Volumetric God Rays Shift: Celestial sunlight perspective shifts smoothly with scroll
    if (godRays) {
      const rayShiftX = -40 + clampedProgress * 120; // -40px to +80px
      godRays.style.setProperty('--god-ray-x', `${rayShiftX.toFixed(1)}px`);
    }

    // 2. Anamorphic Lens Flare: Sweeps across the horizon matching narrative acts
    if (anamorphicFlare) {
      // Dynamic focal altitude across chapters
      let targetFlareY = 40;
      if (clampedProgress < 0.15) {
        targetFlareY = 28; // Upper hero title
      } else if (clampedProgress < 0.45) {
        targetFlareY = 38; // Act II Encounter
      } else if (clampedProgress < 0.7) {
        targetFlareY = 52; // Act III & IV Combat
      } else {
        targetFlareY = 46; // Epilogue Celestial Portal
      }

      // Mouse interactive focal shift
      const normMouseX = (mouse.x / window.innerWidth) * 100;
      const flareX = 50 + (normMouseX - 50) * 0.25;

      anamorphicFlare.style.setProperty('--flare-y', `${targetFlareY}%`);
      anamorphicFlare.style.setProperty('--flare-x', `${flareX.toFixed(1)}%`);

      // Pulse flare intensity on scroll velocity
      const velGlow = Math.min(0.35, (state.scrollVelocity || 0) * 0.01);
      anamorphicFlare.style.setProperty('--flare-opacity', `${(0.7 + velGlow).toFixed(2)}`);
    }

    // 3. Specular Cursor Spotlight
    if (cursorSpotlight) {
      const mouseXPct = ((mouse.x / window.innerWidth) * 100).toFixed(1);
      const mouseYPct = ((mouse.y / window.innerHeight) * 100).toFixed(1);
      cursorSpotlight.style.setProperty('--mouse-x', `${mouseXPct}%`);
      cursorSpotlight.style.setProperty('--mouse-y', `${mouseYPct}%`);
    }

    // 4. Prismatic Chromatic Dispersion Edge Accent
    if (chromaFx) {
      const velChroma = Math.min(1.0, 0.45 + (state.scrollVelocity || 0) * 0.015);
      chromaFx.style.setProperty('--chroma-opacity', `${velChroma.toFixed(2)}`);
    }

    // 5. Render Ambient Celestial Stardust & Bokeh Motes
    if (cinemaParticlesCtx) {
      const w = cinemaParticlesCanvas.width;
      const h = cinemaParticlesCanvas.height;
      cinemaParticlesCtx.clearRect(0, 0, w, h);

      const speedBoost = 1 + Math.min(3.5, (state.scrollVelocity || 0) * 0.04);

      for (let i = 0; i < cinemaParticles.length; i++) {
        const p = cinemaParticles[i];
        p.phase += p.pulseSpeed;
        p.alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.phase));

        // Interactive cursor repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (mouse.isInside && dist < 150 && dist > 1) {
          const force = (1 - dist / 150) * 1.8;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        p.y += p.speedY * p.depth * speedBoost;
        p.x += p.speedX * p.depth + Math.sin(p.phase * 0.5) * 0.35;

        // Wrap around viewport
        if (p.y < -30) {
          p.y = h + 20;
          p.x = Math.random() * w;
        }
        if (p.x < -30) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;

        // Draw glowing particle with soft chromatic bokeh
        const r = p.radius * p.depth;
        let colorRGB = '56, 189, 248'; // Cyan
        if (p.colorType === 'gold') colorRGB = '245, 158, 11';
        if (p.colorType === 'rose') colorRGB = '244, 63, 94';

        const grad = cinemaParticlesCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.2);
        grad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha * 0.95})`);
        grad.addColorStop(0.35, `rgba(${colorRGB}, ${p.alpha * 0.75})`);
        grad.addColorStop(1, `rgba(${colorRGB}, 0)`);

        cinemaParticlesCtx.fillStyle = grad;
        cinemaParticlesCtx.beginPath();
        cinemaParticlesCtx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
        cinemaParticlesCtx.fill();
      }
    }
  }

  function toggleCinemaFx() {
    state.cinemaFxEnabled = !state.cinemaFxEnabled;
    const vp = document.getElementById('canvasViewport');
    if (vp) {
      if (state.cinemaFxEnabled) {
        vp.classList.remove('cinema-fx-disabled');
      } else {
        vp.classList.add('cinema-fx-disabled');
      }
    }
    if (fxBtnText) {
      fxBtnText.textContent = `Cinema FX: ${state.cinemaFxEnabled ? 'ON' : 'OFF'}`;
    }
    if (fxToggleBtn) {
      fxToggleBtn.className = `mode-btn cinema-fx-btn ${state.cinemaFxEnabled ? 'active' : 'off'}`;
    }
    if (hudFxStatus) {
      hudFxStatus.textContent = state.cinemaFxEnabled ? 'Anamorphic 4K [Active]' : 'Standard [Disabled]';
    }
  }

  // --- LERP RENDER LOOP ---
  function tick(timestamp) {
    state.frameCount++;
    if (timestamp - state.lastFrameTime >= 1000) {
      state.fps = state.frameCount;
      state.frameCount = 0;
      state.lastFrameTime = timestamp;
      hudFps.textContent = `${state.fps} FPS`;
    }

    // Autoplay progression
    if (state.isPlaying) {
      const delta = timestamp - (state.lastPlayTime || timestamp);
      const frameInterval = (1000 / 30) / state.playSpeed;

      if (delta >= frameInterval) {
        state.targetFrame += 1;
        if (state.targetFrame >= TOTAL_FRAMES) {
          state.targetFrame = 0; // Loop full saga
        }
        state.lastPlayTime = timestamp;

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const targetScrollY = (state.targetFrame / (TOTAL_FRAMES - 1)) * maxScroll;
        window.scrollTo({ top: targetScrollY, behavior: 'instant' });
      }
    }

    // Silky Smooth Lerp
    const diff = state.targetFrame - state.currentFrame;
    if (Math.abs(diff) > 0.001) {
      state.currentFrame += diff * 0.16;
      renderFrame(Math.round(state.currentFrame));
    }

    // Update Atmospheric Cinema FX (God rays, lens flare, stardust motes)
    updateCinemaAtmosphere(timestamp);

    // Update 3D interactive mouse float physics
    updateCardPhysics(timestamp);

    // Update Resonator elemental energy plasma
    if (typeof updateResonatorEnergy === 'function') {
      updateResonatorEnergy(timestamp);
    }

    requestAnimationFrame(tick);
  }

  // --- TIMELINE INTERACTION & SCRUBBING ---
  function handleTimelineScrub(e) {
    const rect = timelineTrack.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetF = ratio * (TOTAL_FRAMES - 1);

    state.targetFrame = targetF;
    state.currentFrame = targetF;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: ratio * maxScroll, behavior: 'instant' });
    renderFrame(Math.round(targetF));
  }

  timelineTrack.addEventListener('mousedown', (e) => {
    state.isDraggingTimeline = true;
    handleTimelineScrub(e);
  });

  window.addEventListener('mousemove', (e) => {
    const rect = timelineTrack.getBoundingClientRect();
    if (e.clientY >= rect.top - 50 && e.clientY <= rect.bottom + 20) {
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const frameAtPoint = Math.round(ratio * (TOTAL_FRAMES - 1));
      
      tooltipFrameText.textContent = `Frame ${padZero(frameAtPoint + 1, 3)}`;

      let chapterName = 'Act I';
      for (const chap of CHAPTERS) {
        if (frameAtPoint >= chap.range[0] && frameAtPoint <= chap.range[1]) {
          chapterName = chap.title;
          break;
        }
      }
      tooltipActText.textContent = chapterName;
      timelineTooltip.style.left = `${ratio * 100}%`;
    }

    if (state.isDraggingTimeline) {
      handleTimelineScrub(e);
    }
  });

  window.addEventListener('mouseup', () => {
    state.isDraggingTimeline = false;
  });

  // Touch Support
  timelineTrack.addEventListener('touchstart', (e) => {
    state.isDraggingTimeline = true;
    handleTimelineScrub(e);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (state.isDraggingTimeline) {
      handleTimelineScrub(e);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    state.isDraggingTimeline = false;
  });

  // Marker Jumps
  document.querySelectorAll('.marker').forEach((marker) => {
    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetF = parseInt(marker.getAttribute('data-frame'), 10);
      jumpToFrame(targetF);
    });
  });

  // Chapter Button Jumps
  chapButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetF = parseInt(btn.getAttribute('data-frame'), 10);
      jumpToFrame(targetF);
    });
  });

  function jumpToFrame(targetF) {
    state.targetFrame = targetF;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollY = (targetF / (TOTAL_FRAMES - 1)) * maxScroll;
    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
  }

  // --- PLAYBACK CONTROLS ---
  function togglePlay() {
    state.isPlaying = !state.isPlaying;
    state.lastPlayTime = performance.now();

    const playIcons = document.querySelectorAll('.icon-play, .dock-play-icon');
    const pauseIcons = document.querySelectorAll('.icon-pause, .dock-pause-icon');

    if (state.isPlaying) {
      playIcons.forEach((el) => el.classList.add('hidden'));
      pauseIcons.forEach((el) => el.classList.remove('hidden'));
      playBtnText.textContent = 'Pause';
    } else {
      playIcons.forEach((el) => el.classList.remove('hidden'));
      pauseIcons.forEach((el) => el.classList.add('hidden'));
      playBtnText.textContent = 'Autoplay';
    }
  }

  autoPlayBtn.addEventListener('click', togglePlay);
  dockPlayBtn.addEventListener('click', togglePlay);

  stepBackBtn.addEventListener('click', () => {
    state.targetFrame = Math.max(0, state.targetFrame - 1);
    renderFrame(Math.round(state.targetFrame));
  });

  stepForwardBtn.addEventListener('click', () => {
    state.targetFrame = Math.min(TOTAL_FRAMES - 1, state.targetFrame + 1);
    renderFrame(Math.round(state.targetFrame));
  });

  speedPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      speedPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      state.playSpeed = parseFloat(pill.getAttribute('data-speed'));
    });
  });

  replayBtn.addEventListener('click', () => {
    jumpToFrame(0);
    setTimeout(() => {
      if (!state.isPlaying) togglePlay();
    }, 600);
  });

  // Snapshot Frame
  function saveCurrentFrameSnapshot() {
    const currentNum = Math.round(state.currentFrame);
    const link = document.createElement('a');
    link.download = `resonance-saga-frame-${padZero(currentNum + 1, 3)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  if (saveFrameBtn) saveFrameBtn.addEventListener('click', saveCurrentFrameSnapshot);
  const saveFinaleFrameBtn = document.getElementById('saveFinaleFrameBtn');
  if (saveFinaleFrameBtn) saveFinaleFrameBtn.addEventListener('click', saveCurrentFrameSnapshot);
  const saveEpilogueFrameBtn = document.getElementById('saveEpilogueFrameBtn');
  if (saveEpilogueFrameBtn) saveEpilogueFrameBtn.addEventListener('click', saveCurrentFrameSnapshot);

  const replayOdysseyBtn = document.getElementById('replayOdysseyBtn');
  if (replayOdysseyBtn) {
    replayOdysseyBtn.addEventListener('click', () => {
      jumpToFrame(0);
      setTimeout(() => { if (!state.isPlaying) togglePlay(); }, 600);
    });
  }

  const replayEpilogueBtn = document.getElementById('replayEpilogueBtn');
  if (replayEpilogueBtn) {
    replayEpilogueBtn.addEventListener('click', () => {
      jumpToFrame(300);
      setTimeout(() => { if (!state.isPlaying) togglePlay(); }, 600);
    });
  }

  // View Mode
  fitCoverBtn.addEventListener('click', () => {
    state.viewMode = 'cover';
    fitCoverBtn.classList.add('active');
    fitContainBtn.classList.remove('active');
    renderFrame(Math.round(state.currentFrame));
  });

  fitContainBtn.addEventListener('click', () => {
    state.viewMode = 'contain';
    fitContainBtn.classList.add('active');
    fitCoverBtn.classList.remove('active');
    renderFrame(Math.round(state.currentFrame));
  });

  filterSelect.addEventListener('change', (e) => {
    viewport.className = 'canvas-viewport';
    const val = e.target.value;
    if (val !== 'none') {
      viewport.classList.add(`filter-${val}`);
    }
  });

  toggleCaptionsBtn.addEventListener('click', () => {
    state.captionsVisible = !state.captionsVisible;
    document.querySelectorAll('.glass-card').forEach((card) => {
      card.style.display = state.captionsVisible ? 'block' : 'none';
    });
    toggleCaptionsBtn.style.opacity = state.captionsVisible ? '1' : '0.4';
  });

  function toggleHud() {
    state.hudVisible = !state.hudVisible;
    hudTelemetry.classList.toggle('hidden', !state.hudVisible);
  }

  hudToggleBtn.addEventListener('click', toggleHud);
  hudCloseBtn.addEventListener('click', toggleHud);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  fsToggleBtn.addEventListener('click', toggleFullscreen);

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        state.targetFrame = Math.max(0, state.targetFrame - (e.shiftKey ? 10 : 1));
        renderFrame(Math.round(state.targetFrame));
        break;
      case 'ArrowRight':
        e.preventDefault();
        state.targetFrame = Math.min(TOTAL_FRAMES - 1, state.targetFrame + (e.shiftKey ? 10 : 1));
        renderFrame(Math.round(state.targetFrame));
        break;
      case 'KeyF':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'KeyH':
        e.preventDefault();
        toggleHud();
        break;
      case 'KeyM':
        e.preventDefault();
        toggleAudio();
        break;
      case 'KeyC':
        e.preventDefault();
        toggleCaptionsBtn.click();
        break;
      case 'KeyX':
      case 'KeyB':
        e.preventDefault();
        toggleCinemaFx();
        break;
      case 'Home':
        e.preventDefault();
        jumpToFrame(0);
        break;
      case 'End':
        e.preventDefault();
        jumpToFrame(TOTAL_FRAMES - 1);
        break;
    }
  });

  // --- WEB AUDIO API AMBIENT SOUND & LUTE SYNTHESIZER ---
  class AmbientSynthesizer {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.filter = null;
      this.oscillators = [];
      this.isPlaying = false;
      this.chordFreqs = [155.56, 233.08, 293.66, 349.23, 392.0]; // Ebmaj9
      this.luteScale = [349.23, 392.0, 466.16, 523.25, 587.33, 698.46, 783.99]; // Pentatonic lute
      this.lastLuteFrame = 0;
    }

    init() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      // Delay
      const delay = this.ctx.createDelay();
      delay.delayTime.value = 0.45;
      const delayFeedback = this.ctx.createGain();
      delayFeedback.gain.value = 0.35;

      this.filter.connect(delay);
      delay.connect(delayFeedback);
      delayFeedback.connect(delay);
      delay.connect(this.masterGain);

      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Pad Oscillators
      this.chordFreqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const voiceGain = this.ctx.createGain();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.detune.setValueAtTime((i - 2) * 5, this.ctx.currentTime);

        voiceGain.gain.setValueAtTime(0.07 / (i + 1), this.ctx.currentTime);
        osc.connect(voiceGain);
        voiceGain.connect(this.filter);

        osc.start();
        this.oscillators.push(osc);
      });
    }

    start() {
      if (!this.ctx) this.init();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.masterGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 1.5);
      this.isPlaying = true;
      hudAudioState.textContent = 'Active + Lute Strings';
    }

    stop() {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      }
      this.isPlaying = false;
      hudAudioState.textContent = 'Muted';
    }

    onScrollVelocity(velocity) {
      if (!this.isPlaying || !this.filter || !this.ctx) return;
      const baseFreq = 500;
      const targetFreq = Math.min(3000, baseFreq + velocity * 14);
      this.filter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
      this.filter.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime + 0.3, 0.8);
    }

    // Trigger celestial plucked lute sound when scrolling through Part II lute scene
    triggerLuteHarmonic(frameIndex) {
      if (!this.isPlaying || !this.ctx) return;
      if (Math.abs(frameIndex - this.lastLuteFrame) < 8) return; // Debounce
      this.lastLuteFrame = frameIndex;

      // Pick random harmonic from lute scale
      const noteFreq = this.luteScale[Math.floor(Math.random() * this.luteScale.length)];
      const pluckOsc = this.ctx.createOscillator();
      const pluckGain = this.ctx.createGain();

      pluckOsc.type = 'triangle';
      pluckOsc.frequency.setValueAtTime(noteFreq, this.ctx.currentTime);

      // Sharp plucked envelope
      pluckGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      pluckGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      pluckOsc.connect(pluckGain);
      pluckGain.connect(this.masterGain);

      pluckOsc.start();
      pluckOsc.stop(this.ctx.currentTime + 1.25);
    }

    playTerminalGlitchBeep() {
      if (!this.ctx || !state.audioEnabled) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1040, now);
      osc.frequency.exponentialRampToValueAtTime(1920, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.16);
    }

    playResonatorSwitchTune(baseFreq = 440) {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + idx * 0.05 + 0.35);

          gain.gain.setValueAtTime(0.06 / (idx + 1), now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.45);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.5);
        });
      } catch (e) {}
    }
  }

  const suzumeAudio = document.getElementById('suzumeAudio');
  const suzumeBadge = document.getElementById('suzumeBadge');
  const suzumeStatusText = document.getElementById('suzumeStatusText');
  const dockAudioBadge = document.getElementById('dockAudioBadge');
  const dockAudioCurrentTime = document.getElementById('dockAudioCurrentTime');
  const dockAudioTotalTime = document.getElementById('dockAudioTotalTime');
  const dockAudioProgressFill = document.getElementById('dockAudioProgressFill');
  const navAudioCurrentTime = document.getElementById('navAudioCurrentTime');
  const navAudioTotalTime = document.getElementById('navAudioTotalTime');
  const navAudioProgressFill = document.getElementById('navAudioProgressFill');
  const synth = new AmbientSynthesizer();

  function formatAudioTime(secs) {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateAudioProgress() {
    if (!suzumeAudio) return;
    const current = suzumeAudio.currentTime || 0;
    const duration = (suzumeAudio.duration && !isNaN(suzumeAudio.duration)) ? suzumeAudio.duration : 238; // 3:58 fallback
    const pct = Math.min(100, Math.max(0, (current / duration) * 100));

    const curText = formatAudioTime(current);
    const totText = formatAudioTime(duration);

    if (dockAudioCurrentTime) dockAudioCurrentTime.textContent = curText;
    if (dockAudioTotalTime) dockAudioTotalTime.textContent = totText;
    if (dockAudioProgressFill) dockAudioProgressFill.style.width = `${pct}%`;

    if (navAudioCurrentTime) navAudioCurrentTime.textContent = curText;
    if (navAudioTotalTime) navAudioTotalTime.textContent = totText;
    if (navAudioProgressFill) navAudioProgressFill.style.width = `${pct}%`;
  }

  function toggleAudio(forceState) {
    if (typeof forceState === 'boolean') {
      state.audioEnabled = forceState;
    } else {
      state.audioEnabled = !state.audioEnabled;
    }

    const speakerOn = document.querySelector('.icon-speaker-on');
    const speakerOff = document.querySelector('.icon-speaker-off');

    if (state.audioEnabled) {
      if (speakerOn) speakerOn.classList.remove('hidden');
      if (speakerOff) speakerOff.classList.add('hidden');
      if (audioHint) audioHint.classList.add('hidden');
      if (suzumeBadge) suzumeBadge.classList.add('playing');
      if (dockAudioBadge) dockAudioBadge.classList.add('playing');
      if (suzumeStatusText) suzumeStatusText.textContent = 'Playing ♪ RADWIMPS';
      if (hudAudioState) hudAudioState.textContent = 'RADWIMPS — Suzume (Playing)';

      if (suzumeAudio) {
        suzumeAudio.volume = 0.65;
        suzumeAudio.play().catch((e) => console.log('Audio playback deferred:', e));
      }
      try { synth.start(); } catch (e) {}
    } else {
      if (speakerOn) speakerOn.classList.add('hidden');
      if (speakerOff) speakerOff.classList.remove('hidden');
      if (suzumeBadge) suzumeBadge.classList.remove('playing');
      if (dockAudioBadge) dockAudioBadge.classList.remove('playing');
      if (suzumeStatusText) suzumeStatusText.textContent = 'Paused ♪ Click to Play';
      if (hudAudioState) hudAudioState.textContent = 'Muted';

      if (suzumeAudio) {
        suzumeAudio.pause();
      }
      try { synth.stop(); } catch (e) {}
    }
  }

  if (suzumeAudio) {
    suzumeAudio.addEventListener('timeupdate', updateAudioProgress);
    suzumeAudio.addEventListener('loadedmetadata', () => {
      const durText = formatAudioTime(suzumeAudio.duration);
      if (dockAudioTotalTime) dockAudioTotalTime.textContent = durText;
      if (navAudioTotalTime) navAudioTotalTime.textContent = durText;
    });
    suzumeAudio.addEventListener('play', () => {
      if (dockAudioBadge) dockAudioBadge.classList.add('playing');
      if (suzumeBadge) suzumeBadge.classList.add('playing');
      state.audioEnabled = true;
    });
    suzumeAudio.addEventListener('pause', () => {
      if (dockAudioBadge) dockAudioBadge.classList.remove('playing');
      if (suzumeBadge) suzumeBadge.classList.remove('playing');
    });
  }

  if (audioToggleBtn) audioToggleBtn.addEventListener('click', () => toggleAudio());
  if (audioHint) audioHint.addEventListener('click', () => toggleAudio(true));
  if (suzumeBadge) suzumeBadge.addEventListener('click', () => toggleAudio());
  if (dockAudioBadge) dockAudioBadge.addEventListener('click', () => toggleAudio());
  if (fxToggleBtn) fxToggleBtn.addEventListener('click', toggleCinemaFx);

  // ==========================================================================
  // RESONATOR PROFILE & ECHO SHOWCASE MODULE
  // ==========================================================================
  const RESONATORS = {
    rover: {
      id: 'rover',
      name: 'Rover',
      title: 'The Arbiter // Solaris-3 Origin',
      attribute: 'Havoc / Spectro',
      attributeClass: 'attr-havoc',
      weaponType: 'Sword',
      rarityTag: '5★ ARBITER',
      sectorTag: 'HUANGLONG // PANGU TERMINAL SYNCHRONIZED',
      primaryColor: '#e11d48',
      secondaryColor: '#38bdf8',
      glowColor: 'rgba(225, 29, 72, 0.45)',
      targetFrame: 225,
      soundFreq: 220,
      liberation: {
        name: 'Dead Heat // Spatial Collapse',
        percent: 94
      },
      forteCircuit: {
        name: 'Darkness Surge',
        percent: 88
      },
      concerto: {
        name: 'Outro Ready',
        percent: 100
      },
      echo: {
        name: 'Dreamless',
        grade: 'CALAMITY CLASS [4-COST]',
        sonata: 'Havoc Eclipse (5-Pc Set Active)',
        mainChip: 'HAVOC DMG +40.0%',
        skill: 'Summons the sovereign phantom of the Lament to slice through temporal space, dealing catastrophic Havoc damage.'
      },
      description: 'An enigmatic traveler awakening into the broken frequency of Solaris-3. Wields the Pangu Terminal and weightless aerial resonance to command colossal Echoes mid-air.'
    },
    jiyan: {
      id: 'jiyan',
      name: 'Jiyan',
      title: 'General of the Midnight Rangers // Dragon of Jingzhou',
      attribute: 'Aero',
      attributeClass: 'attr-aero',
      weaponType: 'Broadblade',
      rarityTag: '5★ QINGLOONG',
      sectorTag: 'JINZHOU // MIDNIGHT RANGERS COMMAND',
      primaryColor: '#10b981',
      secondaryColor: '#2dd4bf',
      glowColor: 'rgba(16, 185, 129, 0.45)',
      targetFrame: 45,
      soundFreq: 520,
      liberation: {
        name: 'Emerald Storm: Final Glory',
        percent: 98
      },
      forteCircuit: {
        name: 'Qingloong Wind Lance',
        percent: 90
      },
      concerto: {
        name: 'Outro Ready',
        percent: 100
      },
      echo: {
        name: 'Feilian Beringal',
        grade: 'OVERLORD CLASS [4-COST]',
        sonata: 'Sierra Gale (5-Pc Set Active)',
        mainChip: 'AERO DMG +40.0%',
        skill: 'Transforms into the roaring ape monarch, dealing crushing Aero impact and amplifying team Aero damage by 12%.'
      },
      description: 'Commander of the Midnight Rangers in Huanglong. Channels the mythical Qingloong dragon through wind-shearing lance strikes to protect the borders of Jingzhou.'
    },
    yinlin: {
      id: 'yinlin',
      name: 'Yinlin',
      title: 'Secret Investigator // Mistress of Zapstring',
      attribute: 'Electro',
      attributeClass: 'attr-electro',
      weaponType: 'Rectifier',
      rarityTag: '5★ PUPPETEER',
      sectorTag: 'JINZHOU PATROL // COVERT INVESTIGATION',
      primaryColor: '#c084fc',
      secondaryColor: '#f43f5e',
      glowColor: 'rgba(192, 132, 252, 0.45)',
      targetFrame: 150,
      soundFreq: 740,
      liberation: {
        name: 'Thundering Wrath // Marionette Overload',
        percent: 92
      },
      forteCircuit: {
        name: 'Judgment Mark',
        percent: 85
      },
      concerto: {
        name: 'Outro Ready',
        percent: 100
      },
      echo: {
        name: 'Thundering Mephis',
        grade: 'OVERLORD CLASS [4-COST]',
        sonata: 'Void Thunder (5-Pc Set Active)',
        mainChip: 'ELECTRO DMG +40.0%',
        skill: 'Strikes down with electric phantom claws, granting 12% Electro damage amplification and massive stagger.'
      },
      description: 'Former Patrol Investigator adept at manipulating electro-magnetic marionette threads. Deploys Zapstring to link enemies in devastating chain reactions.'
    },
    yangyang: {
      id: 'yangyang',
      name: 'Yangyang',
      title: 'Midnight Outrider // Feather of the Wind',
      attribute: 'Aero',
      attributeClass: 'attr-aero',
      weaponType: 'Sword',
      rarityTag: '4★ SENTINEL',
      sectorTag: 'HUANGLONG // FRONTIER SCOUT DIVISION',
      primaryColor: '#38bdf8',
      secondaryColor: '#a7f3d0',
      glowColor: 'rgba(56, 189, 248, 0.45)',
      targetFrame: 100,
      soundFreq: 660,
      liberation: {
        name: 'Song of Breeze & Cyclone',
        percent: 96
      },
      forteCircuit: {
        name: 'Echoing Plume',
        percent: 82
      },
      concerto: {
        name: 'Outro Ready',
        percent: 100
      },
      echo: {
        name: 'Aero Heron',
        grade: 'ELITE CLASS [3-COST]',
        sonata: 'Moonlit Clouds (5-Pc Set Active)',
        mainChip: 'ENERGY RECHARGE +28.0%',
        skill: 'Summons an avian vortex that gathers scattered foes while regenerating Concerto Energy for the next active Resonator.'
      },
      description: 'A gentle Midnight Outrider gifted with the power to communicate with ambient breezes. Restores team energy and groups enemies in high-pressure vortices.'
    },
    calcharo: {
      id: 'calcharo',
      name: 'Calcharo',
      title: 'Leader of the Ghost Hounds // Shadow Thunder',
      attribute: 'Electro',
      attributeClass: 'attr-electro',
      weaponType: 'Broadblade',
      rarityTag: '5★ MERCENARY',
      sectorTag: 'NEW FEDERATION // GHOST HOUNDS SYNDICATE',
      primaryColor: '#818cf8',
      secondaryColor: '#38bdf8',
      glowColor: 'rgba(129, 140, 248, 0.45)',
      targetFrame: 275,
      soundFreq: 330,
      liberation: {
        name: 'Phantom Etching // Death Blade',
        percent: 95
      },
      forteCircuit: {
        name: 'Hunting Mission Gauge',
        percent: 86
      },
      concerto: {
        name: 'Outro Ready',
        percent: 100
      },
      echo: {
        name: 'Tempest Mephis',
        grade: 'OVERLORD CLASS [4-COST]',
        sonata: 'Void Thunder (5-Pc Set Active)',
        mainChip: 'CRIT DMG +54.0%',
        skill: 'Conjures dark lightning scythes to shred enemy armor and supercharge heavy plunge attacks.'
      },
      description: 'Stern and ruthless commander of the Ghost Hounds mercenary syndicate. Channels dark electrostatic surges to unleash high-speed execution combos.'
    },
    chixia: {
      id: 'chixia',
      name: 'Chixia',
      title: 'Junior Patrol of Jinzhou // Blazing Pistols',
      attribute: 'Fusion',
      attributeClass: 'attr-fusion',
      weaponType: 'Pistols',
      rarityTag: '4★ VANGUARD',
      sectorTag: 'JINZHOU PATROL // RAPID RESPONSE FORCE',
      primaryColor: '#f97316',
      secondaryColor: '#f43f5e',
      glowColor: 'rgba(249, 115, 22, 0.45)',
      targetFrame: 20,
      soundFreq: 880,
      liberation: {
        name: 'Blazing Star Salvo',
        percent: 91
      },
      forteCircuit: {
        name: 'Thermobaric Bullets',
        percent: 89
      },
      concerto: {
        name: 'Outro Ready',
        percent: 100
      },
      echo: {
        name: 'Inferno Rider',
        grade: 'OVERLORD CLASS [4-COST]',
        sonata: 'Molten Rift (5-Pc Set Active)',
        mainChip: 'FUSION DMG +40.0%',
        skill: 'Rides a blazing demon motorcycle, crashing into waves of Tacet Discords with explosive Fusion bursts.'
      },
      description: 'A vivacious Jinzhou patrol officer full of heroism. Fires relentless rapid-fire rounds infused with scorching thermobaric resonance.'
    }
  };

  let activeResonatorId = 'rover';

  // Modal DOM elements
  const resonatorShowcaseModal = document.getElementById('resonatorShowcaseModal');
  const showcaseBackdrop = document.getElementById('showcaseBackdrop');
  const showcaseCloseBtn = document.getElementById('showcaseCloseBtn');
  const soundwaveTransition = document.getElementById('soundwaveTransition');
  const soundwaveStampText = document.getElementById('soundwaveStampText');
  const showcaseHarmonizeBtn = document.getElementById('showcaseHarmonizeBtn');
  const showcaseJumpFrameBtn = document.getElementById('showcaseJumpFrameBtn');

  // Dynamic fields
  const showcaseRarityTag = document.getElementById('showcaseRarityTag');
  const showcaseSectorTag = document.getElementById('showcaseSectorTag');
  const showcaseAttrText = document.getElementById('showcaseAttrText');
  const showcaseWeaponText = document.getElementById('showcaseWeaponText');
  const showcaseCharName = document.getElementById('showcaseCharName');
  const showcaseCharTitle = document.getElementById('showcaseCharTitle');
  const showcaseCharDesc = document.getElementById('showcaseCharDesc');

  const liberationSkillName = document.getElementById('liberationSkillName');
  const liberationValue = document.getElementById('liberationValue');
  const liberationBar = document.getElementById('liberationBar');

  const forteSkillName = document.getElementById('forteSkillName');
  const forteValue = document.getElementById('forteValue');
  const forteBar = document.getElementById('forteBar');

  const concertoSkillName = document.getElementById('concertoSkillName');
  const concertoValue = document.getElementById('concertoValue');
  const concertoBar = document.getElementById('concertoBar');

  const echoGradeTag = document.getElementById('echoGradeTag');
  const echoName = document.getElementById('echoName');
  const echoSonata = document.getElementById('echoSonata');
  const echoSkillDesc = document.getElementById('echoSkillDesc');
  const echoMainElemChip = document.getElementById('echoMainElemChip');

  const resonatorBgVideo = document.getElementById('resonatorBgVideo');
  const resonatorEnergyCanvas = document.getElementById('resonatorEnergyCanvas');
  let resEnergyCtx = null;
  let resEnergyParticles = [];

  function initResonatorEnergy() {
    if (!resonatorEnergyCanvas) return;
    resEnergyCtx = resonatorEnergyCanvas.getContext('2d');
    resizeResonatorEnergyCanvas();
    window.addEventListener('resize', resizeResonatorEnergyCanvas);

    resEnergyParticles = [];
    for (let i = 0; i < 40; i++) {
      resEnergyParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        angle: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 2.2,
        radius: 1.5 + Math.random() * 3,
        alpha: 0.2 + Math.random() * 0.7,
        length: 20 + Math.random() * 60
      });
    }
  }

  function resizeResonatorEnergyCanvas() {
    if (!resonatorEnergyCanvas) return;
    resonatorEnergyCanvas.width = window.innerWidth;
    resonatorEnergyCanvas.height = window.innerHeight;
  }

  function updateResonatorEnergy(time) {
    if (!resEnergyCtx || !resonatorEnergyCanvas) return;
    const w = resonatorEnergyCanvas.width;
    const h = resonatorEnergyCanvas.height;
    resEnergyCtx.clearRect(0, 0, w, h);

    const res = RESONATORS[activeResonatorId] || RESONATORS.rover;
    const primaryColor = res.primaryColor || '#38bdf8';

    for (let i = 0; i < resEnergyParticles.length; i++) {
      const p = resEnergyParticles[i];
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed - 0.4;
      p.angle += (Math.random() - 0.5) * 0.08;

      if (p.x < -40) p.x = w + 40;
      if (p.x > w + 40) p.x = -40;
      if (p.y < -40) p.y = h + 40;
      if (p.y > h + 40) p.y = -40;

      resEnergyCtx.save();
      resEnergyCtx.strokeStyle = primaryColor;
      resEnergyCtx.lineWidth = p.radius;
      resEnergyCtx.globalAlpha = p.alpha * 0.45;
      resEnergyCtx.shadowBlur = 12;
      resEnergyCtx.shadowColor = primaryColor;

      resEnergyCtx.beginPath();
      resEnergyCtx.moveTo(p.x, p.y);
      resEnergyCtx.lineTo(p.x - Math.cos(p.angle) * p.length, p.y - Math.sin(p.angle) * p.length);
      resEnergyCtx.stroke();
      resEnergyCtx.restore();
    }
  }

  function switchResonator(resonatorId, openModal = true) {
    const res = RESONATORS[resonatorId];
    if (!res) return;
    activeResonatorId = resonatorId;

    // 1. Update left sidebar slot buttons
    const slotBtns = document.querySelectorAll('.roster-slot-btn');
    slotBtns.forEach((btn) => {
      if (btn.dataset.resonator === resonatorId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 2. Set dynamic theme colors on root
    document.documentElement.style.setProperty('--resonator-primary', res.primaryColor);
    document.documentElement.style.setProperty('--resonator-secondary', res.secondaryColor);
    document.documentElement.style.setProperty('--resonator-glow', res.glowColor);

    // 3. Soundwave Slide Transition Wipe Effect
    if (soundwaveTransition) {
      if (soundwaveStampText) {
        soundwaveStampText.textContent = `HARMONIZING // ${res.name.toUpperCase()} [${res.attribute.toUpperCase()}]`;
      }
      soundwaveTransition.classList.remove('active');
      void soundwaveTransition.offsetWidth; // re-trigger reflow
      soundwaveTransition.classList.add('active');
      setTimeout(() => {
        soundwaveTransition.classList.remove('active');
      }, 760);
    }

    // 4. Play harmonic audio blip
    if (synth) {
      synth.playResonatorSwitchTune(res.soundFreq);
    }

    // 5. Smoothly jump/scrub background frame towards target narrative climax
    if (typeof res.targetFrame === 'number') {
      state.targetFrame = res.targetFrame;
      renderFrame(Math.round(res.targetFrame));
    }

    // 6. Populate Modal Data
    if (showcaseRarityTag) showcaseRarityTag.textContent = res.rarityTag;
    if (showcaseSectorTag) showcaseSectorTag.textContent = res.sectorTag;
    if (showcaseAttrText) showcaseAttrText.textContent = `Attribute: ${res.attribute}`;
    if (showcaseWeaponText) showcaseWeaponText.textContent = `Weapon: ${res.weaponType}`;
    if (showcaseCharName) showcaseCharName.textContent = res.name;
    if (showcaseCharTitle) showcaseCharTitle.textContent = res.title;
    if (showcaseCharDesc) showcaseCharDesc.textContent = res.description;

    if (liberationSkillName) liberationSkillName.textContent = res.liberation.name;
    if (liberationValue) liberationValue.textContent = `${res.liberation.percent}%`;
    if (liberationBar) liberationBar.style.width = `${res.liberation.percent}%`;

    if (forteSkillName) forteSkillName.textContent = res.forteCircuit.name;
    if (forteValue) forteValue.textContent = `${res.forteCircuit.percent}%`;
    if (forteBar) forteBar.style.width = `${res.forteCircuit.percent}%`;

    if (concertoSkillName) concertoSkillName.textContent = res.concerto.name;
    if (concertoValue) concertoValue.textContent = `${res.concerto.percent}% [READY]`;
    if (concertoBar) concertoBar.style.width = `${res.concerto.percent}%`;

    if (echoGradeTag) echoGradeTag.textContent = res.echo.grade;
    if (echoName) echoName.textContent = res.echo.name;
    if (echoSonata) echoSonata.textContent = res.echo.sonata;
    if (echoSkillDesc) echoSkillDesc.textContent = res.echo.skill;
    if (echoMainElemChip) echoMainElemChip.textContent = res.echo.mainChip;

    // 7. Open Modal if requested
    if (openModal && resonatorShowcaseModal) {
      resonatorShowcaseModal.classList.remove('hidden');
    }
  }

  function closeResonatorModal() {
    if (resonatorShowcaseModal) {
      resonatorShowcaseModal.classList.add('hidden');
    }
  }

  // Sidebar slot button listeners
  const rosterSlotBtns = document.querySelectorAll('.roster-slot-btn');
  rosterSlotBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const resId = btn.dataset.resonator;
      switchResonator(resId, true);
    });
  });

  // Story card click listeners to reveal that chapter's Resonator
  const stageCardMapping = {
    stage1: 'rover',
    stage2: 'jiyan',
    stage3: 'yinlin',
    stage4: 'rover',
    stage5: 'calcharo',
    stage6: 'yangyang'
  };

  Object.entries(stageCardMapping).forEach(([stageId, resKey]) => {
    const stageEl = document.getElementById(stageId);
    if (stageEl) {
      const card = stageEl.querySelector('.glass-card');
      if (card) {
        card.addEventListener('click', (e) => {
          // If clicked directly on an interactive button inside the card, don't hijack
          if (e.target.closest('button') || e.target.closest('a') || e.target.closest('select')) return;
          switchResonator(resKey, true);
        });
      }
    }
  });

  if (showcaseCloseBtn) showcaseCloseBtn.addEventListener('click', closeResonatorModal);
  if (showcaseBackdrop) showcaseBackdrop.addEventListener('click', closeResonatorModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeResonatorModal();
  });

  if (showcaseHarmonizeBtn) {
    showcaseHarmonizeBtn.addEventListener('click', () => {
      triggerTerminalGlitch();
      const res = RESONATORS[activeResonatorId];
      if (synth && res) synth.playResonatorSwitchTune(res.soundFreq * 1.5);
    });
  }

  if (showcaseJumpFrameBtn) {
    showcaseJumpFrameBtn.addEventListener('click', () => {
      const res = RESONATORS[activeResonatorId];
      if (res && typeof res.targetFrame === 'number') {
        jumpToFrame(res.targetFrame);
      }
      closeResonatorModal();
    });
  }

  // ==========================================================================
  // GAME ACTION • START THE GAME & VIDEO INTEGRATION
  // ==========================================================================
  const startGameBtn = document.getElementById('startGameBtn');
  const stageStartGameBtn = document.getElementById('stageStartGameBtn');
  const gameplayVideoSlot = document.getElementById('gameplayVideoSlot');
  const gameplayVideoPlayer = document.getElementById('gameplayVideoPlayer');
  const videoInteractivePoster = document.getElementById('videoInteractivePoster');
  const gameActionFeedStatus = document.getElementById('gameActionFeedStatus');
  const statusPulseDot = document.getElementById('statusPulseDot');
  const videoRecDot = document.getElementById('videoRecDot');
  const videoRecText = document.getElementById('videoRecText');

  let isGameVideoPlaying = false;
  let bgMusicWasPlayingBeforeVideo = false;

  function toggleGameVideo(forcePlay) {
    if (!gameplayVideoPlayer) return;

    const shouldPlay = typeof forcePlay === 'boolean' ? forcePlay : gameplayVideoPlayer.paused;

    if (shouldPlay) {
      // Lower background music so game combat audio is crystal clear
      if (suzumeAudio && !suzumeAudio.paused) {
        bgMusicWasPlayingBeforeVideo = true;
        suzumeAudio.volume = 0.15;
      }

      gameplayVideoPlayer.play().then(() => {
        isGameVideoPlaying = true;
        if (gameplayVideoSlot) gameplayVideoSlot.classList.add('video-active');
        if (videoInteractivePoster) videoInteractivePoster.classList.add('fade-out');
        if (startGameBtn) {
          startGameBtn.classList.add('video-playing');
          const title = startGameBtn.querySelector('.btn-title-main');
          if (title) title.textContent = 'STREAMING COMBAT FEED';
        }
        if (stageStartGameBtn) {
          stageStartGameBtn.classList.add('video-playing');
          const title = stageStartGameBtn.querySelector('.btn-title-main');
          if (title) title.textContent = 'STREAMING ACTIVE';
        }
        if (gameActionFeedStatus) gameActionFeedStatus.textContent = 'FEED ACTIVE // 60.0 FPS';
        if (statusPulseDot) statusPulseDot.classList.add('active');
        if (videoRecText) videoRecText.textContent = 'REC 60FPS';

        triggerTerminalGlitch();
      }).catch((err) => {
        console.log('Video autoplay error:', err);
      });
    } else {
      gameplayVideoPlayer.pause();
      isGameVideoPlaying = false;
      if (gameplayVideoSlot) gameplayVideoSlot.classList.remove('video-active');
      if (startGameBtn) {
        startGameBtn.classList.remove('video-playing');
        const title = startGameBtn.querySelector('.btn-title-main');
        if (title) title.textContent = 'START THE GAME';
      }
      if (stageStartGameBtn) {
        stageStartGameBtn.classList.remove('video-playing');
        const title = stageStartGameBtn.querySelector('.btn-title-main');
        if (title) title.textContent = 'START THE GAME';
      }
      if (gameActionFeedStatus) gameActionFeedStatus.textContent = 'PAUSED // CLICK TO RESUME';
      if (statusPulseDot) statusPulseDot.classList.remove('active');
      if (videoRecText) videoRecText.textContent = 'PAUSED';

      // Restore background music volume if it was ducked
      if (suzumeAudio && bgMusicWasPlayingBeforeVideo && state.audioEnabled) {
        suzumeAudio.volume = 0.65;
      }
    }
  }

  if (startGameBtn) {
    startGameBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleGameVideo();
    });
  }

  if (stageStartGameBtn) {
    stageStartGameBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // If modal is not open, open modal to the video section, or start video
      if (resonatorShowcaseModal && resonatorShowcaseModal.classList.contains('hidden')) {
        switchResonator('jiyan', true);
      }
      setTimeout(() => {
        toggleGameVideo(true);
        if (gameplayVideoSlot) {
          gameplayVideoSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 300);
    });
  }

  if (videoInteractivePoster) {
    videoInteractivePoster.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleGameVideo(true);
    });
  }

  if (gameplayVideoPlayer) {
    gameplayVideoPlayer.addEventListener('play', () => {
      if (videoInteractivePoster) videoInteractivePoster.classList.add('fade-out');
      if (gameplayVideoSlot) gameplayVideoSlot.classList.add('video-active');
      if (startGameBtn) startGameBtn.classList.add('video-playing');
      if (stageStartGameBtn) stageStartGameBtn.classList.add('video-playing');
      if (gameActionFeedStatus) gameActionFeedStatus.textContent = 'FEED ACTIVE // 60.0 FPS';
      if (statusPulseDot) statusPulseDot.classList.add('active');
      if (suzumeAudio && !suzumeAudio.paused) suzumeAudio.volume = 0.15;
    });

    gameplayVideoPlayer.addEventListener('pause', () => {
      if (startGameBtn) {
        startGameBtn.classList.remove('video-playing');
        const title = startGameBtn.querySelector('.btn-title-main');
        if (title) title.textContent = 'START THE GAME';
      }
      if (stageStartGameBtn) {
        stageStartGameBtn.classList.remove('video-playing');
        const title = stageStartGameBtn.querySelector('.btn-title-main');
        if (title) title.textContent = 'START THE GAME';
      }
      if (gameActionFeedStatus) gameActionFeedStatus.textContent = 'PAUSED // CLICK TO RESUME';
      if (statusPulseDot) statusPulseDot.classList.remove('active');
      if (suzumeAudio && state.audioEnabled) suzumeAudio.volume = 0.65;
    });
  }

  // Close modal helper handles pausing video
  function closeResonatorModal() {
    if (resonatorShowcaseModal) {
      resonatorShowcaseModal.classList.add('hidden');
    }
    if (gameplayVideoPlayer && !gameplayVideoPlayer.paused) {
      toggleGameVideo(false);
    }
  }

  // ==========================================================================
  // FINAL CLIMAX FOOTER CTA & WALLPAPER-STYLE CARD MODULE
  // ==========================================================================
  function initWallpaperCtaModule() {
    const wallpaperCard = document.getElementById('wallpaperCard');
    const wallpaperCtaSection = document.getElementById('wallpaperCtaSection');
    const pcPlatformBtn = document.getElementById('pcPlatformBtn');
    const androidPlatformBtn = document.getElementById('androidPlatformBtn');
    const iosPlatformBtn = document.getElementById('iosPlatformBtn');
    const ctaInstantHarmonizeBtn = document.getElementById('ctaInstantHarmonizeBtn');
    const ctaScrollTopBtn = document.getElementById('ctaScrollTopBtn');
    const stage7CtaJumpBtn = document.getElementById('stage7CtaJumpBtn');
    const navPlayAnywhereBtn = document.getElementById('navPlayAnywhereBtn');
    const ctaToastBanner = document.getElementById('ctaToastBanner');
    const ctaToastText = document.getElementById('ctaToastText');
    const wallpaperParticlesCanvas = document.getElementById('wallpaperParticlesCanvas');

    let toastTimeout = null;

    function showCtaToast(message) {
      if (!ctaToastBanner || !ctaToastText) return;
      ctaToastText.textContent = message;
      ctaToastBanner.classList.remove('hidden');

      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        ctaToastBanner.classList.add('hidden');
      }, 4200);
    }

    // Platform button click handlers with cyber audio feedback
    const platformConfigs = [
      {
        btn: pcPlatformBtn,
        name: 'PC Windows',
        message: '[SYS.LINK]: Initializing Windows PC Client Package (Direct / Epic Games)...',
        freq: 659.25
      },
      {
        btn: androidPlatformBtn,
        name: 'Google Play',
        message: '[SYS.LINK]: Redirecting to Google Play Store (Solaris-3 Mobile Client)...',
        freq: 783.99
      },
      {
        btn: iosPlatformBtn,
        name: 'App Store',
        message: '[SYS.LINK]: Authenticating Apple App Store Terminal (Retina HDR Client)...',
        freq: 880.00
      }
    ];

    platformConfigs.forEach(({ btn, name, message, freq }) => {
      if (!btn) return;

      btn.addEventListener('mouseenter', () => {
        if (state.audioEnabled && synth) {
          synth.playNote(freq, 0.08);
        }
      });

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.audioEnabled && synth) {
          synth.playNote(freq * 1.25, 0.22);
          setTimeout(() => { if (synth) synth.playNote(freq * 1.5, 0.28); }, 90);
        }
        showCtaToast(message);
      });
    });

    // Instant Harmonize & Launch Client button
    if (ctaInstantHarmonizeBtn) {
      ctaInstantHarmonizeBtn.addEventListener('mouseenter', () => {
        if (state.audioEnabled && synth) {
          synth.playNote(523.25, 0.09);
        }
      });

      ctaInstantHarmonizeBtn.addEventListener('click', () => {
        if (state.audioEnabled && synth) {
          synth.playLiberation();
        }
        showCtaToast('[SYS.LAUNCH]: Harmonizing frequency with Solaris-3 Global Relay Server... Launch Ready!');
      });
    }

    // Scroll back to top
    if (ctaScrollTopBtn) {
      ctaScrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    function scrollToCtaSection() {
      if (!wallpaperCtaSection) return;
      const topBannerHeight = 110;
      const y = wallpaperCtaSection.getBoundingClientRect().top + window.pageYOffset - topBannerHeight;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }

    // Jump from Stage 7 to CTA
    if (stage7CtaJumpBtn) {
      stage7CtaJumpBtn.addEventListener('click', scrollToCtaSection);
    }

    // Jump from Nav Bar to CTA
    if (navPlayAnywhereBtn) {
      navPlayAnywhereBtn.addEventListener('click', scrollToCtaSection);
    }

    // Ambient Stardust Particles Canvas inside Wallpaper Card
    if (wallpaperParticlesCanvas) {
      const ctx = wallpaperParticlesCanvas.getContext('2d');
      const particles = [];
      const PARTICLE_COUNT = 45;

      function resizeWallpaperCanvas() {
        const rect = wallpaperParticlesCanvas.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        wallpaperParticlesCanvas.width = (rect.width || 1200) * dpr;
        wallpaperParticlesCanvas.height = (rect.height || 600) * dpr;
      }

      resizeWallpaperCanvas();
      window.addEventListener('resize', resizeWallpaperCanvas, { passive: true });

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * (wallpaperParticlesCanvas.width || 1200),
          y: Math.random() * (wallpaperParticlesCanvas.height || 600),
          vx: (Math.random() - 0.5) * 0.45,
          vy: -0.2 - Math.random() * 0.55,
          size: 1 + Math.random() * 2.4,
          baseAlpha: 0.25 + Math.random() * 0.65,
          phase: Math.random() * Math.PI * 2,
          colorType: Math.random() > 0.45 ? 'cyan' : (Math.random() > 0.5 ? 'magenta' : 'gold')
        });
      }

      function drawWallpaperParticles() {
        if (!ctx) return;
        const w = wallpaperParticlesCanvas.width;
        const h = wallpaperParticlesCanvas.height;
        if (!w || !h) return;

        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.phase += 0.025;
          p.x += p.vx;
          p.y += p.vy;

          if (p.y < 0) {
            p.y = h + 10;
            p.x = Math.random() * w;
          }
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;

          const alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.phase));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

          if (p.colorType === 'cyan') {
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.shadowColor = '#38bdf8';
          } else if (p.colorType === 'magenta') {
            ctx.fillStyle = `rgba(244, 63, 94, ${alpha})`;
            ctx.shadowColor = '#f43f5e';
          } else {
            ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
            ctx.shadowColor = '#fbbf24';
          }
          ctx.shadowBlur = 8;
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        requestAnimationFrame(drawWallpaperParticles);
      }

      requestAnimationFrame(drawWallpaperParticles);
    }
  }

  // ==========================================================================
  // INTERACTIVE HEART CURSOR FOLLOWER & MOVEMENT SPARKLES ENGINE
  // ==========================================================================
  function initHeartCursorAndSparkles() {
    const follower = document.getElementById('cursorHeartFollower');
    const canvas = document.getElementById('heartSparklesCanvas');
    if (!follower || !canvas) return;

    try {
      document.documentElement.style.cursor = 'none';
      document.body.style.cursor = 'none';
    } catch (_) {}

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sprite Pre-Renderer for Maximum 60FPS Performance
    function generateHeartSprite(fillColor, glowColor) {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const sCtx = c.getContext('2d');
      sCtx.translate(32, 28);
      sCtx.shadowColor = glowColor;
      sCtx.shadowBlur = 12;

      sCtx.beginPath();
      // Smooth parametric heart curve
      for (let t = 0; t <= Math.PI * 2; t += 0.05) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const sx = x * 1.15;
        const sy = y * 1.15;
        if (t === 0) sCtx.moveTo(sx, sy);
        else sCtx.lineTo(sx, sy);
      }
      sCtx.closePath();
      sCtx.fillStyle = fillColor;
      sCtx.fill();

      // Outer crisp stroke
      sCtx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      sCtx.lineWidth = 1.4;
      sCtx.stroke();

      // Specular Highlight
      sCtx.shadowBlur = 0;
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      sCtx.beginPath();
      sCtx.arc(-5, -6, 3, 0, Math.PI * 2);
      sCtx.fill();

      return c;
    }

    function generateStarSprite(fillColor, glowColor) {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const sCtx = c.getContext('2d');
      sCtx.translate(32, 32);
      sCtx.shadowColor = glowColor;
      sCtx.shadowBlur = 14;

      sCtx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? 20 : 4.5;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) sCtx.moveTo(x, y);
        else sCtx.lineTo(x, y);
      }
      sCtx.closePath();
      sCtx.fillStyle = fillColor;
      sCtx.fill();

      sCtx.strokeStyle = '#ffffff';
      sCtx.lineWidth = 1.2;
      sCtx.stroke();

      sCtx.fillStyle = '#ffffff';
      sCtx.beginPath();
      sCtx.arc(0, 0, 3.4, 0, Math.PI * 2);
      sCtx.fill();

      return c;
    }

    // Palette: Neon Rose, Magenta, Cyan, Soft Peach, Pure White
    const sprites = {
      roseHeart: generateHeartSprite('#f43f5e', '#f43f5e'),
      magentaHeart: generateHeartSprite('#ec4899', '#ec4899'),
      cyanHeart: generateHeartSprite('#38bdf8', '#38bdf8'),
      peachHeart: generateHeartSprite('#fda4af', '#f43f5e'),
      whiteHeart: generateHeartSprite('#ffffff', '#fda4af'),
      cyanStar: generateStarSprite('#38bdf8', '#38bdf8'),
      roseStar: generateStarSprite('#f43f5e', '#f43f5e'),
      whiteStar: generateStarSprite('#ffffff', '#ffffff')
    };

    const heartSpriteKeys = ['roseHeart', 'magentaHeart', 'cyanHeart', 'peachHeart', 'whiteHeart'];
    const starSpriteKeys = ['cyanStar', 'roseStar', 'whiteStar'];

    function resizeSparkleCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeSparkleCanvas();
    window.addEventListener('resize', resizeSparkleCanvas, { passive: true });

    // Particle Array
    const particles = [];
    const MAX_PARTICLES = 180;

    let targetHeartX = window.innerWidth * 0.5;
    let targetHeartY = window.innerHeight * 0.45;
    let currentHeartX = targetHeartX;
    let currentHeartY = targetHeartY;
    let prevMoveX = targetHeartX;
    let prevMoveY = targetHeartY;
    let idleCounter = 0;

    follower.style.left = `${currentHeartX}px`;
    follower.style.top = `${currentHeartY}px`;

    function spawnSparkle(x, y, vx, vy, isStar = false, baseSize = null) {
      if (particles.length >= MAX_PARTICLES) particles.shift();

      let sprite;
      if (isStar) {
        sprite = sprites[starSpriteKeys[Math.floor(Math.random() * starSpriteKeys.length)]];
      } else {
        sprite = sprites[heartSpriteKeys[Math.floor(Math.random() * heartSpriteKeys.length)]];
      }

      const maxLife = 40 + Math.floor(Math.random() * 28);
      const size = baseSize || (18 + Math.random() * 16);

      particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: vx,
        vy: vy,
        gravity: -0.04 - Math.random() * 0.05, // gentle anime float upward
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        size: size,
        life: maxLife,
        maxLife: maxLife,
        sprite: sprite,
        baseAlpha: 0.88 + Math.random() * 0.12
      });
    }

    // Movement Listener
    function handlePointerMove(e) {
      if (!e) return;
      targetHeartX = e.clientX;
      targetHeartY = e.clientY;
      currentHeartX = e.clientX;
      currentHeartY = e.clientY;
      follower.style.left = `${targetHeartX}px`;
      follower.style.top = `${targetHeartY}px`;
      follower.classList.remove('hidden');

      const dx = e.clientX - prevMoveX;
      const dy = e.clientY - prevMoveY;
      const dist = Math.hypot(dx, dy);

      if (dist > 2) {
        // Spawn 2 to 6 sparkles per movement based on speed
        const spawnCount = Math.min(6, Math.max(2, Math.floor(dist / 6)));
        for (let i = 0; i < spawnCount; i++) {
          const spreadAngle = Math.random() * Math.PI * 2;
          const spreadSpeed = 0.6 + Math.random() * 2.8;
          // Inertia velocity away from cursor direction + random burst
          const vx = -(dx / dist) * 0.8 + Math.cos(spreadAngle) * spreadSpeed;
          const vy = -(dy / dist) * 0.8 + Math.sin(spreadAngle) * spreadSpeed - 0.5;
          const isStar = Math.random() < 0.3;
          spawnSparkle(e.clientX, e.clientY, vx, vy, isStar);
        }
        prevMoveX = e.clientX;
        prevMoveY = e.clientY;
      }

      // Check hovering on interactive elements
      const target = e.target;
      if (target && (target.closest('button') || target.closest('a') || target.closest('.glass-card') || target.closest('.platform-badge-btn') || target.closest('.roster-slot-btn') || target.closest('.timeline-track') || target.closest('.filter-select') || target.closest('.dock-mini-btn'))) {
        follower.classList.add('hovering');
      } else {
        follower.classList.remove('hovering');
      }
    }

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Click burst explosion
    window.addEventListener('pointerdown', (e) => {
      follower.classList.add('clicking');
      setTimeout(() => { follower.classList.remove('clicking'); }, 180);

      // Burst of 18-22 hearts and star sparkles radiating outwards
      const burstCount = 20;
      for (let i = 0; i < burstCount; i++) {
        const angle = (i / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const speed = 2.4 + Math.random() * 4.6;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 1.2;
        const isStar = Math.random() < 0.35;
        const size = 20 + Math.random() * 16;
        spawnSparkle(e.clientX, e.clientY, vx, vy, isStar, size);
      }
    });

    window.addEventListener('mouseleave', () => {
      follower.classList.add('hidden');
    });

    window.addEventListener('mouseenter', () => {
      follower.classList.remove('hidden');
    });

    // Render & Animation Loop
    function animateSparkles() {
      // Follower position
      follower.style.left = `${targetHeartX}px`;
      follower.style.top = `${targetHeartY}px`;

      // Ambient idle breathing sparkles
      idleCounter++;
      if (idleCounter % 16 === 0 && particles.length < MAX_PARTICLES) {
        const a = Math.random() * Math.PI * 2;
        const d = 4 + Math.random() * 12;
        spawnSparkle(
          currentHeartX + Math.cos(a) * d,
          currentHeartY + Math.sin(a) * d,
          (Math.random() - 0.5) * 0.7,
          -0.6 - Math.random() * 0.8,
          Math.random() < 0.3,
          14 + Math.random() * 8
        );
      }

      // Render Canvas Sparkles
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.rotation += p.vRot;

        const progress = p.life / p.maxLife; // 1 -> 0
        const scale = (p.size / 64) * Math.sin(progress * Math.PI * 0.9); // smooth pop in and scale down
        const alpha = Math.min(1, progress * 1.3) * p.baseAlpha;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(scale, scale);
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.drawImage(p.sprite, -32, -32);
        ctx.restore();
      }

      requestAnimationFrame(animateSparkles);
    }

    requestAnimationFrame(animateSparkles);
  }

  // --- INITIALIZATION ---
  function init() {
    initCinemaParticles();
    initResonatorEnergy();
    resizeCanvas();
    preloadAllFrames();
    initCardPhysics();
    initWallpaperCtaModule();
    initHeartCursorAndSparkles();
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
