import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { sharedStyles, tokens } from './styles/shared';

/**
 * Movers+Shakers Modal Web Component
 * 
 * @element ms-modal
 * @fires close - Fired when modal is closed
 * 
 * @example
 * ```html
 * <ms-button onclick="document.querySelector('ms-modal').open = true">Open Modal</ms-button>
 * 
 * <ms-modal title="Confirm Action">
 *   <p>Are you sure you want to proceed?</p>
 *   <div slot="footer">
 *     <ms-button variant="outline">Cancel</ms-button>
 *     <ms-button variant="primary">Confirm</ms-button>
 *   </div>
 * </ms-modal>
 * ```
 */
@customElement('ms-modal')
export class MsModal extends LitElement {
    static styles = [
        sharedStyles,
        css`
      .backdrop {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 1040;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease;
      }

      .backdrop.open {
        opacity: 1;
        visibility: visible;
      }

      .modal {
        position: relative;
        width: 100%;
        max-height: calc(100vh - 2rem);
        background-color: ${tokens.colors.brandWhite};
        border: 2px solid ${tokens.colors.brandBlack};
        box-shadow: ${tokens.shadows.lg};
        display: flex;
        flex-direction: column;
        z-index: 1050;
        transform: translateY(-1rem);
        transition: transform 0.2s ease;
      }

      .backdrop.open .modal {
        transform: translateY(0);
      }

      /* Sizes */
      .modal.sm { max-width: 24rem; }
      .modal.md { max-width: 32rem; }
      .modal.lg { max-width: 48rem; }
      .modal.xl { max-width: 64rem; }
      .modal.full { max-width: 100%; }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-bottom: 2px solid ${tokens.colors.greyLight};
      }

      .title {
        font-family: 'Oswald', sans-serif;
        font-weight: 700;
        font-size: 1.25rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        font-size: 1.5rem;
        line-height: 1;
        color: ${tokens.colors.brandBlack};
      }

      .content {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 2px solid ${tokens.colors.greyLight};
        background-color: ${tokens.colors.greyLight};
      }
    `,
    ];

    @property({ type: Boolean, reflect: true }) open = false;
    @property({ type: String }) title = '';
    @property({ type: String }) size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
    @property({ type: Boolean }) closeOnBackdrop = true;
    @property({ type: Boolean }) closeOnEscape = true;

    connectedCallback() {
        super.connectedCallback();
        this._boundKeyHandler = this._handleKeyDown.bind(this);
        document.addEventListener('keydown', this._boundKeyHandler);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this._boundKeyHandler);
    }

    private _boundKeyHandler: (e: KeyboardEvent) => void = () => { };

    private _handleKeyDown(e: KeyboardEvent) {
        if (this.closeOnEscape && e.key === 'Escape' && this.open) {
            this._close();
        }
    }

    private _handleBackdropClick(e: Event) {
        if (this.closeOnBackdrop && e.target === e.currentTarget) {
            this._close();
        }
    }

    private _close() {
        this.open = false;
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    }

    render() {
        return html`
      <div class="backdrop ${this.open ? 'open' : ''}" @click=${this._handleBackdropClick}>
        <div class="modal ${this.size}" role="dialog" aria-modal="true">
          <div class="header">
            ${this.title ? html`<h2 class="title">${this.title}</h2>` : ''}
            <button class="close-btn" @click=${this._close} aria-label="Close modal">×</button>
          </div>
          <div class="content">
            <slot></slot>
          </div>
          <div class="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'ms-modal': MsModal;
    }
}
