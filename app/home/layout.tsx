import type { Metadata } from "next";
import { HomeHeader } from "@/components/home/home-header";
import { HomeFooter } from "@/components/home/home-footer";

export const metadata: Metadata = {
  title: "Home | A Web App",
  description: "Welcome to our web app",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="grid min-h-dvh grid-rows-[auto_1fr_auto] w-full mx-4 ">
      <HomeHeader />
      <div>
        {children}
      </div>
      <HomeFooter />
    </main>
  );
}

