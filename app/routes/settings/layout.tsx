import { Link, Outlet, useNavigate } from "react-router";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SettingsLayout() {
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    navigate(`/settings/${value}`);
  };

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-4xl">
      <div className="space-y-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 px-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link to="/" className="flex items-center gap-2 font-normal">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Gestiona la carga de datos y configuraciones del sistema.
          </p>
        </div>
      </div>

      <Tabs defaultValue="/" onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="/">Cargar Productos</TabsTrigger>
          <TabsTrigger value="config">Configuración Global</TabsTrigger>
        </TabsList>

        <Outlet />
      </Tabs>
    </div>
  );
}
