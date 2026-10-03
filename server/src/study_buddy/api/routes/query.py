from fastapi import APIRouter

from study_buddy.api.dependencies import RagServiceDep
from study_buddy.api.schemas import CitationResponse, QueryRequest, QueryResponse

router = APIRouter(tags=["query"])


@router.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest, service: RagServiceDep) -> QueryResponse:
    answer = await service.ask(request.question, request.top_k)
    return QueryResponse(
        answer=answer.answer,
        citations=[
            CitationResponse(
                document_id=c.document_id,
                filename=c.source,
                page=c.page,
                snippet=c.snippet,
                score=c.score,
            )
            for c in answer.citations
        ],
    )
