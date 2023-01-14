use neon::prelude::*;
use std::cell::RefCell;
use std::io::Read;
use wiwibloblib::read::Reader as RawReader;
use wiwibloblib::read::ReaderBuilder as RawReaderBuilder;

pub struct ReaderBuilder {
	pub inner: RefCell<RawReaderBuilder>
}

impl Finalize for ReaderBuilder {}

pub struct Reader {
	pub inner: RefCell<RawReader>
}

impl Finalize for Reader {}

pub fn verify(mut cx: FunctionContext) -> JsResult<JsUndefined> {
	let cx = &mut cx;

	let reader_builder = cx.argument::<JsBox<ReaderBuilder>>(0)?;
	let mut reader_builder = reader_builder.inner.borrow_mut();
	let verify = cx.argument::<JsBoolean>(1)?.value(cx);

	reader_builder.verify(verify);
	Ok(cx.undefined())
}

pub fn build(mut cx: FunctionContext) -> JsResult<JsPromise> {
	let cx = &mut cx;

	let reader_builder = cx.argument::<JsBox<ReaderBuilder>>(0)?
		.inner
		.borrow()
		.clone();

	let promise = cx.task(|| reader_builder.build())
		.promise(|mut cx, res| {
			let cx = &mut cx;

			let reader = match res {
				Ok(reader) => { reader }
				Err(e) => {
					let e = cx.error(e.to_string())?;
					cx.throw(e)?
				}
			};

			Ok(cx.boxed(Reader {
				inner: RefCell::new(reader)
			}))
		});

	Ok(promise)
}

pub fn get_filename(mut cx: FunctionContext) -> JsResult<JsValue> {
	let cx = &mut cx;

	let reader = cx.argument::<JsBox<Reader>>(0)?;
	let reader = reader.inner.borrow();

	let filename = reader.get_filename();

	match filename {
		Some(filename) => { Ok(cx.string(filename).upcast()) }
		None => { Ok(cx.undefined().upcast()) }
	}
}

pub fn get_owner(mut cx: FunctionContext) -> JsResult<JsValue> {
	let cx = &mut cx;

	let reader = cx.argument::<JsBox<Reader>>(0)?;
	let reader = reader.inner.borrow();

	let owner = reader.get_owner();

	match owner {
		Some(owner) => { Ok(cx.string(owner).upcast()) }
		None => { Ok(cx.undefined().upcast()) }
	}
}

pub fn read_to_new_buffer(mut cx: FunctionContext) -> JsResult<JsArray> {
	let cx = &mut cx;

	let reader = cx.argument::<JsBox<Reader>>(0)?;
	let mut reader = reader.inner.borrow_mut();
	let bufsize = cx.argument::<JsNumber>(1)?.value(cx) as usize;

	let mut buf = vec![0u8; bufsize].into_boxed_slice();
	let bytes_read = match reader.read(&mut buf) {
		Ok(num) => { num }
		Err(e) => {
			let e = cx.error(e.to_string())?;
			cx.throw(e)?
		}
	};
	let buf = JsBuffer::from_slice(cx, &buf[0..bytes_read])?;
	let bytes_read = cx.number(bytes_read as f64);

	let rv = JsArray::new(cx, 2);
	rv.set(cx, 0, buf)?;
	rv.set(cx, 1, bytes_read)?;

	Ok(rv)
}
