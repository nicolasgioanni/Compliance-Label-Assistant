"""Safe logging setup.

The current Phase 1 app keeps logging minimal. Future phases should continue to
avoid logging API keys, image bytes, full uploaded payloads, raw secrets, or
full environment dumps.
"""

import logging


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

