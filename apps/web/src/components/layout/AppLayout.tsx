import type { ReactNode } from "react";
import Header from "./Header";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Header />
      <main className="container app-main">{children}</main>
    </>
  );
}
