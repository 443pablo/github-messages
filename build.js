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
    outfile: "dist/hideLoad.js",
})

console.log("ok!")