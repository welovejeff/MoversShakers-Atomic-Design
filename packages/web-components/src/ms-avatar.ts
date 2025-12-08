import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { sharedStyles, tokens } from './styles/shared';

/**
 * Movers+Shakers Avatar Web Component
 * 
 * @element ms-avatar
 * 
 * @example
 * ```html
 * <ms-avatar src="/user.jpg" alt="John Doe"></ms-avatar>
 * <ms-avatar initials="JD" size="lg"></ms-avatar>
 * <ms-avatar src="/user.jpg" status="online"></ms-avatar>
 * ```
 */
@customElement('ms-avatar')
export class MsAvatar extends LitElement {
    static styles = [
        sharedStyles,
        css`
      :host {
        display: inline-block;
      }

      .avatar {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: ${tokens.colors.greyLight};
        border: 2px solid ${tokens.colors.brandBlack};
        overflow: hidden;
        font-family: 'Oswald', sans-serif;
        font-weight: 700;
        text-transform: uppercase;
        color: ${tokens.colors.brandBlack};
      }

      /* Sizes */
      .avatar.xs { width: 1.5rem; height: 1.5rem; font-size: 0.625rem; }
      .avatar.sm { width: 2rem; height: 2rem; font-size: 0.75rem; }
      .avatar.md { width: 2.5rem; height: 2.5rem; font-size: 0.875rem; }
      .avatar.lg { width: 3rem; height: 3rem; font-size: 1rem; }
      .avatar.xl { width: 4rem; height: 4rem; font-size: 1.25rem; }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .status {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 25%;
        height: 25%;
        min-width: 8px;
        min-height: 8px;
        border-radius: 50%;
        border: 2px solid ${tokens.colors.brandWhite};
      }

      .status.online { background-color: ${tokens.colors.success}; }
      .status.offline { background-color: ${tokens.colors.grey}; }
      .status.away { background-color: ${tokens.colors.warning}; }
      .status.busy { background-color: ${tokens.colors.error}; }
    `,
    ];

    @property({ type: String }) src = '';
    @property({ type: String }) alt = '';
    @property({ type: String }) initials = '';
    @property({ type: String }) size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
    @property({ type: String }) status: 'online' | 'offline' | 'away' | 'busy' | '' = '';

    @state() private _imgError = false;

    render() {
        const showImage = this.src && !this._imgError;
        const fallback = this.initials || this.alt.charAt(0).toUpperCase() || '?';

        return html`
      <div class="avatar ${this.size}">
        ${showImage
                ? html`<img src=${this.src} alt=${this.alt} @error=${this._onImgError} />`
                : html`<span>${fallback}</span>`}
        ${this.status ? html`<span class="status ${this.status}"></span>` : ''}
      </div>
    `;
    }

    private _onImgError() {
        this._imgError = true;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'ms-avatar': MsAvatar;
    }
}
