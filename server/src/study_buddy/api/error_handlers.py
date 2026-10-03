import logging
from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from study_buddy.domain.errors import (
    ConfigurationError,
    DocumentNotFoundError,
    DocumentParsingError,
    DocumentTooLargeError,
    GenerationError,
    StudyBuddyError,
    UnsupportedDocumentError,
    VectorStoreError,
)

logger = logging.getLogger(__name__)

_STATUS_BY_ERROR: dict[type[StudyBuddyError], HTTPStatus] = {
    UnsupportedDocumentError: HTTPStatus.UNSUPPORTED_MEDIA_TYPE,
    DocumentTooLargeError: HTTPStatus.REQUEST_ENTITY_TOO_LARGE,
    DocumentParsingError: HTTPStatus.UNPROCESSABLE_ENTITY,
    DocumentNotFoundError: HTTPStatus.NOT_FOUND,
    VectorStoreError: HTTPStatus.SERVICE_UNAVAILABLE,
    GenerationError: HTTPStatus.BAD_GATEWAY,
    ConfigurationError: HTTPStatus.INTERNAL_SERVER_ERROR,
}


def status_for(exc: StudyBuddyError) -> int:
    for error_type, code in _STATUS_BY_ERROR.items():
        if isinstance(exc, error_type):
            return int(code)
    return int(HTTPStatus.INTERNAL_SERVER_ERROR)


async def _handle_domain_error(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, StudyBuddyError)
    code = status_for(exc)
    if code >= 500:
        logger.error("%s %s failed: %s", request.method, request.url.path, exc, exc_info=exc)
    return JSONResponse(status_code=code, content={"detail": str(exc)})


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(StudyBuddyError, _handle_domain_error)
