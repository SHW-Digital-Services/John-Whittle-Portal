export const MEDIA_MANAGER_EMAIL = 'scotthw1984@gmail.com';

export function canManageMedia(user: { email?: string | null; emailVerified?: boolean } | null | undefined): boolean {
  return user?.email === MEDIA_MANAGER_EMAIL && user.emailVerified === true;
}
