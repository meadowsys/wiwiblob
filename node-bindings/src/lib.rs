use neon::prelude::*;

mod read;
mod wiwiblob;
mod write;

#[neon::main]
fn init(mut cx: ModuleContext) -> NeonResult<()> {
	let cx = &mut cx;

	let exports = cx.exports_object()?;

	// wiwiblob
	{
		let wiwiblob = cx.empty_object();

		let new_wiwiblob = JsFunction::new(cx, wiwiblob::new)?;
		wiwiblob.set(cx, "new_wiwiblob", new_wiwiblob)?;

		let new_wiwiblob_with_spoolsize = JsFunction::new(cx, wiwiblob::with_spoolsize)?;
		wiwiblob.set(cx, "new_wiwiblob_with_spoolsize", new_wiwiblob_with_spoolsize)?;

		let reader_builder = JsFunction::new(cx, wiwiblob::reader_builder)?;
		wiwiblob.set(cx, "reader_builder", reader_builder)?;

		let writer_builder = JsFunction::new(cx, wiwiblob::writer_builder)?;
		wiwiblob.set(cx, "writer_builder", writer_builder)?;

		let writer_builder_with_spoolsize = JsFunction::new(cx, wiwiblob::writer_builder_with_spoolsize)?;
		wiwiblob.set(cx, "writer_builder_with_spoolsize", writer_builder_with_spoolsize)?;

		exports.set(cx, "wiwiblob", wiwiblob)?;
	}

	// reader_builder
	{
		let reader_builder = cx.empty_object();

		let verify = JsFunction::new(cx, read::verify)?;
		reader_builder.set(cx, "verify", verify)?;

		let build = JsFunction::new(cx, read::build)?;
		reader_builder.set(cx, "build", build)?;

		exports.set(cx, "reader_builder", reader_builder)?;
	}

	// reader
	{
		let reader = cx.empty_object();

		let get_filename = JsFunction::new(cx, read::get_filename)?;
		reader.set(cx, "get_filename", get_filename)?;

		let get_owner = JsFunction::new(cx, read::get_owner)?;
		reader.set(cx, "get_owner", get_owner)?;

		let read_exact_to_new_buffer = JsFunction::new(cx, read::read_exact_to_new_buffer)?;
		reader.set(cx, "read_exact_to_new_buffer", read_exact_to_new_buffer)?;

		exports.set(cx, "reader", reader)?;
	}

	// writer_builder
	{
		let writer_builder = cx.empty_object();

		let set_filename = JsFunction::new(cx, write::set_filename)?;
		writer_builder.set(cx, "set_filename", set_filename)?;

		let set_owner = JsFunction::new(cx, write::set_owner)?;
		writer_builder.set(cx, "set_owner", set_owner)?;

		let build = JsFunction::new(cx, write::build)?;
		writer_builder.set(cx, "build", build)?;

		exports.set(cx, "writer_builder", writer_builder)?;
	}

	// writer
	{
		let writer = cx.empty_object();

		let write_all = JsFunction::new(cx, write::write_all)?;
		writer.set(cx, "write_all", write_all)?;

		let finish = JsFunction::new(cx, write::finish)?;
		writer.set(cx, "finish", finish)?;

		exports.set(cx, "writer", writer)?;
	}

	Ok(())
}
