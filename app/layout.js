import { AuthProvider } from "@/context/AuthContext";
import { PermissionProvider } from "@/context/PermissionContext";
import "./globals.css";

export const metadata = {
  title: "Oxygen Flow Management",
  description: "Team ticket management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <PermissionProvider>
            {children}
          </PermissionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
