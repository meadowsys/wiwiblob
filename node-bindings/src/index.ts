import native from "../native/index.js";

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

			return { get_filename, get_owner, read_bytes };

			function get_filename() {
				return native.reader.get_filename(reader);
			}

			function get_owner() {
				return native.reader.get_owner(reader);
			}

			function read_bytes(bufsize: number) {
				return native.reader.read_exact_to_new_buffer(reader, bufsize);
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
