import React, { useState } from 'react';
import { X, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types/memorial';
import { RelationshipSelect } from './RelationshipSelect';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  isDarkMode: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  isDarkMode,
}) => {
  const [visitorName, setVisitorName] = useState<string>('');
  const [visitorRelationship, setVisitorRelationship] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    if (!visitorRelationship) {
      setErrorMsg('Please select your relationship to John first.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser: FirebaseUser = result.user;
      const profile: UserProfile = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Family Member',
        email: fbUser.email || undefined,
          emailVerified: fbUser.emailVerified,
        photoURL: fbUser.photoURL || undefined,
        relationship: visitorRelationship,
      };
      onUserChange(profile);
      onClose();
    } catch (err: unknown) {
      console.warn('Google sign-in error', err);
      const errorObj = err as { code?: string; message?: string };
      const messages: Record<string, string> = {
        'auth/unauthorized-domain': `Google sign-in is not enabled for ${window.location.hostname}. Add this domain in Firebase Authentication → Settings → Authorized domains.`,
        'auth/operation-not-allowed': 'Google sign-in is disabled. Enable Google in Firebase Authentication → Sign-in method.',
        'auth/popup-blocked': 'The sign-in popup was blocked. Allow popups for this site and try again.',
        'auth/popup-closed-by-user': 'The Google sign-in window closed before sign-in completed. Please try again.',
        'auth/cancelled-popup-request': 'Another sign-in window was opened. Please finish the latest window.',
        'auth/network-request-failed': 'Could not reach Google sign-in. Check your connection and browser blocking settings.',
        'auth/account-exists-with-different-credential': 'This email already uses another sign-in method. Log in with that method first.',
      };
      setErrorMsg(messages[errorObj.code || ''] || `Could not complete Google sign-in (${errorObj.code || 'unknown error'}). Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || (isSignUp && (!visitorRelationship || !visitorName.trim()))) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = isSignUp
        ? await createUserWithEmailAndPassword(auth, email.trim(), password)
        : await signInWithEmailAndPassword(auth, email.trim(), password);
      if (isSignUp) await updateProfile(result.user, { displayName: visitorName.trim() });
      onUserChange({
        uid: result.user.uid,
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Family Member',
        email: result.user.email || undefined,
        emailVerified: result.user.emailVerified,
        relationship: visitorRelationship || currentUser?.relationship || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'This email already has an account. Please log in.',
        'auth/invalid-credential': 'The email or password is incorrect.',
        'auth/weak-password': 'Please use a password with at least six characters.',
        'auth/operation-not-allowed': 'Email/password authentication needs to be enabled in Firebase.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
      };
      setErrorMsg(messages[code || ''] || 'Could not complete authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true); setErrorMsg(null);
    try {
      await auth.signOut();
      onUserChange(null);
      onClose();
    } catch {
      setErrorMsg('Could not sign out. Please try again.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div
        className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all ${
          isDarkMode
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100 shadow-purple-950/40'
            : 'bg-white border-stone-200 text-neutral-900 shadow-xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-400">
            <User className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-serif font-semibold text-neutral-100 dark:text-neutral-100">
            {currentUser ? 'Portal Account' : 'Sign Up or Login'}
          </h3>
          <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
            {currentUser
              ? 'You are signed in. Your identity will automatically autofill on all letters and condolences to John.'
              : 'If you want to see the messages or commune with John, please sign up or login below.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* If already signed in */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="h-10 w-10 rounded-full border border-purple-500"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white font-semibold text-sm">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-100 truncate">
                  {currentUser.displayName}
                </p>
                {currentUser.email && (
                  <p className="text-xs text-neutral-400 truncate font-mono">
                    {currentUser.email}
                  </p>
                )}
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" /> Signed in & active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="py-2.5 px-4 rounded-lg border border-red-900/40 bg-red-950/20 hover:bg-red-900/40 text-red-300 text-xs font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Sign In Options */
          <div className="space-y-4">
            <div>
                <label htmlFor="auth-relationship" className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-1">
                  Relationship to John *
                </label>
                <RelationshipSelect
                  id="auth-relationship"
                  required
                  value={visitorRelationship}
                  onChange={setVisitorRelationship}
                />
              </div>


            <p className="text-xs text-neutral-400">Select your relationship before signing up with Google.</p>
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || !visitorRelationship}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-100 text-sm font-medium transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Sign up with Google'}</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-800"></div>
              <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-neutral-500 font-sans">
                Or Use Email & Password
              </span>
              <div className="flex-grow border-t border-neutral-800"></div>
            </div>

            {/* Email/password authentication */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {isSignUp && (
                <div><label htmlFor="auth-name" className="block text-xs text-neutral-400 mb-1">Your Name *</label>
                <input id="auth-name" type="text" required value={visitorName} onChange={e => setVisitorName(e.target.value)} autoComplete="name" className="w-full px-3.5 py-2 rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-100" />
              </div>
              )}
              <div><label htmlFor="auth-email" className="block text-xs text-neutral-400 mb-1">Email address *</label>
                <input id="auth-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className="w-full px-3.5 py-2 rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-100" />
              </div>
              <div><label htmlFor="auth-password" className="block text-xs text-neutral-400 mb-1">Password *</label>
                <input id="auth-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={isSignUp ? 6 : undefined} autoComplete={isSignUp ? "new-password" : "current-password"} className="w-full px-3.5 py-2 rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-100" />
              </div>
              <button
                type="submit"
                disabled={isLoading || (isSignUp && (!visitorName.trim() || !visitorRelationship))}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-600 hover:opacity-95 text-white text-xs font-medium transition-opacity disabled:opacity-40 shadow-md shadow-purple-950/40"
              >
                {isLoading ? 'Please wait...' : isSignUp ? 'Sign up with email' : 'Log in with email'}
              </button>
            </form>
            <button type="button" disabled={isLoading} onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }} className="w-full text-sm text-purple-300">
              {isSignUp ? 'Already have an account? Log in' : 'Need an account? Sign up'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
