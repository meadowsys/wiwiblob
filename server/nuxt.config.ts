import fs from "fs";
import path from "path";

const baseURL = "/";

const native_path = path.resolve("../node-bindings/build/wiwibloblib.node");
if (!fs.existsSync(native_path)) throw new Error("build the node-bindings package first");

if (process.env.NODE_ENV === "production") {
	process.once("exit", () => {
		try {
			fs.linkSync(
				native_path,
				path.resolve("./.output/wiwibloblib.node")
			);
		} catch (err) {
			console.log("error in copying wiwibloblib.node:");
			console.error(err);
			console.log("if this is being run during `pnpm i` or `nuxt prepare`, please ignore this");
		}
	});
} else {
	const dev_path = path.resolve("./wiwibloblib.node");
	if (fs.existsSync(dev_path)) fs.rmSync(dev_path);
	fs.linkSync(native_path, dev_path);
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	telemetry: false,
	modules: [
		"@nuxtjs/tailwindcss"
	],
	app: {
		baseURL
	},
	typescript: {
		shim: false,
		strict: true,
		typeCheck: "build"
	},
	runtimeConfig: {
		wiwiblobDir: "./blobs",
		nativeWiwiblobPath: "./wiwibloblib.node",
		surrealdbBinaryPath: "",
		surrealdbDatabaseDir: "file://./database",
		public: {
			baseURL,
			host: "http://localhost:3000"
		}
	}
});
