export const parseArgv = (argv) => {
  const args = { _: [] };

  for (const rawArg of argv) {
    if (rawArg === "--") {
      continue;
    } else if (rawArg.startsWith("-")) {
      const double = rawArg.startsWith("--");
      const arg = rawArg.slice(double ? 2 : 1);
      const eqIndex = double ? arg.indexOf("=") : -1;
      const key = eqIndex !== -1 ? arg.slice(0, eqIndex) : arg;
      const value = eqIndex !== -1 ? arg.slice(eqIndex + 1) : true;
      if (!Object.hasOwn(args, key)) {
        args[key] = value;
      } else if (Array.isArray(args[key])) {
        args[key].push(value);
      } else {
        args[key] = [args[key], value];
      }
    } else {
      args._.push(rawArg);
    }
  }

  return args;
};
