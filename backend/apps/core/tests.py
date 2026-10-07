from decimal import Decimal

from django.test import SimpleTestCase, TestCase

from .money import quantize, to_money


class MoneyTests(SimpleTestCase):
    def test_to_money_accepts_strings_ints_and_decimals(self):
        self.assertEqual(to_money("900.00"), Decimal("900.00"))
        self.assertEqual(to_money(15), Decimal("15"))
        self.assertEqual(to_money(Decimal("0.1")), Decimal("0.1"))

    def test_to_money_converts_floats_without_binary_noise(self):
        self.assertEqual(to_money(0.1), Decimal("0.1"))
        self.assertEqual(to_money(0.1) + to_money(0.2), Decimal("0.3"))

    def test_to_money_rejects_non_numbers(self):
        for bad in ["abc", "", None, True, "NaN", "Infinity", [1]]:
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                to_money(bad)

    def test_quantize_rounds_half_up_to_the_cent(self):
        self.assertEqual(quantize("2.675"), Decimal("2.68"))
        self.assertEqual(quantize("2.674"), Decimal("2.67"))
        self.assertEqual(quantize("-2.675"), Decimal("-2.68"))
        self.assertEqual(quantize(Decimal("337")), Decimal("337.00"))


class HealthTests(TestCase):
    def test_health_is_public(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
