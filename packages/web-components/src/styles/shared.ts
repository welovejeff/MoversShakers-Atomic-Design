import { css, unsafeCSS } from 'lit';

/**
 * Movers+Shakers Design Tokens for Web Components
 */
export const tokens = {
    colors: {
        brandYellow: unsafeCSS('#FFF000'),
        brandBlack: unsafeCSS('#111111'),
        brandWhite: unsafeCSS('#FFFFFF'),
        greyLight: unsafeCSS('#F3F4F6'),
        grey: unsafeCSS('#9CA3AF'),
        greyDark: unsafeCSS('#333333'),
        success: unsafeCSS('#10B981'),
        successLight: unsafeCSS('#D1FAE5'),
        error: unsafeCSS('#EF4444'),
        errorLight: unsafeCSS('#FEE2E2'),
        warning: unsafeCSS('#F59E0B'),
        warningLight: unsafeCSS('#FEF3C7'),
        info: unsafeCSS('#3B82F6'),
        infoLight: unsafeCSS('#DBEAFE'),
    },
    shadows: {
        sm: unsafeCSS('2px 2px 0px 0px rgba(0, 0, 0, 1)'),
        md: unsafeCSS('4px 4px 0px 0px rgba(0, 0, 0, 1)'),
        lg: unsafeCSS('8px 8px 0px 0px rgba(0, 0, 0, 1)'),
        yellowMd: unsafeCSS('4px 4px 0px 0px #FFF000'),
    },
};

export const sharedStyles = css`
  :host {
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  .brand-font {
    font-family: 'Oswald', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;
