"""Corporate Actions module — Splits, bonus, rights, mergers, dividends."""
from dataclasses import dataclass
from typing import List, Dict, Any
from datetime import date

@dataclass
class CorporateAction:
    symbol: str
    action_type: str  # split, bonus, rights, merger, dividend
    ex_date: date
    record_date: date
    ratio: float = 1.0
    amount: float = 0.0
    description: str = ""

class CorporateActionsEngine:
    """Handles corporate action adjustments for portfolio holdings."""
    
    def process_split(self, symbol: str, ratio: float, ex_date: date) -> Dict[str, Any]:
        return {"symbol": symbol, "type": "split", "ratio": ratio, "ex_date": ex_date.isoformat()}
    
    def process_bonus(self, symbol: str, ratio: float, ex_date: date) -> Dict[str, Any]:
        return {"symbol": symbol, "type": "bonus", "ratio": ratio, "ex_date": ex_date.isoformat()}
    
    def process_dividend(self, symbol: str, amount: float, ex_date: date) -> Dict[str, Any]:
        return {"symbol": symbol, "type": "dividend", "amount": amount, "ex_date": ex_date.isoformat()}
    
    def adjust_holdings(self, holdings: List[Dict], action: CorporateAction) -> List[Dict]:
        adjusted = []
        for h in holdings:
            if h["symbol"] == action.symbol:
                if action.action_type == "split":
                    h["qty"] = int(h["qty"] * action.ratio)
                    h["avg_price"] = h["avg_price"] / action.ratio
                elif action.action_type == "bonus":
                    h["qty"] = int(h["qty"] * (1 + action.ratio))
                    h["avg_price"] = h["avg_price"] / (1 + action.ratio)
                elif action.action_type == "dividend":
                    h["dividend_received"] = h.get("dividend_received", 0) + (h["qty"] * action.amount)
            adjusted.append(h)
        return adjusted

__all__ = ["CorporateAction", "CorporateActionsEngine"]