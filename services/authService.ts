import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    User
} from 'firebase/auth';
import { auth } from './firebaseConfig';

const ALLOWED_DOMAIN = 'moversshakers.co';

export const authService = {
    /**
     * Sign in with Google, restricting access to specific domain.
     */
    async signInWithGoogle(): Promise<User> {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check domain restriction
            if (!user.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
                // If domain doesn't match, sign out immediately and throw error
                await signOut(auth);
                throw new Error(`Access Restricted: Only @${ALLOWED_DOMAIN} emails are allowed.`);
            }

            return user;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    /**
     * Sign out the current user.
     */
    async signOutUser(): Promise<void> {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }
};
