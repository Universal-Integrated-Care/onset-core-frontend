import React from "react";
import Image from "next/image";
import { StatusIcon } from "@/constants";
import clsx from "clsx";
import { Status } from "@/types/appwrite.types";

interface StatusBadgeProps {
  status: Status;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <div
      className={clsx("status-badge", {
        "bg-green-600": status === Status.SCHEDULED,
        "bg-red-600": status === Status.CANCELLED,
        "bg-blue-600": status === Status.PENDING,
      })}
    >
      <Image
        src={StatusIcon[status]}
        alt={status}
        width={24}
        height={24}
        className="h-fit w-3"
      ></Image>
      <p
        className={clsx("text-12-semibold capitalize", {
          "text-green-500": status === "SCHEDULED",
          "text-red-500": status === "CANCELLED",
          "text-blue-500": status === "PENDING",
        })}
      >
        {status}
      </p>
    </div>
  );
};

export default StatusBadge;
