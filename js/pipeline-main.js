// ===================================
// Pipeline Portfolio - Main JavaScript
// Enhanced with Performance & Accessibility Fixes
// ===================================

(function() {
    'use strict';

    // ===================================
    // Utility Functions (Inline)
    // ===================================

    const Utils = {
        throttle(func, delay) {
            let timeoutId;
            let lastRan;
            return function(...args) {
                if (!lastRan) {
                    func.apply(this, args);
                    lastRan = Date.now();
                } else {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        if ((Date.now() - lastRan) >= delay) {
                            func.apply(this, args);
                            lastRan = Date.now();
                        }
                    }, delay - (Date.now() - lastRan));
                }
            };
        },

        smoothScrollTo(element, offsetTop = 70) {
            if (!element) return;
            const targetPosition = element.offsetTop - offsetTop;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        },

        prefersReducedMotion() {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        },

        isMobileDevice() {
            return window.innerWidth < 768;
        },

        isLowEndDevice() {
            const cores = navigator.hardwareConcurrency || 2;
            const memory = navigator.deviceMemory || 4;
            return cores <= 4 || memory <= 4;
        },

        async waitForResources() {
            const imagePromises = Array.from(document.images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve; // Resolve even on error to not block
                });
            });

            try {
                await Promise.all([document.fonts.ready, ...imagePromises]);
            } catch (error) {
                console.warn('Some resources failed to load:', error);
            }
        }
    };

    // Global cleanup registry
    const cleanupRegistry = [];

    // ===================================
    // Loading Screen - FIXED: Real resource loading
    // ===================================

    window.addEventListener('load', async function() {
        // Wait for actual resources instead of fake timeout
        await Utils.waitForResources();

        // Small delay for smooth transition
        setTimeout(function() {
            const loadingScreen = document.getElementById('loading-screen');
            const mainContainer = document.getElementById('main-container');

            if (loadingScreen && mainContainer) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.transition = 'opacity 0.5s ease';

                setTimeout(function() {
                    loadingScreen.classList.add('hidden');
                    mainContainer.classList.remove('hidden');
                    initializeAnimations();
                }, 500);
            }
        }, 300); // Minimal delay for UX
    });

    // ===================================
    // PHASE 2: Interactive Pipeline Canvas - OPTIMIZED
    // ===================================

    function initInteractivePipelineCanvas() {
        const canvas = document.getElementById('pipeline-canvas');
        if (!canvas) return;

        // Skip heavy animations if user prefers reduced motion
        if (Utils.prefersReducedMotion()) {
            console.log('Reduced motion preferred - skipping canvas animation');
            return;
        }

        const ctx = canvas.getContext('2d');
        const particles = [];
        const nodes = [
            { x: 0.15, y: 0.5, label: 'INPUT', color: '#00ff88', section: 'about' },
            { x: 0.30, y: 0.5, label: 'PROCESS', color: '#00d4ff', section: 'skills' },
            { x: 0.50, y: 0.5, label: 'ENRICH', color: '#fbbf24', section: 'experience' },
            { x: 0.70, y: 0.5, label: 'OUTPUT', color: '#ff0080', section: 'projects' },
            { x: 0.85, y: 0.5, label: 'MONITOR', color: '#a855f7', section: 'contact' }
        ];

        let hoveredNode = null;
        let isCanvasVisible = true;
        let animationFrameId = null;

        // Adaptive particle count based on device
        const isMobile = Utils.isMobileDevice();
        const isLowEnd = Utils.isLowEndDevice();
        const particleCount = isLowEnd ? 5 : (isMobile ? 10 : 20);

        function resizeCanvas() {
            // Use lower resolution on mobile for better performance
            const dpr = window.devicePixelRatio || 1;
            const scale = isMobile ? 1 : Math.min(dpr, 2);

            canvas.width = canvas.offsetWidth * scale;
            canvas.height = canvas.offsetHeight * scale;
            canvas.style.width = canvas.offsetWidth + 'px';
            canvas.style.height = canvas.offsetHeight + 'px';

            ctx.scale(scale, scale);
        }

        resizeCanvas();
        const resizeHandler = Utils.throttle(resizeCanvas, 250);
        window.addEventListener('resize', resizeHandler);
        cleanupRegistry.push(() => window.removeEventListener('resize', resizeHandler));

        // Particle class
        class Particle {
            constructor(startNode, endNode) {
                this.startNode = startNode;
                this.endNode = endNode;
                this.progress = 0;
                this.speed = 0.002 + Math.random() * 0.003;
                this.size = 2 + Math.random() * 2;
                this.opacity = 0.8;
                this.color = startNode.color;
            }

            update() {
                this.progress += this.speed;
                if (this.progress >= 1) {
                    this.progress = 0;
                    const currentIndex = nodes.indexOf(this.endNode);
                    if (currentIndex < nodes.length - 1) {
                        this.startNode = this.endNode;
                        this.endNode = nodes[currentIndex + 1];
                        this.color = this.startNode.color;
                    } else {
                        this.startNode = nodes[0];
                        this.endNode = nodes[1];
                        this.color = nodes[0].color;
                    }
                }
            }

            draw() {
                const x = this.startNode.x * (canvas.width / (isMobile ? 1 : 2)) +
                         (this.endNode.x - this.startNode.x) * (canvas.width / (isMobile ? 1 : 2)) * this.progress;
                const y = this.startNode.y * (canvas.height / (isMobile ? 1 : 2)) +
                         (this.endNode.y - this.startNode.y) * (canvas.height / (isMobile ? 1 : 2)) * this.progress;

                ctx.beginPath();
                ctx.arc(x, y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
                ctx.fill();

                // Add glow effect (skip on low-end devices)
                if (!isLowEnd) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = this.color;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }
        }

        // Create initial particles
        for (let i = 0; i < particleCount; i++) {
            const startIndex = Math.floor(Math.random() * (nodes.length - 1));
            particles.push(new Particle(nodes[startIndex], nodes[startIndex + 1]));
        }

        // Draw connection lines
        function drawConnections() {
            ctx.strokeStyle = '#1a2332';
            ctx.lineWidth = 2;
            const scale = isMobile ? 1 : 2;
            for (let i = 0; i < nodes.length - 1; i++) {
                ctx.beginPath();
                ctx.moveTo(nodes[i].x * canvas.width / scale, nodes[i].y * canvas.height / scale);
                ctx.lineTo(nodes[i + 1].x * canvas.width / scale, nodes[i + 1].y * canvas.height / scale);
                ctx.stroke();
            }
        }

        // Draw nodes
        function drawNodes() {
            const scale = isMobile ? 1 : 2;
            nodes.forEach((node, index) => {
                const x = node.x * canvas.width / scale;
                const y = node.y * canvas.height / scale;
                const radius = hoveredNode === index ? 35 : 30;

                // Outer glow
                if (hoveredNode === index && !isLowEnd) {
                    ctx.beginPath();
                    ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
                    ctx.fillStyle = node.color + '20';
                    ctx.fill();
                }

                // Node circle
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = '#12182e';
                ctx.strokeStyle = node.color;
                ctx.lineWidth = 3;
                ctx.fill();
                ctx.stroke();

                // Pulse effect
                if (!isLowEnd) {
                    ctx.beginPath();
                    ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
                    ctx.strokeStyle = node.color + '40';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
        }

        // Animation loop - OPTIMIZED with visibility check
        function animate() {
            if (!isCanvasVisible) return; // Pause when not visible

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawConnections();
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawNodes();

            animationFrameId = requestAnimationFrame(animate);
        }

        // CRITICAL FIX: Pause animation when canvas is off-screen
        const canvasObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isCanvasVisible = entry.isIntersecting;
                if (isCanvasVisible && !animationFrameId) {
                    animate();
                } else if (!isCanvasVisible && animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            });
        }, { threshold: 0 });

        canvasObserver.observe(canvas);
        cleanupRegistry.push(() => {
            canvasObserver.disconnect();
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        });

        animate();

        // Mouse interaction - throttled for performance
        const handleMouseMove = Utils.throttle((e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const scale = isMobile ? 1 : 2;

            hoveredNode = null;
            nodes.forEach((node, index) => {
                const x = node.x * canvas.width / scale;
                const y = node.y * canvas.height / scale;
                const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);

                if (distance < 35) {
                    hoveredNode = index;
                    canvas.style.cursor = 'pointer';
                    showPipelineTooltip(node, e.clientX, e.clientY);
                }
            });

            if (hoveredNode === null) {
                canvas.style.cursor = 'default';
                hidePipelineTooltip();
            }
        }, 50);

        canvas.addEventListener('mousemove', handleMouseMove);
        cleanupRegistry.push(() => canvas.removeEventListener('mousemove', handleMouseMove));

        canvas.addEventListener('click', (e) => {
            if (hoveredNode !== null) {
                const node = nodes[hoveredNode];
                const section = document.getElementById(node.section);
                if (section) {
                    Utils.smoothScrollTo(section);
                }
            }
        });

        canvas.addEventListener('mouseleave', () => {
            hoveredNode = null;
            canvas.style.cursor = 'default';
            hidePipelineTooltip();
        });
    }

    // Pipeline tooltip functions - FIXED with null checks
    function showPipelineTooltip(node, x, y) {
        const tooltip = document.getElementById('pipeline-tooltip');
        if (!tooltip) return;

        const titleEl = tooltip.querySelector('.tooltip-title');
        const descEl = tooltip.querySelector('.tooltip-desc');

        if (!titleEl || !descEl) return;

        const descriptions = {
            'about': 'Learn about my background and expertise',
            'skills': 'Explore my technical skills and tools',
            'experience': 'View my professional journey',
            'projects': 'Check out my featured projects',
            'contact': 'Get in touch with me'
        };

        titleEl.textContent = node.label;
        descEl.textContent = descriptions[node.section] || '';
        tooltip.style.display = 'block';
        tooltip.style.left = x + 15 + 'px';
        tooltip.style.top = y + 15 + 'px';
        tooltip.style.opacity = '1';
    }

    function hidePipelineTooltip() {
        const tooltip = document.getElementById('pipeline-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => tooltip.style.display = 'none', 200);
        }
    }

    // ===================================
    // PHASE 2: Skill Radar Chart Visualization
    // ===================================

    function initSkillRadarChart() {
        const container = document.querySelector('.skill-radar-container');
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'skill-radar-chart';
        canvas.width = 400;
        canvas.height = 400;
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 150;

        const skills = [
            { name: 'Event-Driven Architecture', level: 95, color: '#00ff88' },
            { name: 'Microservices', level: 90, color: '#00d4ff' },
            { name: 'Data Pipelines', level: 95, color: '#fbbf24' },
            { name: 'Cloud & K8s', level: 85, color: '#ff0080' },
            { name: 'Leadership', level: 80, color: '#a855f7' },
            { name: 'System Design', level: 90, color: '#00ff88' }
        ];

        const angles = skills.map((_, i) => (Math.PI * 2 * i) / skills.length - Math.PI / 2);

        function drawRadarGrid() {
            ctx.strokeStyle = '#1a2332';
            ctx.lineWidth = 1;

            // Draw concentric circles
            for (let i = 1; i <= 5; i++) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Draw axes
            angles.forEach((angle, i) => {
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                ctx.lineTo(x, y);
                ctx.stroke();

                // Draw labels
                ctx.fillStyle = '#a0aec0';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                const labelX = centerX + Math.cos(angle) * (radius + 30);
                const labelY = centerY + Math.sin(angle) * (radius + 30);
                const words = skills[i].name.split(' ');
                words.forEach((word, wi) => {
                    ctx.fillText(word, labelX, labelY + wi * 15);
                });
            });
        }

        function drawSkillData(animationProgress = 1) {
            ctx.beginPath();
            angles.forEach((angle, i) => {
                const level = (skills[i].level / 100) * radius * animationProgress;
                const x = centerX + Math.cos(angle) * level;
                const y = centerY + Math.sin(angle) * level;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();

            // Fill
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, '#00ff8840');
            gradient.addColorStop(1, '#00d4ff20');
            ctx.fillStyle = gradient;
            ctx.fill();

            // Stroke
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw points
            angles.forEach((angle, i) => {
                const level = (skills[i].level / 100) * radius * animationProgress;
                const x = centerX + Math.cos(angle) * level;
                const y = centerY + Math.sin(angle) * level;

                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fillStyle = skills[i].color;
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        }

        // Animate on scroll into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let progress = 0;
                    const animate = () => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        drawRadarGrid();
                        drawSkillData(progress);
                        progress += 0.02;
                        if (progress <= 1) requestAnimationFrame(animate);
                    };
                    animate();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        observer.observe(container);
    }

    // ===================================
    // PHASE 2: Project Case Study Modals
    // ===================================

    function initProjectModals() {
        // Create modal container if it doesn't exist
        let modal = document.getElementById('project-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'project-modal';
            modal.className = 'project-modal';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <div class="modal-body"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Add "View Case Study" buttons to featured projects
        const featuredProjects = document.querySelectorAll('.project-card.featured');
        featuredProjects.forEach((card, index) => {
            let btn = card.querySelector('.view-case-study-btn');
            if (!btn) {
                btn = document.createElement('button');
                btn.className = 'view-case-study-btn';
                btn.innerHTML = '📖 View Case Study';
                card.querySelector('.project-tech').after(btn);
            }

            btn.addEventListener('click', () => openProjectModal(card, index));
        });

        // Close modal handlers
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    function openProjectModal(projectCard, index) {
        const modal = document.getElementById('project-modal');
        const modalBody = modal.querySelector('.modal-body');

        const title = projectCard.querySelector('.project-title').textContent;
        const company = projectCard.querySelector('.project-company').textContent;
        const description = projectCard.querySelector('.project-description').textContent;
        const roles = projectCard.querySelector('.project-roles')?.innerHTML || '';
        const metrics = projectCard.querySelector('.project-metrics')?.innerHTML || '';
        const highlights = projectCard.querySelector('.project-highlights')?.innerHTML || '';
        const tech = projectCard.querySelector('.project-tech')?.innerHTML || '';

        // Case study data
        const caseStudies = {
            0: { // Transaction Data Platform
                challenge: 'N26 had fragmented transaction data across multiple legacy systems, causing compliance issues and slow query times (5+ seconds). Teams couldn\'t get real-time insights.',
                solution: 'Designed a centralized event-driven platform using Kafka for real-time ingestion, PostgreSQL for storage, and REST APIs for access. Implemented async enrichment pipeline with batching.',
                impact: 'Reduced query latency from 5s to <1s (80% improvement). Migrated 5+ consumer teams. Processed 500M+ transactions/month with 99.99% uptime.',
                architecture: 'https://via.placeholder.com/800x400/12182e/00ff88?text=Architecture+Diagram',
                beforeAfter: {
                    before: '• 5+ seconds query time\n• Fragmented data across systems\n• Manual compliance processes\n• No real-time insights',
                    after: '• <1 second query time\n• Centralized data platform\n• Automated compliance\n• Real-time analytics'
                }
            }
        };

        const study = caseStudies[index] || null;

        modalBody.innerHTML = `
            <div class="modal-header-section">
                <h2>${title}</h2>
                <p class="modal-company">${company}</p>
                <p class="modal-description">${description}</p>
            </div>

            ${study ? `
                <div class="case-study-section">
                    <h3>🎯 Challenge</h3>
                    <p>${study.challenge}</p>
                </div>

                <div class="case-study-section">
                    <h3>💡 Solution</h3>
                    <p>${study.solution}</p>
                </div>

                <div class="case-study-section">
                    <h3>📊 Impact</h3>
                    <p>${study.impact}</p>
                </div>

                <div class="case-study-section before-after">
                    <div class="before-after-grid">
                        <div class="before">
                            <h4>❌ Before</h4>
                            <pre>${study.beforeAfter.before}</pre>
                        </div>
                        <div class="after">
                            <h4>✅ After</h4>
                            <pre>${study.beforeAfter.after}</pre>
                        </div>
                    </div>
                </div>
            ` : ''}

            ${roles ? `<div class="modal-section">${roles}</div>` : ''}
            ${metrics ? `<div class="modal-section modal-metrics">${metrics}</div>` : ''}
            ${highlights ? `<div class="modal-section">${highlights}</div>` : ''}
            ${tech ? `<div class="modal-section"><h4>Technologies Used:</h4><div class="project-tech">${tech}</div></div>` : ''}
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // ===================================
    // Navigation
    // ===================================

    function initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');
        const controlPanel = document.querySelector('.control-panel');

        // Smooth scroll for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const offset = 70;
                    const targetPosition = targetSection.offsetTop - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Update active nav link on scroll
        window.addEventListener('scroll', function() {
            let current = '';

            // Add scrolled class to nav
            if (window.scrollY > 50) {
                controlPanel.classList.add('scrolled');
            } else {
                controlPanel.classList.remove('scrolled');
            }

            // Update active section
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // ===================================
    // Pipeline Node Interactions
    // ===================================

    function initPipelineNodes() {
        const pipelineNodes = document.querySelectorAll('.interactive-node');

        pipelineNodes.forEach(node => {
            node.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                const targetSection = document.getElementById(section);

                if (targetSection) {
                    const offset = 70;
                    const targetPosition = targetSection.offsetTop - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });

            node.style.cursor = 'pointer';

            // Add hover effect
            node.addEventListener('mouseenter', function() {
                this.querySelector('.node-pulse').style.opacity = '1';
            });

            node.addEventListener('mouseleave', function() {
                this.querySelector('.node-pulse').style.opacity = '0.3';
            });
        });
    }

    // ===================================
    // Counter Animation for Metrics
    // ===================================

    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    function initMetricCounters() {
        const metrics = document.querySelectorAll('.metric-value[data-target]');
        let animated = false;

        function checkMetrics() {
            const metricsSection = document.querySelector('.metrics-dashboard');
            if (!metricsSection || animated) return;

            const rect = metricsSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

            if (isVisible) {
                animated = true;
                metrics.forEach(metric => {
                    const target = parseInt(metric.getAttribute('data-target'));
                    animateCounter(metric, target);
                });
            }
        }

        window.addEventListener('scroll', checkMetrics);
        checkMetrics(); // Check on load
    }

    // ===================================
    // Impact Section Counters
    // ===================================

    function initImpactCounters() {
        const impactNumbers = document.querySelectorAll('.impact-number[data-target]');
        let impactAnimated = false;

        function checkImpact() {
            const impactSection = document.querySelector('.impact-section');
            if (!impactSection || impactAnimated) return;

            const rect = impactSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

            if (isVisible) {
                impactAnimated = true;
                impactNumbers.forEach(number => {
                    const target = parseInt(number.getAttribute('data-target'));
                    animateCounter(number, target, 2500);
                });
            }
        }

        window.addEventListener('scroll', checkImpact);
        checkImpact();
    }

    // ===================================
    // Certification Cards Animation
    // ===================================

    function initCertificationAnimations() {
        const certCards = document.querySelectorAll('.cert-card');

        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) scale(1)';
                    }, index * 100);
                }
            });
        }, observerOptions);

        certCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px) scale(0.9)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }

    // ===================================
    // Impact Cards Stagger Animation
    // ===================================

    function initImpactCardsAnimation() {
        const impactCards = document.querySelectorAll('.impact-card');

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) scale(1)';
                    }, index * 80);
                }
            });
        }, observerOptions);

        impactCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px) scale(0.95)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
    }

    // ===================================
    // Terminal Typing Effect
    // ===================================

    function typeWriter(element, text, speed = 50) {
        let i = 0;
        element.textContent = '';

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }

        type();
    }

    // ===================================
    // Data Packet Animation
    // ===================================

    function initDataPackets() {
        const packets = document.querySelectorAll('.packet');

        // Randomize animation delays
        packets.forEach((packet, index) => {
            const delay = Math.random() * 3;
            packet.style.animationDelay = `${delay}s`;

            // Randomize vertical position slightly
            const randomTop = 20 + (index * 30) + (Math.random() * 10);
            packet.style.top = `${randomTop}%`;
        });
    }

    // ===================================
    // Dynamic Grid Background
    // ===================================

    function initGridBackground() {
        const grid = document.querySelector('.grid-background');
        if (!grid) return;

        // Add parallax effect
        window.addEventListener('scroll', function() {
            const scrolled = window.scrollY;
            grid.style.transform = `translate(${scrolled * 0.05}px, ${scrolled * 0.05}px)`;
        });
    }

    // ===================================
    // Timeline Animations
    // ===================================

    function initTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');

        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        timelineItems.forEach(item => {
            observer.observe(item);
        });
    }

    // ===================================
    // Glitch Effect on Hover
    // ===================================

    function initGlitchEffect() {
        const glitchText = document.querySelector('.glitch-text');
        if (!glitchText) return;

        glitchText.addEventListener('mouseenter', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'glitchAnimation 0.3s ease';
            }, 10);
        });
    }

    // ===================================
    // Project Card Interactions
    // ===================================

    function initProjectCards() {
        const projectCards = document.querySelectorAll('.project-card');

        projectCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                // Slight tilt effect on hover
                this.style.transition = 'transform 0.3s ease';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    // ===================================
    // Smooth Reveal Animations
    // ===================================

    function initSmoothReveals() {
        const revealElements = document.querySelectorAll(
            '.content-card, .terminal-card, .contact-card'
        );

        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // ===================================
    // Status Indicator Pulse
    // ===================================

    function initStatusIndicators() {
        const statusBadges = document.querySelectorAll('.status-badge.live');

        statusBadges.forEach(badge => {
            setInterval(() => {
                badge.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    badge.style.transform = 'scale(1)';
                }, 200);
            }, 3000);
        });
    }

    // ===================================
    // Console Easter Eggs
    // ===================================

    function initConsoleEasterEggs() {
        const styles = [
            'color: #00ff88',
            'font-size: 14px',
            'font-weight: bold',
            'font-family: monospace'
        ].join(';');

        console.log('%c🚀 Pipeline Portfolio Initialized', styles);
        console.log('%c💡 Try typing: help()', 'color: #00d4ff; font-family: monospace;');

        // Add global help function
        window.help = function() {
            console.log('%c=== Available Commands ===', 'color: #00ff88; font-weight: bold;');
            console.log('%cabout()', 'color: #00d4ff;', '- Learn more about Gaurav');
            console.log('%cskills()', 'color: #00d4ff;', '- View technical skills');
            console.log('%ccontact()', 'color: #00d4ff;', '- Get contact information');
            console.log('%chire()', 'color: #00d4ff;', '- Why hire Gaurav?');
        };

        window.about = function() {
            console.log('%c👨‍💻 Gaurav Ratnawat', 'color: #00ff88; font-size: 16px; font-weight: bold;');
            console.log('Lead Software Engineer @ N26');
            console.log('📍 Berlin, Germany');
            console.log('9+ years building scalable systems');
            console.log('💡 Kafka • Kubernetes • Spring Boot • Event-Driven Architecture');
        };

        window.skills = function() {
            console.log('%c⚡ Core Skills:', 'color: #00ff88; font-weight: bold;');
            console.log('• Event-Driven Architectures');
            console.log('• Real-time Data Pipelines (500M+ transactions/month)');
            console.log('• Microservices & Kubernetes');
            console.log('• Kafka, PostgreSQL, Redis, AWS');
            console.log('• 99.99% uptime systems');
        };

        window.contact = function() {
            console.log('%c📧 Contact Information:', 'color: #00ff88; font-weight: bold;');
            console.log('Email: de.gratnawat@gmail.com');
            console.log('LinkedIn: https://www.linkedin.com/in/ratnawatgaurav/');
            console.log('Phone: +49-15510055601');
            console.log('Location: Berlin, Germany');
        };

        window.hire = function() {
            console.log('%c🎯 Why Hire Gaurav?', 'color: #00ff88; font-weight: bold;');
            console.log('✅ 9+ years of production experience');
            console.log('✅ Built systems handling 500M+ transactions/month');
            console.log('✅ Proven track record of 99.99% uptime');
            console.log('✅ Reduced processing time by 60%');
            console.log('✅ Team leadership & mentoring experience');
            console.log('✅ Expert in Kafka, Kubernetes, Event-Driven Architecture');
            console.log('\n📄 Download resume: ' + window.location.origin + '/Gaurav Ratnawat Resume Engg.pdf');
        };
    }

    // ===================================
    // Keyboard Shortcuts
    // ===================================

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + K to toggle navigation
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // Ctrl/Cmd + . to scroll to contact
            if ((e.ctrlKey || e.metaKey) && e.key === '.') {
                e.preventDefault();
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // ===================================
    // Performance Monitoring
    // ===================================

    function logPerformance() {
        if (window.performance) {
            window.addEventListener('load', function() {
                setTimeout(function() {
                    const perfData = window.performance.timing;
                    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

                    console.log(
                        '%c⚡ Page Load Time: ' + pageLoadTime + 'ms',
                        'color: #00ff88; font-family: monospace;'
                    );
                }, 0);
            });
        }
    }

    // ===================================
    // Initialize All Animations
    // ===================================

    function initializeAnimations() {
        initNavigation();
        initPipelineNodes();
        initInteractivePipelineCanvas(); // NEW - Phase 2
        initSkillRadarChart(); // NEW - Phase 2
        initProjectModals(); // NEW - Phase 2
        initMetricCounters();
        initDataPackets();
        initGridBackground();
        initTimeline();
        initGlitchEffect();
        initProjectCards();
        initSmoothReveals();
        initProjectFilters();
        initStatusIndicators();
        initConsoleEasterEggs();
        initKeyboardShortcuts();
        logPerformance();
        initCollapsibleSections(); // FIX: Add this function call
        initMetricCountAnimation(); // Add this if not present
        initCertificationAnimations(); // Add this if not present
        initImpactCounters(); // Add this if not present
        console.log('🚀 Pipeline Portfolio Initialized - Phase 2 Features Active');
    }

    // ===================================
    // Project Filters - ENHANCED
    // ===================================

    function initProjectFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');

                // Filter projects with animation
                projectCards.forEach((card, index) => {
                    const categories = card.getAttribute('data-category');

                    if (filter === 'all' || categories.includes(filter)) {
                        setTimeout(() => {
                            card.style.display = 'flex';
                            card.style.animation = 'fadeIn 0.5s ease-out';
                        }, index * 50);
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // ===================================
    // COLLAPSIBLE SECTIONS - Text Density Reduction
    // ===================================

    function initCollapsibleSections() {
        // Add toggle buttons to roles & responsibilities
        const companyRoles = document.querySelectorAll('.company-roles, .project-roles');

        companyRoles.forEach(section => {
            const heading = section.querySelector('h4');
            if (!heading) return;

            // Create toggle button
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'toggle-details';
            toggleBtn.innerHTML = '<span>Show Details</span> <span class="icon">▼</span>';

            // Insert after heading
            heading.parentNode.insertBefore(toggleBtn, heading.nextSibling);

            // Hide the list by default
            const list = section.querySelector('ul');
            if (list) {
                list.style.maxHeight = '0';
                list.style.overflow = 'hidden';
                list.style.opacity = '0';
                list.style.transition = 'max-height 0.4s ease, opacity 0.3s ease, margin-top 0.3s ease';
                list.style.marginTop = '0';
            }

            // Toggle functionality
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const list = section.querySelector('ul');

                if (!list) return;

                const isExpanded = list.style.maxHeight !== '0px' && list.style.maxHeight !== '';

                if (isExpanded) {
                    // Collapse
                    list.style.maxHeight = '0';
                    list.style.opacity = '0';
                    list.style.marginTop = '0';
                    this.querySelector('span:first-child').textContent = 'Show Details';
                    this.classList.remove('expanded');
                } else {
                    // Expand
                    list.style.maxHeight = list.scrollHeight + 'px';
                    list.style.opacity = '1';
                    list.style.marginTop = 'var(--space-sm)';
                    this.querySelector('span:first-child').textContent = 'Hide Details';
                    this.classList.add('expanded');
                }
            });
        });

        // Add toggle for achievement lists
        const achievementLists = document.querySelectorAll('.achievement-list, .project-highlights');

        achievementLists.forEach(list => {
            const items = list.querySelectorAll('li');
            if (items.length <= 3) return; // Only add if more than 3 items

            // Hide items beyond the first 3
            items.forEach((item, index) => {
                if (index >= 3) {
                    item.style.display = 'none';
                }
            });

            // Create show more button
            const showMoreBtn = document.createElement('button');
            showMoreBtn.className = 'toggle-details';
            showMoreBtn.innerHTML = '<span>Show More</span> <span class="icon">▼</span>';
            showMoreBtn.style.marginTop = 'var(--space-sm)';

            list.parentNode.insertBefore(showMoreBtn, list.nextSibling);

            showMoreBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const isExpanded = this.classList.contains('expanded');

                items.forEach((item, index) => {
                    if (index >= 3) {
                        if (isExpanded) {
                            item.style.display = 'none';
                        } else {
                            item.style.display = 'list-item';
                        }
                    }
                });

                if (isExpanded) {
                    this.querySelector('span:first-child').textContent = 'Show More';
                    this.classList.remove('expanded');
                } else {
                    this.querySelector('span:first-child').textContent = 'Show Less';
                    this.classList.add('expanded');
                }
            });
        });
    }

    // ===================================
    // METRIC COUNT ANIMATION - Enhanced
    // ===================================

    function initMetricCountAnimation() {
        const metricCards = document.querySelectorAll('.metric-card');

        metricCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const value = this.querySelector('.metric-value');
                if (!value) return;

                // Add pulse effect
                value.style.transform = 'scale(1.1)';
                value.style.color = 'var(--secondary-color)';
            });

            card.addEventListener('mouseleave', function() {
                const value = this.querySelector('.metric-value');
                if (!value) return;

                value.style.transform = 'scale(1)';
                value.style.color = 'var(--primary-color)';
            });
        });
    }

    // ===================================
    // ENHANCED TECH BADGE INTERACTIONS
    // ===================================

    function initTechBadgeInteractions() {
        const techBadges = document.querySelectorAll('.tech-badge, .tech-pill');

        techBadges.forEach(badge => {
            badge.addEventListener('mouseenter', function() {
                // Create ripple effect
                const ripple = document.createElement('span');
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(0, 255, 136, 0.5)';
                ripple.style.width = '10px';
                ripple.style.height = '10px';
                ripple.style.animation = 'rippleEffect 0.6s ease-out';

                this.style.position = 'relative';
                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // ===================================
    // SMOOTH SCROLL WITH OFFSET
    // ===================================

    function smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (!element) return;

        const offset = 70;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // ===================================
    // INTERSECTION OBSERVER FOR ANIMATIONS
    // ===================================

    function initIntersectionObservers() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    fadeInObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that need fade-in
        const elementsToFade = document.querySelectorAll('.timeline-content, .project-card, .cert-card');
        elementsToFade.forEach(el => fadeInObserver.observe(el));
    }

    // ===================================
    // KEYBOARD NAVIGATION
    // ===================================

    function initKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            // Press 'H' to go home
            if (e.key === 'h' || e.key === 'H') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // Press numbers 1-5 to jump to sections
            const sectionMap = {
                '1': '#about',
                '2': '#skills',
                '3': '#experience',
                '4': '#projects',
                '5': '#contact'
            };

            if (sectionMap[e.key]) {
                smoothScrollTo(sectionMap[e.key]);
            }
        });
    }

    // ===================================
    // CONSOLE EASTER EGG
    // ===================================

    function initConsoleMessage() {
        const styles = [
            'color: #00ff88',
            'font-size: 16px',
            'font-weight: bold',
            'font-family: monospace',
            'padding: 10px'
        ].join(';');

        console.log('%c🚀 Pipeline Portfolio v1.0', styles);
        console.log('%c💚 Like what you see? Let\'s connect!', 'color: #00d4ff; font-size: 14px;');
        console.log('%c📧 de.gratnawat@gmail.com', 'color: #fbbf24; font-size: 12px;');
        console.log('%c\nPress H to scroll to top', 'color: #a0aec0; font-size: 11px;');
        console.log('%cPress 1-5 to jump to sections', 'color: #a0aec0; font-size: 11px;');
    }

    // ===================================
    // PERFORMANCE OPTIMIZATION
    // ===================================

    function optimizeAnimations() {
        // Reduce motion for users who prefer it
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            document.documentElement.style.setProperty('--transition-fast', '0.05s');
            document.documentElement.style.setProperty('--transition-base', '0.1s');
            document.documentElement.style.setProperty('--transition-slow', '0.2s');
        }
    }

    // ===================================
    // INITIALIZE EVERYTHING
    // ===================================

    document.addEventListener('DOMContentLoaded', function() {
        initConsoleMessage();
        initKeyboardNavigation();
        initIntersectionObservers();
        initTechBadgeInteractions();
        optimizeAnimations();
        initInteractivePipeline(); // PHASE 2
        initCaseStudyModals(); // PHASE 2
    });

    // ===================================
    // PHASE 2: INTERACTIVE PIPELINE WITH CANVAS
    // ===================================

    function initInteractivePipeline() {
        const canvas = document.getElementById('pipeline-canvas');
        const tooltip = document.getElementById('pipeline-tooltip');
        const nodes = document.querySelectorAll('.interactive-node');

        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const particles = [];
        let animationFrame;

        // Set canvas size
        function resizeCanvas() {
            const parent = canvas.parentElement;
            canvas.width = parent.offsetWidth;
            canvas.height = parent.offsetHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle class
        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.life = Math.random() * 100 + 50;
                this.maxLife = this.life;
                this.size = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life -= 0.5;

                if (this.life <= 0 || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                    this.reset();
                }
            }

            draw() {
                const opacity = this.life / this.maxLife;
                ctx.fillStyle = `rgba(0, 255, 136, ${opacity * 0.6})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle());
        }

        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        const opacity = (1 - distance / 100) * 0.2;
                        ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationFrame = requestAnimationFrame(animate);
        }

        animate();

        // Interactive nodes
        nodes.forEach(node => {
            const tooltipData = {
                'about': { title: 'INPUT STREAM', desc: 'Data ingestion & profiling' },
                'skills': { title: 'PROCESSING', desc: 'Transform & enrich data' },
                'experience': { title: 'ENRICHMENT', desc: 'Add business context' },
                'projects': { title: 'OUTPUT', desc: 'Serve enriched data' },
                'contact': { title: 'MONITORING', desc: 'Track system health' }
            };

            const section = node.getAttribute('data-section');
            const data = tooltipData[section];

            node.addEventListener('mouseenter', function(e) {
                if (data && tooltip) {
                    tooltip.querySelector('.tooltip-title').textContent = data.title;
                    tooltip.querySelector('.tooltip-desc').textContent = data.desc;
                    tooltip.classList.add('active');
                }
            });

            node.addEventListener('mousemove', function(e) {
                if (tooltip) {
                    const rect = canvas.getBoundingClientRect();
                    tooltip.style.left = (e.clientX - rect.left + 20) + 'px';
                    tooltip.style.top = (e.clientY - rect.top - 20) + 'px';
                }
            });

            node.addEventListener('mouseleave', function() {
                if (tooltip) {
                    tooltip.classList.remove('active');
                }
            });

            node.addEventListener('click', function() {
                const targetSection = document.getElementById(section);
                if (targetSection) {
                    const offset = 70;
                    const targetPosition = targetSection.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Visual feedback
                    this.style.transition = 'all 0.3s ease';
                    this.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 300);
                }
            });
        });

        // Cleanup on unload
        window.addEventListener('beforeunload', function() {
            cancelAnimationFrame(animationFrame);
        });
    }

    // ===================================
    // PHASE 2: CASE STUDY MODALS
    // ===================================

    function initCaseStudyModals() {
        // Create modal HTML dynamically
        const modalHTML = `
            <div class="case-study-modal" id="case-study-modal">
                <div class="case-study-content">
                    <div class="case-study-header">
                        <button class="case-study-close" id="close-case-study">×</button>
                        <h2 class="case-study-title" id="modal-title"></h2>
                        <p class="case-study-subtitle" id="modal-subtitle"></p>
                    </div>
                    <div class="case-study-body" id="modal-body"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('case-study-modal');
        const closeBtn = document.getElementById('close-case-study');

        // Case study data
        const caseStudies = {
            'transaction-platform': {
                title: 'Transaction Data Platform',
                subtitle: 'N26 Bank • 500M+ transactions/month • 99.99% uptime',
                content: `
                    <div class="case-study-section">
                        <h3>📊 Challenge → Solution → Impact</h3>
                        <div class="challenge-solution-impact">
                            <div class="csi-card challenge">
                                <h4>🎯 Challenge</h4>
                                <ul>
                                    <li>Multiple teams querying transaction data inefficiently</li>
                                    <li>Inconsistent enrichment logic across services</li>
                                    <li>60% of processing time spent on redundant enrichment</li>
                                    <li>GDPR compliance scattered across 20+ systems</li>
                                    <li>No centralized monitoring or observability</li>
                                </ul>
                            </div>
                            <div class="csi-card solution">
                                <h4>💡 Solution</h4>
                                <ul>
                                    <li>Built unified event-driven platform with Kafka</li>
                                    <li>Centralized enrichment pipeline with caching</li>
                                    <li>PostgreSQL Aurora with read replicas</li>
                                    <li>REST APIs + Lakehouse integration (S3/Athena)</li>
                                    <li>Comprehensive monitoring with Datadog & OpenSearch</li>
                                </ul>
                            </div>
                            <div class="csi-card impact">
                                <h4>🚀 Impact</h4>
                                <ul>
                                    <li>60% reduction in processing time</li>
                                    <li>5+ services migrated to platform</li>
                                    <li>99.99% uptime achieved</li>
                                    <li>30% reduction in MTTR</li>
                                    <li>500M+ transactions/month processed</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="case-study-section">
                        <h3>🏗️ Architecture</h3>
                        <div class="architecture-diagram">
                            <pre>
┌─────────────────────────────────────────────────────────────────┐
│                      TRANSACTION DATA PLATFORM                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📨 Kafka Topics                                                │
│    ├── transaction.created                                      │
│    ├── transaction.updated                                      │
│    └── transaction.enriched                                     │
│                     ↓                                            │
│  ⚙️ Enrichment Pipeline (Kotlin + Spring Boot 3)               │
│    ├── Event Consumer                                           │
│    ├── Enrichment Logic (async + batching)                     │
│    ├── Redis Cache (hot data)                                  │
│    └── Dead Letter Queue                                        │
│                     ↓                                            │
│  🗄️ PostgreSQL Aurora (Active-Passive)                         │
│    ├── Write: Primary instance                                  │
│    ├── Read: Auto-scaling replicas                             │
│    └── Backup: Point-in-time recovery                          │
│                     ↓                                            │
│  🌐 REST APIs (Kotlin + Spring Boot 3)                         │
│    ├── Transaction Query API                                    │
│    ├── Batch Export API                                         │
│    └── Health & Metrics endpoints                              │
│                     ↓                                            │
│  📊 Lakehouse Integration                                       │
│    ├── S3: Raw + Enriched data                                 │
│    ├── AWS Glue: Schema catalog                                │
│    └── Athena: SQL queries                                     │
│                                                                  │
│  📈 Observability Stack                                         │
│    ├── Datadog: Metrics, traces, logs                          │
│    ├── OpenSearch: Full-text search                            │
│    └── Custom dashboards & alerts                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            </pre>
                        </div>
                    </div>

                    <div class="case-study-section">
                        <h3>💻 Technical Implementation</h3>
                        <h4>Key Technologies</h4>
                        <ul>
                            <li><strong>Kotlin & Spring Boot 3:</strong> Microservices with coroutines for async processing</li>
                            <li><strong>Apache Kafka:</strong> Event streaming with 10M+ events/day</li>
                            <li><strong>PostgreSQL Aurora:</strong> Auto-scaling read replicas, 1.5K peak RPS</li>
                            <li><strong>Redis:</strong> Hot data caching, 95% hit rate</li>
                            <li><strong>Kubernetes:</strong> Auto-scaling pods based on CPU/memory</li>
                            <li><strong>AWS Lakehouse:</strong> S3 + Glue + Athena for analytics</li>
                        </ul>

                        <h4>Performance Optimizations</h4>
                        <ul>
                            <li><strong>Batching:</strong> Process enrichment in batches of 100 transactions</li>
                            <li><strong>Async Workflows:</strong> Non-blocking I/O with Kotlin coroutines</li>
                            <li><strong>Caching Strategy:</strong> Redis for frequently accessed data (30-day window)</li>
                            <li><strong>Read Replicas:</strong> Auto-scaling based on load (3-10 replicas)</li>
                            <li><strong>Connection Pooling:</strong> HikariCP with optimized settings</li>
                        </ul>

                        <h4>Reliability & Resilience</h4>
                        <ul>
                            <li><strong>Circuit Breakers:</strong> Prevent cascade failures</li>
                            <li><strong>Retry Mechanisms:</strong> Exponential backoff for transient errors</li>
                            <li><strong>Dead Letter Queues:</strong> Handle poison messages</li>
                            <li><strong>Multi-Region:</strong> Active-passive deployment</li>
                            <li><strong>Health Checks:</strong> K8s liveness/readiness probes</li>
                        </ul>
                    </div>

                    <div class="case-study-section">
                        <h3>📊 Metrics & Monitoring</h3>
                        <ul>
                            <li><strong>Throughput:</strong> 500M+ transactions/month, 1.5K peak RPS</li>
                            <li><strong>Latency:</strong> P50: 200ms, P95: 800ms, P99: 1.2s</li>
                            <li><strong>Uptime:</strong> 99.99% availability (< 1 hour downtime/year)</li>
                            <li><strong>Error Rate:</strong> 0.01% (auto-retry recovers 90%)</li>
                            <li><strong>Cache Hit Rate:</strong> 95% (Redis)</li>
                            <li><strong>MTTR:</strong> Reduced by 30% with actionable alerts</li>
                        </ul>
                    </div>

                    <div class="case-study-section">
                        <h3>👥 Leadership & Collaboration</h3>
                        <ul>
                            <li>Led team of 5 engineers (design, implementation, deployment)</li>
                            <li>Weekly sync with compliance, product, regulatory teams</li>
                            <li>Conducted architecture reviews with Staff+ engineers</li>
                            <li>Mentored junior engineers on Kafka, K8s, system design</li>
                            <li>Presented at internal tech talks (100+ attendees)</li>
                        </ul>
                    </div>

                    <div class="case-study-section">
                        <h3>🎓 Key Learnings</h3>
                        <ul>
                            <li><strong>Start Simple:</strong> MVP with core features, iterate based on feedback</li>
                            <li><strong>Observability First:</strong> Build monitoring before scaling</li>
                            <li><strong>Batch When Possible:</strong> 60% performance gain from batching</li>
                            <li><strong>Cache Strategically:</strong> Not everything needs caching</li>
                            <li><strong>Fail Fast, Recover Faster:</strong> Circuit breakers + DLQs = resilience</li>
                        </ul>
                    </div>
                `
            },
            'dealer-locator': {
                title: 'Dealer Locator Service',
                subtitle: 'ThoughtWorks • Major US Construction Equipment Manufacturer',
                content: `
                    <div class="case-study-section">
                        <h3>📊 Challenge → Solution → Impact</h3>
                        <div class="challenge-solution-impact">
                            <div class="csi-card challenge">
                                <h4>🎯 Challenge</h4>
                                <ul>
                                    <li>2 legacy microservices with poor performance (48 TPS)</li>
                                    <li>Monolithic architecture, hard to scale</li>
                                    <li>No geospatial optimization for location queries</li>
                                    <li>Manual deployment, 45-min pipeline</li>
                                    <li>Limited observability into production issues</li>
                                </ul>
                            </div>
                            <div class="csi-card solution">
                                <h4>💡 Solution</h4>
                                <ul>
                                    <li>Migrated to modern microservices architecture</li>
                                    <li>Implemented PostGIS for geospatial queries</li>
                                    <li>PostgreSQL read replica auto-scaling</li>
                                    <li>3 RESTful APIs: address, IP, coordinate geocoding</li>
                                    <li>Azure DevOps CI/CD pipeline optimization</li>
                                </ul>
                            </div>
                            <div class="csi-card impact">
                                <h4>🚀 Impact</h4>
                                <ul>
                                    <li>163% TPS improvement (48 → 126)</li>
                                    <li>2 legacy services modernized</li>
                                    <li>10+ CloudWatch dashboards created</li>
                                    <li>5-minute reduction in pipeline time</li>
                                    <li>2 team members onboarded & mentored</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="case-study-section">
                        <h3>🏗️ Architecture</h3>
                        <div class="architecture-diagram">
                            <pre>
┌──────────────────────────────────────────────────────────┐
│              DEALER LOCATOR SERVICE                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  🌐 3 RESTful APIs (Spring Boot + Java 11)              │
│    ├── /geocode/address  (Address → Coordinates)        │
│    ├── /geocode/ip       (IP → Location)                │
│    └── /geocode/coords   (Lat/Long → Address)           │
│                     ↓                                     │
│  🗺️ PostGIS Engine                                       │
│    ├── Spatial indexing (GiST)                          │
│    ├── Distance calculations                             │
│    ├── GeoJSON boundary queries                         │
│    └── Nearest neighbor search                           │
│                     ↓                                     │
│  🗄️ PostgreSQL with PostGIS Extension                   │
│    ├── Write: Primary RDS instance                      │
│    ├── Read: 3-5 auto-scaling replicas                  │
│    ├── Jooq for type-safe queries                       │
│    └── Connection pooling (HikariCP)                    │
│                     ↓                                     │
│  📊 AWS CloudWatch                                       │
│    ├── 10+ custom dashboards                            │
│    ├── Metrics: Latency, TPS, error rate               │
│    ├── Alarms: High latency, replica lag                │
│    └── Logs: Centralized logging                        │
│                                                           │
└──────────────────────────────────────────────────────────┘
                            </pre>
                        </div>
                    </div>

                    <div class="case-study-section">
                        <h3>💻 Technical Deep Dive</h3>
                        <h4>PostGIS Optimization</h4>
                        <ul>
                            <li><strong>Spatial Indexing:</strong> GiST indexes on geometry columns</li>
                            <li><strong>Distance Queries:</strong> ST_DWithin for radius searches</li>
                            <li><strong>GeoJSON Support:</strong> ST_Contains for boundary checks</li>
                            <li><strong>Query Optimization:</strong> Reduced from 2s → 200ms avg</li>
                        </ul>

                        <h4>Auto-Scaling Strategy</h4>
                        <ul>
                            <li><strong>Read Replicas:</strong> 3-5 replicas based on CPU (target: 70%)</li>
                            <li><strong>Connection Pooling:</strong> Max 100 connections/replica</li>
                            <li><strong>Load Balancing:</strong> Round-robin across healthy replicas</li>
                            <li><strong>Failover:</strong> Automatic promotion in < 30 seconds</li>
                        </ul>

                        <h4>CI/CD Pipeline</h4>
                        <ul>
                            <li><strong>Before:</strong> 45-minute manual deployment</li>
                            <li><strong>After:</strong> 40-minute automated pipeline</li>
                            <li><strong>Stages:</strong> Build → Test → Integration → Deploy</li>
                            <li><strong>Optimizations:</strong> Parallel tests, Docker layer caching</li>
                        </ul>
                    </div>

                    <div class="case-study-section">
                        <h3>👥 Leadership Impact</h3>
                        <ul>
                            <li>Led team of 4 developers through migration</li>
                            <li>Weekly client meetings with Technical Product Owner</li>
                            <li>Conducted code reviews for all PRs (100+ reviews)</li>
                            <li>Technical design sessions for complex features</li>
                            <li>Onboarded 2 new team members (domain + tech stack)</li>
                        </ul>
                    </div>
                `
            }
        };

        // Add "View Case Study" buttons to featured projects
        const featuredProjects = document.querySelectorAll('.project-card.featured');
        featuredProjects.forEach((card, index) => {
            const projectId = index === 0 ? 'transaction-platform' : 'dealer-locator';
            const button = document.createElement('button');
            button.className = 'view-case-study-btn';
            button.innerHTML = '🔍 View Full Case Study';
            button.setAttribute('data-case-study', projectId);

            const techSection = card.querySelector('.project-tech');
            if (techSection) {
                techSection.parentNode.insertBefore(button, techSection);
            }

            button.addEventListener('click', function() {
                openCaseStudy(projectId);
            });
        });

        function openCaseStudy(id) {
            const study = caseStudies[id];
            if (!study) return;

            document.getElementById('modal-title').textContent = study.title;
            document.getElementById('modal-subtitle').textContent = study.subtitle;
            document.getElementById('modal-body').innerHTML = study.content;

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeCaseStudy() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        closeBtn.addEventListener('click', closeCaseStudy);

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeCaseStudy();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeCaseStudy();
            }
        });
    }

})();
