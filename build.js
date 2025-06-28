import * as esbuild from "esbuild"

esbuild.build({
    entryPoints: ["src/index.js"],
    bundle: true,
    outfile: "dist/index.js",
    minify: true,
    sourcemap: true
})

console.log("ok!")