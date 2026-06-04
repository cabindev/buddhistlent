// app/layout.tsx 
import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { getServerSession } from "next-auth/next";
import authOptions from "./lib/configs/auth/authOptions";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "งดเหล้าเข้าพรรษา",
  description: "มีสติ มีสุข ทุกโอกาส | ระบบงดเหล้าเข้าพรรษา",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="th" suppressHydrationWarning>
      <body className="font-sans">
        <SessionProvider session={session}>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}