import path from "node:path";

const project = path.resolve(process.cwd());
const stylesheet = path.join(project, "src/app/globals.css");

// Turbopack sometimes runs PostCSS without a filename. Tailwind then
// resolves @import from the parent of this app and misses node_modules.
function keepStylesheetPath() {
  return {
    postcssPlugin: "keep-stylesheet-path",
    Once(_root, { result }) {
      if (!result.opts.from) result.opts.from = stylesheet;
    },
  };
}
keepStylesheetPath.postcss = true;

const postcssConfig = {
  plugins: [
    keepStylesheetPath(),
    [
      "@tailwindcss/postcss",
      {
        base: path.join(project, "src"),
      },
    ],
  ],
};

export default postcssConfig;
