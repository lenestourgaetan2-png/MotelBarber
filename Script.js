/**
 * MOTEL BARBER - IMMERSIVE EXPERIENCE SCRIPT
 * Bulletproof scroll-driven transitions and audio-visual fading.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Motel Barber - Immersive Teaser Loaded.');

    const visuelsSection = document.getElementById('visuels');
    const bgVideo = document.querySelector('.video-bg-blur');
    const fgVideo = document.querySelector('.video-fg');
    const videoContainer = document.querySelector('.video-bg-container');

    if (!visuelsSection || !bgVideo || !fgVideo || !videoContainer) return;

    // Ensure initial volume states
    bgVideo.muted = true; // Background blurred copy always fully muted
    fgVideo.muted = true; // Foreground copy starts muted for browser autoplay policy compliance
    fgVideo.volume = 0;

    // Force play on load (native autoplay handles this, but we reinforce it safely)
    const forcePlay = () => {
        if (bgVideo.paused) bgVideo.play().catch(err => console.log('BG play deferred:', err));
        if (fgVideo.paused) fgVideo.play().catch(err => console.log('FG play deferred:', err));
    };
    forcePlay();

    let hasInteracted = false;

    // Handle user gesture to safely un-mute foreground video
    const enableAudio = () => {
        if (hasInteracted) return;
        hasInteracted = true;
        
        // Unmute the foreground video (volume is still controlled by scroll)
        fgVideo.muted = false;
        
        // Ensure both videos are playing in case browser paused them
        forcePlay();
        
        // Remove listeners
        window.removeEventListener('click', enableAudio);
        window.removeEventListener('touchstart', enableAudio);
        console.log('Audio unmuted via user gesture.');
        
        // Instantly trigger scroll update to adjust volume to correct scroll value
        updateScrollEffects();
    };

    // Listen for true user gestures to unmute (scrolling is NOT a valid gesture for audio)
    window.addEventListener('click', enableAudio);
    window.addEventListener('touchstart', enableAudio, { passive: true });

    // Sync times once every 1000ms instead of 60fps to prevent decoder overload and stutters
    setInterval(() => {
        if (!bgVideo.paused && !fgVideo.paused) {
            const diff = Math.abs(bgVideo.currentTime - fgVideo.currentTime);
            if (diff > 0.3) {
                bgVideo.currentTime = fgVideo.currentTime;
            }
        }
    }, 1000);

    // Play/Pause class toggle for text animations only (keeps video playback bulletproof)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visuelsSection.classList.add('visible');
                // Safely ensure video is playing when user scrolls into view
                forcePlay();
            } else {
                visuelsSection.classList.remove('visible');
            }
        });
    }, { threshold: 0.05 });

    observer.observe(visuelsSection);

    // Smooth Scroll Dynamics (Volume, Opacity & Multi-Layer Parallax)
    const updateScrollEffects = () => {
        const scrollY = window.scrollY;

        // --- 1. HERO PARALLAX LAYER ---
        if (scrollY < window.innerHeight) {
            const heroLogo = document.querySelector('.hero-logo-container');
            const heroTitle = document.querySelector('.hero-title');
            
            if (heroLogo) {
                // Slides down slower, creating depth overlay
                heroLogo.style.transform = `translateY(${scrollY * 0.18}px)`;
            }
            if (heroTitle) {
                // Slides down slightly slower than logo, creating multi-layered speed depth
                heroTitle.style.transform = `translateY(${scrollY * 0.12}px)`;
            }
        }

        // --- 2. IMMERSIVE VIDEO CARD PARALLAX ---
        const rect = visuelsSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Calculate entrance ratio (0 to 1 as it scrolls in from bottom)
        let enterRatio = 1 - (rect.top / viewportHeight);
        enterRatio = Math.max(0, Math.min(1, enterRatio));

        // Calculate exit ratio (1 to 0 as it scrolls out of top)
        let exitRatio = 1 + (rect.top / rect.height);
        exitRatio = Math.max(0, Math.min(1, exitRatio));

        // Combined dynamic ratio
        let activeRatio = Math.min(enterRatio, exitRatio);

        // Apply visual and acoustic fade using smooth cubic function for premium feeling
        const smoothRatio = Math.pow(activeRatio, 1.5);

        // Set opacity of the video layout
        videoContainer.style.opacity = smoothRatio;

        // Set volume of the foreground video (clamp between 0 and 1)
        if (!fgVideo.muted) {
            fgVideo.volume = smoothRatio;
        }

        // Layer A: Zoom and vertical translation of the entire floating container
        const scaleVal = 0.92 + (smoothRatio * 0.08); // goes from 0.92 to 1.0
        const cardTranslateY = (1 - activeRatio) * 55; // slides down slightly when offscreen
        videoContainer.style.transform = `translate(-50%, calc(-50% + ${cardTranslateY}px)) scale(${scaleVal})`;

        // Layer B: Opposite vertical translation for the background blurred video inside the container
        const bgTranslateY = (activeRatio - 1) * 25; // vertical drifting parallax inside the card
        bgVideo.style.transform = `scale(1.15) translateY(${bgTranslateY}px)`;
    };

    window.addEventListener('scroll', updateScrollEffects, { passive: true });
    window.addEventListener('resize', updateScrollEffects, { passive: true });
    
    // Initial call to set correct states on load
    updateScrollEffects();
});
