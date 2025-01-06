import React from "react";
import clsx from "clsx";
import Image from "next/image";

interface StatCardProps {
  count?: number; // Optional prop
  label: string; // Required prop
  icon: string; // Required prop (assuming it's a string URL)
  type: "appointments" | "pending" | "cancelled"; // Adjust based on your types
}

const StatCard: React.FC<StatCardProps> = ({
  count = 0,
  label,
  icon,
  type,
}) => {
  return (
    <div
      className={clsx("stat-card", {
        "bg-appointments": type === "appointments",
        "bg-pending": type === "pending",
        "bg-cancelled": type === "cancelled",
      })}
    >
      <div className="flex items-center gap-4">
        <Image
          src={icon}
          alt={label}
          width={32}
          height={32}
          className="size-8 w-fit"
        ></Image>
        <h2 className="text-32-bold text-white">{count}</h2>
      </div>
      <p className="text-14-regular">{label}</p>
    </div>
  );
};

export default StatCard;
