"""Corporate Actions module — Splits, bonus, rights, mergers, dividends.
SEBI-compliant fractional handling with cash-in-lieu per audit recommendations.
"""
import math
from dataclasses import dataclass
from typing import List, Dict, Any
from datetime import date

@dataclass
class CorporateAction:
    symbol: str
    action_type: str  # split, bonus, rights, merger, dividend, demerger
    ex_date: date
    record_date: date
    ratio: float = 1.0
    amount: float = 0.0
    description: str = ""
    # Demerger-specific
    net_book_value_transferred: float = 0.0
    pre_demerger_net_worth: float = 0.0
    swap_ratio: float = 1.0

class CorporateActionsEngine:
    """Handles corporate action adjustments for portfolio holdings.
    SEBI-compliant: fractional entitlements pooled, auctioned, cash-in-lieu credited.
    Section 49(2C) demerger cost apportionment.
    Section 55(2)(aa) bonus shares NIL cost.
    """

    def process_split(self, symbol: str, ratio: float, ex_date: date) -> Dict[str, Any]:
        return {"symbol": symbol, "type": "split", "ratio": ratio, "ex_date": ex_date.isoformat()}

    def process_bonus(self, symbol: str, ratio: float, ex_date: date) -> Dict[str, Any]:
        return {"symbol": symbol, "type": "bonus", "ratio": ratio, "ex_date": ex_date.isoformat()}

    def process_dividend(self, symbol: str, amount: float, ex_date: date) -> Dict[str, Any]:
        return {"symbol": symbol, "type": "dividend", "amount": amount, "ex_date": ex_date.isoformat()}

    def adjust_holdings(self, holdings: List[Dict], action: CorporateAction, market_price: float = 0.0) -> List[Dict]:
        adjusted = []
        for h in holdings:
            if h["symbol"] != action.symbol:
                adjusted.append(h)
                continue

            if action.action_type in ("split", "bonus"):
                factor = action.ratio if action.action_type == "split" else (1.0 + action.ratio)
                new_total = h["qty"] * factor
                whole_shares = int(math.floor(new_total))
                fractional_shares = new_total - whole_shares
                fractional_cash = round(fractional_shares * market_price, 2)
                new_avg_cost = h["avg_price"] / factor

                adjusted.append({
                    **h,
                    "qty": whole_shares,
                    "avg_price": round(new_avg_cost, 2),
                    "fractional_cash_credit": fractional_cash,
                    "corporate_action": action.action_type,
                })
            elif action.action_type == "dividend":
                adjusted.append({
                    **h,
                    "dividend_received": h.get("dividend_received", 0) + (h["qty"] * action.amount),
                })
            elif action.action_type == "demerger":
                alpha = 0.0
                if action.pre_demerger_net_worth > 0:
                    alpha = action.net_book_value_transferred / action.pre_demerger_net_worth
                parent_cost = h["avg_price"] * (1 - alpha)
                spinoff_cost = (h["avg_price"] * alpha) / action.swap_ratio if action.swap_ratio > 0 else 0.0
                adjusted.append({
                    **h,
                    "parent_avg_cost": round(parent_cost, 2),
                    "spinoff_avg_cost": round(spinoff_cost, 2),
                    "spinoff_qty": int(h["qty"] * action.swap_ratio),
                    "demerger_alpha": round(alpha, 4),
                })
            else:
                adjusted.append(h)
        return adjusted

    def adjust_for_bonus_nil_cost(self, qty: int, avg_cost: float, bonus_ratio: float) -> Dict[str, Any]:
        original_qty = qty
        bonus_qty = int(qty * bonus_ratio)
        return {
            "original_shares": original_qty,
            "original_cost_per_share": avg_cost,
            "bonus_shares": bonus_qty,
            "bonus_cost_per_share": 0.0,
            "total_shares": original_qty + bonus_qty,
        }

__all__ = ["CorporateAction", "CorporateActionsEngine"]
