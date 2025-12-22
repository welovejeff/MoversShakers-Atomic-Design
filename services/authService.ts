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
    async signInWithGoogle(): Promise<{ user: User; accessToken: string }> {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/gmail.readonly');

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const accessToken = credential?.accessToken || '';

            // Check domain restriction
            if (!user.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
                // If domain doesn't match, sign out immediately and throw error
                await signOut(auth);
                throw new Error(`Access Restricted: Only @${ALLOWED_DOMAIN} emails are allowed.`);
            }

            return { user, accessToken };
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
