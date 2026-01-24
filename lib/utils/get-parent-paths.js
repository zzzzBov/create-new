import path from "node:path";

export const getParentPaths = (pth) => {
  const paths = [];
  for (let p = pth; !paths.includes(p); p = path.resolve(p, "..")) {
    paths.push(p);
  }
  return paths;
};
