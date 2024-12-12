export const breakText = (text: string, maxWordsPerRow: number): string => {
  const words = text.split(" ");
  let result = "";
  let row = "";

  words.forEach((word, index) => {
    if (row.split(" ").length + 1 > maxWordsPerRow) {
      result += row.trim() + "<br>";
      row = "";
    }
    row += word + " ";
  });

  result += row.trim(); // Add the last row
  return result;
};
