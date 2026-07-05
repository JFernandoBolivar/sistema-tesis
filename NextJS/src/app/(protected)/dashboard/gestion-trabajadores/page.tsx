import { DashboardPage } from "./components/dashboard/dashboard-page";
import PageLayout from "../../../../components/layout/page-layout";

export default function DashboardRac() {
  return (
    <PageLayout
      title="Dashboard"
      description="Estadísticas y métricas de gestión de trabajadores"
    >
      <DashboardPage />
    </PageLayout>
  );
}
