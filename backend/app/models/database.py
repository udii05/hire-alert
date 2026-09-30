from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from app.core.config import settings

engine = create_async_engine(settings.database_url, echo=settings.debug)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """
    Verify database connectivity. Schema is owned by Prisma (frontend) —
    we must NOT run create_all here, otherwise table/column names would
    conflict with the camelCase columns Prisma generated.
    """
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
