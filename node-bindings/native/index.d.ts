declare class Nominal<T> { #__private: T }

declare namespace native {
	export namespace wiwiblob {
		export type WiwiBlob = Nominal<WiwiBlob>;

		export function new_wiwiblob(dir: string): WiwiBlob;
		export function new_wiwiblob_with_spoolsize(dir: string, spoolsize: number): WiwiBlob;
		export function reader_builder(wiwiblob: WiwiBlob, hash: string): read.ReaderBuilder
		export function writer_builder(wiwiblob: WiwiBlob): write.WriterBuilder
		export function writer_builder_with_spoolsize(wiwiblob: WiwiBlob, spoolsize: number): write.WriterBuilder
	}

	export namespace read {
		export type Reader = Nominal<Reader>;
		export type ReaderBuilder = Nominal<ReaderBuilder>;
	}

	export namespace write {
		export type Writer = Nominal<Writer>;
		export type WriterBuilder = Nominal<WriterBuilder>;
	}
}

export default native;
