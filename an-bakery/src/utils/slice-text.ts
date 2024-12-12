export function sliceText(input: string, numStart: number = 4, numEnd: number = 4): string {
  if (numStart < 0 || numEnd < 0 || numStart + numEnd >= input.length) {
    throw new Error("Invalid number of start or end characters");
  }
  const startText = input.slice(0, numStart);
  const endText = input.slice(-numEnd);
  return `${startText}...${endText}`;
}
