const category = (character) => {
  return /\p{Lu}/u.test(character)
    ? "uppercase"
    : /\p{Ll}/u.test(character)
    ? "lowercase"
    : /\p{Nd}/u.test(character)
    ? "digit"
    : "other";
};

export const splitIntoWords = (input) => {
  let state = "initial";
  const output = [];
  const word = [];

  const append = (wordOrCharacter) => {
    if (Array.isArray(wordOrCharacter)) {
      output.push(wordOrCharacter.splice(0, wordOrCharacter.length).join(""));
    } else {
      output.push(wordOrCharacter);
    }
  };

  const queue = (character) => {
    word.push(character);
  };

  const actions = {
    initial: {
      lowercase(character) {
        state = "lowerCase";
        queue(character);
      },
      uppercase(character) {
        state = "unknownCase";
        queue(character);
      },
      digit(character) {
        state = "number";
        queue(character);
      },
      other(character) {
        state = "initial";
        append(character);
      },
    },
    lowerCase: {
      lowercase(character) {
        state = "lowerCase";
        queue(character);
      },
      uppercase(character) {
        state = "unknownCase";
        append(word);
        queue(character);
      },
      digit(character) {
        state = "number";
        append(word);
        queue(character);
      },
      other(character) {
        state = "initial";
        append(word);
        append(character);
      },
    },
    unknownCase: {
      lowercase(character) {
        state = "lowerCase";
        queue(character);
      },
      uppercase(character) {
        state = "upperCase";
        queue(character);
      },
      digit(character) {
        state = "number";
        append(word);
        queue(character);
      },
      other(character) {
        state = "initial";
        append(word);
        append(character);
      },
    },
    upperCase: {
      lowercase(character) {
        state = "lowerCase";
        const previousCharacter = word.pop();
        append(word);
        queue(previousCharacter);
        queue(character);
      },
      uppercase(character) {
        state = "upperCase";
        queue(character);
      },
      digit(character) {
        state = "number";
        append(word);
        queue(character);
      },
      other(character) {
        state = "initial";
        append(word);
        append(character);
      },
    },
    number: {
      lowercase(character) {
        state = "lowerCase";
        append(word);
        queue(character);
      },
      uppercase(character) {
        state = "unknownCase";
        append(word);
        queue(character);
      },
      digit(character) {
        state = "number";
        queue(character);
      },
      other(character) {
        state = "initial";
        append(word);
        append(character);
      },
    },
  };

  for (const current of input) {
    actions[state][category(current)](current);
  }

  if (word.length) {
    append(word);
  }

  return output;
};
