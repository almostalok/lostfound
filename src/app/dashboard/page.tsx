import { PrismaClient } from "@prisma/client";
import DashboardClient from "./DashboardClient";
import { Suspense } from "react";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const lostItems = await prisma.lostItem.findMany({
    orderBy: { created_at: "desc" },
    include: { matches: true },
  });

  const foundItems = await prisma.foundItem.findMany({
    orderBy: { created_at: "desc" },
    include: { matches: true },
  });

  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-medium tracking-tight mb-4 text-white">Dashboard</h1>
        <p className="text-neutral-400">View reported items and track your matches.</p>
      </div>

      <Suspense fallback={<div className="text-neutral-400">Loading your items...</div>}>
        <DashboardClient lostItems={lostItems} foundItems={foundItems} />
      </Suspense>
    </div>
  );
}
