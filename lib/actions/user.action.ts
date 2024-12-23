"use server";

import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

import prisma from "@/lib/prisma";

interface CreateUserParams {
  email: string;
  name: string;
  phone: string;
  password: string;
}

interface UserResponse {
  user: any;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user?: {
    id: number;
    email: string;
    name: string;
    hasClinic: boolean;
    clinicId: bigint | null;
  };
  session?: {
    session_token: string;
  };
  error?: string;
}

/* ------------------------------
    ✅ Create User
------------------------------- */
export const createUser = async (
  user: CreateUserParams,
): Promise<UserResponse> => {
  try {
    const existingUser = await prisma.users.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      return {
        user: null,
        error: "Email already registered. Please login instead.",
      };
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await prisma.users.create({
      data: {
        email: user.email,
        name: user.name,
        phone: user.phone,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
      },
    });

    return { user: newUser };
  } catch (error) {
    console.error("Error creating user:", error);
    return { user: null, error: "An error occurred during registration" };
  }
};

/* ------------------------------
    ✅ Get User
------------------------------- */
export const getUser = async (userId: string) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const id = parseInt(userId);
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        clinic_id: true,
        hasClinic: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

/* ------------------------------
    ✅ Check User Clinic Status
------------------------------- */
export const checkUserClinicStatus = async (
  userId: number,
): Promise<boolean> => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { hasClinic: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user.hasClinic;
  } catch (error) {
    console.error("Error checking clinic status:", error);
    throw new Error("An error occurred while checking clinic status");
  }
};

/* ------------------------------
    ✅ Verify User Credentials
------------------------------- */
export const verifyUserCredentials = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  try {
    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: credentials.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        hasClinic: true,
        clinic_id: true,
      },
    });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(
      credentials.password,
      user.password,
    );

    if (!passwordMatch) {
      return { error: "Invalid credentials" };
    }

    // Create or retrieve an active session
    let activeSession = await prisma.sessions.findFirst({
      where: {
        user_id: user.id,
        expires: { gt: new Date() },
      },
      select: {
        session_token: true,
      },
    });

    if (!activeSession) {
      activeSession = await prisma.sessions.create({
        data: {
          user_id: user.id,
          session_token: uuidv4(),
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day session
        },
        select: {
          session_token: true,
        },
      });
    }

    // ✅ Await cookies before setting
    const cookieStore = await cookies();
    await cookieStore.set("session_token", activeSession.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasClinic: user.hasClinic,
        clinicId: user.clinic_id || null,
      },
      session: {
        session_token: activeSession.session_token,
      },
    };
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return { error: "An error occurred during login" };
  }
};

/* ------------------------------
    ✅ Logout User
------------------------------- */
export const logoutUser = async (): Promise<void> => {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (sessionToken) {
      await prisma.sessions.deleteMany({
        where: { session_token: sessionToken },
      });

      await cookieStore.delete("session_token");
    }
  } catch (error) {
    console.error("Error logging out user:", error);
    throw new Error("An error occurred during logout");
  }
};
