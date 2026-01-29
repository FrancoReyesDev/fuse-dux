import { useFetcher } from "react-router";
import type { Route } from "./+types/settings";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const action = async ({ request }: Route.ActionArgs) => {
  // Placeholder for action logic, adapted by user later
  return { success: true };
};

export default function Settings() {
  const uploadFetcher = useFetcher();
  const configFetcher = useFetcher();

  const isUploading = uploadFetcher.state === "submitting";
  const isSavingConfig = configFetcher.state === "submitting";

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la carga de datos y configuraciones del sistema.
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Cargar Productos</TabsTrigger>
          <TabsTrigger value="config">Configuración Global</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Cargar Productos</CardTitle>
              <CardDescription>
                Sube el archivo CSV con la lista de precios actualizada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 mb-6">
                <p className="font-semibold mb-2">
                  Importante: El orden de las columnas debe ser:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <span className="font-semibold">
                      Código, Producto, 1) EF/TRANS
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold">
                      CRED/ DEB/ QR, CREDITO 3 PAGOS, CREDITO 6 CUOTAS
                    </span>
                  </li>
                  <li className="text-yellow-700 dark:text-yellow-300/80 text-xs mt-1">
                    ...y el resto de campos (HOT SALE, MAYORISTA, etc)
                  </li>
                </ul>
                <div className="mt-3">
                  <a
                    href="/sample.csv"
                    download="ejemplo_carga.csv"
                    className="text-sm font-medium underline text-yellow-800 hover:text-yellow-900 dark:text-yellow-200 dark:hover:text-yellow-100 block"
                  >
                    Descargar CSV de ejemplo
                  </a>
                </div>
              </div>

              <uploadFetcher.Form
                method="post"
                encType="multipart/form-data"
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="file">Archivo CSV</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept=".csv"
                    required
                    className="cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skipRows">Filas a saltar</Label>
                  <Input
                    id="skipRows"
                    name="skipRows"
                    type="number"
                    defaultValue={0}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className={`w-full ${
                    uploadFetcher.data?.success ? "bg-green-500" : ""
                  }`}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Spinner /> Subiendo...
                    </>
                  ) : uploadFetcher.data?.success ? (
                    "Archivo subido exitosamente"
                  ) : (
                    "Subir archivo"
                  )}
                </Button>
              </uploadFetcher.Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Global</CardTitle>
              <CardDescription>
                Ajusta los parámetros generales del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <configFetcher.Form className="space-y-4">
                <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground text-sm">
                  Placeholder para configuraciones de KV
                </div>
                {/* User will implement inputs here */}
              </configFetcher.Form>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                disabled={isSavingConfig}
                onClick={() => {}} // Placeholder
                className="w-full"
              >
                Guardar Configuración
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
