use anyhow::Result;
use blake3::Hasher;
use blake3::Hash;
use std::io::Read;
use std::path;
use tempfile::SpooledTempFile;

mod error;
mod write;

pub const DEFAULT_SPOOL_INMEMORY_SIZE: usize = 5 * 1024 * 1024; // 5MiB
const FILENAME: &str = "f";
const OWNER: &str = "o";
const DATA: &str = "d";

/// 128KiB is minimum for efficient parallelisation on x86_64
/// according to blake3 docs, so lets just use that, I don't know any better
/// probably insignificant anyways, but meh lol
/// https://docs.rs/blake3/1.3.3/blake3/struct.Hasher.html#method.update_rayon
const MIN_FOR_EFFICIENT_PARALLELISATION: usize = 128 * 1024; // 128KiB
const BUFFER_SIZE: usize = 2 * 1024 * 1024; // 2MiB

#[derive(Default)]
struct FileMeta {
	filename: Option<String>,
	owner: Option<String>
}

pub struct WiwiBlob {
	dir: String,
	spoolsize: usize
}

impl WiwiBlob {
	pub fn new(dir: String) -> Self {
		Self::with_spoolsize(dir, DEFAULT_SPOOL_INMEMORY_SIZE)
	}

	pub fn with_spoolsize(dir: String, spoolsize: usize) -> Self {
		Self { dir, spoolsize }
	}
}

fn hash_data<R: Read>(reader: &mut R) -> Result<Hash> {
	let mut hash = Hasher::new();
	let mut buf = vec![0u8; BUFFER_SIZE].into_boxed_slice();

	loop {
		let read_bytes = reader.read(&mut buf)?;
		if read_bytes == 0 { break }

		// TODO && is_power_of_2(read_bytes)
		// figure out how to round down to nearest power of two using bit manipulation
		// and then enable parallelisation
		// if read_bytes > MIN_FOR_EFFICIENT_PARALLELISATION {
		// 	hash.update_rayon(&buf);
		// } else {
		// 	hash.update(&buf);
		// }

		hash.update(&buf);
	}

	Ok(hash.finalize())
}

fn get_path(dir: &str, hash: &str) -> path::PathBuf {
	let mut path = path::PathBuf::from(dir);

	path.reserve(2 + 1 + 2 + 1 + hash.len());
	path.push(&hash[0..2]);
	path.push(&hash[2..4]);
	path.push(hash);

	path
}

fn is_power_of_2(num: usize) -> bool {
	(num & (num - 1)) == 0
}
