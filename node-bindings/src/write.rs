use neon::prelude::*;
use neon::types::buffer::TypedArray;
use std::cell::RefCell;
use std::io::Write;
use wiwibloblib::write::Writer as RawWriter;
use wiwibloblib::write::WriterBuilder as RawWriterBuilder;

pub struct WriterBuilder {
	pub inner: RefCell<RawWriterBuilder>
}

impl Finalize for WriterBuilder {}

pub struct Writer {
	pub inner: RefCell<Option<RawWriter>>
}

impl Finalize for Writer {}

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
		inner: RefCell::new(Some(writer))
	}))
}

pub fn write_all(mut cx: FunctionContext) -> JsResult<JsUndefined> {
	let cx = &mut cx;

	let writer = cx.argument::<JsBox<Writer>>(0)?;
	let mut writer_opt = writer.inner.borrow_mut();
	let mut writer = writer_opt.take().unwrap();
	let buf = cx.argument::<JsBuffer>(1)?;

	let res = writer.write_all(buf.as_slice(cx));
	*writer_opt = Some(writer);

	match res {
		Ok(_) => { Ok(cx.undefined()) }
		Err(e) => {
			let e = cx.error(e.to_string())?;
			cx.throw(e)?
		}
	}
}

pub fn finish(mut cx: FunctionContext) -> JsResult<JsString> {
	let cx = &mut cx;

	let writer = cx.argument::<JsBox<Writer>>(0)?;
	let mut writer_opt = writer.inner.borrow_mut();
	let writer = writer_opt.take().unwrap();

	match writer.finish() {
		Ok(hash) => { Ok(cx.string(hash)) }
		Err(e) => {
			let e = cx.error(e.to_string())?;
			cx.throw(e)?
		}
	}
}
