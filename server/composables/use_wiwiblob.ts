import path from "path";
import { new_wiwiblob_with_native_path } from "wiwiblob";

let wiwiblob: ReturnType<typeof new_wiwiblob_with_native_path> | undefined = undefined;

export function use_wiwiblob() {
	if (wiwiblob) return wiwiblob;

	const runtime_config = useRuntimeConfig();
	wiwiblob = new_wiwiblob_with_native_path(
		path.resolve(runtime_config.nativeWiwiblobPath),
		path.resolve(runtime_config.wiwiblobDir)
	);
	return wiwiblob;
}
