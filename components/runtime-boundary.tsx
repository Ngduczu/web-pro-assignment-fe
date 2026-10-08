import { connection } from "next/server";
import type { ReactNode } from "react";

export async function RuntimeBoundary({ children }: { children: ReactNode }) {
  await connection();
  return children;
}
