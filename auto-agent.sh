#!/usr/bin/env bash
# Research OS - Auto-Scheduled Agent Startup Script
# Runs every 3 hours when idle to check for pending work and improvements

set -euo pipefail

# Configuration
RESEARCH_OS_ROOT="${RESEARCH_OS_ROOT:-$(cd "$(dirname "$0")" && pwd)}"
LOG_DIR="$RESEARCH_OS_ROOT/logs/auto-agent"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/auto-agent-$(date +%Y%m%d-%H%M%S).log"
PID_FILE="$LOG_DIR/auto-agent.pid"
LOCK_FILE="$LOG_DIR/auto-agent.lock"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ✅ $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ⚠️  $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ❌ $1" | tee -a "$LOG_FILE"
}

# Check if already running
check_lock() {
    if [ -f "$LOCK_FILE" ]; then
        local pid=$(cat "$LOCK_FILE" 2>/dev/null)
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            log_warning "Auto-agent already running (PID: $pid). Exiting."
            exit 0
        else
            log_warning "Stale lock file found. Removing."
            rm -f "$LOCK_FILE"
        fi
    fi
    echo $$ > "$LOCK_FILE"
}

cleanup_lock() {
    rm -f "$LOCK_FILE"
}

# Check if system is idle (low CPU usage)
check_idle() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    cpu_usage=${cpu_usage%.*}  # Remove decimal
    
    if [ "$cpu_usage" -gt 30 ]; then
        log_warning "System not idle (CPU: ${cpu_usage}%). Skipping run."
        return 1
    fi
    return 0
}

# Check for pending work in Research OS
check_pending_work() {
    log "Checking for pending work..."
    
    local work_found=false
    
    # 1. Check for uncommitted changes
    cd "$RESEARCH_OS_ROOT"
    if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
        log "Found uncommitted changes"
        work_found=true
    fi
    
    # 2. Check for untracked files
    if [ -n "$(git status --porcelain 2>/dev/null | grep '^??')" ]; then
        log "Found untracked files"
        work_found=true
    fi
    
    # 3. Check for failing tests
    if [ -f "research-os-frontend/package.json" ]; then
        cd "$RESEARCH_OS_ROOT/research-os-frontend"
        if ! npm test -- --passWithNoTests 2>&1 | grep -q "passed"; then
            log_warning "Frontend tests failing"
            work_found=true
        fi
    fi
    
    if [ -f "math-engine/pyproject.toml" ]; then
        cd "$RESEARCH_OS_ROOT/math-engine"
        if ! python -m pytest --tb=no -q 2>&1 | grep -q "passed"; then
            log_warning "Math engine tests failing"
            work_found=true
        fi
    fi
    
    # 4. Check for build failures
    if [ -f "research-os-frontend/package.json" ]; then
        cd "$RESEARCH_OS_ROOT/research-os-frontend"
        if ! npm run build --dry-run 2>&1 >/dev/null; then
            log_warning "Frontend build failing"
            work_found=true
        fi
    fi
    
    # 5. Check for outdated dependencies
    if [ -f "research-os-frontend/package.json" ]; then
        cd "$RESEARCH_OS_ROOT/research-os-frontend"
        local outdated=$(npm outdated --json 2>/dev/null | jq -r '. | length' 2>/dev/null || echo "0")
        if [ "$outdated" -gt 0 ]; then
            log "Found $outdated outdated dependencies"
            work_found=true
        fi
    fi
    
    # 6. Check for linting errors
    cd "$RESEARCH_OS_ROOT/research-os-frontend"
    if ! npm run lint 2>&1 >/dev/null; then
        log_warning "Linting errors found"
        work_found=true
    fi
    
    # 7. Check for TODO/FIXME comments
    local todo_count=$(grep -r "TODO\|FIXME" --include="*.ts" --include="*.tsx" --include="*.py" "$RESEARCH_OS_ROOT" 2>/dev/null | wc -l)
    if [ "$todo_count" -gt 0 ]; then
        log "Found $todo_count TODO/FIXME comments"
        work_found=true
    fi
    
    if [ "$work_found" = true ]; then
        log_success "Pending work detected"
        return 0
    else
        log "No pending work detected"
        return 1
    fi
}

