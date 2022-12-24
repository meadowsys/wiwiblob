use neon::prelude::*;
use wiwibloblib::write::Writer as RawWriter;
use wiwibloblib::write::WriterBuilder as RawWriterBuilder;

pub struct Writer {
	inner: RawWriter
}

impl Finalize for Writer {}

pub struct WriterBuilder {
	inner: RawWriterBuilder
}

impl Finalize for WriterBuilder {}
