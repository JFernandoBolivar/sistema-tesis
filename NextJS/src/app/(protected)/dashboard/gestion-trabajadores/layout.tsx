import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebarEmployees } from "./components/layout/app-sidebar";
import { HeaderLayout } from "../../../../components/layout/header";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebarEmployees />
      <SidebarInset>
        <HeaderLayout
          title="Gestion de Trabajadores - RAC"
          subtitle="Gestiona y visualiza la informacion de los trabajadores MPPRIJP"
        >
          <SidebarTrigger className="text-foreground hover:bg-muted rounded-lg transition-colors" />
        </HeaderLayout>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
