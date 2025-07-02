import * as esbuild from "esbuild";

const isProd = process.argv.includes('--prod');

esbuild.build({
    entryPoints: ["src/index.js"],
    bundle: true,
    outfile: "dist/index.js",
    minify: true,
    loader: {
        ".css": "text"
    },
    sourcemap: !isProd
});

esbuild.build({
    entryPoints: ["src/pages/hideLoad.ts"],
    bundle: true,
    minify: true,
    outfile: "dist/hideLoad.js",
    sourcemap: !isProd
});

esbuild.build({
    entryPoints: ["src/background/index.js"],
    bundle: true,
    minify: true,
    outfile: "dist/background.js",
    sourcemap: !isProd
});

console.log("ok!");