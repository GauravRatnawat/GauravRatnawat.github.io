// ===================================
// Pipeline Navigation System - Fade In/Fade Out
// ===================================

(function() {
    'use strict';

    let currentSectionIndex = 0;
    const sections = [
        { id: 'about', label: '1', name: 'About' },
        { id: 'skills', label: '2', name: 'Skills' },
        { id: 'experience', label: '3', name: 'Experience' },
        { id: 'projects', label: '4', name: 'Projects' },
        { id: 'contact', label: '5', name: 'Contact' }
    ];

    let isTransitioning = false;

    function initPipelineNavigation() {
        // Create navigation controls
        createFlowIndicator();
        createNavigationArrows();

        // Initialize first section
        showSection(0, false);

        // Handle navigation link clicks
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                const sectionIndex = sections.findIndex(s => s.id === targetSection);
                if (sectionIndex !== -1) {
                    navigateToSection(sectionIndex);
                }
            });
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (isTransitioning) return;

            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                navigateNext();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                navigatePrev();
            }
        });

        // Handle pipeline node clicks
        const pipelineNodes = document.querySelectorAll('.interactive-node');
        pipelineNodes.forEach((node) => {
            node.addEventListener('click', () => {
                const targetSection = node.getAttribute('data-section');
                const sectionIndex = sections.findIndex(s => s.id === targetSection);
                if (sectionIndex !== -1) {
                    navigateToSection(sectionIndex);
                }
            });
        });
    }

    function createFlowIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'pipeline-flow-indicator';
        indicator.innerHTML = sections.map((section, index) => `
            <div class="flow-step ${index === 0 ? 'active' : ''}" 
                 data-index="${index}" 
                 data-label="${section.name}">
                ${section.label}
            </div>
        `).join('');

        document.body.appendChild(indicator);

        // Add click handlers
        const flowSteps = indicator.querySelectorAll('.flow-step');
        flowSteps.forEach((step) => {
            step.addEventListener('click', () => {
                const index = parseInt(step.getAttribute('data-index'));
                navigateToSection(index);
            });
        });
    }

    function createNavigationArrows() {
        const arrows = document.createElement('div');
        arrows.className = 'pipeline-nav-arrows';
        arrows.innerHTML = `
            <button class="pipeline-nav-btn" id="prev-section" disabled>
                ←
            </button>
            <div class="section-counter">
                <span class="current">1</span> / ${sections.length}
            </div>
            <button class="pipeline-nav-btn" id="next-section">
                →
            </button>
        `;

        document.body.appendChild(arrows);

        // Add click handlers
        document.getElementById('prev-section').addEventListener('click', navigatePrev);
        document.getElementById('next-section').addEventListener('click', navigateNext);
    }

    function navigateToSection(index) {
        if (index === currentSectionIndex || isTransitioning) return;
        if (index < 0 || index >= sections.length) return;

        const direction = index > currentSectionIndex ? 'forward' : 'backward';
        showSection(index, true, direction);
        currentSectionIndex = index;

        // Update active states
        updateNavigationStates();
    }

    function navigateNext() {
        if (currentSectionIndex < sections.length - 1) {
            navigateToSection(currentSectionIndex + 1);
        }
    }

    function navigatePrev() {
        if (currentSectionIndex > 0) {
            navigateToSection(currentSectionIndex - 1);
        }
    }

    function showSection(index, animate = true, direction = 'forward') {
        if (isTransitioning) return;

        const sectionId = sections[index].id;
        const targetSection = document.getElementById(sectionId);
        if (!targetSection) return;

        isTransitioning = true;

        // Get current active section
        const currentSection = document.querySelector('.section.active');

        // Simple instant switch - no animations
        if (currentSection) {
            currentSection.classList.remove('active');
        }
        targetSection.classList.add('active');
        isTransitioning = false;
    }

    function updateNavigationStates() {
        // Update flow indicator
        const flowSteps = document.querySelectorAll('.flow-step');
        flowSteps.forEach((step, index) => {
            if (index === currentSectionIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            if (index === currentSectionIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update arrow buttons
        const prevBtn = document.getElementById('prev-section');
        const nextBtn = document.getElementById('next-section');
        const counter = document.querySelector('.section-counter .current');

        if (prevBtn) {
            prevBtn.disabled = currentSectionIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = currentSectionIndex === sections.length - 1;
        }
        if (counter) {
            counter.textContent = currentSectionIndex + 1;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPipelineNavigation);
    } else {
        initPipelineNavigation();
    }

    // ===================================
    // Mobile Menu Toggle
    // ===================================
    function initMobileMenu() {
        const controlPanel = document.querySelector('.control-panel');
        const navLinks = document.querySelector('.nav-links');

        if (!controlPanel || !navLinks) return;

        // Create hamburger menu button
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
        menuToggle.innerHTML = '<span class="hamburger-icon"></span>';

        // Insert after nav-brand
        const navBrand = document.querySelector('.nav-brand');
        if (navBrand) {
            navBrand.after(menuToggle);
        }

        // Toggle menu on click
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('mobile-active');
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking a link
        const navLinkItems = navLinks.querySelectorAll('.nav-link');
        navLinkItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
                menuToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!controlPanel.contains(e.target)) {
                navLinks.classList.remove('mobile-active');
                menuToggle.classList.remove('active');
            }
        });
    }

    // Initialize mobile menu
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }

})();
