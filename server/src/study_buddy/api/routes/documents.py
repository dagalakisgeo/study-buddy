from pathlib import PureWindowsPath
from typing import Annotated

from fastapi import APIRouter, File, Response, UploadFile, status

from study_buddy.api.dependencies import DocumentServiceDep, IngestionServiceDep
from study_buddy.api.schemas import DocumentResponse, IngestResponse

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", response_model=IngestResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: Annotated[UploadFile, File(description="A PDF document")],
    service: IngestionServiceDep,
) -> IngestResponse:
    # PureWindowsPath strips both "/" and "\" directory parts from client filenames.
    filename = PureWindowsPath(file.filename or "upload.pdf").name
    data = await file.read()
    result = await service.ingest(data, filename, file.content_type)
    return IngestResponse(
        document_id=result.document_id,
        filename=result.source,
        pages=result.page_count,
        chunks=result.chunk_count,
    )


@router.get("", response_model=list[DocumentResponse])
async def list_documents(service: DocumentServiceDep) -> list[DocumentResponse]:
    return [
        DocumentResponse(document_id=doc.document_id, filename=doc.source, chunks=doc.chunk_count)
        for doc in await service.list_documents()
    ]


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: str, service: DocumentServiceDep) -> Response:
    await service.delete_document(document_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
