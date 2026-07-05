import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { HeaderLayout } from "../../../../components/layout/header";
import { AppSidebarSecurity } from "./components/app-sidebar";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebarSecurity />
      <SidebarInset>
        <HeaderLayout title="Gestion de Usuarios">
          <SidebarTrigger className="text-foreground hover:bg-muted rounded-lg transition-colors" />
        </HeaderLayout>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
