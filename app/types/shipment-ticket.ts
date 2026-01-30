export interface ShipmentTicket {
  trackingNumber: string; // tracking suele ser identificador -> string
  saleDate: Date; // parseado desde "DD/MM/YYYY"
  declaredValue: number; // desde "Valor declarado"
  declaredWeightKg: number | null; // "" => null
  recipientName: string;
  contactPhone: string | null; // "-" o "" => null
  address: string;
  city: string;
  postalCode: string;
  notes: string | null; // "-" => null
  email: string | null; // "-" => null
  totalToCollect: number; // desde "4 Total a cobrar"
  reverseLogistics: boolean; // "SI"/"NO"
}
