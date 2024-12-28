"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/table/Datatable";
import { practitionerColumns, Practitioner } from "./practitionerColumns";
import DashboardLoader from "@/components/DashboardLoader";

interface PractitionerTableProps {
  newPractitioner?: Practitioner; // ✅ Allow dynamic addition of new practitioner
}

const PractitionerTable = ({ newPractitioner }: PractitionerTableProps) => {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * ✅ Fetch Practitioners (Initial Load Only)
   */
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

  /**
   * ✅ Add New Practitioner Dynamically
   */
  useEffect(() => {
    if (newPractitioner) {
      console.log("✅ Adding New Practitioner to Table:", newPractitioner);
      setPractitioners((prev) => {
        // Prevent duplicate entries
        const exists = prev.some(
          (practitioner) => practitioner.id === newPractitioner.id,
        );
        if (!exists) {
          return [newPractitioner, ...prev]; // Add to the top
        }
        return prev;
      });
    }
  }, [newPractitioner]);

  /**
   * ✅ Debug State
   */
  console.log("✅ Current Practitioners State:", practitioners);

  /**
   * ✅ Render Loading State
   */
  if (isLoading) {
    return <DashboardLoader text="Loading Practitioners, please wait..." />;
  }

  /**
   * ✅ Render Practitioner Table
   */
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Practitioners</h2>
      {/* ✅ Force re-render the DataTable */}
      <DataTable
        key={practitioners.length}
        columns={practitionerColumns}
        data={practitioners}
      />
    </section>
  );
};

export default PractitionerTable;
