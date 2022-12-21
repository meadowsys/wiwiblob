use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
	#[error("The provided filename is too long, expected less than {}, got {}", u16::MAX, .0)]
	FilenameTooLong(usize),
	#[error("The provided owner is too long, expected less than {}, got {}", u8::MAX, .0)]
	OwnerTooLong(usize),
	#[error("The provided hash does not match with the actual hash, expected {expected}, got {got}")]
	MismatchedHash { expected: String, got: String }
}
