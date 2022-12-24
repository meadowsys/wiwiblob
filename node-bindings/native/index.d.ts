declare class Nominal<T> { #__private: T }

declare namespace native {
	export namespace wiwiblob {
		export type WiwiBlob = Nominal<WiwiBlob>;

		export function new_wiwiblob(dir: string): WiwiBlob;
		export function new_wiwiblob_with_spoolsize(dir: string, spoolsize: number): WiwiBlob;
	}
}

export default native;
