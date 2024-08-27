import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SocketProvider } from './context/SocketContext';
import Game from "./Game";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Raja Rani",
  description: "Created by Manoj-Prabu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ height: "100vh" }}>
        <SocketProvider>
          <Game>
            {children}
          </Game>
        </SocketProvider>
      </body>
    </html>
  );
}
