import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sharedStyles, tokens } from './styles/shared';

/**
 * Movers+Shakers Badge Web Component
 * 
 * @element ms-badge
 * 
 * @example
 * ```html
 * <ms-badge>New</ms-badge>
 * <ms-badge variant="success" dot>Active</ms-badge>
 * <ms-badge variant="error" size="lg">Urgent</ms-badge>
 * ```
 */
@customElement('ms-badge')
export class MsBadge extends LitElement {
    static styles = [
        sharedStyles,
        css`
      :host {
        display: inline-flex;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        border: 1px solid;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 500;
      }

      /* Sizes */
      .badge.sm {
        padding: 0.125rem 0.375rem;
        font-size: 0.625rem;
      }

      .badge.md {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }

      .badge.lg {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
      }

      /* Variants */
      .badge.default {
        background-color: ${tokens.colors.greyLight};
        color: ${tokens.colors.brandBlack};
        border-color: ${tokens.colors.grey};
      }

      .badge.success {
        background-color: ${tokens.colors.successLight};
        color: ${tokens.colors.success};
        border-color: ${tokens.colors.success};
      }

      .badge.error {
        background-color: ${tokens.colors.errorLight};
        color: ${tokens.colors.error};
        border-color: ${tokens.colors.error};
      }

      .badge.warning {
        background-color: ${tokens.colors.warningLight};
        color: ${tokens.colors.warning};
        border-color: ${tokens.colors.warning};
      }

      .badge.info {
        background-color: ${tokens.colors.infoLight};
        color: ${tokens.colors.info};
        border-color: ${tokens.colors.info};
      }

      /* Dot indicator */
      .dot {
        width: 0.4375rem;
        height: 0.4375rem;
        border-radius: 50%;
      }

      .dot.default { background-color: ${tokens.colors.grey}; }
      .dot.success { background-color: ${tokens.colors.success}; }
      .dot.error { background-color: ${tokens.colors.error}; }
      .dot.warning { background-color: ${tokens.colors.warning}; }
      .dot.info { background-color: ${tokens.colors.info}; }
    `,
    ];

    @property({ type: String }) variant: 'default' | 'success' | 'error' | 'warning' | 'info' = 'default';
    @property({ type: String }) size: 'sm' | 'md' | 'lg' = 'md';
    @property({ type: Boolean }) dot = false;

    render() {
        return html`
      <span class="badge ${this.variant} ${this.size}">
        ${this.dot ? html`<span class="dot ${this.variant}"></span>` : ''}
        <slot></slot>
      </span>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'ms-badge': MsBadge;
    }
}
