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
		export function reader_builder(wiwiblob: WiwiBlob, hash: string): ReaderBuilder
		export function writer_builder(wiwiblob: WiwiBlob): WriterBuilder
		export function writer_builder_with_spoolsize(wiwiblob: WiwiBlob, spoolsize: number): WriterBuilder
	}

	export namespace writer_builder {
		export function set_filename(writer_builder: WriterBuilder, filename: string): void;
		export function set_owner(writer_builder: WriterBuilder, owner: string): void;
		export function build(writer_builder: WriterBuilder): Writer;
	}
}

export default native;
