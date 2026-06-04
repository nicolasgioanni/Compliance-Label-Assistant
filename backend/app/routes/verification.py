"""Verification routes.

Phase 1 exposes a mock single-label verification endpoint only. Real upload
validation, image preprocessing, OpenAI extraction, deterministic verification,
and batch processing are intentionally deferred to later modules.
"""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas import ExpectedFields, SingleVerificationResponse
from app.services.mock_verification_service import build_mock_verification

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
    if not file.filename:
        raise HTTPException(status_code=400, detail="Please upload a label image.")

    expected_fields = ExpectedFields(
        brand_name=brand_name,
        class_type=class_type,
        alcohol_content=alcohol_content,
        net_contents=net_contents,
        government_warning=government_warning,
    )
    return build_mock_verification(filename=file.filename, expected_fields=expected_fields)

