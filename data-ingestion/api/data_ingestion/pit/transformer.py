"""Point-in-Time transformer — ensures no look-ahead bias."""
from typing import Dict, Any, List
from datetime import datetime, date

class PITTransformer:
    """Transforms raw data into point-in-time compliant format."""
    
    def __init__(self, as_of_date: date = None):
        self.as_of_date = as_of_date or date.today()
    
    def filter_by_date(self, records: List[Dict[str, Any]], date_field: str = "date") -> List[Dict[str, Any]]:
        """Filter records to only those available as of as_of_date."""
        result = []
        for r in records:
            record_date = r.get(date_field)
            if isinstance(record_date, str):
                record_date = datetime.fromisoformat(record_date).date()
            if record_date and record_date <= self.as_of_date:
                result.append(r)
        return result
    
    def tag_pit(self, record: Dict[str, Any], source_date: date) -> Dict[str, Any]:
        """Tag a record with point-in-time metadata."""
        record["_pit_as_of"] = self.as_of_date.isoformat()
        record["_pit_source_date"] = source_date.isoformat()
        record["_pit_compliant"] = source_date <= self.as_of_date
        return record

__all__ = ["PITTransformer"]