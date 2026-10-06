import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const siteKey = '6LeG_uEtAAAAAJ8ZM9szpfXhhO-RsEozroyQ3AiE';

export type RecaptchaAction = 'LOGIN' | 'SIGNUP';

declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (key: string, options: { action: RecaptchaAction }) => Promise<string>;
      };
    };
  }
}

export class RecaptchaVerificationError extends Error {
  constructor() {
    super('Security verification could not be completed. Please try again.');
    this.name = 'RecaptchaVerificationError';
  }
}

export async function verifyRecaptchaAction(action: RecaptchaAction): Promise<void> {
  try {
    const recaptcha = window.grecaptcha?.enterprise;
    if (!recaptcha) throw new Error('The reCAPTCHA Enterprise API did not load.');

    await new Promise<void>(resolve => recaptcha.ready(resolve));
    const token = await recaptcha.execute(siteKey, { action });
    if (!token) throw new Error('reCAPTCHA returned an empty token.');

    const assessToken = httpsCallable<
      { token: string; action: RecaptchaAction },
      { verified: boolean }
    >(functions, 'assessRecaptchaToken');
    await assessToken({ token, action });
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    throw new RecaptchaVerificationError();
  }
}
