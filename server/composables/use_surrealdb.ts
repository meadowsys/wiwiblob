import Surreal from "surrealdb.js";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { randomBytes } from "crypto";
import { createInterface } from "readline";

let surrealdb: Surreal | undefined;
let child_process: ChildProcessWithoutNullStreams;

export async function use_surrealdb() {
	if (surrealdb) return surrealdb;

	let { bound_addr, cp, password: pass } = await spawn_surreal_process();
	child_process = cp;

	surrealdb = new Surreal(`http://${bound_addr}`);
	surrealdb.signin({
		user: "root",
		pass
	});

	child_process.on("exit", () => {
		surrealdb?.close();
		surrealdb = undefined;
	});
	process.on("exit", () => surrealdb?.close());

	await surrealdb.wait();
	return surrealdb;
}

async function spawn_surreal_process() {
	let config = useRuntimeConfig();

	let password = await random_bytes(64).then(buf => buf.toString("base64url"));

	let port = 30000 + await random_bytes(2).then(buf => buf[0] + buf[1]);
	let bound_addr = `127.0.0.1:${port}`;
	let surrealdb_binary_path = await get_surreal_path();

	let cp = spawn(surrealdb_binary_path, [
		"start",
		"--user",
		"root",
		"--pass",
		password,
		"--log",
		process.env.NODE_ENV === "production" ? "info" : "debug",
		"--bind",
		bound_addr,
		config.surrealdbDatabaseDir
	], {
		stdio: "pipe",
		env: {},
		cwd: process.cwd(),
		killSignal: "SIGINT"
	});

	cp.on("error", (err) => {
		console.log(err);
		// TODO add proper logging to the whole app
	});

	process.on("exit", () => cp.kill("SIGINT"));

	let stdout_rl = createInterface(cp.stdout);
	stdout_rl.on("line", l => console.log(`[surrealdb stdout] ${l}`));
	let stderr_rl = createInterface(cp.stderr);
	stderr_rl.on("line", l => console.log(`[surrealdb stderr] ${l}`));

	return { bound_addr, cp, password };
}

function random_bytes(n: number): Promise<Buffer> {
	return new Promise((res, rej) => randomBytes(n, (err, buf) => {
		err ? rej(err) : res(buf);
	}));
}

function get_surreal_path(): Promise<string> {
	const config = useRuntimeConfig();
	if (config.surrealdbBinaryPath !== "") return Promise.resolve(config.surrealdbBinaryPath);

	let cp = spawn("which", ["surreal"], {
		stdio: "pipe",
		cwd: process.cwd()
	});

	return new Promise((res, rej) => {
		let chunks: Array<any> = [];
		cp.stdout.on("data", chunk => chunks.push(Buffer.from(chunk)));
		cp.stdout.on("error", err => rej(err));
		cp.stdout.on("end", () => res(Buffer.concat(chunks).toString("utf8").trim()));
	});
}
