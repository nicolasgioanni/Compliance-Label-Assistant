"""Verification routes.

Routes handle HTTP inputs and delegate validation, preprocessing, extraction,
and response construction to service modules.
"""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas import ExpectedFields, SingleVerificationResponse
from app.services.image_preprocessor import ImagePreprocessingError
from app.services.openai_extraction_service import (
    ExtractionConfigurationError,
    ExtractionServiceError,
    InvalidExtractionResponseError,
)
from app.services.single_verification_service import verify_single_label
from app.utils.file_validation import UploadValidationError

router = APIRouter()


@router.post("/verify", response_model=SingleVerificationResponse)
async def verify_label(
    file: UploadFile = File(...),
    brand_name: str = Form(...),
    class_type: str = Form(...),
    alcohol_content: str = Form(...),
    net_contents: str = Form(...),
    government_warning: str = Form(...),
) -> SingleVerificationResponse:
    expected_fields = ExpectedFields(
        brand_name=brand_name,
        class_type=class_type,
        alcohol_content=alcohol_content,
        net_contents=net_contents,
        government_warning=government_warning,
    )
    try:
        return await verify_single_label(file=file, expected_fields=expected_fields)
    except UploadValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ImagePreprocessingError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ExtractionConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except InvalidExtractionResponseError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except ExtractionServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
