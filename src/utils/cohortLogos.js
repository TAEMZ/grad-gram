// Verified Local Institutional Crest Assets
export const LOCAL_CRESTS = {
  hawassa: "/crests/hawassa.webp",
  harvard: "/crests/harvard.svg",
  stanford: "/crests/stanford.svg",
  cambridge: "/crests/cambridge.svg",
  oxford: "/crests/oxford.svg",
  mit: "/crests/mit.svg",
  berkeley: "/crests/berkeley.svg",
  columbia: "/crests/columbia.svg",
  cornell: "/crests/cornell.svg",
  imperial: "/crests/imperial.svg",
  princeton: "/crests/princeton.svg",
  yale: "/crests/yale.svg",
  nus: "/crests/nus.svg",
  tsinghua: "/crests/tsinghua.svg",
  tokyo: "/crests/tokyo.png",
  toronto: "/crests/toronto.svg",
  worabe: "/crests/worabe.svg",
};

/**
 * Resolves the verified official crest URL for a room or university name.
 * Falls back to room.logo if it points to a valid local path.
 */
export function getCohortLogo(roomOrName) {
  if (!roomOrName) return null;
  const name = (typeof roomOrName === "string" ? roomOrName : roomOrName.university || "").toLowerCase();
  for (const [key, path] of Object.entries(LOCAL_CRESTS)) {
    if (name.includes(key)) {
      return path;
    }
  }
  if (typeof roomOrName === "object" && roomOrName?.logo && roomOrName.logo.startsWith("/")) {
    return roomOrName.logo;
  }
  return null;
}
