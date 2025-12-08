import type { ImgHTMLAttributes } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
    /** Size of the avatar */
    size?: AvatarSize;
    /** Image source URL */
    src?: string;
    /** Alt text for the image */
    alt?: string;
    /** Fallback initials when no image */
    initials?: string;
    /** Show online status indicator */
    status?: 'online' | 'offline' | 'away' | 'busy';
}
