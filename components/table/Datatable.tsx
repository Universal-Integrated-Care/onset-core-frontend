"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAblyAppointmentSubscription } from "@/hooks/useAblyAppointmentSubscription";

interface BaseData {
  id: string;
}

interface DataTableProps<TData extends BaseData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  clinicId?: string; // ✅ Add clinicId
  onRowUpdate?: (updatedData: UpdateData, rowId: string) => void; // Renamed from handleRowUpdate
  enableRealtime?: boolean; // Add this prop to control whether to use Ably
}

export function DataTable<TData extends BaseData, TValue>({
  columns,
  data: initialData,
  clinicId,
  onRowUpdate,
  enableRealtime = false, // Default to false
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState(initialData);
  const [globalFilter, setGlobalFilter] = useState("");

  // ✅ Update a specific row in the table
  const handleRowUpdate = (updatedRow: Partial<TData>, rowId: string) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.id === rowId ? { ...row, ...updatedRow } : row,
      ),
    );
  };
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Always call the hook, but only use its data when enabled
  const { appointments: newAppointments, error } =
    useAblyAppointmentSubscription(Number(clinicId || 0));

  useEffect(() => {
    if (enableRealtime && clinicId && newAppointments.length > 0) {
      console.log("New appointments received:", newAppointments);

      setData((prevData) => {
        // Create a copy of previous data
        const updatedData = [...prevData];

        newAppointments.forEach((newAppointment) => {
          const typedAppointment = newAppointment as unknown as TData;

          // Find index of existing appointment
          const existingIndex = updatedData.findIndex(
            (item) => item.id === typedAppointment.id,
          );

          if (existingIndex !== -1) {
            // Replace existing appointment
            updatedData[existingIndex] = typedAppointment;
          } else {
            // Add new appointment to the beginning
            updatedData.unshift(typedAppointment);
          }
        });

        return updatedData;
      });
    }
  }, [newAppointments, enableRealtime, clinicId]);

  // Update data when initialData changes
  useEffect(() => {
    console.log("Initial data changed:", initialData);

    setData((prevData) => {
      // If new data is empty, return previous data
      if (initialData.length === 0) {
        return prevData;
      }

      // Merge existing data with new initial data
      const mergedData = [...initialData];

      // Add any existing items that aren't in the new initial data
      prevData.forEach((prevItem) => {
        const existsInNew = mergedData.some(
          (newItem) => newItem.id === prevItem.id,
        );

        if (!existsInNew) {
          mergedData.push(prevItem);
        }
      });

      return mergedData;
    });
  }, [initialData]);

  // Log any Ably errors
  useEffect(() => {
    if (enableRealtime && error) {
      console.error("Ably subscription error:", error);
    }
  }, [error, enableRealtime]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    meta: {
      handleRowUpdate: onRowUpdate, // Pass the renamed prop to meta
    },
  });

  return (
    <div className="data-table">
      <input
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search all columns..."
        className="mb-4 p-2 border rounded"
      />
      <Table className="shad-table">
        <TableHeader className="bg-dark-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="shad-table-row-header">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="shad-table-row"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, {
                      ...cell.getContext(),
                      handleRowUpdate,
                    })}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="table-actions">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="shad-gray-btn"
        >
          <Image
            src="/assets/icons/arrow.svg"
            width={24}
            height={24}
            alt="arrow"
          />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="shad-gray-btn"
        >
          <Image
            src="/assets/icons/arrow.svg"
            width={24}
            height={24}
            alt="arrow "
            className="rotate-180"
          />
        </Button>
      </div>
    </div>
  );
}
