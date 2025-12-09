// Admin authorization utilities

const ADMIN_EMAILS = ['tanner@thefiredev.com'];

export function isAdmin(email: string | undefined): boolean {
  return email ? ADMIN_EMAILS.includes(email) : false;
}

// Helper to check if a post is from today
export function isPostFromToday(publishedAt: string | null): boolean {
  if (!publishedAt) return false;

  const postDate = new Date(publishedAt);
  const today = new Date();

  return (
    postDate.getFullYear() === today.getFullYear() &&
    postDate.getMonth() === today.getMonth() &&
    postDate.getDate() === today.getDate()
  );
}

// Helper to check if research is from today
export function isResearchFromToday(researchDate: string | null): boolean {
  if (!researchDate) return false;

  const research = new Date(researchDate);
  const today = new Date();

  return research.toDateString() === today.toDateString();
}
