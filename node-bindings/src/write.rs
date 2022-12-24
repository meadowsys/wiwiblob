use neon::prelude::*;
use std::cell::RefCell;
use wiwibloblib::write::Writer as RawWriter;
use wiwibloblib::write::WriterBuilder as RawWriterBuilder;

pub struct Writer {
	pub inner: RefCell<RawWriter>
}

impl Finalize for Writer {}

pub struct WriterBuilder {
	pub inner: RefCell<RawWriterBuilder>
}

impl Finalize for WriterBuilder {}

pub fn set_filename(mut cx: FunctionContext) -> JsResult<JsUndefined> {
	let cx = &mut cx;

	let writer_builder = cx.argument::<JsBox<WriterBuilder>>(0)?;
	let mut writer_builder = writer_builder.inner.borrow_mut();
	let filename = cx.argument::<JsString>(1)?.value(cx);

	match writer_builder.set_filename(filename) {
		Ok(_) => { Ok(cx.undefined()) }
		Err(e) => {
			let e = cx.error(e.to_string())?;
			cx.throw(e)
		}
	}
}

pub fn set_owner(mut cx: FunctionContext) -> JsResult<JsUndefined> {
	let cx = &mut cx;

	let writer_builder = cx.argument::<JsBox<WriterBuilder>>(0)?;
	let mut writer_builder = writer_builder.inner.borrow_mut();
	let owner = cx.argument::<JsString>(1)?.value(cx);

	match writer_builder.set_owner(owner) {
		Ok(_) => { Ok(cx.undefined()) }
		Err(e) => {
			let e = cx.error(e.to_string())?;
			cx.throw(e)
		}
	}
}

pub fn build(mut cx: FunctionContext) -> JsResult<JsBox<Writer>> {
	let cx = &mut cx;

	let writer_builder = cx.argument::<JsBox<WriterBuilder>>(0)?
		.inner
		.borrow()
		.clone();
	let writer = match writer_builder.build() {
		Ok(writer) => { writer }
		Err(e) => {
			let e = cx.error(e.to_string())?;
			cx.throw(e)?
		}
	};

	Ok(cx.boxed(Writer {
		inner: RefCell::new(writer)
	}))
}
