import { use_wiwiblob } from "~/composables/use_wiwiblob";
import { readMultipartFormData } from "h3";

export const filetype_metakey = "filetype";

export default defineEventHandler(async event => {
	let wiwiblob = use_wiwiblob();

	let formdata = await readMultipartFormData(event);
	if (!formdata) {
		event.node.res.statusCode = 400;
		event.node.res.end();
		return;
	}

	if (formdata.length > 5) {
		event.node.res.statusCode = 400;
		return { err: "upload at most 5 files at a time" };
	}

	let promises: Array<Promise<string>> = [];

	for (let file of formdata) {
		let writer_builder = wiwiblob.writer_builder();

		console.log(file.type);
		if (file.filename) writer_builder.set_filename(file.filename);
		if (file.type) writer_builder.set_other_meta(file.type, file.type);
		let writer = writer_builder.build();

		promises.push(new Promise((res, rej) => {
			writer.write(file.data, err => {
				if (err) return rej(err);
				writer.end(() => {
					res(writer.get_hash());
				});
			});
		}));
	}

	let hashes = await Promise.all(promises);
	return { hashes };
});
