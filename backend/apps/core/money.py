"""
Money helpers. Every authoritative monetary value in the system is a Decimal.

- Storage: DecimalField(max_digits=12, decimal_places=2) via MoneyField().
- Calculations: keep full Decimal precision for intermediates and call
  quantize() once at the output boundary.
- Rounding: ROUND_HALF_UP to the cent, which matches how banks present amounts.
"""
from decimal import ROUND_HALF_UP, Decimal, InvalidOperation

from django.db import models

CENT = Decimal("0.01")
ZERO = Decimal("0.00")
MONEY_MAX_DIGITS = 12
MONEY_DECIMAL_PLACES = 2


def MoneyField(**kwargs):
    """A model field for currency amounts with the project-wide precision."""
    kwargs.setdefault("max_digits", MONEY_MAX_DIGITS)
    kwargs.setdefault("decimal_places", MONEY_DECIMAL_PLACES)
    return models.DecimalField(**kwargs)


def to_money(value):
    """Convert str/int/Decimal to Decimal without losing precision.

    Floats are converted through their shortest string representation so that
    0.1 becomes Decimal("0.1") rather than its binary approximation.
    Raises ValueError for anything that is not a finite number.
    """
    if isinstance(value, bool) or value is None:
        raise ValueError(f"Not a monetary amount: {value!r}")
    if isinstance(value, float):
        value = repr(value)
    try:
        result = Decimal(value)
    except (InvalidOperation, TypeError) as exc:
        raise ValueError(f"Not a monetary amount: {value!r}") from exc
    if not result.is_finite():
        raise ValueError(f"Not a monetary amount: {value!r}")
    return result


def quantize(value):
    """Round a Decimal to the cent using ROUND_HALF_UP."""
    return to_money(value).quantize(CENT, rounding=ROUND_HALF_UP)
