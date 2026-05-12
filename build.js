const fs = require("fs");
const babel = require("@babel/core");

let html = fs.readFileSync("source.html", "utf-8");

// Step 1: Remove Babel standalone CDN
html = html.replace(/  <script src="https:\/\/unpkg\.com\/@babel\/standalone\/babel\.min\.js"><\/script>\s*/g, "");

// Step 2: Find JSX block (after CDN removal)
const babelOpen = '<script type="text/babel">';
const babelClose = '</script>';
const jsxStart = html.indexOf(babelOpen);
const jsxEnd = html.indexOf(babelClose, jsxStart);

if (jsxStart === -1 || jsxEnd === -1) {
  console.error("ERROR: Could not find JSX script block");
  process.exit(1);
}

// Step 3: Extract and compile JSX
const jsxCode = html.slice(jsxStart + babelOpen.length, jsxEnd);
const result = babel.transformSync(jsxCode, {
  plugins: [["@babel/plugin-transform-react-jsx", { runtime: "classic" }]],
  compact: false,
});
if (!result || !result.code) {
  console.error("ERROR: Babel transform failed");
  process.exit(1);
}

// Step 4: Replace babel script block with compiled JS
const pre = html.slice(0, jsxStart);
const post = html.slice(jsxEnd + babelClose.length);
html = pre + '<script>\n' + result.code + '\n</script>' + post;

fs.writeFileSync("Exercise-Coach.html", html, "utf-8");

console.log("Built Exercise-Coach.html");
console.log("JSX:", jsxCode.length, "-> JS:", result.code.length, "chars");

// Verify
const babelRefs = (html.match(/babel/g) || []).length;
const scriptBlocks = (html.match(/<script/g) || []).length;
const closeScripts = (html.match(/<\/script>/g) || []).length;
console.log("Babel refs:", babelRefs, "| <script>:", scriptBlocks, "| </script>:", closeScripts);
if (babelRefs > 0) console.log("WARNING: Babel references still present!");
if (scriptBlocks !== closeScripts) console.log("WARNING: Mismatched script tags!");
