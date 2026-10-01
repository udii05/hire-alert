"""
Hire-Alert AI Agent Backend
FastAPI application with multi-agent workflow orchestration.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.models.database import init_db
from app.api.agents import router as agents_router
from app.api.opportunities import router as opportunities_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management."""
    # Fail fast if production is running with the placeholder API key
    if not settings.debug and settings.backend_api_key == "backend-api-key-change-in-production":
        raise RuntimeError(
            "BACKEND_API_KEY is set to the insecure default. "
            "Set a strong BACKEND_API_KEY in the environment, or run with DEBUG=true for local development."
        )

    logger.info(f"Starting {settings.app_name}")
    try:
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.warning(f"Database initialization skipped: {e}")
        logger.info("Will connect to database on demand")

    # Start the background scheduler (daily refresh, cleanup, priority alerts)
    try:
        from app.workers.scheduler import scheduler
        await scheduler.start()
    except Exception as e:
        logger.warning(f"Scheduler start skipped: {e}")

    yield

    try:
        from app.workers.scheduler import scheduler
        await scheduler.stop()
    except Exception:
        pass

    logger.info(f"Shutting down {settings.app_name}")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware (origins configured via ALLOWED_ORIGINS env var)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests."""
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Include routers
app.include_router(agents_router)
app.include_router(opportunities_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
