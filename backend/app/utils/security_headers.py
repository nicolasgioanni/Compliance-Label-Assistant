"""Applies lightweight defensive headers to API responses."""

from starlette.responses import Response


SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
}


def apply_security_headers(response: Response) -> Response:
    for header_name, header_value in SECURITY_HEADERS.items():
        if header_name not in response.headers:
            response.headers[header_name] = header_value

    return response
