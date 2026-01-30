import { createAvatar } from "@dicebear/core";
import { pixelArt } from "@dicebear/collection";

export function avatarDataUriFromUuid(uuid: string): string {
  return createAvatar(pixelArt, {
    seed: uuid,
    // backgroundColor: ["000000", "0a0a0a", "111111"],
  }).toDataUri();
}
