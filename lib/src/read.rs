use anyhow::Result;
use std::fs;
use std::io::Read;
use std::io::Seek;
use std::io::SeekFrom;
use super::error::Error;
use super::FileMeta;
use xz2::read::XzDecoder;

#[must_use = "builder does nothing unless built"]
#[derive(Clone)]
pub struct ReaderBuilder {
	dir: String,
	hash: String,
	verify: bool
}

impl ReaderBuilder {
	pub(crate) fn new(dir: String, hash: String) -> Self {
		Self { dir, hash, verify: false }
	}

	pub fn verify(&mut self, verify: bool) {
		self.verify = verify;
	}

	pub fn build(self) -> Result<Reader> {
		Reader::from_builder(self)
	}
}

pub struct Reader {
	filemeta: FileMeta,
	xz: XzDecoder<fs::File>
}


impl Reader {
	pub fn from_builder(builder: ReaderBuilder) -> Result<Self> {
		let ReaderBuilder { dir, hash, verify } = builder;

		let path = super::get_path(&dir, &hash);
		let mut file = fs::OpenOptions::new()
			.read(true)
			.open(path)?;

		if verify {
			let actual_hash = super::hash_data(&mut file)?.to_hex();
			if *hash != actual_hash {
				return Err(Error::MismatchedHash { expected: hash, got: actual_hash.to_string() }.into())
			}

			file.seek(SeekFrom::Start(0))?;
		}
		let mut xz = XzDecoder::new(file);

		let mut filemeta = FileMeta::default();

		let mut one_buf = [0u8; 1];
		let mut buf = vec![].into_boxed_slice();
		loop {
			xz.read_exact(&mut one_buf)?;
			if one_buf[0] as usize > buf.len() {
				buf = vec![0u8; one_buf[0] as usize].into()
			}

			let meta = &mut buf[0..one_buf[0] as usize];
			xz.read_exact(meta)?;
			match meta {
				meta if meta == super::DATA => { break }

				meta if meta == super::FILENAME => {
					let mut filename_len = [0u8; 2];
					xz.read_exact(&mut filename_len)?;
					let filename_len = u16::from_le_bytes(filename_len);

					let mut filename = vec![0u8; filename_len as usize].into_boxed_slice();
					xz.read_exact(&mut filename)?;
					let filename = String::from_utf8(filename.into_vec())?;

					filemeta.filename = Some(filename);
				}

				meta if meta == super::OWNER => {
					let mut owner_len = [0u8; 1];
					xz.read_exact(&mut owner_len)?;
					let owner_len = u8::from_le_bytes(owner_len);

					let mut owner = vec![0u8; owner_len as usize].into_boxed_slice();
					xz.read_exact(&mut owner)?;
					let owner = String::from_utf8(owner.into_vec())?;

					filemeta.owner = Some(owner);
				}

				meta if meta == super::OTHER_META => {
					let mut key_len = [0u8; 8];
					xz.read_exact(&mut key_len)?;
					let key_len = u64::from_le_bytes(key_len);

					let mut key = vec![0u8; key_len as usize].into_boxed_slice();
					xz.read_exact(&mut key)?;
					let k = String::from_utf8(key.into_vec())?;

					let mut value_len = [0u8; 8];
					xz.read_exact(&mut value_len)?;
					let value_len = u64::from_le_bytes(value_len);

					let mut value = vec![0u8; value_len as usize].into_boxed_slice();
					xz.read_exact(&mut value)?;
					let v = String::from_utf8(value.into_vec())?;

					if let Some(vec) = filemeta.other_meta.get_mut(&k) {
						vec.push(v);
					} else {
						filemeta.other_meta.insert(k, vec![v]);
					}
				}

				unknown_meta => {
					return Err(Error::UnknownMetaField(
						String::from_utf8(unknown_meta.to_vec())?
					).into())
				}
			}
		}

		Ok(Reader {
			filemeta,
			xz
		})
	}

	pub fn get_filename(&self) -> Option<&str> {
		self.filemeta.filename.as_deref()
	}

	pub fn get_owner(&self) -> Option<&str> {
		self.filemeta.owner.as_deref()
	}

	pub fn get_other_meta(&self, k: &str) -> Option<&Vec<String>> {
		self.filemeta.other_meta.get(k)
	}

	pub fn get_other_meta_iter(&self) -> std::collections::hash_map::Iter<'_, String, Vec<String>> {
		self.filemeta.other_meta.iter()
	}
}

impl Read for Reader {
	fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
		self.xz.read(buf)
	}
}
