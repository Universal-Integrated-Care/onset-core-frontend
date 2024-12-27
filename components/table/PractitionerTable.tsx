"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/table/Datatable";
import { practitionerColumns, Practitioner } from "./practitionerColumns";
import DashboardLoader from "@/components/DashboardLoader";

const PractitionerTable = () => {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        const res = await fetch("/api/practitioners");
        if (!res.ok) throw new Error("Failed to fetch practitioners");

        const data = await res.json();
        setPractitioners(data.practitioners || []);
      } catch (error) {
        console.error("❌ Error fetching practitioners:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPractitioners();
  }, []);

  if (isLoading) {
    return <DashboardLoader text="Loading Practitioners, please wait..." />;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Practitioners</h2>
      <DataTable columns={practitionerColumns} data={practitioners} />
    </section>
  );
};

export default PractitionerTable;
