"""
Enhanced logging and monitoring configuration for the FastAPI backend.
Includes structured logging, request/response logging, error tracking, and performance monitoring.
"""

import time
import logging
from typing import Callable
from contextlib import asynccontextmanager

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from loguru import logger
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
import psutil
import os

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total number of HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'active_connections',
    'Number of active connections'
)

SYSTEM_CPU_USAGE = Gauge(
    'system_cpu_usage_percent',
    'Current system CPU usage percentage'
)

SYSTEM_MEMORY_USAGE = Gauge(
    'system_memory_usage_percent',
    'Current system memory usage percentage'
)

DB_CONNECTION_POOL_SIZE = Gauge(
    'db_connection_pool_size',
    'Database connection pool size'
)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging all requests and responses with structured data."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        # Extract request information
        request_id = request.headers.get('X-Request-ID', 'unknown')
        user_agent = request.headers.get('User-Agent', 'unknown')
        client_ip = request.client.host if request.client else 'unknown'

        # Log incoming request
        logger.info(
            "Incoming request",
            extra={
                "request_id": request_id,
                "method": request.method,
                "url": str(request.url),
                "headers": dict(request.headers),
                "client_ip": client_ip,
                "user_agent": user_agent,
            }
        )

        try:
            # Process the request
            response = await call_next(request)

            # Calculate processing time
            process_time = time.time() - start_time

            # Update Prometheus metrics
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.url.path,
                status_code=response.status_code
            ).inc()

            REQUEST_LATENCY.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(process_time)

            # Log response
            logger.info(
                "Request completed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "url": str(request.url),
                    "status_code": response.status_code,
                    "process_time": f"{process_time:.4f}s",
                    "response_headers": dict(response.headers),
                }
            )

            # Add custom headers to response
            response.headers["X-Process-Time"] = f"{process_time:.4f}"
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as e:
            # Calculate processing time for errors
            process_time = time.time() - start_time

            # Log error
            logger.error(
                "Request failed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "url": str(request.url),
                    "process_time": f"{process_time:.4f}s",
                    "error": str(e),
                    "error_type": type(e).__name__,
                }
            )

            # Update error metrics
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.url.path,
                status_code=500
            ).inc()

            REQUEST_LATENCY.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(process_time)

            # Re-raise the exception
            raise


class PerformanceMonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware for performance monitoring and system metrics."""

    def __init__(self, app):
        super().__init__(app)
        self._setup_system_monitoring()

    def _setup_system_monitoring(self):
        """Set up periodic system metrics collection."""
        import threading

        def collect_system_metrics():
            while True:
                try:
                    # Update system metrics
                    SYSTEM_CPU_USAGE.set(psutil.cpu_percent(interval=1))
                    SYSTEM_MEMORY_USAGE.set(psutil.virtual_memory().percent)

                    # Sleep for 30 seconds before next collection
                    time.sleep(30)
                except Exception as e:
                    logger.error(f"Failed to collect system metrics: {e}")

        # Start system monitoring in a background thread
        monitoring_thread = threading.Thread(target=collect_system_metrics, daemon=True)
        monitoring_thread.start()
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process the request and return response."""
        return await call_next(request)


def setup_logging():
    """Configure structured logging with loguru."""
    # Remove default logger
    logging.getLogger().handlers.clear()

    # Configure loguru
    logger.remove()  # Remove default handler

    # Add console handler with structured format
    logger.add(
        lambda msg: print(msg, end=""),
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level> | "
            "{extra}"
        ),
        level="INFO",
        serialize=False,  # Set to True for JSON output in production
        backtrace=True,
        diagnose=True
    )

    # Add file handler for persistent logging
    logger.add(
        "logs/app.log",
        rotation="10 MB",
        retention="1 week",
        level="INFO",
        format=(
            "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | "
            "{name}:{function}:{line} | {message} | {extra}"
        ),
        serialize=True,  # JSON format for file logs
        backtrace=True,
        diagnose=True
    )

    # Intercept standard library logging
    class InterceptHandler(logging.Handler):
        def emit(self, record):
            # Get corresponding Loguru level if it exists
            try:
                level = logger.level(record.levelname).name
            except ValueError:
                level = record.levelno

            # Find caller from where originated the logged message
            frame, depth = logging.currentframe(), 2
            while frame.f_code.co_filename == logging.__file__:
                frame = frame.f_back
                depth += 1

            logger.opt(depth=depth, exception=record.exc_info).log(
                level, record.getMessage()
            )

    # Intercept all standard library logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    return logger


def setup_sentry():
    """Initialize Sentry for error tracking."""
    sentry_dsn = os.environ.get('SENTRY_DSN')
    if sentry_dsn:
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[
                FastApiIntegration(),
                LoggingIntegration(
                    level=logging.INFO,  # Capture info and above as breadcrumbs
                    event_level=logging.ERROR  # Send errors as events
                ),
            ],
            # Set traces_sample_rate to 1.0 to capture 100%
            # of transactions for performance monitoring
            traces_sample_rate=1.0,
            # Set profiles_sample_rate to 1.0 to profile 100%
            # of sampled transactions
            profiles_sample_rate=1.0,
            environment=os.environ.get('ENVIRONMENT', 'development'),
            release=os.environ.get('RELEASE_VERSION', '1.0.0'),
        )
        logger.info("Sentry error tracking initialized")
    else:
        logger.warning("SENTRY_DSN not found, error tracking disabled")


def get_metrics():
    """Get current Prometheus metrics."""
    return generate_latest()


@asynccontextmanager
async def lifespan(app):
    """Application lifespan context manager for startup/shutdown events."""
    # Startup
    logger.info("Application startup")
    ACTIVE_CONNECTIONS.set(0)

    yield

    # Shutdown
    logger.info("Application shutdown")


# Create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)