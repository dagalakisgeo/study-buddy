class StudyBuddyError(Exception):
    """Base class for all application errors."""


class ConfigurationError(StudyBuddyError):
    """Required configuration is missing or invalid."""


class UnsupportedDocumentError(StudyBuddyError):
    """No loader can handle the uploaded file type."""


class DocumentTooLargeError(StudyBuddyError):
    """The uploaded file exceeds the configured size limit."""


class DocumentParsingError(StudyBuddyError):
    """The file could not be parsed."""


class EmptyDocumentError(DocumentParsingError):
    """The file was parsed but contains no extractable text."""


class DocumentNotFoundError(StudyBuddyError):
    """No stored document matches the given id."""


class VectorStoreError(StudyBuddyError):
    """The vector store failed or is unreachable."""


class GenerationError(StudyBuddyError):
    """The LLM failed to produce an answer."""
