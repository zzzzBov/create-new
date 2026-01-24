import { splitIntoWords } from "./split-into-words.js";
import { capitalizeFirstLetter } from "./capitalize-first-letter.js";

export const pascalCase = (input) =>
  splitIntoWords(input)
    .filter((word) => /[\p{L}\p{Nd}]/u.test(word))
    .map(capitalizeFirstLetter)
    .join("");
