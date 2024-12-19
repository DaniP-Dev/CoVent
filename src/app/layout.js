import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Providers from "@/providers/providers";
import "./globals.css";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.className} ${GeistMono.className}`}>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
