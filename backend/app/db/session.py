"""Async database session configuration for PostgreSQL, Supabase, and SQLite."""

import os
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

raw_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./loanflow.db")

# Normalize PostgreSQL driver for asyncpg
if raw_url.startswith("postgres://"):
    raw_url = raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+asyncpg://"):
    raw_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)

DATABASE_URL = raw_url

# Connect args & engine configuration
engine_kwargs = {"echo": False}

if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    connect_args = {}
    
    # Supabase & PgBouncer / Connection Pooler optimizations:
    # 1. Disable asyncpg prepared statement caching when using poolers (port 6543)
    # 2. Support SSL mode required by Supabase
    if ":6543" in DATABASE_URL or "pooler.supabase.com" in DATABASE_URL:
        connect_args["statement_cache_size"] = 0
        connect_args["prepared_statement_cache_size"] = 0
    
    if "sslmode=require" in DATABASE_URL or "supabase.co" in DATABASE_URL or "pooler.supabase" in DATABASE_URL:
        # Strip query parameter if present so asyncpg handles it via connect_args
        clean_url = DATABASE_URL.replace("?sslmode=require", "").replace("&sslmode=require", "")
        DATABASE_URL = clean_url
        connect_args["ssl"] = "require"

    engine_kwargs.update({
        "pool_size": 20,
        "max_overflow": 10,
        "pool_pre_ping": True,
        "connect_args": connect_args,
    })

engine = create_async_engine(DATABASE_URL, **engine_kwargs)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
async_session_maker = async_session_factory


async def get_async_session() -> AsyncSession:  # type: ignore[misc]
    """Yield an async database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
