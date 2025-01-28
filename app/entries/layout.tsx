import React from 'react'
import "../globals.css";

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
        {children}
      </body>
    </html>
    );
}