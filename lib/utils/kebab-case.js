import { splitIntoWords } from "./split-into-words.js";

export const kebabCase = (input) =>
  splitIntoWords(input)
    .filter((word) => /[\p{L}\p{Nd}]/u.test(word))
    .map((word) => word.toLowerCase())
    .join("-");
