declare class Nominal<T> { #__private: T }

declare namespace native {
	export type WiwiBlob = Nominal<WiwiBlob>;
	export type Reader = Nominal<Reader>;
	export type ReaderBuilder = Nominal<ReaderBuilder>;
	export type Writer = Nominal<Writer>;
	export type WriterBuilder = Nominal<WriterBuilder>;

	export namespace wiwiblob {
		export function new_wiwiblob(dir: string): WiwiBlob;
		export function new_wiwiblob_with_spoolsize(dir: string, spoolsize: number): WiwiBlob;
		export function reader_builder(wiwiblob: WiwiBlob, hash: string): ReaderBuilder;
		export function writer_builder(wiwiblob: WiwiBlob): WriterBuilder;
		export function writer_builder_with_spoolsize(wiwiblob: WiwiBlob, spoolsize: number): WriterBuilder;
	}

	export namespace reader_builder {
		export function verify(reader_builder: ReaderBuilder, verify: boolean): void;
		export function build(reader_builder: ReaderBuilder): Reader;
	}

	export namespace reader {
		export function get_filename(reader: Reader): string | undefined;
		export function get_owner(reader: Reader): string | undefined;
		export function read_exact_to_new_buffer(reader: Reader, bufsize: number): Buffer;
	}

	export namespace writer_builder {
		export function set_filename(writer_builder: WriterBuilder, filename: string): void;
		export function set_owner(writer_builder: WriterBuilder, owner: string): void;
		export function build(writer_builder: WriterBuilder): Writer;
	}

	export namespace writer {
		export function write_all(writer: Writer, buf: Buffer): void;
		export function finish(writer: Writer): string;
	}
}

export default native;
