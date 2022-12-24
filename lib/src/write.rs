use anyhow::Result;
use std::fs;
use std::io::Read;
use std::io::Write;
use std::io::Seek;
use std::io::SeekFrom;
use super::error::Error;
use super::FileMeta;
use tempfile::spooled_tempfile;
use tempfile::SpooledTempFile;
use xz2::write::XzEncoder;

#[must_use = "builder does nothing unless built"]
pub struct WriterBuilder {
	dir: String,
	filemeta: FileMeta,
	spoolsize: usize
}

impl WriterBuilder {
	pub(crate) fn new(dir: String) -> Self {
		Self::with_spoolsize(dir, super::DEFAULT_SPOOL_INMEMORY_SIZE)
	}

	pub(crate) fn with_spoolsize(dir: String, spoolsize: usize) -> Self {
		Self { dir, filemeta: FileMeta::default(), spoolsize }
	}

	pub fn set_filename(&mut self, filename: String) -> Result<()> {
		if filename.len() > u16::MAX as usize {
			return Err(Error::FilenameTooLong(filename.len()).into())
		}
		self.filemeta.filename = Some(filename);
		Ok(())
	}

	pub fn set_owner(&mut self, owner: String) -> Result<()> {
		if owner.len() > u8::MAX as usize {
			return Err(Error::OwnerTooLong(owner.len()).into())
		}
		self.filemeta.owner = Some(owner);
		Ok(())
	}

	pub fn build(self) -> Result<Writer> {
		Writer::from_builder(self)
	}
}

pub struct Writer {
	dir: String,
	xz: XzEncoder<SpooledTempFile>
}

impl Writer {
	pub fn from_builder(builder: WriterBuilder) -> Result<Self> {
		let WriterBuilder { dir, filemeta, spoolsize } = builder;
		let FileMeta { filename, owner } = filemeta;

		let tempfile = spooled_tempfile(spoolsize);
		let mut xz = XzEncoder::new(tempfile, 0);

		if let Some(filename) = filename {
			let filename_bytes = super::FILENAME;
			xz.write_all(&[filename_bytes.len() as u8])?;
			xz.write_all(filename_bytes)?;

			xz.write_all(&(filename.len() as u16).to_le_bytes())?;
			xz.write_all(filename.as_bytes())?;
		}

		if let Some(owner) = owner {
			let owner_bytes = super::OWNER;
			xz.write_all(&[owner_bytes.len() as u8])?;
			xz.write_all(owner_bytes)?;

			xz.write_all(&[owner.len() as u8])?;
			xz.write_all(owner.as_bytes())?;
		}

		let data_bytes = super::DATA;
		xz.write_all(&[data_bytes.len() as u8])?;
		xz.write_all(data_bytes)?;

		Ok(Writer {
			dir: dir.into(),
			xz
		})
	}
}

impl Write for Writer {
	fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
		self.xz.write(buf)
	}

	fn flush(&mut self) -> std::io::Result<()> {
		self.xz.flush()
	}
}

impl Writer {
	pub fn finish(self) -> Result<String> {
		let mut tempfile = self.xz.finish()?;
		tempfile.seek(SeekFrom::Start(0))?;

		let hash = super::hash_data(&mut tempfile)?.to_hex();
		tempfile.seek(SeekFrom::Start(0))?;

		let path = super::get_path(&self.dir, &hash);
		fs::create_dir_all(path.parent().unwrap())?;

		let mut file = fs::OpenOptions::new()
			.create_new(true)
			.write(true)
			.open(path)?;
		let mut buf = vec![0u8; super::BUFFER_SIZE].into_boxed_slice();

		loop {
			let read_bytes = tempfile.read(&mut buf)?;
			if read_bytes == 0 { break }
			file.write_all(&buf[0..read_bytes])?;
		}

		Ok(hash.to_string())
	}
}
