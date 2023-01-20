declare class Nominal<T> { #__private: T }

export type WiwiBlob = Nominal<WiwiBlob>;
export type Reader = Nominal<Reader>;
export type ReaderBuilder = Nominal<ReaderBuilder>;
export type Writer = Nominal<Writer>;
export type WriterBuilder = Nominal<WriterBuilder>;

export type native = {
	wiwiblob: {
		new_wiwiblob(dir: string): WiwiBlob;
		new_wiwiblob_with_spoolsize(dir: string, spoolsize: number): WiwiBlob;
		reader_builder(wiwiblob: WiwiBlob, hash: string): ReaderBuilder;
		writer_builder(wiwiblob: WiwiBlob): WriterBuilder;
		writer_builder_with_spoolsize(wiwiblob: WiwiBlob, spoolsize: number): WriterBuilder;
	};

	reader_builder: {
		verify(reader_builder: ReaderBuilder, verify: boolean): void;
		build(reader_builder: ReaderBuilder): Promise<Reader>;
	};

	reader: {
		/* TODO promisify? */ get_filename(reader: Reader): string | undefined;
		/* TODO promisify? */ get_owner(reader: Reader): string | undefined;
		/* TODO promisify? */ read_to_new_buffer(reader: Reader, bufsize: number): [buf: Buffer, read_bytes: number];
	};

	writer_builder: {
		/* TODO promisify? */ set_filename(writer_builder: WriterBuilder, filename: string): void;
		/* TODO promisify? */ set_owner(writer_builder: WriterBuilder, owner: string): void;
		/* TODO promisify? */ set_other_meta(writer_builder: WriterBuilder, k: string, v: string): void;
		build(writer_builder: WriterBuilder): Promise<Writer>;
	};

	writer: {
		/**
		 * **WARNING**: **DO NOT** call this function again until the returned promise has resolved
		 */
		write_all(writer: Writer, buf: Buffer): Promise<void>;
		finish(writer: Writer): Promise<string>;
	};
};


declare function create(path?: string): native;
export default create;
