import * as esbuild from "esbuild"

esbuild.build({
    entryPoints: ["src/index.js"],
    bundle: true,
    outfile: "dist/index.js"
})

console.log("yup")