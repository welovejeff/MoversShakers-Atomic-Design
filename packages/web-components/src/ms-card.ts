import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sharedStyles, tokens } from './styles/shared';

/**
 * Movers+Shakers Card Web Component
 * 
 * @element ms-card
 * @slot - Card body content
 * @slot header - Card header content
 * @slot footer - Card footer content
 * 
 * @example
 * ```html
 * <ms-card>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </ms-card>
 * 
 * <ms-card hoverable image="/hero.jpg">
 *   <span slot="header">Featured</span>
 *   <p>Card with image</p>
 *   <button slot="footer">Learn More</button>
 * </ms-card>
 * ```
 */
@customElement('ms-card')
export class MsCard extends LitElement {
    static styles = [
        sharedStyles,
        css`
      :host {
        display: block;
      }

      .card {
        background-color: ${tokens.colors.brandWhite};
        border: 2px solid ${tokens.colors.brandBlack};
        overflow: hidden;
        transition: all 0.2s ease;
      }

      .card.elevated {
        box-shadow: ${tokens.shadows.md};
      }

      .card.outline {
        border-color: ${tokens.colors.grey};
        box-shadow: none;
      }

      .card.hoverable:hover {
        transform: translateY(-4px);
        box-shadow: ${tokens.shadows.lg};
      }

      .header {
        padding: var(--card-padding);
        border-bottom: 2px solid ${tokens.colors.greyLight};
      }

      .content {
        padding: var(--card-padding);
      }

      .footer {
        padding: var(--card-padding);
        border-top: 2px solid ${tokens.colors.greyLight};
        background-color: ${tokens.colors.greyLight};
      }

      img {
        width: 100%;
        height: auto;
        display: block;
        border-bottom: 2px solid ${tokens.colors.brandBlack};
      }

      /* Padding sizes */
      :host([padding="none"]) { --card-padding: 0; }
      :host([padding="sm"]) { --card-padding: 0.75rem; }
      :host([padding="md"]), :host { --card-padding: 1.25rem; }
      :host([padding="lg"]) { --card-padding: 2rem; }
    `,
    ];

    @property({ type: String }) variant: 'default' | 'elevated' | 'outline' = 'default';
    @property({ type: String, reflect: true }) padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
    @property({ type: Boolean }) hoverable = false;
    @property({ type: String }) image = '';
    @property({ type: String }) imageAlt = '';

    render() {
        const classes = [
            'card',
            this.variant,
            this.hoverable ? 'hoverable' : '',
        ].filter(Boolean).join(' ');

        return html`
      <div class=${classes}>
        ${this.image ? html`<img src=${this.image} alt=${this.imageAlt} />` : ''}
        <slot name="header">
          <div class="header" style="display: none;"></div>
        </slot>
        <div class="content">
          <slot></slot>
        </div>
        <slot name="footer"></slot>
      </div>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'ms-card': MsCard;
    }
}
