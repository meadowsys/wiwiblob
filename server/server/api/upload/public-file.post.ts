import { use_wiwiblob } from "~/composables/use_wiwiblob";
import { formidable, File } from "formidable";
import fs from "fs";

export const filetype_metakey = "filetype";

export default defineEventHandler(async event => {
	let formdata = formidable({
		allowEmptyFiles: false,
		maxFileSize: 100 * 1024 * 1024 * 1024,
		multiples: true,
		keepExtensions: true
	});

	let promises: Array<Promise<string>> = [];
	await new Promise<void>(res => {
		formdata.parse(event.node.req, (err, fields, _files) => {
			if (err) {
				console.log(err);
				event.node.res.statusCode = 500;
				event.node.res.end();
				return;
			}

			let files = Object.entries(_files);
			if (files.length > 5) return { err: "upload at most 5 files at a time" };

			for (let [filekey, file] of files) {
				if (Array.isArray(file)) {
					promises.push(...file.map(process_file));
				} else {
					promises.push(process_file(file));
				}
			}
			res();
		});
	});

	let hashes = await Promise.all(promises);
	return { hashes };
});

async function process_file(file: File): Promise<string> {
	let wiwiblob = use_wiwiblob();

	let writer_builder = wiwiblob.writer_builder();
	if (file.originalFilename) writer_builder.set_filename(file.originalFilename);
	if (file.mimetype) writer_builder.set_other_meta(filetype_metakey, file.mimetype);
	let writer = writer_builder.build();

	let read_stream = fs.createReadStream(file.filepath);
	read_stream.pipe(writer);
	return await new Promise(res => {
		writer.on("close", () => {
			res(writer.get_hash());
		});
	});
}
