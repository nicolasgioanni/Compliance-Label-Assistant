"""Shared application constants with public-contract text.

The standard warning is server-owned because API clients may submit stale or
custom warning text while backend verification must compare against one
canonical value.
"""

STANDARD_GOVERNMENT_WARNING = (
    "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during "
    "pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability "
    "to drive a car or operate machinery, and may cause health problems."
)
