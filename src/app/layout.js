import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Oxygen Flow Management",
  description: "Team ticket management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
