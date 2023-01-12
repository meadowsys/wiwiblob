import native from "../native/index.js";
import { Readable, Writable } from "stream";

export function new_wiwiblob(dir: string, spoolsize?: number) {
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

		function build() {
			let reader = native.reader_builder.build(reader_builder);

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
			};

			stream.get_filename = get_filename;
			stream.get_owner = get_owner;

			return stream;

			function get_filename() {
				return native.reader.get_filename(reader);
			}

			function get_owner() {
				return native.reader.get_owner(reader);
			}
		}
	}

	function writer_builder(spoolsize?: number) {
		let writer_builder = spoolsize
			? native.wiwiblob.writer_builder_with_spoolsize(wiwiblob, spoolsize)
			: native.wiwiblob.writer_builder(wiwiblob);

		return { set_filename, set_owner, build };

		function set_filename(filename: string) {
			native.writer_builder.set_filename(writer_builder, filename);
		}

		function set_owner(owner: string) {
			native.writer_builder.set_owner(writer_builder, owner);
		}

		function build() {
			let writer = native.writer_builder.build(writer_builder);

			let hash: string | undefined = undefined;
			let previous_promise: Promise<void> = Promise.resolve();

			const write: Writable["_write"] = (chunk, encoding, callback) => {
				if (encoding !== "binary") return callback(new Error("only `binary` encoding supported"));

				let promise = previous_promise;
				previous_promise.then(() => {
					promise = new Promise(res => {
						previous_promise = native.writer.write_all(writer, chunk);
						previous_promise
							.then(() => {
								callback();
								res();
							})
							.catch(err => callback(err));
					});
				});
			};

			let stream = new Writable({
				defaultEncoding: "binary",
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
					try {
						hash = native.writer.finish(writer);
						callback();
					} catch (err: any) {
						callback(err);
					}
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
