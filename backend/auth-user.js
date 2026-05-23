import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Ensure a user row exists for the given Auth0 profile.
 * - Creates a new user with `roleForNew` on first login.
 * - Updates profile fields on subsequent logins but preserves existing role.
 */
export async function ensureUserFromProfile(profile, roleForNew = "USER") {
  if (!profile?.sub || !profile?.email) throw new Error("Missing auth profile");

  const user = await prisma.user.upsert({
    where: { auth0Id: profile.sub },
    update: {
      email: profile.email,
      name: profile.name ?? profile.nickname ?? profile.email,
      picture: profile.picture ?? null,
      // do not overwrite role here
    },
    create: {
      auth0Id: profile.sub,
      email: profile.email,
      name: profile.name ?? profile.nickname ?? profile.email,
      picture: profile.picture ?? null,
      role: roleForNew,
    },
  });

  return user;
}

export default ensureUserFromProfile;
