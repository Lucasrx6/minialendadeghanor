export function usernameToAuthEmail(username: string) {
  const normalized = username
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]/g, "");

  return `${normalized}@users.minialendadeghanor.app`;
}

export function isValidUsername(username: string) {
  const clean = usernameToAuthEmail(username).split("@")[0];
  return clean.length >= 3 && clean.length <= 32;
}
