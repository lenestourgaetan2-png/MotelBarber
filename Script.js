/**
 * MOTEL BARBER - IMMERSIVE EXPERIENCE SCRIPT
 * Bulletproof scroll-driven transitions and audio-visual fading.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Motel Barber - Script Loaded.');

    // --- 1. GENERAL FLOATING IMAGES PARALLAX ---
    const floatingImages = document.querySelectorAll('.floating-img');
    
    const updateGeneralParallax = () => {
        const scrollY = window.scrollY;
        
        // Parallax for floating images
        floatingImages.forEach(img => {
            const speed = parseFloat(img.getAttribute('data-speed')) || 0;
            // Only apply parallax on desktop/tablet (viewport width > 900px)
            if (window.innerWidth > 900) {
                img.style.transform = `translateY(${scrollY * speed}px)`;
            } else {
                img.style.transform = 'none';
            }
        });

        // --- 2. HERO PARALLAX LAYER (Accueil only) ---
        if (scrollY < window.innerHeight) {
            const heroLogo = document.querySelector('.hero-logo-container');
            const heroTitle = document.querySelector('.hero-title');
            
            if (heroLogo) {
                heroLogo.style.transform = `translateY(${scrollY * 0.18}px)`;
            }
            if (heroTitle) {
                heroTitle.style.transform = `translateY(${scrollY * 0.12}px)`;
            }
        }
    };

    window.addEventListener('scroll', updateGeneralParallax, { passive: true });
    window.addEventListener('resize', updateGeneralParallax, { passive: true });
    updateGeneralParallax();

    // --- 3. IMMERSIVE VIDEO CARD PARALLAX (Accueil only) ---
    const visuelsSection = document.getElementById('visuels');
    const bgVideo = document.querySelector('.video-bg-blur');
    const fgVideo = document.querySelector('.video-fg');
    const videoContainer = document.querySelector('.video-bg-container');

    if (visuelsSection && bgVideo && fgVideo && videoContainer) {
        // Ensure initial volume states
        bgVideo.muted = true;
        fgVideo.muted = true;
        fgVideo.volume = 0;

        const forcePlay = () => {
            if (bgVideo.paused) bgVideo.play().catch(err => console.log('BG play deferred:', err));
            if (fgVideo.paused) fgVideo.play().catch(err => console.log('FG play deferred:', err));
        };
        forcePlay();

        let hasInteracted = false;

        const enableAudio = () => {
            if (hasInteracted) return;
            hasInteracted = true;
            fgVideo.muted = false;
            forcePlay();
            
            window.removeEventListener('click', enableAudio);
            window.removeEventListener('touchstart', enableAudio);
            console.log('Audio unmuted via user gesture.');
            updateVideoScroll();
        };

        window.addEventListener('click', enableAudio);
        window.addEventListener('touchstart', enableAudio, { passive: true });

        setInterval(() => {
            if (!bgVideo.paused && !fgVideo.paused) {
                const diff = Math.abs(bgVideo.currentTime - fgVideo.currentTime);
                if (diff > 0.3) {
                    bgVideo.currentTime = fgVideo.currentTime;
                }
            }
        }, 1000);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    visuelsSection.classList.add('visible');
                    forcePlay();
                } else {
                    visuelsSection.classList.remove('visible');
                }
            });
        }, { threshold: 0.05 });

        observer.observe(visuelsSection);

        const updateVideoScroll = () => {
            const rect = visuelsSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            let enterRatio = 1 - (rect.top / viewportHeight);
            enterRatio = Math.max(0, Math.min(1, enterRatio));

            let exitRatio = 1 + (rect.top / rect.height);
            exitRatio = Math.max(0, Math.min(1, exitRatio));

            let activeRatio = Math.min(enterRatio, exitRatio);
            const smoothRatio = Math.pow(activeRatio, 1.5);

            videoContainer.style.opacity = smoothRatio;

            if (!fgVideo.muted) {
                fgVideo.volume = smoothRatio;
            }

            const scaleVal = 0.92 + (smoothRatio * 0.08);
            const cardTranslateY = (1 - activeRatio) * 55;
            videoContainer.style.transform = `translate(-50%, calc(-50% + ${cardTranslateY}px)) scale(${scaleVal})`;

            const bgTranslateY = (activeRatio - 1) * 25;
            bgVideo.style.transform = `scale(1.15) translateY(${bgTranslateY}px)`;
        };

        window.addEventListener('scroll', updateVideoScroll, { passive: true });
        window.addEventListener('resize', updateVideoScroll, { passive: true });
        updateVideoScroll();
    }
});
