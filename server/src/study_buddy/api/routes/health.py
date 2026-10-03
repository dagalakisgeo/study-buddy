from fastapi import APIRouter

from study_buddy.api.dependencies import HealthChecksDep
from study_buddy.api.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health(checks: HealthChecksDep) -> HealthResponse:
    results = {check.name: await check.is_healthy() for check in checks}
    return HealthResponse(status="ok" if all(results.values()) else "degraded", checks=results)
