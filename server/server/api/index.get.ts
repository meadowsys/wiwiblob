import { use_surrealdb } from "~/composables/use_surrealdb";
import { use_wiwiblob } from "~/composables/use_wiwiblob";

export default defineEventHandler(async () => {
	await use_surrealdb();
	await use_wiwiblob();

	return { staat: "goed (misschien)" };
});
