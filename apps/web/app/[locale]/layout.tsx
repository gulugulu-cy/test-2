import "@/styles/globals.css";
import "@/styles/prosemirror.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";
import { Toaster } from "@/components/tailwind/ui/toaster";

// const title = "AI文档编辑器";
// const description = "AI文档编辑器";

// export const metadata: Metadata = {
//   title,
//   description,
//   openGraph: {
//     title,
//     description,
//   },
//   twitter: {
//     title,
//     description,
//     card: "summary_large_image",
//     creator: "@steventey",
//   },
//   metadataBase: new URL("https://novel.sh"),
// };

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children, params: { locale }, }: { children: ReactNode, params: { locale: string }; }) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Toaster />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
