pub const DEFAULT_SPOOL_INMEMORY_SIZE: usize = 5242880; // 5 * 1024 * 1024, 5MiB

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
