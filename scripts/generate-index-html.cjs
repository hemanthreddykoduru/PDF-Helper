const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../dist/client/assets');
const outputFile = path.join(__dirname, '../dist/client/index.html');

console.log("Scanning for assets in:", assetsDir);

if (!fs.existsSync(assetsDir)) {
  console.error("Error: assets directory not found!");
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);

// Main JS is usually named index-[hash].js
// We pick the largest one that starts with index if there are multiple.
const indexJs = files
  .filter(f => f.startsWith('index-') && f.endsWith('.js'))
  .sort((a, b) => {
    return fs.statSync(path.join(assetsDir, b)).size - fs.statSync(path.join(assetsDir, a)).size;
  })[0];

// Main CSS is usually named styles-[hash].css or index-[hash].css
const indexCss = files.find(f => f.endsWith('.css'));

if (!indexJs) {
  console.error("Error: Could not find main index.js in assets.");
  console.log("Available files:", files);
  process.exit(1);
}

console.log(`Found assets: JS=${indexJs}, CSS=${indexCss || 'NONE'}`);

const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>PDF Helper</title>
    <script>
      window.onerror = function(m, u, l, c, e) {
        alert("JS Error: " + m + "\\nAt: " + u + ":" + l + ":" + c);
        return false;
      };
      window.onunhandledrejection = function(event) {
        alert("Promise Error: " + event.reason);
      };
      console.log("Debug logger initialized");
    </script>
    <!-- Use relative paths for Capacitor -->
    ${indexCss ? `<link rel="stylesheet" href="./assets/${indexCss}" />` : ''}
    <style>
      body { margin: 0; padding: 0; background-color: #0f1117; color: #fff; }
      #root { min-height: 100vh; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./assets/${indexJs}"></script>
  </body>
</html>`;

fs.writeFileSync(outputFile, htmlContent);
console.log(`Successfully generated ${outputFile}`);
