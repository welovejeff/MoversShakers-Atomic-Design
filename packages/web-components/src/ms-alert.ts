import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sharedStyles, tokens } from './styles/shared';

/**
 * Movers+Shakers Alert Web Component
 * 
 * @element ms-alert
 * @fires dismiss - Fired when alert is dismissed
 * 
 * @example
 * ```html
 * <ms-alert variant="info" title="Heads up">
 *   This is an informational message.
 * </ms-alert>
 * 
 * <ms-alert variant="error" title="Error" dismissible>
 *   Something went wrong.
 * </ms-alert>
 * ```
 */
@customElement('ms-alert')
export class MsAlert extends LitElement {
    static styles = [
        sharedStyles,
        css`
      :host {
        display: block;
      }

      .alert {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        border: 2px solid;
      }

      /* Variants */
      .alert.info {
        background-color: ${tokens.colors.infoLight};
        border-color: ${tokens.colors.info};
      }
      .alert.success {
        background-color: ${tokens.colors.successLight};
        border-color: ${tokens.colors.success};
      }
      .alert.warning {
        background-color: ${tokens.colors.warningLight};
        border-color: ${tokens.colors.warning};
      }
      .alert.error {
        background-color: ${tokens.colors.errorLight};
        border-color: ${tokens.colors.error};
      }

      .content {
        flex: 1;
        min-width: 0;
      }

      .title {
        font-family: 'Oswald', sans-serif;
        font-weight: 700;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.25rem;
      }

      .title.info { color: ${tokens.colors.info}; }
      .title.success { color: ${tokens.colors.success}; }
      .title.warning { color: ${tokens.colors.warning}; }
      .title.error { color: ${tokens.colors.error}; }

      .body {
        font-size: 0.875rem;
        color: ${tokens.colors.brandBlack};
        line-height: 1.5;
      }

      .dismiss {
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        font-size: 1.25rem;
        line-height: 1;
        opacity: 0.7;
      }

      .dismiss:hover {
        opacity: 1;
      }
    `,
    ];

    @property({ type: String }) variant: 'info' | 'success' | 'warning' | 'error' = 'info';
    @property({ type: String }) title = '';
    @property({ type: Boolean }) dismissible = false;

    render() {
        return html`
      <div class="alert ${this.variant}" role="alert">
        <div class="content">
          ${this.title ? html`<div class="title ${this.variant}">${this.title}</div>` : ''}
          <div class="body"><slot></slot></div>
        </div>
        ${this.dismissible
                ? html`<button class="dismiss" @click=${this._onDismiss} aria-label="Dismiss">×</button>`
                : ''}
      </div>
    `;
    }

    private _onDismiss() {
        this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'ms-alert': MsAlert;
    }
}
