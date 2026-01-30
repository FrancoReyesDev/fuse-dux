import type { Order } from "~/types/order";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./ui/sidebar";
import { Plus, GalleryVerticalEnd, Settings, Calculator } from "lucide-react";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { avatarDataUriFromUuid } from "~/lib/avatar-data-uri-from-uuid";
import { NewOrderDialog } from "./new-order-dialog";
import type { ConfigConstants } from "~/types/config-constants";
import { useMemo, useState } from "react";
import { CustomProductDialog } from "./custom-product-dialog";

interface Props {
  orders: Order[];
  config: ConfigConstants;
}

export function AppSidebar({ orders, config }: Props) {
  const indexedOrders = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders],
  );

  const [selectedOrder, setSelectedOrder] = useState<Order["id"] | undefined>(
    indexedOrders.keys().next().value,
  );

  return (
    <Sidebar collapsible="icon" variant="floating">
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
          <SidebarGroupLabel>Pedidos Recientes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <NewOrderDialog>
                  <SidebarMenuButton>
                    <Plus className="size-4" />
                    <span>Nuevo Pedido</span>
                  </SidebarMenuButton>
                </NewOrderDialog>
              </SidebarMenuItem>
              {orders.map((order) => (
                <SidebarMenuItem key={order.id}>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={order.customer.name}
                    isActive={order.id === selectedOrder}
                    onClick={() => setSelectedOrder(order.id)}
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={avatarDataUriFromUuid(order.id.toString())}
                        alt={order.customer.name}
                      />
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {order.customer.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {order.customer.address}
                      </span>
                    </div>
                  </SidebarMenuButton>
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
