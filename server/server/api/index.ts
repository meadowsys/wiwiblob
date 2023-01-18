import { use_wiwiblob } from "~/composables/use_wiwiblob";
export default defineEventHandler(() => {
	use_wiwiblob();
	return "e";
});
