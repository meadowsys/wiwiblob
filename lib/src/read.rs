use anyhow::Result;
use std::fs;
use std::io::Read;
use std::io::Seek;
use std::io::SeekFrom;
use super::error::Error;
use xz2::read::XzDecoder;

#[must_use = "builder does nothing unless built"]
pub struct ReaderBuilder<'h> {
	dir: &'h str,
	hash: &'h str,
	verify: bool
}

impl<'h> ReaderBuilder<'h> {
	pub fn new(dir: &'h str, hash: &'h str) -> Self {
		Self { dir, hash, verify: false }
	}

	pub fn verify(&mut self, verify: bool) {
		self.verify = verify;
	}
}

pub struct Reader {
	dir: String,
	xz: XzDecoder<fs::File>
}


impl Reader {
	pub fn from_builder(builder: ReaderBuilder) -> Result<Self> {
		let ReaderBuilder { dir, hash, verify } = builder;

		let path = super::get_path(dir, hash);
		let mut file = fs::OpenOptions::new()
			.read(true)
			.open(path)?;

		if verify {
			let actual_hash = super::hash_data(&mut file)?.to_hex();
			if hash != &actual_hash {
				return Err(Error::MismatchedHash { expected: hash.into(), got: actual_hash.to_string() }.into())
			}

			file.seek(SeekFrom::Start(0))?;
		}

		let xz = XzDecoder::new(file);

		Ok(Reader {
			dir: dir.into(),
			xz
		})
	}
}

impl Read for Reader {
	fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
		self.xz.read(buf)
	}
}
