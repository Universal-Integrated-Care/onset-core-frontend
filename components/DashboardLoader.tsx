"use client";

import React from "react";
import { MoonLoader } from "react-spinners";

interface DashboardLoaderProps {
  text?: string; // Optional prop for loading text
}

const DashboardLoader = ({
  text = "Loading, please wait...",
}: DashboardLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-300 text-white gap-4">
      {/* Loader Animation */}
      <MoonLoader
        color="#4F46E5"
        loading={true}
        size={80}
        speedMultiplier={1}
        aria-label="Loading Spinner"
        data-testid="dashboard-loader"
      />

      {/* Animated Text */}
      <p className="text-xl font-semibold animate-pulse mt-4">{text}</p>
    </div>
  );
};

export default DashboardLoader;
