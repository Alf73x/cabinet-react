const kExtraPlaceBorder = 1000;

export function placeToText(aiPlace: number): string {
  return aiPlace > kExtraPlaceBorder ? "" : String(aiPlace);
}

