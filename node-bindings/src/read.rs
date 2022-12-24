use neon::prelude::*;
use std::cell::RefCell;
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
