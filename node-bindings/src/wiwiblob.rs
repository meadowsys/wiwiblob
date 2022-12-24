use neon::prelude::*;
use wiwibloblib::WiwiBlob as RawWiwiBlob;
use super::write::WriterBuilder;
use super::read::ReaderBuilder;

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

pub fn reader_builder(mut cx: FunctionContext) -> JsResult<JsBox<ReaderBuilder>> {
	let cx = &mut cx;

	let wiwiblob = cx.argument::<JsBox<WiwiBlob>>(0)?;
	let hash = cx.argument::<JsString>(1)?.value(cx);

	Ok(cx.boxed(ReaderBuilder {
		inner: wiwiblob.inner.reader_builder(hash)
	}))
}

pub fn writer_builder(mut cx: FunctionContext) -> JsResult<JsBox<WriterBuilder>> {
	let cx = &mut cx;

	let wiwiblob = cx.argument::<JsBox<WiwiBlob>>(0)?;

	Ok(cx.boxed(WriterBuilder {
		inner: wiwiblob.inner.writer_builder()
	}))
}

pub fn writer_builder_with_spoolsize(mut cx: FunctionContext) -> JsResult<JsBox<WriterBuilder>> {
	let cx = &mut cx;

	let wiwiblob = cx.argument::<JsBox<WiwiBlob>>(0)?;
	let spoolsize = cx.argument::<JsNumber>(1)?.value(cx) as usize;

	Ok(cx.boxed(WriterBuilder {
		inner: wiwiblob.inner.writer_builder_with_spoolsize(spoolsize)
	}))
}
