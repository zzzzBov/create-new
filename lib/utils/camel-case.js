import { splitIntoWords } from "./split-into-words.js";
import { capitalizeFirstLetter } from "./capitalize-first-letter.js";

export const camelCase = (input) =>
  splitIntoWords(input)
    .filter((word) => /[\p{L}\p{Nd}]/u.test(word))
    .map((word, index) =>
      index ? capitalizeFirstLetter(word) : word.toLowerCase()
    )
    .join("");
