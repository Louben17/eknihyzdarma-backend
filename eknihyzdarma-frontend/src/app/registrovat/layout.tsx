import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrace",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
