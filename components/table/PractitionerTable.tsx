"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/table/Datatable";
import { getPractitionerColumns, Practitioner } from "./practitionerColumns";
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
   * ✅ Handle Delete Practitioner
   */
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/practitioners/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete practitioner.");
      }

      console.log(`✅ Practitioner with ID ${id} deleted successfully`);

      // Remove deleted practitioner from the state
      setPractitioners((prev) => prev.filter((p) => p.id !== id));
    } catch (error: any) {
      console.error("❌ Error Deleting Practitioner:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

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
      {/* ✅ Pass `handleDelete` to columns */}
      <DataTable
        key={practitioners.length}
        columns={getPractitionerColumns(handleDelete)}
        data={practitioners}
      />
    </section>
  );
};

export default PractitionerTable;
