import os
import re

with open("docs/tool-audit.md", "r", encoding="utf-8") as f:
    content = f.read()

# Find all tool sections
tools = re.findall(r"#### Tool (\d+): ([^\n]+)", content)
print(f"Total tool sections parsed: {len(tools)}")

detail_citations = []
for num, name in tools:
    pattern = rf"#### Tool {num}: " + re.escape(name) + r"([\s\S]*?)(?=#### Tool \d+:|### Category \d+:|\Z)"
    m = re.search(pattern, content)
    if not m:
        continue
    body = m.group(1)
    
    # Extract backtick file paths in the Verifying File Citations block
    cit_block = ""
    if "- **Verifying File Citations:**" in body:
        cit_block = body.split("- **Verifying File Citations:**")[1].split("- **Production Readiness Notes:**")[0]
    
    # Extract lines in cit_block
    for line in cit_block.strip().split("\n"):
        line = line.strip()
        if not line or not line.startswith("-"):
            continue
        # Find backtick content
        b_matches = re.findall(r"`([^`]+)`", line)
        for bm in b_matches:
            # Check if this looks like a file path
            clean = bm.split("(")[0].strip()
            path_part = clean.split(":")[0].strip()
            line_part = clean.split(":")[1].strip() if ":" in clean else None
            
            # Check if has extension
            if "." in path_part and ("/" in path_part or "\\" in path_part or path_part.endswith(".sql") or path_part.endswith(".md") or path_part.endswith(".py") or path_part.endswith(".tsx") or path_part.endswith(".ts") or path_part.endswith(".json")):
                rel_path = path_part.replace("/", os.sep)
                # Check existence
                full_path = None
                if os.path.exists(rel_path):
                    full_path = rel_path
                elif rel_path.startswith("src") and os.path.exists(os.path.join("research-os-frontend", rel_path)):
                    full_path = os.path.join("research-os-frontend", rel_path)
                elif os.path.exists(os.path.join("research-os-frontend", rel_path)):
                    full_path = os.path.join("research-os-frontend", rel_path)
                
                # Check if marked as non-existent in the text itself (e.g., 'does not exist', 'missing')
                intentional_missing = False
                if "does not exist" in line or "Missing" in line or "not built" in line or "unbuilt" in line:
                    intentional_missing = True
                
                detail_citations.append({
                    "tool_num": num,
                    "line_text": line,
                    "bm": bm,
                    "path": rel_path,
                    "full_path": full_path,
                    "exists": full_path is not None,
                    "intentional_missing": intentional_missing,
                    "line_spec": line_part
                })

print(f"Total detailed file citations found: {len(detail_citations)}")
existing_cits = [c for c in detail_citations if c["exists"]]
missing_real = [c for c in detail_citations if not c["exists"] and not c["intentional_missing"]]
intentional = [c for c in detail_citations if not c["exists"] and c["intentional_missing"]]

print(f"Existing files: {len(existing_cits)}")
print(f"Intentional missing references (unbuilt components noted as such): {len(intentional)}")
print(f"Unexplained missing files: {len(missing_real)}")

for m in missing_real:
    print("UNEXPLAINED MISSING:", m)
