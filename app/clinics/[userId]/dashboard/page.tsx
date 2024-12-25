"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import StatCard from "@/components/StatCard";
import { columns, Payment } from "@/components/table/columns";
import { DataTable } from "@/components/table/Datatable";

 
async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ]
}



const Dashboard = () => {
  const router = useRouter();
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAndFetchData = async () => {
      try {
        // Session Validation
        const res = await fetch("/api/validate-session", {
          credentials: "include",
        });

        if (!res.ok) {
          console.error("❌ Invalid session, redirecting to /login");
          router.push("/login");
          return;
        }

        const data = await res.json();
        console.log("🔄 Session Validation Result:", data);

        if (!data.valid) {
          console.error("❌ Invalid session, redirecting to /login");
          router.push("/login");
          return;
        }

        setIsValidSession(true);

        // Fetch Payments Data
        const paymentsData = await getData();
        setPayments(paymentsData);
      } catch (error) {
        console.error("❌ Error during initialization:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    validateAndFetchData();
  }, [router]);

  if (isLoading) {
    return <p>🔄 Loading dashboard, please wait...</p>;
  }

  if (isValidSession === null) {
    return <p>🔄 Validating session, please wait...</p>;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      {/* Header */}
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            alt="Logo"
            height={32}
            width={162}
            className="h-8 w-fit"
          />
        </Link>
        <p className="text-16-semibold">Admin Dashboard</p>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">Start the day by managing new appointments</p>
        </section>

        {/* Stats Section */}
        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={10}
            label="Schedule Appointments"
            icon="/assets/icons/appointments.svg"
          />
          <StatCard
            type="pending"
            count={5}
            label="Pending Appointments"
            icon="/assets/icons/pending.svg"
          />
          <StatCard
            type="cancelled"
            count={5}
            label="Cancelled Appointments"
            icon="/assets/icons/cancelled.svg"
          />
        </section>

        {/* Data Table Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Recent Payments</h2>
          <DataTable columns={columns} data={payments} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;