import fs from "fs";
import path from "path";

const native_path = path.resolve("../node-bindings/build/wiwibloblib.node");
if (!fs.existsSync(native_path)) throw new Error("build the node-bindings package first");

if (process.env.NODE_ENV === "production") {
	process.once("exit", () => {
		fs.linkSync(
			native_path,
			path.resolve("./.output/wiwibloblib.node")
		);
	});
} else {
	const dev_path = path.resolve("./wiwibloblib.node");
	if (!fs.existsSync(dev_path)){
		fs.linkSync(
			native_path,
			dev_path
		);
	}
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	telemetry: false,
	typescript: {
		shim: false,
		strict: true,
		typeCheck: "build"
	},
	runtimeConfig: {
		wiwiblobDir: "./blobs",
		nativeWiwiblobPath: "./wiwibloblib.node"
	}
});
