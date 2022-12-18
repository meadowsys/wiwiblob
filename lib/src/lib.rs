type MainResult<T = ()> = Result<T, Box<dyn std::error::Error>>;

pub struct WiwiBlob {
	dir: String
}

impl WiwiBlob {
	pub fn new(dir: String) -> Self {
		Self { dir }
	}
}
