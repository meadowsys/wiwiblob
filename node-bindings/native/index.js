import { createRequire } from "module";
const require = createRequire(import.meta.url);
export default (path) => require(path ? path : (process.env.WIWIBLOBLIB_NATIVE_PATH ?? "../build/wiwibloblib.node"));
