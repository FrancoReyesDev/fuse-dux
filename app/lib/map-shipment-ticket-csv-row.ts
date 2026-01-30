import { Effect } from "effect";
import type { ShipmentTicket } from "~/types/shipment-ticket";

export const mapShipmentTicketCsvRow = (
  csvRow: string[],
): Effect.Effect<ShipmentTicket, Error> =>
  Effect.gen(function* () {
    return {
      trackingNumber: csvRow[0],
      saleDate: new Date(csvRow[1]),
      declaredValue: Number(csvRow[2]),
      declaredWeightKg: Number(csvRow[3]),
      recipientName: csvRow[4],
      contactPhone: csvRow[5],
      address: csvRow[6],
      city: csvRow[7],
      postalCode: csvRow[8],
      notes: csvRow[9],
      email: csvRow[10],
      totalToCollect: Number(csvRow[11]),
      reverseLogistics: csvRow[12] === "SI",
    };
  });
