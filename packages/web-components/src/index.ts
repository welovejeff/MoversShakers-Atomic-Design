/**
 * Movers+Shakers Design System - Web Components
 * 
 * Usage:
 * ```html
 * <script type="module" src="@movers-shakers/web-components"></script>
 * 
 * <ms-button variant="primary">Click Me</ms-button>
 * <ms-badge variant="success">Active</ms-badge>
 * <ms-avatar initials="JD" size="lg"></ms-avatar>
 * <ms-card hoverable>Card content</ms-card>
 * <ms-alert variant="info" title="Heads up">Message here</ms-alert>
 * <ms-modal title="My Modal" open>Modal content</ms-modal>
 * ```
 */

// Export all components
export { MsButton } from './ms-button';
export { MsBadge } from './ms-badge';
export { MsAvatar } from './ms-avatar';
export { MsCard } from './ms-card';
export { MsAlert } from './ms-alert';
export { MsModal } from './ms-modal';

// Export tokens for external use
export { tokens, sharedStyles } from './styles/shared';
