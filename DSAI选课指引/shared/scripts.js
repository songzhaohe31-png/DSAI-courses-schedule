/**
 * HKMU Course Selection Guidance System - Shared JavaScript
 * ==========================================================
 * Contains all shared JavaScript utilities, helpers, and component initializers
 * for the HKMU Data Science Course Selection Guidance System.
 * 
 * Dependencies:
 * - Lucide Icons (loaded via CDN)
 * 
 * Usage:
 * Include this script at the end of your HTML body:
 * <script src="/shared/scripts.js"></script>
 */

(function() {
  'use strict';

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Initialize all components when DOM is ready
   */
  function init() {
    initLucideIcons();
    initMobileMenu();
    initNavigationHighlight();
    initScrollAnimations();
    initProgressBars();
    initTooltips();
    console.log('HKMU Course Guide: Shared scripts initialized');
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================
  // LUCIDE ICONS INITIALIZATION
  // ============================================

  /**
   * Initialize Lucide icons
   * Replaces all elements with data-lucide attribute with SVG icons
   */
  function initLucideIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    } else {
      // Retry after a short delay if lucide isn't loaded yet
      setTimeout(initLucideIcons, 100);
    }
  }

  /**
   * Refresh Lucide icons (useful after dynamic content updates)
   */
  window.refreshIcons = function() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  };

  // ============================================
  // MOBILE MENU
  // ============================================

  /**
   * Initialize mobile menu toggle functionality
   */
  function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-menu-overlay');
    const menuIconOpen = document.getElementById('menu-icon-open');
    const menuIconClose = document.getElementById('menu-icon-close');

    if (!menuBtn || !mobileMenu) return;

    let isOpen = false;

    function toggleMenu() {
      isOpen = !isOpen;
      
      // Toggle menu visibility
      mobileMenu.classList.toggle('is-open', isOpen);
      if (mobileOverlay) {
        mobileOverlay.classList.toggle('is-visible', isOpen);
      }

      // Toggle icons
      if (menuIconOpen && menuIconClose) {
        menuIconOpen.classList.toggle('hidden', isOpen);
        menuIconClose.classList.toggle('hidden', !isOpen);
      }

      // Update ARIA attributes
      menuBtn.setAttribute('aria-expanded', isOpen.toString());
      mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());

      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
      if (isOpen) toggleMenu();
    }

    // Menu button click
    menuBtn.addEventListener('click', toggleMenu);

    // Close on overlay click
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', closeMenu);
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    });

    // Close on window resize (if going to desktop)
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 768 && isOpen) {
        closeMenu();
      }
    }, 100));

    // Close menu when clicking on a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ============================================
  // NAVIGATION HIGHLIGHT
  // ============================================

  /**
   * Highlight current navigation item based on URL
   */
  function initNavigationHighlight() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      const navId = link.getAttribute('data-nav');

      // Check if this link matches the current page
      let isActive = false;

      if (linkPath === currentPath) {
        isActive = true;
      } else if (linkPath !== '/' && currentPath.startsWith(linkPath)) {
        isActive = true;
      } else if (navId === 'home' && (currentPath === '/' || currentPath === '/index.html')) {
        isActive = true;
      } else if (navId === 'progress' && currentPath.includes('progress')) {
        isActive = true;
      } else if (navId === 'courses' && currentPath.includes('course')) {
        isActive = true;
      }

      if (isActive) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================

  /**
   * Initialize scroll-triggered animations using Intersection Observer
   */
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          
          // Add animation class if specified
          const animationClass = entry.target.dataset.animation;
          if (animationClass) {
            entry.target.classList.add(animationClass);
          }

          // Unobserve after animation (optional, remove if you want re-animation)
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // Store observer for external access
    window.scrollAnimationObserver = observer;
  }

  /**
   * Manually trigger animation on an element
   * @param {HTMLElement} element - Element to animate
   * @param {string} animationClass - Animation class to add
   * @param {number} delay - Delay in milliseconds
   */
  window.triggerAnimation = function(element, animationClass = 'animate-fadeIn', delay = 0) {
    setTimeout(() => {
      element.classList.add(animationClass);
      element.classList.add('is-visible');
    }, delay);
  };

  // ============================================
  // PROGRESS BARS
  // ============================================

  /**
   * Initialize progress bars with animation
   */
  function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill[data-progress]');

    progressBars.forEach(bar => {
      const progress = bar.dataset.progress;
      if (progress) {
        // Set CSS variable for animation
        bar.style.setProperty('--progress', progress + '%');
        
        // Trigger animation
        setTimeout(() => {
          bar.style.width = progress + '%';
        }, 100);
      }
    });

    // Animate circular progress
    const circularProgress = document.querySelectorAll('.progress-circle-fill[data-progress]');
    circularProgress.forEach(circle => {
      const progress = parseFloat(circle.dataset.progress) || 0;
      const circumference = 2 * Math.PI * 45; // r=45
      const offset = circumference - (progress / 100) * circumference;
      
      setTimeout(() => {
        circle.style.strokeDashoffset = offset;
      }, 100);
    });
  }

  /**
   * Update progress bar value
   * @param {string} selector - CSS selector for the progress bar
   * @param {number} value - New progress value (0-100)
   */
  window.updateProgressBar = function(selector, value) {
    const bar = document.querySelector(selector);
    if (bar) {
      bar.style.width = value + '%';
      bar.setAttribute('data-progress', value);
      bar.style.setProperty('--progress', value + '%');
    }
  };

  // ============================================
  // TOOLTIPS
  // ============================================

  /**
   * Initialize tooltips
   */
  function initTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');

    tooltipTriggers.forEach(trigger => {
      const tooltipText = trigger.dataset.tooltip;
      
      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = tooltipText;
      tooltip.style.cssText = `
        position: absolute;
        background: #1A1A2E;
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s, visibility 0.2s;
        pointer-events: none;
      `;
      
      document.body.appendChild(tooltip);

      // Position tooltip
      function positionTooltip() {
        const rect = trigger.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top = rect.top - tooltipRect.height - 8;
        let left = rect.left + (rect.width - tooltipRect.width) / 2;
        
        // Adjust if off-screen
        if (left < 8) left = 8;
        if (left + tooltipRect.width > window.innerWidth - 8) {
          left = window.innerWidth - tooltipRect.width - 8;
        }
        if (top < 8) {
          top = rect.bottom + 8;
        }
        
        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
      }

      // Show/hide events
      trigger.addEventListener('mouseenter', () => {
        positionTooltip();
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
      });

      trigger.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
      });

      // Clean up on page unload
      window.addEventListener('beforeunload', () => {
        tooltip.remove();
      });
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  window.throttle = function(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  window.debounce = function(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  window.formatNumber = function(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  /**
   * Format file size
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  window.formatFileSize = function(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  window.truncateText = function(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  window.copyToClipboard = async function(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };

  // ============================================
  // LOCALSTORAGE HELPERS
  // ============================================

  const STORAGE_PREFIX = 'hkmu_course_guide_';

  /**
   * Save data to localStorage with prefix
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  window.saveToStorage = function(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(STORAGE_PREFIX + key, serialized);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Stored value or default
   */
  window.loadFromStorage = function(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return defaultValue;
    }
  };

  /**
   * Remove data from localStorage
   * @param {string} key - Storage key
   */
  window.removeFromStorage = function(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  };

  /**
   * Clear all app data from localStorage
   */
  window.clearAllStorage = function() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  };

  // ============================================
  // COURSE PROGRESS HELPERS
  // ============================================

  /**
   * Get course progress from storage
   * @returns {Object} Course progress data
   */
  window.getCourseProgress = function() {
    return loadFromStorage('course_progress', {});
  };

  /**
   * Update course status
   * @param {string} courseId - Course ID
   * @param {string} status - Status (completed, in-progress, available, locked)
   */
  window.updateCourseStatus = function(courseId, status) {
    const progress = getCourseProgress();
    progress[courseId] = {
      status: status,
      updatedAt: new Date().toISOString()
    };
    saveToStorage('course_progress', progress);
  };

  /**
   * Get status of a specific course
   * @param {string} courseId - Course ID
   * @returns {string} Course status
   */
  window.getCourseStatus = function(courseId) {
    const progress = getCourseProgress();
    return progress[courseId]?.status || 'locked';
  };

  /**
   * Calculate overall progress
   * @param {Array} allCourses - Array of all courses
   * @returns {Object} Progress statistics
   */
  window.calculateProgress = function(allCourses) {
    const progress = getCourseProgress();
    const total = allCourses.length;
    const completed = allCourses.filter(c => progress[c.id]?.status === 'completed').length;
    const inProgress = allCourses.filter(c => progress[c.id]?.status === 'in-progress').length;
    const available = allCourses.filter(c => progress[c.id]?.status === 'available').length;
    const locked = total - completed - inProgress - available;

    return {
      total,
      completed,
      inProgress,
      available,
      locked,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  /**
   * Reset all course progress
   */
  window.resetAllProgress = function() {
    removeFromStorage('course_progress');
  };

  // ============================================
  // INTERSECTION OBSERVER HELPER
  // ============================================

  /**
   * Create an Intersection Observer
   * @param {Function} callback - Callback function
   * @param {Object} options - Observer options
   * @returns {IntersectionObserver} Observer instance
   */
  window.createObserver = function(callback, options = {}) {
    const defaultOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
  };

  /**
   * Observe multiple elements
   * @param {string} selector - CSS selector
   * @param {Function} callback - Callback function
   * @param {Object} options - Observer options
   */
  window.observeElements = function(selector, callback, options = {}) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return null;

    const observer = createObserver((entries) => {
      entries.forEach(entry => callback(entry));
    }, options);

    elements.forEach(el => observer.observe(el));
    return observer;
  };

  // ============================================
  // TAB COMPONENT HELPER
  // ============================================

  /**
   * Initialize tab component
   * @param {string} containerSelector - Tab container selector
   */
  window.initTabs = function(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const tabs = container.querySelectorAll('.tab');
    const panes = container.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;

        // Update tab states
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update pane visibility
        panes.forEach(pane => {
          pane.classList.toggle('active', pane.dataset.tabPane === targetId);
        });

        // Trigger event
        container.dispatchEvent(new CustomEvent('tabChange', { 
          detail: { tabId: targetId } 
        }));
      });
    });
  };

  // ============================================
  // MODAL HELPER
  // ============================================

  /**
   * Open a modal
   * @param {string} modalId - Modal element ID
   */
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  };

  /**
   * Close a modal
   * @param {string} modalId - Modal element ID
   */
  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // ============================================
  // NOTIFICATION/TOAST HELPER
  // ============================================

  /**
   * Show a toast notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds
   */
  window.showToast = function(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
      `;
      document.body.appendChild(container);
    }

    // Colors based on type
    const colors = {
      success: { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D52', icon: 'check-circle' },
      error: { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626', icon: 'x-circle' },
      warning: { bg: '#FFF3E0', border: '#FF9800', text: '#E65100', icon: 'alert-triangle' },
      info: { bg: '#E3F2FD', border: '#2196F3', text: '#1565C0', icon: 'info' }
    };

    const color = colors[type] || colors.info;

    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: ${color.bg};
      border-left: 4px solid ${color.border};
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      color: ${color.text};
      font-size: 14px;
      font-weight: 500;
      min-width: 280px;
      animation: slideInRight 0.3s ease;
    `;
    toast.innerHTML = `
      <i data-lucide="${color.icon}" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
      <span style="flex: 1;">${message}</span>
      <button style="background: none; border: none; cursor: pointer; padding: 4px; color: inherit; opacity: 0.6;">
        <i data-lucide="x" style="width: 16px; height: 16px;"></i>
      </button>
    `;

    // Close button
    toast.querySelector('button').addEventListener('click', () => {
      removeToast();
    });

    container.appendChild(toast);
    refreshIcons();

    // Auto remove
    const timeout = setTimeout(removeToast, duration);

    function removeToast() {
      clearTimeout(timeout);
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }
  };

  // ============================================
  // FORM VALIDATION HELPERS
  // ============================================

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid
   */
  window.isValidEmail = function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  /**
   * Validate required field
   * @param {string} value - Value to check
   * @returns {boolean} Is valid
   */
  window.isRequired = function(value) {
    return value && value.trim().length > 0;
  };

  /**
   * Validate minimum length
   * @param {string} value - Value to check
   * @param {number} min - Minimum length
   * @returns {boolean} Is valid
   */
  window.minLength = function(value, min) {
    return value && value.length >= min;
  };

  // ============================================
  // API HELPERS
  // ============================================

  /**
   * Make API request
   * @param {string} url - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise} Response promise
   */
  window.apiRequest = async function(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  // ============================================
  // EXPORT FOR MODULE SYSTEMS
  // ============================================

  // If using ES modules, export utilities
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      throttle,
      debounce,
      formatNumber,
      formatFileSize,
      truncateText,
      copyToClipboard,
      saveToStorage,
      loadFromStorage,
      removeFromStorage,
      getCourseProgress,
      updateCourseStatus,
      calculateProgress
    };
  }

})();
