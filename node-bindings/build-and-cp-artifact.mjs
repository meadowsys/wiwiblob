// @ts-check

const out_filename = "./build/wiwibloblib.node";

import { spawn } from "child_process";
import { copyFileSync as copy_file, mkdirSync as mkdir, rmSync as rm } from "fs";
import path from "path";
import { createInterface as create_readline_interface } from "readline";

const args = process.argv.slice(2);
const command = ["cargo", "b"];
command.push(...args);
command.push("--message-format", "json-render-diagnostics");

const build_process = spawn(/** @type {string} */ (command.shift()), command, {
	stdio: ["inherit", "pipe", "inherit"]
});
build_process.on("exit", code => code && !process.exitCode && (process.exitCode = code));

const read_line = create_readline_interface(build_process.stdout);
read_line.on("line", line => {
	const data = JSON.parse(line);

	if (data.reason === "build-finished") {
		process.on("exit", () => {
			console.log(data.success ? "success!" : "no success!");
		});
		return;
	}

	if (
		data.reason !== "compiler-artifact"
		|| data.target.name !== "node-bindings"
		|| !Array.isArray(data.filenames)
	) return;

	if (data.filenames.length !== 1) {
		console.log("didn't get exactly 1 filename, unsure what to do with it");
		console.log("filenames:");
		data.filenames.length > 1
			? data.filenames.forEach(filename => console.log(`   ${filename}`))
			: console.log("none");
		console.log("please submit a bug report with this output!");
		process.exitCode = 1;
		return;
	}

	const libpath = path.resolve(out_filename);
	rm(libpath, { force: true });
	mkdir(path.dirname(libpath), { recursive: true })
	copy_file(data.filenames[0], libpath);
	console.log("copied wiwibloblib.node");
});
