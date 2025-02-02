import React from 'react'
import "../globals.css";
import { Toaster } from '@/components/ui/toaster';

export default function EntryLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
      <body
        className={`w-full h-full antialiased`}
      >
        <Toaster/>
        {children}
      </body>
    </html>
    );
}