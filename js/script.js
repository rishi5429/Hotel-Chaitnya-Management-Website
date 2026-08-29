/**
 * Chaitanya — Wine Bar & Restaurant
 * Interaction layer (vanilla JS, no dependencies)
 */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    /* ----------------------------------------------------------------------
     * 0. Theme preference
     * -------------------------------------------------------------------- */
    const themeToggle = document.getElementById('themeToggle');
    const pageRoot = document.documentElement;

    function setTheme(theme, persist = true) {
        const isDark = theme === 'dark';
        pageRoot.dataset.theme = isDark ? 'dark' : 'light';
        if (themeToggle) {
            const label = `Switch to ${isDark ? 'light' : 'dark'} mode`;
            themeToggle.setAttribute('aria-label', label);
            themeToggle.setAttribute('title', label);
            themeToggle.setAttribute('aria-pressed', String(isDark));
        }
        if (persist) {
            try {
                localStorage.setItem('chaitanya-theme', isDark ? 'dark' : 'light');
            } catch (error) {
                // The website remains usable when storage is unavailable.
            }
        }
    }

    setTheme(pageRoot.dataset.theme === 'dark' ? 'dark' : 'light', false);

    // Auto-set copyright year
    const copyrightYearEl = document.getElementById('copyrightYear');
    if (copyrightYearEl) copyrightYearEl.textContent = new Date().getFullYear();
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTheme(pageRoot.dataset.theme === 'dark' ? 'light' : 'dark');
        });
    }

    /* ----------------------------------------------------------------------
     * 1. Scroll: progress bar, header state, back-to-top, active nav link
     * -------------------------------------------------------------------- */
    const scrollProgress = document.getElementById('scrollProgress');
    const mainHeader = document.getElementById('mainHeader');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    let scrollTicking = false;

    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        if (scrollProgress) {
            scrollProgress.style.width = scrollHeight > 0 ? `${(scrollTop / scrollHeight) * 100}%` : '0%';
        }

        if (mainHeader) {
            mainHeader.classList.toggle('scrolled', scrollTop > 50);
        }

        if (backToTopBtn) {
            backToTopBtn.classList.toggle('visible', scrollTop > 400);
        }

        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 140;
            if (scrollTop >= sectionTop && scrollTop < sectionTop + section.offsetHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${currentSectionId}`;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        scrollTicking = false;
    }

    window.addEventListener('scroll', function () {
        if (!scrollTicking) {
            window.requestAnimationFrame(handleScroll);
            scrollTicking = true;
        }
    }, { passive: true });
    handleScroll();

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ----------------------------------------------------------------------
     * 2. Mobile navigation drawer
     * -------------------------------------------------------------------- */
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    let mobileNavTrigger = null;

    function toggleMobileNav(show, returnFocus = true) {
        if (!mobileNavOverlay) return;
        if (show) mobileNavTrigger = document.activeElement;
        mobileNavOverlay.classList.toggle('open', show);
        mobileNavOverlay.setAttribute('aria-hidden', String(!show));
        if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', String(show));
        document.body.style.overflow = show ? 'hidden' : '';
        if (show) {
            const closeButton = mobileNavOverlay.querySelector('button, a[href]');
            if (closeButton) closeButton.focus();
        } else if (returnFocus && mobileNavTrigger instanceof HTMLElement) {
            mobileNavTrigger.focus();
            mobileNavTrigger = null;
        }
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => toggleMobileNav(true));
    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', () => toggleMobileNav(false));
    mobileLinks.forEach(link => link.addEventListener('click', () => toggleMobileNav(false, false)));

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', function (e) {
            if (e.target === this) toggleMobileNav(false);
        });
    }

    /* ----------------------------------------------------------------------
     * 3. Scroll-reveal animations
     * -------------------------------------------------------------------- */
    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('active'));
    }

    /* ----------------------------------------------------------------------
     * 4. Menu category filter tabs
     * -------------------------------------------------------------------- */
    const menuTabBtns = document.querySelectorAll('.menu-tab-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    menuTabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            menuTabBtns.forEach(b => b.classList.remove('active'));
            menuTabBtns.forEach(b => b.setAttribute('aria-pressed', String(b === this)));
            this.classList.add('active');

            const category = this.getAttribute('data-category');

            menuCards.forEach(card => {
                const match = category === 'all' || card.getAttribute('data-category') === category;
                if (match) {
                    card.style.display = 'flex';
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(16px)';
                    setTimeout(() => { card.style.display = 'none'; }, 280);
                }
            });
        });
    });

    /* ----------------------------------------------------------------------
     * 5. Generic modal helper
     * -------------------------------------------------------------------- */
    function toggleModal(modal, show, returnFocus = true) {
        if (!modal) return;
        if (show) modal._triggerElement = document.activeElement;
        modal.classList.toggle('show', show);
        modal.setAttribute('aria-hidden', String(!show));
        document.body.style.overflow = show ? 'hidden' : '';
        if (show) {
            const closeButton = modal.querySelector('button[aria-label^="Close"]');
            if (closeButton) closeButton.focus();
        } else if (returnFocus && modal._triggerElement instanceof HTMLElement) {
            modal._triggerElement.focus();
        }
    }

    /* ----------------------------------------------------------------------
     * 6. Full menu modal
     * -------------------------------------------------------------------- */
    const fullMenuModal = document.getElementById('fullMenuModal');
    const openFullMenuBtn = document.getElementById('openFullMenuBtn');
    const closeFullMenuModal = document.getElementById('closeFullMenuModal');
    const fullTabs = document.querySelectorAll('.full-tab');
    const fullCategoryPanes = document.querySelectorAll('.full-category-pane');

    if (openFullMenuBtn) openFullMenuBtn.addEventListener('click', () => toggleModal(fullMenuModal, true));
    if (closeFullMenuModal) closeFullMenuModal.addEventListener('click', () => toggleModal(fullMenuModal, false));

    fullTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            fullTabs.forEach(t => t.classList.remove('active'));
            fullCategoryPanes.forEach(pane => pane.classList.remove('active'));
            this.classList.add('active');
            const targetPane = document.getElementById(this.getAttribute('data-target'));
            if (targetPane) targetPane.classList.add('active');
        });
    });

    /* ----------------------------------------------------------------------
     * 7. Reservation modal
     * -------------------------------------------------------------------- */
    const reservationModal = document.getElementById('reservationModal');
    const closeReservationModal = document.getElementById('closeReservationModal');
    const reservationForm = document.getElementById('reservationForm');
    const reserveDateInput = document.getElementById('reserveDate');

    const reserveButtons = [
        document.getElementById('headerReserveBtn'),
        document.getElementById('mobileReserveBtn'),
        document.getElementById('heroReserveBtn'),
        document.getElementById('ctaReserveBtn'),
        document.getElementById('menuBookTableBtn')
    ];

    // Date input: today onwards
    if (reserveDateInput) {
        const today = getLocalDateString();
        reserveDateInput.setAttribute('min', today);
        reserveDateInput.value = today;
    }

    reserveButtons.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleModal(fullMenuModal, false, false);
            toggleMobileNav(false);
            toggleModal(reservationModal, true);
        });
    });

    // "Reserve" on a specific dish pre-fills the notes field
    document.querySelectorAll('.reserve-this-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const dishName = this.getAttribute('data-item');
            const reserveNotes = document.getElementById('reserveNotes');
            if (reserveNotes && dishName) {
                reserveNotes.value = `Pre-order request: ${dishName}`;
            }
            toggleModal(reservationModal, true);
        });
    });

    if (closeReservationModal) {
        closeReservationModal.addEventListener('click', () => toggleModal(reservationModal, false));
    }

    // Click outside content closes modals
    [reservationModal, fullMenuModal].forEach(modal => {
        if (!modal) return;
        modal.addEventListener('click', function (e) {
            if (e.target === this) toggleModal(this, false);
        });
    });

    if (reservationForm) {
        reservationForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!reservationForm.reportValidity()) {
                return;
            }

            const name = document.getElementById('reserveName').value.trim();
            const phone = document.getElementById('reservePhone').value.trim();
            const email = document.getElementById('reserveEmail').value.trim();
            const date = document.getElementById('reserveDate').value;
            const time = document.getElementById('reserveTime').value;
            const guests = document.getElementById('reserveGuests').value;
            const diningArea = reservationForm.querySelector('input[name="diningArea"]:checked').value;
            const notes = document.getElementById('reserveNotes').value.trim();
            const reservationDetails = [
                'Hello Chaitanya, I would like to reserve a table.',
                `Name: ${name}`,
                `Phone: ${phone}`,
                email ? `Email: ${email}` : '',
                `Guests: ${guests}`,
                `Date: ${date}`,
                `Time: ${time}`,
                `Seating: ${diningArea}`,
                notes ? `Special requests: ${notes}` : ''
            ].filter(Boolean).join('\n');

            window.open(`https://wa.me/919922383501?text=${encodeURIComponent(reservationDetails)}`, '_blank', 'noopener,noreferrer')
                || (window.location.href = `https://wa.me/919922383501?text=${encodeURIComponent(reservationDetails)}`);
            toggleModal(reservationModal, false);
            reservationForm.reset();
            if (reserveDateInput) reserveDateInput.value = getLocalDateString();

            showToast('Your reservation details are ready to send to our team.', 'WhatsApp opened.');
        });
    }

    /* ----------------------------------------------------------------------
     * 8. Gallery lightbox
     * -------------------------------------------------------------------- */
    const galleryCards = document.querySelectorAll('.gallery-card');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeLightboxBtn = document.getElementById('closeLightboxBtn');
    const prevLightboxBtn = document.getElementById('prevLightboxBtn');
    const nextLightboxBtn = document.getElementById('nextLightboxBtn');

    let currentGalleryIndex = 0;
    const galleryItemsData = [];

    galleryCards.forEach((card, index) => {
        galleryItemsData.push({
            src: card.getAttribute('data-img'),
            caption: card.getAttribute('data-caption')
        });

        card.addEventListener('click', () => {
            currentGalleryIndex = index;
            updateLightbox();
            toggleModal(lightboxModal, true);
        });
    });

    function updateLightbox() {
        const item = galleryItemsData[currentGalleryIndex];
        if (item && lightboxImg) {
            lightboxImg.src = item.src;
            lightboxImg.alt = item.caption || 'Gallery image';
            if (lightboxCaption) lightboxCaption.textContent = item.caption || '';
        }
    }

    function stepLightbox(step) {
        currentGalleryIndex = (currentGalleryIndex + step + galleryItemsData.length) % galleryItemsData.length;
        updateLightbox();
    }

    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', () => toggleModal(lightboxModal, false));
    if (prevLightboxBtn) prevLightboxBtn.addEventListener('click', () => stepLightbox(-1));
    if (nextLightboxBtn) nextLightboxBtn.addEventListener('click', () => stepLightbox(1));

    if (lightboxModal) {
        lightboxModal.addEventListener('click', function (e) {
            if (e.target === this) toggleModal(this, false);
        });
    }

    /* ----------------------------------------------------------------------
     * 9. Global keyboard controls (Escape / arrows)
     * -------------------------------------------------------------------- */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            toggleModal(lightboxModal, false);
            toggleModal(reservationModal, false);
            toggleModal(fullMenuModal, false);
            toggleMobileNav(false);
            return;
        }
        if (lightboxModal && lightboxModal.classList.contains('show')) {
            if (e.key === 'ArrowLeft') stepLightbox(-1);
            if (e.key === 'ArrowRight') stepLightbox(1);
        }

        const openModal = document.querySelector('.modal-backdrop.show, .lightbox-backdrop.show');
        if (e.key === 'Tab' && openModal) {
            const focusable = [...openModal.querySelectorAll('button:not([disabled]), [href], input, select, textarea')]
                .filter(element => !element.hasAttribute('hidden'));
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    /* ----------------------------------------------------------------------
     * 10. Testimonials slider (auto-rotate, pause on hover)
     * -------------------------------------------------------------------- */
    const testimonialTrack = document.getElementById('testimonialTrack');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const prevTestimonial = document.getElementById('prevTestimonial');
    const nextTestimonial = document.getElementById('nextTestimonial');
    const testimonialDotsContainer = document.getElementById('testimonialDots');

    let currentSlide = 0;
    const totalSlides = testimonialCards.length;

    if (testimonialDotsContainer && totalSlides > 0) {
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to review ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            testimonialDotsContainer.appendChild(dot);
        }
    }

    function goToSlide(index) {
        currentSlide = index;
        if (testimonialTrack) {
            testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        document.querySelectorAll('.slider-dots .dot').forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlide);
        });
    }

    if (prevTestimonial) {
        prevTestimonial.addEventListener('click', () => goToSlide((currentSlide - 1 + totalSlides) % totalSlides));
    }
    if (nextTestimonial) {
        nextTestimonial.addEventListener('click', () => goToSlide((currentSlide + 1) % totalSlides));
    }

    let sliderPaused = false;
    const sliderContainer = document.querySelector('.testimonial-slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => { sliderPaused = true; });
        sliderContainer.addEventListener('mouseleave', () => { sliderPaused = false; });
        sliderContainer.addEventListener('focusin', () => { sliderPaused = true; });
        sliderContainer.addEventListener('focusout', () => { sliderPaused = false; });
    }

    if (totalSlides > 1) {
        setInterval(() => {
            if (!sliderPaused && !document.hidden) {
                goToSlide((currentSlide + 1) % totalSlides);
            }
        }, 7000);
    }

    /* ----------------------------------------------------------------------
     * 11. Contact & newsletter forms
     * -------------------------------------------------------------------- */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!contactForm.reportValidity()) return;
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                showToast('Please fill in your name, email and message.');
                return;
            }

            const subject = document.getElementById('subject').value.trim() || 'Enquiry from the Chaitanya website';
            const emailBody = `Name: ${name}\nEmail: ${email}\n\n${message}`;
            const mailtoUrl = `mailto:reservations@hotelchaitanya.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
            window.location.href = mailtoUrl;
            contactForm.reset();
            showToast('Your email client should open with a pre-filled message. If it does not, please copy the details and email us directly.', 'Email draft ready');
        });
    }

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.validity.valid) {
                showToast('Newsletter subscriptions are not yet active. Thank you for your interest.', 'Coming soon');
                newsletterForm.reset();
            } else {
                showToast('Please enter a valid email address.');
            }
        });
    }

    /* ----------------------------------------------------------------------
     * 12. Toast notifications
     * -------------------------------------------------------------------- */
    function getLocalDateString() {
        const date = new Date();
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().split('T')[0];
    }

    function showToast(message, heading = '') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        const content = document.createElement('div');
        if (heading) {
            const title = document.createElement('strong');
            title.textContent = heading;
            content.appendChild(title);
            content.append(' ');
        }
        content.append(document.createTextNode(message));
        toast.appendChild(content);
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(30px)';
            setTimeout(() => toast.remove(), 320);
        }, 5200);
    }
});
