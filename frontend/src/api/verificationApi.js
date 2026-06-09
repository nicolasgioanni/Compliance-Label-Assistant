import { DEFAULT_GOVERNMENT_WARNING } from '../constants/defaultWarningText';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function parseApiResponse(response) {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = body?.detail || 'The verification service returned an error.';
    throw new Error(detail);
  }

  return body;
}

function appendExpectedFields(formData, expectedFields) {
  formData.append('brand_name', expectedFields.brandName);
  formData.append('class_type', expectedFields.classType);
  formData.append('alcohol_content', expectedFields.alcoholContent);
  formData.append('net_contents', expectedFields.netContents);
  formData.append('bottler_producer', expectedFields.bottlerProducer || '');
  formData.append('country_of_origin', expectedFields.countryOfOrigin || '');
  formData.append('government_warning', expectedFields.governmentWarning || DEFAULT_GOVERNMENT_WARNING);
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return parseApiResponse(response);
}

export async function warmVerificationBackend() {
  const response = await fetch(`${API_BASE_URL}/warmup`, {
    method: 'POST',
  });
  return parseApiResponse(response);
}

export async function verifySingleLabel(file, expectedFields) {
  const formData = new FormData();
  formData.append('file', file);
  appendExpectedFields(formData, expectedFields);

  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: 'POST',
    body: formData,
  });

  return parseApiResponse(response);
}
