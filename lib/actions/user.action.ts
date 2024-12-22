"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

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
  };
  session?: {
    session_token: string;
  };
  error?: string;
}

export const createUser = async (
  user: CreateUserParams,
): Promise<UserResponse> => {
  try {
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      return {
        user: null,
        error: "Email already registered. Please login instead.",
      };
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    // Create new user with hashed password
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

    return {
      user: newUser,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      user: null,
      error: "An error occurred during registration",
    };
  }
};

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

export const verifyUserCredentials = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  try {
    const user = await prisma.users.findUnique({
      where: { email: credentials.email },
      include: {
        sessions: {
          include: {
            clinics: true,
          },
        },
      },
    });

    if (!user) {
      return {
        error: "Invalid credentials",
      };
    }

    const passwordMatch = await bcrypt.compare(
      credentials.password,
      user.password,
    );

    if (!passwordMatch) {
      return {
        error: "Invalid credentials",
      };
    }

    // Check if user has any associated clinics
    const hasClinic = user.sessions.some((session) => session.clinics !== null);

    if (!hasClinic) {
      // User needs to complete registration
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          hasClinic: false,
        },
      };
    }

    // User has completed registration, create new session
    const newSession = await prisma.sessions.create({
      data: {
        user_id: user.id,
        clinic_id: user.sessions[0].clinic_id, // Use the first clinic
        session_token: uuidv4(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasClinic: true,
      },
      session: {
        session_token: newSession.session_token,
      },
    };
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return {
      error: "An error occurred during login",
    };
  }
};

export const validateSession = async (
  sessionToken: string,
): Promise<boolean> => {
  try {
    const session = await prisma.sessions.findUnique({
      where: { session_token: sessionToken },
      include: {
        clinics: true,
      },
    });

    if (!session) {
      return false;
    }

    // Check if session has expired
    if (new Date() > session.expires) {
      // Clean up expired session
      await prisma.sessions.delete({
        where: { session_token: sessionToken },
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating session:", error);
    return false;
  }
};

export const invalidateSession = async (
  sessionToken: string,
): Promise<void> => {
  try {
    await prisma.sessions.delete({
      where: { session_token: sessionToken },
    });
  } catch (error) {
    console.error("Error invalidating session:", error);
  }
};
