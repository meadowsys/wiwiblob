import _native, { Reader, Writer } from "../native/index.js";
import { Readable, Writable } from "stream";

export function new_wiwiblob(dir: string, spoolsize?: number) {
	return new_wiwiblob_with_native_path(undefined!, dir, spoolsize);
}

export function new_wiwiblob_with_native_path(native_path: string, dir: string, spoolsize?: number) {
	const native = _native(native_path);

	let wiwiblob = spoolsize
		? native.wiwiblob.new_wiwiblob_with_spoolsize(dir, spoolsize)
		: native.wiwiblob.new_wiwiblob(dir);

	return { reader_builder, writer_builder };

	function reader_builder(hash: string) {
		let reader_builder = native.wiwiblob.reader_builder(wiwiblob, hash);

		return { verify, build };

		function verify(verify: boolean) {
			native.reader_builder.verify(reader_builder, verify);
		}

		async function build() {
			let reader = await native.reader_builder.build(reader_builder);

			let stream = new Readable({
				encoding: "binary",
				read(size) {
					let read_bytes = 1;
					let buf: Buffer;

					do {
						try {
							[buf, read_bytes] = native.reader.read_to_new_buffer(reader, size);
						} catch (err: any) {
							this.destroy(err);
							break;
						}
						size -= read_bytes;
						if (read_bytes > 0) {
							this.push(buf, "binary");
						} else {
							this.push(null);
						}
					} while (size > 0 && read_bytes > 0);
				}
			}) as Readable & {
				get_filename: typeof get_filename;
				get_owner: typeof get_owner;
				get_other_meta: typeof get_other_meta;
			};

			stream.get_filename = get_filename;
			stream.get_owner = get_owner;
			stream.get_other_meta = get_other_meta;

			return stream;

			function get_filename() {
				return native.reader.get_filename(reader);
			}

			function get_owner() {
				return native.reader.get_owner(reader);
			}

			function get_other_meta(k: string) {
				return native.reader.get_other_meta(reader, k);
			}
		}
	}

	function writer_builder(spoolsize?: number) {
		let writer_builder = spoolsize
			? native.wiwiblob.writer_builder_with_spoolsize(wiwiblob, spoolsize)
			: native.wiwiblob.writer_builder(wiwiblob);

		return { set_filename, set_owner, set_other_meta, build };

		function set_filename(filename: string) {
			native.writer_builder.set_filename(writer_builder, filename);
		}

		function set_owner(owner: string) {
			native.writer_builder.set_owner(writer_builder, owner);
		}

		function set_other_meta(k: string, v: string) {
			native.writer_builder.set_other_meta(writer_builder, k, v);
		}

		function build() {
			let writer: Writer;

			let hash: string | undefined = undefined;
			let previous_promise: Promise<void> = Promise.resolve();

			const write: Writable["_write"] = (chunk, encoding, callback) => {
				// if (encoding !== "binary") return callback(new Error(`only "binary" encoding supported (got ${encoding})`));

				let temp = previous_promise;

				previous_promise = new Promise(res => {
					temp.then(() => native.writer.write_all(writer, chunk))
						.then(
							() => callback(),
							err => callback(err)
						)
						.then(res)
				});
			};

			let stream = new Writable({
				defaultEncoding: "binary",
				construct(callback) {
					native.writer_builder.build(writer_builder).then(w => {
						writer = w;
						callback();
					}).catch(err => callback(err));
				},
				write,
				writev(chunks, callback) {
					// recursively call `write`

					let i = 0;
					const process_next: typeof callback = (err) => {
						if (err) return callback(err);

						let next_chunk = chunks[i++];
						if (!next_chunk) return callback();

						write(next_chunk.chunk, next_chunk.encoding, process_next);
					}
					process_next();
				},
				final(callback) {
					native.writer.finish(writer).then(h => {
						hash = h;
						callback();
					}).catch(err => callback(err));
				}
			}) as Writable & {
				get_hash: typeof get_hash
			};

			stream.get_hash = get_hash;

			return stream;

			function get_hash() {
				if (hash) return hash;
				throw new Error("stream not finalised yet, cannot get hash yet");
			}
		}
	}
}
