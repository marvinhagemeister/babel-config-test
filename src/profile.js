const { startProfiling } = require("@marvinh/node-profiler");
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

(async () => {
  const stopProfiling = await startProfiling();

  const babelConfig = {
    envName: "production",
    babelrc: false,
    configFile: false,
    presets: [
      [
        require.resolve("@babel/preset-env"),
        {
          useBuiltIns: "usage",
          modules: "commonjs",
          corejs: 3,
          targets: [
            "last 1 chrome version",
            "last 1 firefox version",
            "last 1 safari version",
            "last 1 iOS version",
            "last 1 edge version",
          ],
        },
      ],
    ],
  };

  console.log("Running, this may take about a minute...");
  const start = Date.now();

  const out = [];

  for (let i = 0; i < 3000; i++) {
    const res = babel.transformSync(`console.log(${i});`, {
      ...babelConfig,
      filename: `source_${i}.js`,
    });

    // Do something with return value so that v8 doesn't think
    // that the loop does nothing.
    out.push(res.code);

    // Simulate bundler doing other stuff in between
    await new Promise((r) => setTimeout(r, 4));
  }

  // Do something with the result so that v8 doesn't
  // optimize it away
  console.log(out.length);

  const duration = (Date.now() - start) / 1000;
  console.log("Done in " + duration + "s");

  const profile = await stopProfiling();

  // Import this file in the "Performance" tab in Chrome's DevTools panel
  fs.writeFileSync(
    path.join(__dirname, "..", "profile.cpuprofile"),
    JSON.stringify(profile)
  );
})();
