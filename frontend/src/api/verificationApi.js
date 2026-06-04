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
  formData.append('government_warning', expectedFields.governmentWarning);
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
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

export async function verifyBatchLabels(files, expectedFields) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  appendExpectedFields(formData, expectedFields);

  const response = await fetch(`${API_BASE_URL}/verify-batch`, {
    method: 'POST',
    body: formData,
  });

  return parseApiResponse(response);
}
