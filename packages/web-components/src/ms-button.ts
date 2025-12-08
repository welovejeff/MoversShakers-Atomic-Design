import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sharedStyles, tokens } from './styles/shared';

/**
 * Movers+Shakers Button Web Component
 * 
 * @element ms-button
 * @fires click - Fired when button is clicked
 * 
 * @example
 * ```html
 * <ms-button variant="primary">Click Me</ms-button>
 * <ms-button variant="secondary" size="lg">Large Button</ms-button>
 * <ms-button variant="outline" loading>Loading...</ms-button>
 * ```
 */
@customElement('ms-button')
export class MsButton extends LitElement {
    static styles = [
        sharedStyles,
        css`
      :host {
        display: inline-block;
      }

      button {
        font-family: 'Oswald', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 700;
        border: 2px solid;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.2s ease;
        position: relative;
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Size variants */
      button.sm {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
      }

      button.md {
        padding: 0.625rem 1.25rem;
        font-size: 0.875rem;
      }

      button.lg {
        padding: 0.875rem 1.75rem;
        font-size: 1rem;
      }

      /* Variant: Primary */
      button.primary {
        background-color: ${tokens.colors.brandYellow};
        color: ${tokens.colors.brandBlack};
        border-color: ${tokens.colors.brandBlack};
        box-shadow: ${tokens.shadows.md};
      }

      button.primary:hover:not(:disabled) {
        transform: translate(-2px, -2px);
        box-shadow: ${tokens.shadows.lg};
      }

      /* Variant: Secondary */
      button.secondary {
        background-color: ${tokens.colors.brandBlack};
        color: ${tokens.colors.brandWhite};
        border-color: ${tokens.colors.brandBlack};
        box-shadow: ${tokens.shadows.md};
      }

      button.secondary:hover:not(:disabled) {
        transform: translate(-2px, -2px);
        box-shadow: ${tokens.shadows.yellowMd};
      }

      /* Variant: Outline */
      button.outline {
        background-color: transparent;
        color: ${tokens.colors.brandBlack};
        border-color: ${tokens.colors.brandBlack};
      }

      button.outline:hover:not(:disabled) {
        background-color: ${tokens.colors.brandYellow};
      }

      /* Variant: Ghost */
      button.ghost {
        background-color: transparent;
        color: ${tokens.colors.brandBlack};
        border-color: transparent;
      }

      button.ghost:hover:not(:disabled) {
        background-color: ${tokens.colors.greyLight};
      }

      /* Full width */
      :host([fullwidth]) button {
        width: 100%;
      }

      /* Spinner */
      .spinner {
        width: 1em;
        height: 1em;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
    ];

    @property({ type: String }) variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary';
    @property({ type: String }) size: 'sm' | 'md' | 'lg' = 'md';
    @property({ type: Boolean }) loading = false;
    @property({ type: Boolean }) disabled = false;
    @property({ type: Boolean, reflect: true }) fullwidth = false;

    render() {
        const classes = `${this.variant} ${this.size}`;

        return html`
      <button 
        class=${classes}
        ?disabled=${this.disabled || this.loading}
        @click=${this._handleClick}
      >
        ${this.loading
                ? html`
              <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
              </svg>
            `
                : ''}
        <slot></slot>
      </button>
    `;
    }

    private _handleClick(e: Event) {
        if (this.disabled || this.loading) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'ms-button': MsButton;
    }
}
