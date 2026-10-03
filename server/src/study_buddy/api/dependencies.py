from typing import Annotated, cast

from fastapi import Depends, Request

from study_buddy.core.container import Container
from study_buddy.domain.ports import HealthCheck
from study_buddy.services.document_service import DocumentService
from study_buddy.services.ingestion_service import IngestionService
from study_buddy.services.rag_service import RagService


def get_container(request: Request) -> Container:
    return cast(Container, request.app.state.container)


ContainerDep = Annotated[Container, Depends(get_container)]


def get_ingestion_service(container: ContainerDep) -> IngestionService:
    return container.ingestion_service


def get_document_service(container: ContainerDep) -> DocumentService:
    return container.document_service


def get_rag_service(container: ContainerDep) -> RagService:
    return container.rag_service


def get_health_checks(container: ContainerDep) -> list[HealthCheck]:
    return container.health_checks


IngestionServiceDep = Annotated[IngestionService, Depends(get_ingestion_service)]
DocumentServiceDep = Annotated[DocumentService, Depends(get_document_service)]
RagServiceDep = Annotated[RagService, Depends(get_rag_service)]
HealthChecksDep = Annotated[list[HealthCheck], Depends(get_health_checks)]
