import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/provider";
import StoreProvider from "@/redux/storeProvider";
import InitUser from "@/initUser";



export const metadata: Metadata = {
  title: "Snapcart | Your 10 min grocery delivery App",
  description: "Your 10 min grocery delivery App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
    >
      <body className="w-full min-h-screen bg-linear-to-b from-green-50 to-white">
        <Provider>
          <StoreProvider>
            <InitUser />
            {children}
          </StoreProvider>
        </Provider>
      </body>
    </html>
  );
}
