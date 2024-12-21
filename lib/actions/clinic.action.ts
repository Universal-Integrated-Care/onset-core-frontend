"use server";

import { PrismaClient } from "@prisma/client";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const prisma = new PrismaClient();

export const createUser = async (user: CreateUserParams) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      return existingUser; // Return existing user if found
    }

    // Create new user
    const newUser = await prisma.users.create({
      data: {
        email: user.email,
        name: user.name,
        phone: user.phone,
        password: user.password || "", // Replace with hashed password in real apps
      },
    });
    console.log(newUser);

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUser = async (userId: string) => {
  try {
    // Validate userId
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Convert userId to Int
    const id = parseInt(userId);

    // Find user by ID
    const user = await prisma.users.findUnique({
      where: { id },
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
