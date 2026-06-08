"""Handles OpenAI vision extraction only.

This provider extracts visible text and likely alcohol label fields from a
preprocessed image. It does not decide whether a label passes review; later
deterministic verification remains separate so comparison decisions are
auditable. The OpenAI API key stays backend-only.
"""

from __future__ import annotations

import asyncio
import base64

from openai import APIConnectionError, APIStatusError, APITimeoutError, OpenAIError, RateLimitError
from pydantic import BaseModel, ValidationError

from app.config import Settings, get_settings
from app.providers.openai.client import get_openai_client
from app.schemas import ExtractedFields


EXTRACTION_PROMPT = """You are extracting visible text from an alcohol beverage label image.
Return JSON only. Do not include markdown. Do not decide compliance.
Extract these fields if visible: brand_name, class_type, alcohol_content, net_contents,
government_warning_text. If a field is not visible, return null.
Preserve exact wording for the government warning."""


class ExtractionConfigurationError(RuntimeError):
    """Raised when extraction cannot run because backend configuration is missing."""


class ExtractionServiceError(RuntimeError):
    """Raised when OpenAI extraction fails."""


class InvalidExtractionResponseError(RuntimeError):
    """Raised when the model response cannot be parsed into the expected schema."""


_EXTRACTION_SEMAPHORES: dict[tuple[int, int], asyncio.Semaphore] = {}


class _ExtractionFields(BaseModel):
    brand_name: str | None = None
    class_type: str | None = None
    alcohol_content: str | None = None
    net_contents: str | None = None
    government_warning_text: str | None = None


def _build_image_data_url(image_bytes: bytes) -> str:
    encoded_image = base64.b64encode(image_bytes).decode("ascii")
    return f"data:image/jpeg;base64,{encoded_image}"


def _parse_extracted_fields(parsed_output: object) -> ExtractedFields:
    parsed_source = parsed_output.model_dump() if isinstance(parsed_output, BaseModel) else parsed_output
    try:
        parsed_fields = _ExtractionFields.model_validate(parsed_source)
        return ExtractedFields(
            brand_name=parsed_fields.brand_name,
            class_type=parsed_fields.class_type,
            alcohol_content=parsed_fields.alcohol_content,
            net_contents=parsed_fields.net_contents,
            government_warning_text=parsed_fields.government_warning_text,
            raw_text=None,
        )
    except ValidationError as exc:
        raise InvalidExtractionResponseError(
            "The extraction service returned an invalid structured response. Please try again."
        ) from exc


def _extract_label_fields_sync(image_bytes: bytes, settings: Settings) -> ExtractedFields:
    if not settings.openai_api_key:
        raise ExtractionConfigurationError(
            "OpenAI extraction is not configured. Please set OPENAI_API_KEY on the backend."
        )

    client = get_openai_client(settings)
    image_data_url = _build_image_data_url(image_bytes)

    try:
        response = client.responses.parse(
            model=settings.openai_model,
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": EXTRACTION_PROMPT},
                        {
                            "type": "input_image",
                            "image_url": image_data_url,
                            "detail": settings.openai_image_detail,
                        },
                    ],
                }
            ],
            store=False,
            temperature=0,
            text_format=_ExtractionFields,
        )
        return _parse_extracted_fields(response.output_parsed)
    except (APIConnectionError, APITimeoutError, RateLimitError) as exc:
        raise ExtractionServiceError(
            "The extraction service is temporarily unavailable. Please try again."
        ) from exc
    except APIStatusError as exc:
        raise ExtractionServiceError(
            "The extraction service returned an error. Please try again."
        ) from exc
    except OpenAIError as exc:
        raise ExtractionServiceError(
            "The extraction service could not process this label. Please try again."
        ) from exc


async def extract_label_fields(image_bytes: bytes, settings: Settings | None = None) -> ExtractedFields:
    active_settings = settings or get_settings()
    semaphore = _get_extraction_semaphore(active_settings.openai_extraction_concurrency)
    async with semaphore:
        return await asyncio.to_thread(_extract_label_fields_sync, image_bytes, active_settings)


def _get_extraction_semaphore(concurrency: int) -> asyncio.Semaphore:
    loop_id = id(asyncio.get_running_loop())
    cache_key = (loop_id, max(concurrency, 1))
    if cache_key not in _EXTRACTION_SEMAPHORES:
        _EXTRACTION_SEMAPHORES[cache_key] = asyncio.Semaphore(cache_key[1])
    return _EXTRACTION_SEMAPHORES[cache_key]
