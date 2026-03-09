import { db } from "./db";

export async function isEmailAllowed(email: string): Promise<boolean> {
  if (!email?.trim()) return false;

  const normalizedEmail = email.trim().toLowerCase();

  const result = await db.execute({
    sql: `
      SELECT 1
      FROM allowed_users
      WHERE lower(trim(email)) = ?
      LIMIT 1
    `,
    args: [normalizedEmail],
  });

  return result.rows.length > 0;
}