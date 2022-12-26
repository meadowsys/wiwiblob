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
			});

			return { get_filename, get_owner, stream };

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

			return { write_all, finish };

			function write_all(buf: Buffer) {
				native.writer.write_all(writer, buf);
			}

			function finish() {
				return native.writer.finish(writer);
			}
		}
	}
}
