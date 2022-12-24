use neon::prelude::*;
use wiwibloblib::read::Reader as RawReader;
use wiwibloblib::read::ReaderBuilder as RawReaderBuilder;

pub struct ReaderBuilder {
	inner: RawReaderBuilder
}

impl Finalize for ReaderBuilder {}

pub struct Reader {
	inner: RawReader
}

impl Finalize for Reader {}
