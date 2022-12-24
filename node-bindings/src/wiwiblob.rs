use neon::prelude::*;
use wiwibloblib::WiwiBlob as RawWiwiBlob;

pub struct WiwiBlob {
	inner: RawWiwiBlob
}

impl Finalize for WiwiBlob {}

pub fn new(mut cx: FunctionContext) -> JsResult<JsBox<WiwiBlob>> {
	let cx = &mut cx;

	let dir = cx.argument::<JsString>(0)?.value(cx);

	Ok(cx.boxed(WiwiBlob {
		inner: RawWiwiBlob::new(dir)
	}))
}

pub fn with_spoolsize(mut cx: FunctionContext) -> JsResult<JsBox<WiwiBlob>> {
	let cx = &mut cx;

	let dir = cx.argument::<JsString>(0)?.value(cx);
	let spoolsize = cx.argument::<JsNumber>(1)?.value(cx) as usize;

	Ok(cx.boxed(WiwiBlob {
		inner: RawWiwiBlob::with_spoolsize(dir, spoolsize)
	}))
}