# Check for improvement opportunities
check_improvements() {
    log "Checking for improvement opportunities..."
    
    local improvements=false
    
    # 1. Check for large files that could be split
    local large_files=$(find "$RESEARCH_OS_ROOT" -name "*.tsx" -o -name "*.ts" -o -name "*.py" | xargs wc -l 2>/dev/null | awk '$1 > 500 {print $2 " (" $1 " lines)"}')
    if [ -n "$large_files" ]; then
        log_warning "Large files detected (>500 lines):"
        echo "$large_files" | while read line; do log "  $line"; done
        improvements=true
    fi
    
    # 2. Check for duplicate code
    local duplicate_functions=$(grep -r "function\|const.*=" --include="*.tsx" --include="*.ts" "$RESEARCH_OS_ROOT/src" 2>/dev/null | sed 's/.*function //; s/.*const \([a-zA-Z]*\).*/\1/' | sort | uniq -d | head -20)
    if [ -n "$duplicate_functions" ]; then
        log_warning "Potential duplicate function names:"
        echo "$duplicate_functions" | while read line; do log "  $line"; done
        improvements=true
    fi
    
    # 3. Check for missing tests
    local untested_files=$(find "$RESEARCH_OS_ROOT/math-engine/src" -name "*.py" ! -name "test_*" ! -name "__init__.py" 2>/dev/null)
    local test_files=$(find "$RESEARCH_OS_ROOT/math-engine/tests" -name "test_*.py" 2>/dev/null)
    local untested_count=0
    for f in $untested_files; do
        local basename=$(basename "$f" .py)
        if ! echo "$test_files" | grep -q "test_$basename"; then
            ((untested_count++))
            log "Missing test for: $f"
        fi
    done
    if [ "$untested_count" -gt 0 ]; then
        log_warning "$untested_count modules missing tests"
        improvements=true
    fi
    
    # 4. Check for deprecated patterns
    if grep -r "className.*=" --include="*.tsx" "$RESEARCH_OS_ROOT/src" 2>/dev/null | grep -v "cn(" | head -5; then
        log_warning "Found className without cn() utility (may cause Tailwind issues)"
        improvements=true
    fi
    
    # 5. Check for missing error boundaries
    if ! grep -r "ErrorBoundary\|error-boundary" --include="*.tsx" "$RESEARCH_OS_ROOT/src" 2>/dev/null | head -1; then
        log_warning "No error boundaries found in React components"
        improvements=true
    fi
    
    if [ "$improvements" = true ]; then
        log_success "Improvement opportunities identified"
        return 0
    else
        log "No significant improvements needed"
        return 1
    fi
}

# Generate work report
generate_report() {
    local report_file="$LOG_DIR/work-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" <<EOF
# Research OS - Auto-Agent Work Report
**Generated**: $(date '+%Y-%m-%d %H:%M:%S')
**Run ID**: $(basename "$LOG_FILE" .log)

## Summary
- **Pending Work**: $(check_pending_work && echo "YES" || echo "NO")
- **Improvements**: $(check_improvements && echo "YES" || echo "NO")

## Details

### Pending Work
$(check_pending_work && cat <<'EOF' || echo "No pending work detected")
- Uncommitted changes: $(git status --porcelain 2>/dev/null | grep -c '^[ M]' || echo 0) files
- Untracked files: $(git status --porcelain 2>/dev/null | grep -c '^??' || echo 0) files
- Failing tests: $(cd "$RESEARCH_OS_ROOT/research-os-frontend" && npm test -- --passWithNoTests 2>&1 | grep -c "failed" || echo 0)
- Linting errors: $(npm run lint 2>&1 | grep -c "error" || echo 0)
- TODO/FIXME comments: $(grep -r "TODO\|FIXME" --include="*.ts" --include="*.tsx" --include="*.py" "$RESEARCH_OS_ROOT" 2>/dev/null | wc -l)
EOF

### Improvements
$(check_improvements && cat <<'EOF' || echo "No significant improvements needed")
- Large files: $(find "$RESEARCH_OS_ROOT" -name "*.tsx" -o -name "*.ts" -o -name "*.py" | xargs wc -l 2>/dev/null | awk '$1 > 500' | wc -l) files >500 lines
- Duplicate functions: $(grep -r "function\|const.*=" --include="*.tsx" --include="*.ts" "$RESEARCH_OS_ROOT/src" 2>/dev/null | sed 's/.*function //; s/.*const \([a-zA-Z]*\).*/\1/' | sort | uniq -d | wc -l)
- Untested modules: $(find "$RESEARCH_OS_ROOT/math-engine/src" -name "*.py" ! -name "test_*" ! -name "__init__.py" 2>/dev/null | while read f; do basename=$(basename "$f" .py); if ! find "$RESEARCH_OS_ROOT/math-engine/tests" -name "test_$basename.py" | grep -q .; then echo "$f"; fi; done | wc -l)
EOF

}

# Main execution
main() {
    log "=== Research OS Auto-Agent Starting ==="
    
    check_lock
    trap cleanup_lock EXIT
    
    # Check if system is idle
    if ! check_idle; then
        log "System not idle, exiting"
        exit 0
    fi
    
    # Check for work
    local has_work=false
    if check_pending_work; then
        has_work=true
    fi
    
    if check_improvements; then
        has_work=true
    fi
    
    if [ "$has_work" = true ]; then
        log "Work detected, generating report..."
        generate_report
        
        # Here you could trigger actual work:
        # - Run tests
        # - Auto-fix linting errors
        # - Create GitHub issues for TODOs
        # - etc.
        
        log_success "Auto-agent cycle completed with work found"
    else
        log "No work needed at this time"
    fi
    
    log "=== Research OS Auto-Agent Finished ==="
}

# Run main
main "$@"