import { use_surrealdb } from "~/composables/use_surrealdb";
import { use_wiwiblob } from "~/composables/use_wiwiblob";

export default defineEventHandler(() => {
	use_surrealdb();
	use_wiwiblob();

	return { staat: "goed (misschien)" };
});
