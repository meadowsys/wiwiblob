use neon::prelude::*;

mod wiwiblob;

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

		exports.set(cx, "wiwiblob", wiwiblob)?;
	}

	Ok(())
}
