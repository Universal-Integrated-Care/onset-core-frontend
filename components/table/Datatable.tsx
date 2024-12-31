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
import { getSocket } from "@/lib/socket"; // Ensure getSocket is correctly set up

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  clinicId: string; // ✅ Add clinicId
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  clinicId,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState(initialData);
  const [globalFilter, setGlobalFilter] = useState("");

  // ✅ Update a specific row in the table
  const handleRowUpdate = (updatedRow: Partial<TData>, rowId: string) => {
    setData((prevData) =>
      prevData.map((row) =>
        (row as any).id === rowId ? { ...row, ...updatedRow } : row,
      ),
    );
  };

  useEffect(() => {
    const socket = getSocket();

    // ✅ Join the clinic-specific room
    const clinic_id = clinicId; // Replace with dynamic clinic_id if available
    socket.emit("joinClinic", clinic_id);

    // ✅ Listen for clinic-specific appointments
    socket.on("newAppointment", (newAppointment: TData) => {
      console.log(
        `🔄 New Appointment Received in Clinic ${clinic_id}:`,
        newAppointment,
      );
      setData((prevData) => {
        const exists = prevData.some(
          (appointment: any) => appointment.id === (newAppointment as any).id,
        );
        return exists ? prevData : [newAppointment, ...prevData];
      });
    });

    return () => {
      socket.off("newAppointment");
    };
  }, [setData]);

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
