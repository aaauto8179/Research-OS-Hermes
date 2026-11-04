import os
import re

with open("docs/tool-audit.md", "r", encoding="utf-8") as f:
    lines = f.readlines()

table_lines = [l for l in lines[130:237] if l.startswith("| **")]

results = []
for l in table_lines:
    parts = [p.strip() for p in l.split("|")[1:-1]]
    num = parts[0].replace("**", "")
    name = parts[1]
    status = parts[4].replace("`", "")
    citation = parts[5].replace("`", "")
    
    # Extract file path before colon or parenthesis
    clean_citation = citation.split("(")[0].strip()
    file_part = clean_citation.split(":")[0].strip()
    line_spec = clean_citation.split(":")[1].strip() if ":" in clean_citation else None
    
    rel_path = file_part.replace("/", os.sep)
    
    # Try direct or inside research-os-frontend
    full_path = None
    if os.path.exists(rel_path):
        full_path = rel_path
    elif rel_path.startswith("src") and os.path.exists(os.path.join("research-os-frontend", rel_path)):
        full_path = os.path.join("research-os-frontend", rel_path)
    elif os.path.exists(os.path.join("research-os-frontend", rel_path)):
        full_path = os.path.join("research-os-frontend", rel_path)
    
    if full_path:
        with open(full_path, "r", encoding="utf-8", errors="ignore") as fp:
            file_len = len(fp.readlines())
        line_ok = True
        start_line = None
        end_line = None
        if line_spec:
            m_lines = re.match(r"(\d+)(?:-(\d+))?", line_spec)
            if m_lines:
                start_line = int(m_lines.group(1))
                end_line = int(m_lines.group(2)) if m_lines.group(2) else start_line
                if start_line > file_len:
                    line_ok = False
        results.append({
            "num": num,
            "name": name,
            "status": status,
            "citation": citation,
            "full_path": full_path,
            "file_len": file_len,
            "line_spec": line_spec,
            "line_ok": line_ok,
            "exists": True
        })
    else:
        results.append({
            "num": num,
            "name": name,
            "status": status,
            "citation": citation,
            "rel_path": rel_path,
            "exists": False
        })

existing = [r for r in results if r["exists"]]
missing = [r for r in results if not r["exists"]]
line_mismatches = [r for r in existing if not r["line_ok"]]

print(f"Total tools evaluated in matrix: {len(results)}")
print(f"Verified files existing on disk: {len(existing)} / {len(results)}")
print(f"Missing files: {len(missing)}")
print(f"Line out-of-bounds: {len(line_mismatches)}")

if missing:
    for m in missing:
        print("Missing file:", m)

if line_mismatches:
    for lm in line_mismatches:
        print("Line out of bounds:", lm)
