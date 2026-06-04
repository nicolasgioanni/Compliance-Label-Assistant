"""Handles OpenAI vision extraction only.

This service extracts visible text and likely alcohol label fields from a
preprocessed image. It does not decide whether a label passes review; later
deterministic verification remains separate so comparison decisions are
auditable. The OpenAI API key stays backend-only.
"""

from __future__ import annotations

import asyncio
import base64

from openai import APIConnectionError, APIStatusError, APITimeoutError, OpenAI, OpenAIError, RateLimitError
from pydantic import ValidationError

from app.config import Settings, get_settings
from app.schemas import ExtractedFields


EXTRACTION_PROMPT = """You are extracting visible text from an alcohol beverage label image.
Return JSON only. Do not include markdown. Do not decide compliance.
Extract these fields if visible: brand_name, class_type, alcohol_content, net_contents,
government_warning_text, raw_text. If a field is not visible, return null.
Preserve exact wording for the government warning."""


class ExtractionConfigurationError(RuntimeError):
    """Raised when extraction cannot run because backend configuration is missing."""


class ExtractionServiceError(RuntimeError):
    """Raised when OpenAI extraction fails after retry handling."""


class InvalidExtractionResponseError(RuntimeError):
    """Raised when the model response cannot be parsed into the expected schema."""


def _build_image_data_url(image_bytes: bytes) -> str:
    encoded_image = base64.b64encode(image_bytes).decode("ascii")
    return f"data:image/jpeg;base64,{encoded_image}"


def _parse_extracted_fields(parsed_output: object) -> ExtractedFields:
    if isinstance(parsed_output, ExtractedFields):
        return parsed_output

    try:
        return ExtractedFields.model_validate(parsed_output)
    except ValidationError as exc:
        raise InvalidExtractionResponseError(
            "The extraction service returned an invalid structured response. Please try again."
        ) from exc


def _extract_label_fields_sync(image_bytes: bytes, settings: Settings) -> ExtractedFields:
    if not settings.openai_api_key:
        raise ExtractionConfigurationError(
            "OpenAI extraction is not configured. Please set OPENAI_API_KEY on the backend."
        )

    client = OpenAI(api_key=settings.openai_api_key, timeout=settings.openai_timeout_seconds)
    image_data_url = _build_image_data_url(image_bytes)

    for attempt_number in range(2):
        try:
            response = client.responses.parse(
                model=settings.openai_model,
                input=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "input_text", "text": EXTRACTION_PROMPT},
                            {"type": "input_image", "image_url": image_data_url},
                        ],
                    }
                ],
                text_format=ExtractedFields,
            )
            return _parse_extracted_fields(response.output_parsed)
        except (APIConnectionError, APITimeoutError, RateLimitError) as exc:
            if attempt_number == 0:
                continue
            raise ExtractionServiceError(
                "The extraction service is temporarily unavailable. Please try again."
            ) from exc
        except APIStatusError as exc:
            if attempt_number == 0 and exc.status_code >= 500:
                continue
            raise ExtractionServiceError(
                "The extraction service returned an error. Please try again."
            ) from exc
        except OpenAIError as exc:
            raise ExtractionServiceError(
                "The extraction service could not process this label. Please try again."
            ) from exc

    raise ExtractionServiceError("The extraction service could not process this label. Please try again.")


async def extract_label_fields(image_bytes: bytes, settings: Settings | None = None) -> ExtractedFields:
    active_settings = settings or get_settings()
    return await asyncio.to_thread(_extract_label_fields_sync, image_bytes, active_settings)

