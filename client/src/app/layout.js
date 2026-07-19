import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "YourShop — Premium Electronics",
  description:
    "Discover the latest electronics: headphones, gaming gear, smart home devices and more at YourShop.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen flex flex-col bg-[#0A0F1E] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
