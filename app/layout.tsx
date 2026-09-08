import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRST Events",
  description: "Регистрация на мероприятия PRST",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-neutral-900">{children}</body>
    </html>
  );
}
