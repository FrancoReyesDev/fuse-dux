import type { Order } from "~/types/order";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./ui/sidebar";
import {
  Plus,
  GalleryVerticalEnd,
  Settings,
  Calculator,
  Pencil,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router";
import { Avatar, AvatarImage } from "./ui/avatar";
import { avatarDataUriFromUuid } from "~/lib/avatar-data-uri-from-uuid";
import { OrderDialog } from "./order-dialog/order-dialog";
import type { ConfigConstants } from "~/types/config-constants";
import { useMemo, useState } from "react";
import { CustomProductDialog } from "./custom-product-dialog";
import { useOrder } from "~/hooks/use-order";
import { Button } from "./ui/button";

interface Props {
  config: ConfigConstants;
}

export function AppSidebar({ config }: Props) {
  const { order, orders, setOrder, clearOrder } = useOrder();

  const [openOrderDialog, setOpenOrderDialog] = useState<boolean>(false);

  const indexedOrders = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders],
  );

  const handleSelectOrder = (id: Order["id"], openDialog: boolean = false) => {
    const order = indexedOrders.get(id);
    if (!order) return;
    setOrder((prev) => {
      if (prev.id === order.id) return prev;
      return order;
    });
    if (openDialog) setOpenOrderDialog(true);
  };

  const handleCreateOrder = () => {
    clearOrder();
    setOpenOrderDialog(true);
  };

  return (
    <Sidebar collapsible="icon" variant="floating">
      <OrderDialog open={openOrderDialog} setOpen={setOpenOrderDialog} />
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Fuse Dux</span>
                  <span className="truncate text-xs">V 1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pedidos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleCreateOrder}>
                  <Plus className="size-4" />
                  <span>Nuevo Pedido</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {orders.map(({ id, customer }) => (
                <SidebarMenuItem key={id} className="flex flex-row">
                  <SidebarMenuButton
                    size="lg"
                    tooltip={customer.name}
                    isActive={id === order?.id}
                    onClick={() => handleSelectOrder(id, true)}
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={avatarDataUriFromUuid(id.toString())}
                        alt={customer.name}
                      />
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {customer.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {customer.address}
                      </span>
                    </div>
                  </SidebarMenuButton>
                  <SidebarMenuAction onClick={() => handleSelectOrder(id)}>
                    <ChevronRight className="size-4" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <CustomProductDialog configs={config}>
              <SidebarMenuButton tooltip="Calculadora">
                <Calculator />
                <span>Calculadora</span>
              </SidebarMenuButton>
            </CustomProductDialog>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configuración">
              <Link to="/settings">
                <Settings />
                <span>Configuración</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
