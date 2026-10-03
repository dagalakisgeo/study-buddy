from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from study_buddy.api.error_handlers import register_error_handlers
from study_buddy.api.routes import api_router
from study_buddy.core.config import Settings, get_settings
from study_buddy.core.container import Container, build_container


def create_app(container: Container | None = None, settings: Settings | None = None) -> FastAPI:
    """Application factory.

    Run with: `uvicorn study_buddy.main:create_app --factory`.
    Pass a prebuilt `container` to swap in other implementations (e.g. in tests).
    """
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        active = container or build_container(settings)
        await active.startup()
        app.state.container = active
        try:
            yield
        finally:
            await active.shutdown()

    app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_error_handlers(app)
    app.include_router(api_router, prefix=settings.api_prefix)
    return app
