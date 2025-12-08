/**
 * Movers+Shakers Design System
 * Interactive Components JavaScript
 * Version 2.0
 */

(function() {
    'use strict';

    // ============================================
    // MODAL COMPONENT
    // ============================================

    class Modal {
        constructor() {
            this.activeModal = null;
            this.init();
        }

        init() {
            // Bind trigger buttons
            document.querySelectorAll('[data-modal-trigger]').forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    const modalId = trigger.getAttribute('data-modal-trigger');
                    this.open(modalId);
                });
            });

            // Bind close buttons
            document.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.close();
                });
            });

            // Close on backdrop click
            document.querySelectorAll('[data-modal]').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.close();
                    }
                });
            });

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.activeModal) {
                    this.close();
                }
            });
        }

        open(modalId) {
            const modal = document.querySelector(`[data-modal="${modalId}"]`);
            if (!modal) return;

            this.activeModal = modal;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';

            // Focus trap
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length) {
                focusableElements[0].focus();
            }

            // Trigger custom event
            modal.dispatchEvent(new CustomEvent('modal:opened'));
        }

        close() {
            if (!this.activeModal) return;

            this.activeModal.classList.add('hidden');
            this.activeModal.classList.remove('flex');
            document.body.style.overflow = '';

            // Trigger custom event
            this.activeModal.dispatchEvent(new CustomEvent('modal:closed'));
            this.activeModal = null;
        }
    }

    // ============================================
    // DROPDOWN COMPONENT
    // ============================================

    class Dropdown {
        constructor() {
            this.activeDropdown = null;
            this.init();
        }

        init() {
            // Bind dropdown triggers
            document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const dropdownId = trigger.getAttribute('data-dropdown-trigger');
                    this.toggle(dropdownId, trigger);
                });
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', (e) => {
                if (this.activeDropdown && !e.target.closest('[data-dropdown]')) {
                    this.closeAll();
                }
            });

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAll();
                }
            });

            // Keyboard navigation within dropdown
            document.querySelectorAll('[data-dropdown]').forEach(dropdown => {
                dropdown.addEventListener('keydown', (e) => {
                    this.handleKeyboardNav(e, dropdown);
                });
            });
        }

        toggle(dropdownId, trigger) {
            const dropdown = document.querySelector(`[data-dropdown="${dropdownId}"]`);
            if (!dropdown) return;

            const isOpen = !dropdown.classList.contains('hidden');

            // Close any open dropdowns first
            this.closeAll();

            if (!isOpen) {
                dropdown.classList.remove('hidden');
                this.activeDropdown = dropdown;
                this.positionDropdown(dropdown, trigger);

                // Focus first item
                const firstItem = dropdown.querySelector('[data-dropdown-item]');
                if (firstItem) firstItem.focus();

                dropdown.dispatchEvent(new CustomEvent('dropdown:opened'));
            }
        }

        positionDropdown(dropdown, trigger) {
            const rect = trigger.getBoundingClientRect();
            const dropdownRect = dropdown.getBoundingClientRect();

            // Check if dropdown would go off screen
            if (rect.bottom + dropdownRect.height > window.innerHeight) {
                dropdown.style.bottom = '100%';
                dropdown.style.top = 'auto';
            }
        }

        closeAll() {
            document.querySelectorAll('[data-dropdown]').forEach(dropdown => {
                if (!dropdown.classList.contains('hidden')) {
                    dropdown.classList.add('hidden');
                    dropdown.dispatchEvent(new CustomEvent('dropdown:closed'));
                }
            });
            this.activeDropdown = null;
        }

        handleKeyboardNav(e, dropdown) {
            const items = dropdown.querySelectorAll('[data-dropdown-item]');
            const currentIndex = Array.from(items).indexOf(document.activeElement);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                    items[nextIndex].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                    items[prevIndex].focus();
                    break;
                case 'Enter':
                case ' ':
                    if (document.activeElement.hasAttribute('data-dropdown-item')) {
                        document.activeElement.click();
                    }
                    break;
            }
        }
    }

    // ============================================
    // TABS COMPONENT
    // ============================================

    class Tabs {
        constructor() {
            this.init();
        }

        init() {
            document.querySelectorAll('[data-tabs]').forEach(tabContainer => {
                const tabs = tabContainer.querySelectorAll('[data-tab]');
                const panels = tabContainer.querySelectorAll('[data-tab-panel]');

                tabs.forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        e.preventDefault();
                        const targetPanel = tab.getAttribute('data-tab');
                        this.switchTab(tabContainer, targetPanel);
                    });

                    // Keyboard navigation
                    tab.addEventListener('keydown', (e) => {
                        this.handleKeyboardNav(e, tabs, tab);
                    });
                });

                // Set initial active state if not set
                const activeTab = tabContainer.querySelector('[data-tab][aria-selected="true"]');
                if (!activeTab && tabs.length > 0) {
                    this.switchTab(tabContainer, tabs[0].getAttribute('data-tab'));
                }
            });
        }

        switchTab(container, targetPanel) {
            const tabs = container.querySelectorAll('[data-tab]');
            const panels = container.querySelectorAll('[data-tab-panel]');

            // Update tabs
            tabs.forEach(tab => {
                const isActive = tab.getAttribute('data-tab') === targetPanel;
                tab.setAttribute('aria-selected', isActive);
                tab.classList.toggle('border-brand-yellow', isActive);
                tab.classList.toggle('text-black', isActive);
                tab.classList.toggle('border-transparent', !isActive);
                tab.classList.toggle('text-gray-500', !isActive);

                // For boxed/pill tabs
                tab.classList.toggle('bg-brand-yellow', isActive && tab.closest('[data-tabs-style="boxed"]'));
                tab.classList.toggle('bg-white', !isActive && tab.closest('[data-tabs-style="boxed"]'));
            });

            // Update panels
            panels.forEach(panel => {
                const isActive = panel.getAttribute('data-tab-panel') === targetPanel;
                panel.classList.toggle('hidden', !isActive);
            });

            // Dispatch event
            container.dispatchEvent(new CustomEvent('tabs:changed', {
                detail: { activeTab: targetPanel }
            }));
        }

        handleKeyboardNav(e, tabs, currentTab) {
            const tabArray = Array.from(tabs);
            const currentIndex = tabArray.indexOf(currentTab);
            let newIndex;

            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    newIndex = currentIndex > 0 ? currentIndex - 1 : tabArray.length - 1;
                    tabArray[newIndex].focus();
                    tabArray[newIndex].click();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    newIndex = currentIndex < tabArray.length - 1 ? currentIndex + 1 : 0;
                    tabArray[newIndex].focus();
                    tabArray[newIndex].click();
                    break;
                case 'Home':
                    e.preventDefault();
                    tabArray[0].focus();
                    tabArray[0].click();
                    break;
                case 'End':
                    e.preventDefault();
                    tabArray[tabArray.length - 1].focus();
                    tabArray[tabArray.length - 1].click();
                    break;
            }
        }
    }

    // ============================================
    // ACCORDION COMPONENT
    // ============================================

    class Accordion {
        constructor() {
            this.init();
        }

        init() {
            document.querySelectorAll('[data-accordion]').forEach(accordion => {
                const allowMultiple = accordion.hasAttribute('data-accordion-multiple');
                const triggers = accordion.querySelectorAll('[data-accordion-trigger]');

                triggers.forEach(trigger => {
                    trigger.addEventListener('click', (e) => {
                        e.preventDefault();
                        const panelId = trigger.getAttribute('data-accordion-trigger');
                        this.toggle(accordion, panelId, allowMultiple);
                    });

                    // Keyboard support
                    trigger.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            trigger.click();
                        }
                    });
                });
            });
        }

        toggle(accordion, panelId, allowMultiple) {
            const panel = accordion.querySelector(`[data-accordion-panel="${panelId}"]`);
            const trigger = accordion.querySelector(`[data-accordion-trigger="${panelId}"]`);

            if (!panel || !trigger) return;

            const isOpen = !panel.classList.contains('hidden');

            // Close others if not allowing multiple
            if (!allowMultiple && !isOpen) {
                accordion.querySelectorAll('[data-accordion-panel]').forEach(p => {
                    p.classList.add('hidden');
                });
                accordion.querySelectorAll('[data-accordion-trigger]').forEach(t => {
                    t.setAttribute('aria-expanded', 'false');
                    const icon = t.querySelector('[data-accordion-icon]');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                });
            }

            // Toggle current panel
            panel.classList.toggle('hidden');
            trigger.setAttribute('aria-expanded', !isOpen);

            const icon = trigger.querySelector('[data-accordion-icon]');
            if (icon) {
                icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
                icon.style.transition = 'transform 200ms ease';
            }

            // Dispatch event
            accordion.dispatchEvent(new CustomEvent('accordion:toggled', {
                detail: { panelId, isOpen: !isOpen }
            }));
        }
    }

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================

    class Toast {
        constructor() {
            this.container = null;
            this.init();
        }

        init() {
            // Create toast container if it doesn't exist
            if (!document.querySelector('[data-toast-container]')) {
                this.container = document.createElement('div');
                this.container.setAttribute('data-toast-container', '');
                this.container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-3';
                document.body.appendChild(this.container);
            } else {
                this.container = document.querySelector('[data-toast-container]');
            }
        }

        show(options = {}) {
            const {
                message = 'Notification',
                type = 'info', // info, success, warning, error
                duration = 5000,
                dismissible = true,
                action = null // { label: 'Undo', onClick: () => {} }
            } = options;

            const toast = document.createElement('div');
            toast.className = this.getToastClasses(type);
            toast.setAttribute('role', 'alert');
            toast.setAttribute('data-toast', '');

            const iconSvg = this.getIcon(type);

            toast.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">${iconSvg}</div>
                    <div class="flex-1">
                        <p class="font-medium text-sm">${message}</p>
                    </div>
                    ${action ? `
                        <button data-toast-action class="text-sm font-bold uppercase tracking-wider underline hover:no-underline">
                            ${action.label}
                        </button>
                    ` : ''}
                    ${dismissible ? `
                        <button data-toast-dismiss class="flex-shrink-0 hover:opacity-70 transition-opacity">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
                ${duration > 0 ? `<div class="absolute bottom-0 left-0 h-1 bg-current opacity-30 transition-all" data-toast-progress style="width: 100%"></div>` : ''}
            `;

            // Add animation class
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            toast.style.transition = 'all 300ms ease';

            this.container.appendChild(toast);

            // Trigger animation
            requestAnimationFrame(() => {
                toast.style.transform = 'translateX(0)';
                toast.style.opacity = '1';
            });

            // Bind dismiss
            const dismissBtn = toast.querySelector('[data-toast-dismiss]');
            if (dismissBtn) {
                dismissBtn.addEventListener('click', () => this.dismiss(toast));
            }

            // Bind action
            const actionBtn = toast.querySelector('[data-toast-action]');
            if (actionBtn && action?.onClick) {
                actionBtn.addEventListener('click', () => {
                    action.onClick();
                    this.dismiss(toast);
                });
            }

            // Auto dismiss with progress
            if (duration > 0) {
                const progressBar = toast.querySelector('[data-toast-progress]');
                if (progressBar) {
                    progressBar.style.transition = `width ${duration}ms linear`;
                    requestAnimationFrame(() => {
                        progressBar.style.width = '0%';
                    });
                }

                setTimeout(() => this.dismiss(toast), duration);
            }

            return toast;
        }

        dismiss(toast) {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';

            setTimeout(() => {
                toast.remove();
            }, 300);
        }

        getToastClasses(type) {
            const baseClasses = 'relative min-w-[320px] max-w-md p-4 border-2 border-black shadow-brand-md overflow-hidden';

            const typeClasses = {
                info: 'bg-info-light text-info',
                success: 'bg-success-light text-success',
                warning: 'bg-warning-light text-warning',
                error: 'bg-error-light text-error',
                brand: 'bg-brand-yellow text-black'
            };

            return `${baseClasses} ${typeClasses[type] || typeClasses.info}`;
        }

        getIcon(type) {
            const icons = {
                info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
                success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
                warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
                error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
                brand: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
            };

            return icons[type] || icons.info;
        }

        // Convenience methods
        info(message, options = {}) {
            return this.show({ ...options, message, type: 'info' });
        }

        success(message, options = {}) {
            return this.show({ ...options, message, type: 'success' });
        }

        warning(message, options = {}) {
            return this.show({ ...options, message, type: 'warning' });
        }

        error(message, options = {}) {
            return this.show({ ...options, message, type: 'error' });
        }
    }

    // ============================================
    // FORM VALIDATION
    // ============================================

    class FormValidator {
        constructor() {
            this.validators = {
                required: (value) => value.trim() !== '',
                email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                minLength: (value, length) => value.length >= parseInt(length),
                maxLength: (value, length) => value.length <= parseInt(length),
                pattern: (value, regex) => new RegExp(regex).test(value),
                match: (value, targetId) => {
                    const target = document.getElementById(targetId);
                    return target && value === target.value;
                }
            };
            this.init();
        }

        init() {
            document.querySelectorAll('[data-validate]').forEach(form => {
                form.setAttribute('novalidate', '');

                form.addEventListener('submit', (e) => {
                    if (!this.validateForm(form)) {
                        e.preventDefault();
                    }
                });

                // Real-time validation
                form.querySelectorAll('[data-rules]').forEach(field => {
                    field.addEventListener('blur', () => this.validateField(field));
                    field.addEventListener('input', () => {
                        if (field.classList.contains('border-error')) {
                            this.validateField(field);
                        }
                    });
                });
            });
        }

        validateForm(form) {
            const fields = form.querySelectorAll('[data-rules]');
            let isValid = true;

            fields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            form.dispatchEvent(new CustomEvent('form:validated', {
                detail: { isValid }
            }));

            return isValid;
        }

        validateField(field) {
            const rules = field.getAttribute('data-rules').split('|');
            const value = field.value;
            let isValid = true;
            let errorMessage = '';

            for (const rule of rules) {
                const [ruleName, ruleParam] = rule.split(':');

                if (this.validators[ruleName]) {
                    if (!this.validators[ruleName](value, ruleParam)) {
                        isValid = false;
                        errorMessage = this.getErrorMessage(ruleName, ruleParam, field);
                        break;
                    }
                }
            }

            this.updateFieldState(field, isValid, errorMessage);
            return isValid;
        }

        getErrorMessage(rule, param, field) {
            const customMessage = field.getAttribute(`data-error-${rule}`);
            if (customMessage) return customMessage;

            const messages = {
                required: 'This field is required',
                email: 'Please enter a valid email address',
                minLength: `Must be at least ${param} characters`,
                maxLength: `Must be no more than ${param} characters`,
                pattern: 'Please match the requested format',
                match: 'Fields do not match'
            };

            return messages[rule] || 'Invalid value';
        }

        updateFieldState(field, isValid, errorMessage) {
            const container = field.closest('[data-field]') || field.parentElement;
            let errorEl = container.querySelector('[data-field-error]');

            // Remove existing states
            field.classList.remove('border-error', 'border-success', 'bg-error-light', 'bg-success-light');

            if (isValid) {
                field.classList.add('border-success', 'bg-success-light');
                if (errorEl) errorEl.remove();
            } else {
                field.classList.add('border-error', 'bg-error-light');

                if (!errorEl) {
                    errorEl = document.createElement('p');
                    errorEl.setAttribute('data-field-error', '');
                    errorEl.className = 'text-xs text-error font-medium mt-1';
                    container.appendChild(errorEl);
                }
                errorEl.textContent = errorMessage;
            }

            field.dispatchEvent(new CustomEvent('field:validated', {
                detail: { isValid, errorMessage }
            }));
        }

        // Add custom validator
        addValidator(name, fn) {
            this.validators[name] = fn;
        }
    }

    // ============================================
    // MOBILE MENU TOGGLE
    // ============================================

    class MobileMenu {
        constructor() {
            this.isOpen = false;
            this.init();
        }

        init() {
            document.querySelectorAll('[data-mobile-menu-trigger]').forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    const menuId = trigger.getAttribute('data-mobile-menu-trigger');
                    this.toggle(menuId);
                });
            });

            // Close on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeAll();
                }
            });

            // Close on resize to desktop
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768 && this.isOpen) {
                    this.closeAll();
                }
            });
        }

        toggle(menuId) {
            const menu = document.querySelector(`[data-mobile-menu="${menuId}"]`);
            const trigger = document.querySelector(`[data-mobile-menu-trigger="${menuId}"]`);

            if (!menu) return;

            this.isOpen = !this.isOpen;

            menu.classList.toggle('hidden');
            menu.classList.toggle('flex');

            // Update trigger icon
            const openIcon = trigger?.querySelector('[data-menu-icon-open]');
            const closeIcon = trigger?.querySelector('[data-menu-icon-close]');

            if (openIcon) openIcon.classList.toggle('hidden', this.isOpen);
            if (closeIcon) closeIcon.classList.toggle('hidden', !this.isOpen);

            // Prevent body scroll when menu is open
            document.body.style.overflow = this.isOpen ? 'hidden' : '';

            // Dispatch event
            menu.dispatchEvent(new CustomEvent(this.isOpen ? 'menu:opened' : 'menu:closed'));
        }

        closeAll() {
            document.querySelectorAll('[data-mobile-menu]').forEach(menu => {
                menu.classList.add('hidden');
                menu.classList.remove('flex');
            });

            document.querySelectorAll('[data-mobile-menu-trigger]').forEach(trigger => {
                const openIcon = trigger.querySelector('[data-menu-icon-open]');
                const closeIcon = trigger.querySelector('[data-menu-icon-close]');
                if (openIcon) openIcon.classList.remove('hidden');
                if (closeIcon) closeIcon.classList.add('hidden');
            });

            document.body.style.overflow = '';
            this.isOpen = false;
        }
    }

    // ============================================
    // TOOLTIP COMPONENT
    // ============================================

    class Tooltip {
        constructor() {
            this.activeTooltip = null;
            this.init();
        }

        init() {
            document.querySelectorAll('[data-tooltip]').forEach(trigger => {
                const content = trigger.getAttribute('data-tooltip');
                const position = trigger.getAttribute('data-tooltip-position') || 'top';

                trigger.addEventListener('mouseenter', () => this.show(trigger, content, position));
                trigger.addEventListener('mouseleave', () => this.hide());
                trigger.addEventListener('focus', () => this.show(trigger, content, position));
                trigger.addEventListener('blur', () => this.hide());
            });
        }

        show(trigger, content, position) {
            this.hide(); // Remove any existing tooltip

            const tooltip = document.createElement('div');
            tooltip.setAttribute('data-tooltip-element', '');
            tooltip.className = 'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-brand-black border-2 border-black shadow-brand-sm whitespace-nowrap';
            tooltip.textContent = content;
            tooltip.style.opacity = '0';
            tooltip.style.transition = 'opacity 150ms ease';

            document.body.appendChild(tooltip);
            this.activeTooltip = tooltip;

            // Position tooltip
            const triggerRect = trigger.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            let top, left;

            switch (position) {
                case 'top':
                    top = triggerRect.top - tooltipRect.height - 8 + window.scrollY;
                    left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + window.scrollX;
                    break;
                case 'bottom':
                    top = triggerRect.bottom + 8 + window.scrollY;
                    left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + window.scrollX;
                    break;
                case 'left':
                    top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + window.scrollY;
                    left = triggerRect.left - tooltipRect.width - 8 + window.scrollX;
                    break;
                case 'right':
                    top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + window.scrollY;
                    left = triggerRect.right + 8 + window.scrollX;
                    break;
            }

            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;

            requestAnimationFrame(() => {
                tooltip.style.opacity = '1';
            });
        }

        hide() {
            if (this.activeTooltip) {
                this.activeTooltip.remove();
                this.activeTooltip = null;
            }
        }
    }

    // ============================================
    // PASSWORD TOGGLE
    // ============================================

    class PasswordToggle {
        constructor() {
            this.init();
        }

        init() {
            document.querySelectorAll('[data-password-toggle]').forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    const inputId = toggle.getAttribute('data-password-toggle');
                    const input = document.getElementById(inputId) || toggle.previousElementSibling;

                    if (!input) return;

                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';

                    // Update icon if using Lucide
                    const eyeIcon = toggle.querySelector('[data-lucide="eye"]');
                    const eyeOffIcon = toggle.querySelector('[data-lucide="eye-off"]');

                    if (eyeIcon) eyeIcon.classList.toggle('hidden', !isPassword);
                    if (eyeOffIcon) eyeOffIcon.classList.toggle('hidden', isPassword);

                    // Update aria
                    toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
                });
            });
        }
    }

    // ============================================
    // CHECKBOX/TOGGLE COMPONENT
    // ============================================

    class Toggle {
        constructor() {
            this.init();
        }

        init() {
            // Custom checkboxes
            document.querySelectorAll('[data-checkbox]').forEach(checkbox => {
                checkbox.addEventListener('click', () => {
                    const isChecked = checkbox.getAttribute('data-checked') === 'true';
                    checkbox.setAttribute('data-checked', !isChecked);

                    const checkIcon = checkbox.querySelector('[data-check-icon]');
                    if (checkIcon) checkIcon.classList.toggle('hidden', isChecked);

                    checkbox.classList.toggle('bg-brand-yellow', !isChecked);
                    checkbox.classList.toggle('bg-white', isChecked);

                    checkbox.dispatchEvent(new CustomEvent('toggle:changed', {
                        detail: { checked: !isChecked }
                    }));
                });
            });

            // Toggle switches
            document.querySelectorAll('[data-toggle-switch]').forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const isChecked = toggle.getAttribute('data-checked') === 'true';
                    toggle.setAttribute('data-checked', !isChecked);

                    const knob = toggle.querySelector('[data-toggle-knob]');
                    if (knob) {
                        knob.style.transform = isChecked ? 'translateX(0)' : 'translateX(24px)';
                    }

                    toggle.classList.toggle('bg-brand-yellow', !isChecked);
                    toggle.classList.toggle('bg-gray-300', isChecked);

                    toggle.dispatchEvent(new CustomEvent('toggle:changed', {
                        detail: { checked: !isChecked }
                    }));
                });
            });
        }
    }

    // ============================================
    // COPY TO CLIPBOARD
    // ============================================

    class CopyToClipboard {
        constructor() {
            this.init();
        }

        init() {
            document.querySelectorAll('[data-copy]').forEach(trigger => {
                trigger.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const targetId = trigger.getAttribute('data-copy');
                    const target = document.getElementById(targetId) || trigger.querySelector('[data-copy-content]');

                    if (!target) return;

                    const text = target.textContent || target.value;

                    try {
                        await navigator.clipboard.writeText(text);

                        // Show success state
                        const originalText = trigger.innerHTML;
                        trigger.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';

                        setTimeout(() => {
                            trigger.innerHTML = originalText;
                        }, 2000);

                        trigger.dispatchEvent(new CustomEvent('copy:success'));
                    } catch (err) {
                        trigger.dispatchEvent(new CustomEvent('copy:error'));
                    }
                });
            });
        }
    }

    // ============================================
    // DARK MODE TOGGLE
    // ============================================

    class DarkMode {
        constructor() {
            this.storageKey = 'ms-theme';
            this.init();
        }

        init() {
            // Check for saved preference or system preference
            const savedTheme = localStorage.getItem(this.storageKey);
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (savedTheme) {
                this.setTheme(savedTheme);
            } else if (systemPrefersDark) {
                this.setTheme('dark');
            }

            // Bind toggle buttons
            document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
                toggle.addEventListener('click', () => this.toggle());
            });

            // Listen for system preference changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.storageKey)) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }

        getTheme() {
            return document.documentElement.getAttribute('data-theme') || 'light';
        }

        setTheme(theme) {
            // Add transition class for smooth switching
            document.documentElement.classList.add('theme-transition');

            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(this.storageKey, theme);

            // Update toggle buttons
            document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
                const lightIcon = toggle.querySelector('[data-theme-icon="light"]');
                const darkIcon = toggle.querySelector('[data-theme-icon="dark"]');

                if (lightIcon) lightIcon.classList.toggle('hidden', theme === 'dark');
                if (darkIcon) darkIcon.classList.toggle('hidden', theme === 'light');
            });

            // Remove transition class after animation
            setTimeout(() => {
                document.documentElement.classList.remove('theme-transition');
            }, 300);

            // Dispatch event
            document.dispatchEvent(new CustomEvent('theme:changed', {
                detail: { theme }
            }));
        }

        toggle() {
            const currentTheme = this.getTheme();
            this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        }

        // Check if dark mode is active
        isDark() {
            return this.getTheme() === 'dark';
        }
    }

    // ============================================
    // INITIALIZE ALL COMPONENTS
    // ============================================

    // Make components globally available
    window.MSDesignSystem = {
        Modal: null,
        Dropdown: null,
        Tabs: null,
        Accordion: null,
        Toast: null,
        FormValidator: null,
        MobileMenu: null,
        Tooltip: null,
        PasswordToggle: null,
        Toggle: null,
        CopyToClipboard: null,
        DarkMode: null,

        init() {
            this.Modal = new Modal();
            this.Dropdown = new Dropdown();
            this.Tabs = new Tabs();
            this.Accordion = new Accordion();
            this.Toast = new Toast();
            this.FormValidator = new FormValidator();
            this.MobileMenu = new MobileMenu();
            this.Tooltip = new Tooltip();
            this.PasswordToggle = new PasswordToggle();
            this.Toggle = new Toggle();
            this.CopyToClipboard = new CopyToClipboard();
            this.DarkMode = new DarkMode();

            console.log('Movers+Shakers Design System initialized');
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.MSDesignSystem.init());
    } else {
        window.MSDesignSystem.init();
    }

})();
