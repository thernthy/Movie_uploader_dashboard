"use client";

import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { VideoProvider } from "./appContext/videoDetail";
import { UserProvider } from "./appContext/UserContexct";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Artificial loading delay for UI purposes
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <SessionProvider>
          <UserProvider>
            <VideoProvider>
              <div className="dark:bg-boxdark-2 dark:text-bodydark">
                {loading ? <Loader /> : children}
              </div>
            </VideoProvider>
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
