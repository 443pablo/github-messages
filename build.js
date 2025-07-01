import * as esbuild from "esbuild"

esbuild.build({
    entryPoints: ["src/index.js"],
    bundle: true,
    outfile: "dist/index.js",
    minify: true,
    sourcemap: true
})

esbuild.build({
    entryPoints: ["src/pages/hideLoad.ts"],
    bundle: true,
    minify: true,
    outfile: "dist/hideLoad.js",
})

esbuild.build({
    entryPoints: ["src/background/index.js"],
    bundle: true,
    minify: true,
    outfile: "dist/background.js",
})

console.log("ok!")