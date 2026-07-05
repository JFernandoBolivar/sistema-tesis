import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { HeaderLayout } from "../../../../components/layout/header";
import { AppSidebarPasivos } from "./components/layout/app-sidebar";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebarPasivos />
      <SidebarInset>
        <HeaderLayout
          title="Gestion de Pasivos - RAC"
          subtitle="Gestiona y visualiza la informacion de los pasivos MPPRIJP"
        >
          <SidebarTrigger className="text-foreground hover:bg-muted rounded-lg transition-colors" />
        </HeaderLayout>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
