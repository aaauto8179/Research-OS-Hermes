'use client';

import React, { useRef, useState } from 'react';
import {
  useScenarioStore,
  ScenarioCase,
} from '@/lib/scenario-store';
import {
  Upload,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileJson,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Columns,
} from 'lucide-react';

export const ScenarioControls: React.FC = () => {
  const {
    activeScenario,
    setActiveScenario,
    saveStatus,
    lastSavedAt,
    errorMessage,
    useSegmentAggregation,
    setUseSegmentAggregation,
    comparisonMode,
    setComparisonMode,
    exportScenarioJSON,
    exportScenarioCSV,
    importScenarioJSON,
    importScenarioCSV,
    resetToDefaults,
  } = useScenarioStore();

  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = (format: 'json' | 'csv') => {
    const content = format === 'json' ? exportScenarioJSON() : exportScenarioCSV();
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario_${activeScenario}_${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      if (file.name.endsWith('.json') || file.type.includes('json')) {
        const result = importScenarioJSON(text);
        if (result.success) {
          setImportStatusMessage(`Imported ${file.name} successfully`);
        } else {
          setImportStatusMessage(`JSON Import Error: ${result.message}`);
        }
      } else if (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('spreadsheet')) {
        const result = importScenarioCSV(text);
        if (result.success) {
          setImportStatusMessage(`Imported ${file.name} successfully`);
        } else {
          setImportStatusMessage(`CSV Import Error: ${result.message}`);
        }
      } else {
        setImportStatusMessage('Please upload a .json or .csv scenario file');
      }

      setTimeout(() => setImportStatusMessage(null), 5000);
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Scenario Tabs */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
            Scenario:
          </span>
          {(['base', 'bull', 'bear'] as ScenarioCase[]).map((c) => {
            const isActive = activeScenario === c;
            const badgeColors: Record<ScenarioCase, { active: string; border: string }> = {
              base: { active: 'bg-blue-600 text-white shadow-sm', border: 'border-blue-500/40' },
              bull: { active: 'bg-emerald-600 text-white shadow-sm', border: 'border-emerald-500/40' },
              bear: { active: 'bg-rose-600 text-white shadow-sm', border: 'border-rose-500/40' },
            };

            return (
              <button
                key={c}
                type="button"
                onClick={() => setActiveScenario(c)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? badgeColors[c].active
                    : 'bg-secondary/60 hover:bg-secondary text-foreground border border-border'
                }`}
              >
                {c === 'bull' && <Sparkles className="w-3.5 h-3.5" />}
                <span>{c === 'base' ? 'Base Case' : c === 'bull' ? 'Bull Case' : 'Bear Case'}</span>
              </button>
            );
          })}
        </div>

        {/* Status & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Save Status Indicator */}
          <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md bg-secondary/40 border border-border">
            {saveStatus === 'saving' && (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span className="text-muted-foreground">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-muted-foreground font-mono">
                  Saved {lastSavedAt ? `@ ${lastSavedAt}` : 'locally'}
                </span>
              </>
            )}
            {saveStatus === 'idle' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground font-mono">Synced</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-rose-500">{errorMessage || 'Sync Notice'}</span>
              </>
            )}
          </div>

          {/* Segment Aggregation Toggle */}
          <button
            type="button"
            onClick={() => setUseSegmentAggregation(!useSegmentAggregation)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border flex items-center space-x-1.5 transition-colors ${
              useSegmentAggregation
                ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                : 'bg-background text-muted-foreground border-border hover:bg-secondary'
            }`}
            title="Derive total revenue by summing segment projections minus intersegment elimination"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{useSegmentAggregation ? 'Segment Driven' : 'Consolidated CAGR'}</span>
          </button>

          {/* Comparison Mode Toggle */}
          <button
            type="button"
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border flex items-center space-x-1.5 transition-colors ${
              comparisonMode
                ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                : 'bg-background text-muted-foreground border-border hover:bg-secondary'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Compare Cases</span>
          </button>

          {/* Import Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border flex items-center space-x-1.5"
            title="Import assumptions from JSON or CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Export Dropdown Buttons */}
          <button
            type="button"
            onClick={() => handleDownload('json')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border flex items-center space-x-1"
            title="Download scenario as JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-500" />
            <span>JSON</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownload('csv')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border flex items-center space-x-1"
            title="Download scenario projections as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>CSV</span>
          </button>

          {/* Reset Defaults */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset scenario drivers and projections to defaults?')) {
                resetToDefaults();
              }
            }}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 flex items-center space-x-1"
            title="Reset to factory baseline assumptions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Upload Dropzone Preview (Shown or toggleable) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-2.5 text-center text-xs transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border/60 hover:border-border text-muted-foreground bg-muted/20'
        }`}
      >
        <div className="flex items-center justify-center space-x-2">
          <Upload className="w-3.5 h-3.5" />
          <span>
            Drag & drop custom scenario <strong>.json</strong> or <strong>.csv</strong> model here, or click{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary underline font-medium"
            >
              browse
            </button>
          </span>
        </div>
        {importStatusMessage && (
          <p className="mt-1 text-xs font-medium text-emerald-500">{importStatusMessage}</p>
        )}
      </div>
    </div>
  );
};
