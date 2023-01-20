import { use_wiwiblob } from "~/composables/use_wiwiblob";
import { sendStream } from "h3";
import { filetype_metakey } from "../upload/public-file.post";

const hash_len = 64;

export default defineEventHandler(async event => {
	let hash = event.context.params.hash;
	if (hash.length !== hash_len) {
		event.node.req.statusCode = 404;
		return { err: "not found" };
	}

	let verify = new URLSearchParams(event.path!.substring(event.path!.indexOf("?"))).get("verify");

	let wiwiblob = use_wiwiblob();
	let reader_builder = wiwiblob.reader_builder(hash);
	if (verify !== null) reader_builder.verify(true);

	let reader: Awaited<ReturnType<typeof reader_builder["build"]>>;

	try {
		reader = await reader_builder.build();
	} catch (err: any) {
		new Error().message
		if (
			err
				&& "message" in (err as object)
				&& typeof err.message === "string"
				&& err.message.includes("(os error 2)")
		) {
			event.node.res.statusCode = 404;
			return { err: "not found" };
		} else {
			console.log(err);
			throw "AAAAAAAAAAAAA";
		}
	}

	let filetype = reader.get_other_meta(filetype_metakey);
	if (filetype && filetype.length === 1) setHeader(event, "content-type", filetype[0]);
	else setHeader(event, "content-type", "application/octet-stream");

	let filename = reader.get_filename()?.replace("\n", " ");
	if (filename) setHeader(event, "content-disposition", `attachment; filename="${filename}"`);
	else setHeader(event, "content-disposition", `attachment`);

	return sendStream(event, reader);
});
