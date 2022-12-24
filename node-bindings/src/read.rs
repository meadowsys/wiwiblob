use neon::prelude::*;
use wiwibloblib::read::Reader as RawReader;
use wiwibloblib::read::ReaderBuilder as RawReaderBuilder;

pub struct ReaderBuilder {
	pub inner: RawReaderBuilder
}

impl Finalize for ReaderBuilder {}

pub struct Reader {
	pub inner: RawReader
}

impl Finalize for Reader {}
