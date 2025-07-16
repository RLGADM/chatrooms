export function getCookie(name: string): string | null {
  const cookies = document.cookie.split('; ');
  const match = cookies.find(c => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}