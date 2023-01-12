declare class Nominal<T> { #__private: T }

declare namespace native {
	export type WiwiBlob = Nominal<WiwiBlob>;
	export type Reader = Nominal<Reader>;
	export type ReaderBuilder = Nominal<ReaderBuilder>;
	export type Writer = Nominal<Writer>;
	export type WriterBuilder = Nominal<WriterBuilder>;

	export namespace wiwiblob {
		/* TODO promisify? */ export function new_wiwiblob(dir: string): WiwiBlob;
		/* TODO promisify? */ export function new_wiwiblob_with_spoolsize(dir: string, spoolsize: number): WiwiBlob;
		/* TODO promisify? */ export function reader_builder(wiwiblob: WiwiBlob, hash: string): ReaderBuilder;
		/* TODO promisify? */ export function writer_builder(wiwiblob: WiwiBlob): WriterBuilder;
		/* TODO promisify? */ export function writer_builder_with_spoolsize(wiwiblob: WiwiBlob, spoolsize: number): WriterBuilder;
	}

	export namespace reader_builder {
		/* TODO promisify? */ export function verify(reader_builder: ReaderBuilder, verify: boolean): void;
		/* TODO promisify? */ export function build(reader_builder: ReaderBuilder): Reader;
	}

	export namespace reader {
		/* TODO promisify? */ export function get_filename(reader: Reader): string | undefined;
		/* TODO promisify? */ export function get_owner(reader: Reader): string | undefined;
		/* TODO promisify? */ export function read_to_new_buffer(reader: Reader, bufsize: number): [buf: Buffer, read_bytes: number];
	}

	export namespace writer_builder {
		/* TODO promisify? */ export function set_filename(writer_builder: WriterBuilder, filename: string): void;
		/* TODO promisify? */ export function set_owner(writer_builder: WriterBuilder, owner: string): void;
		/* TODO promisify? */ export function build(writer_builder: WriterBuilder): Writer;
	}

	export namespace writer {
		/**
		 * **WARNING**: **DO NOT** call this function again until the returned promise has resolved
		 */
		export function write_all(writer: Writer, buf: Buffer): Promise<void>;
		/* TODO promisify? */ export function finish(writer: Writer): string;
	}
}

export default native;
