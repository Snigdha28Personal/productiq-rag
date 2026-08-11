import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "ProductIQ — AI Product Research Copilot",
  description: "Turn customer research into product decisions with grounded RAG evidence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f17] text-slate-100 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
