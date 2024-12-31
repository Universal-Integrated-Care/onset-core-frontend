import { NextRequest } from "next/server";
import { getServerSession } from "next-auth"; // Adjust to your session library

export async function getSession(req: NextRequest) {
  const session = await getServerSession(req);
  if (session?.user) {
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        clinic_id: session.user.clinic_id, // Ensure clinic_id is available
      },
    };
  }
  return null;
}
