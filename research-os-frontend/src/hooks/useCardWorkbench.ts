"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface CardNote {
  id?: string;
  symbol: string;
  card_id: string;
  user_id?: string;
  title?: string;
  content: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CardAttachment {
  id: string;
  symbol: string;
  card_id: string;
  user_id?: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  file_url?: string;
  storage_path?: string;
  created_at?: string;
}

export interface UseCardWorkbenchReturn {
  notes: CardNote[];
  activeNote: CardNote | null;
  attachments: CardAttachment[];
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  saveNote: (content: string, title?: string, tags?: string[]) => Promise<CardNote | undefined>;
  uploadAttachment: (file: File) => Promise<CardAttachment | undefined>;
  deleteAttachment: (id: string) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  setActiveNote: (note: CardNote | null) => void;
  refresh: () => Promise<void>;
}

function getSafeStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  return null;
}

function getInitialCachedData(cacheKey: string): {
  notes: CardNote[];
  activeNote: CardNote | null;
  attachments: CardAttachment[];
} {
  const storage = getSafeStorage();
  if (storage) {
    try {
      const cached = storage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          const notes = Array.isArray(parsed.notes) ? parsed.notes : [];
          const activeNote = parsed.activeNote || (notes.length > 0 ? notes[0] : null);
          const attachments = Array.isArray(parsed.attachments) ? parsed.attachments : [];
          return { notes, activeNote, attachments };
        }
      }
    } catch {
      // Ignore storage parse errors
    }
  }
  return { notes: [], activeNote: null, attachments: [] };
}

export function useCardWorkbench(cardId: string, symbol: string): UseCardWorkbenchReturn {
  const normSymbol = (symbol || "").toUpperCase();
  const cacheKey = `wb_notes_${normSymbol}_${cardId}`;

  // Synchronous initialization from localStorage prevents flash of empty state
  const initialData = getInitialCachedData(cacheKey);
  const [notes, setNotes] = useState<CardNote[]>(initialData.notes);
  const [activeNote, setActiveNote] = useState<CardNote | null>(initialData.activeNote);
  const [attachments, setAttachments] = useState<CardAttachment[]>(initialData.attachments);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<CardNote | null>(null);
  const activeNoteRef = useRef<CardNote | null>(null);
  activeNoteRef.current = activeNote;

  const notesRef = useRef<CardNote[]>(notes);
  notesRef.current = notes;
  const attachmentsRef = useRef<CardAttachment[]>(attachments);
  attachmentsRef.current = attachments;

  const syncCache = useCallback(
    (updatedNotes: CardNote[], updatedActive: CardNote | null, updatedAtts: CardAttachment[]) => {
      const storage = getSafeStorage();
      if (storage) {
        try {
          storage.setItem(
            cacheKey,
            JSON.stringify({
              notes: updatedNotes,
              activeNote: updatedActive,
              attachments: updatedAtts,
            })
          );
        } catch {
          // Ignore quota errors
        }
      }
    },
    [cacheKey]
  );

  // 1. Initial Load: Read API data and sync to state and localStorage cache
  useEffect(() => {
    let isCancelled = false;

    // Refresh from localStorage on key change
    const cached = getInitialCachedData(cacheKey);
    if (cached.activeNote || cached.notes.length > 0 || cached.attachments.length > 0) {
      setNotes(cached.notes);
      setActiveNote(cached.activeNote);
      setAttachments(cached.attachments);
    }

    async function loadData() {
      setIsLoading(true);
      let latestNotes = notesRef.current;
      let latestActive = activeNoteRef.current;
      let latestAtts = attachmentsRef.current;

      try {
        // Fetch notes from BFF
        const notesUrl = `/api/workstation/notes/${encodeURIComponent(normSymbol)}?card_id=${encodeURIComponent(cardId)}`;
        const notesRes = await fetch(notesUrl, { cache: "no-store" });
        if (!isCancelled && notesRes.ok) {
          const json = await notesRes.json();
          if (json && Array.isArray(json.data) && json.data.length > 0) {
            latestNotes = json.data;
            latestActive = json.data[0];
            setNotes(latestNotes);
            setActiveNote(latestActive);
          }
        }
      } catch (err) {
        console.warn(`[useCardWorkbench] Error fetching notes for ${normSymbol}/${cardId}:`, err);
      }

      try {
        // Fetch attachments from BFF
        const attUrl = `/api/workstation/attachments/${encodeURIComponent(normSymbol)}?card_id=${encodeURIComponent(cardId)}`;
        const attRes = await fetch(attUrl, { cache: "no-store" });
        if (!isCancelled && attRes.ok) {
          const json = await attRes.json();
          if (json && Array.isArray(json.data)) {
            latestAtts = json.data;
            setAttachments(latestAtts);
          }
        }
      } catch (err) {
        console.warn(`[useCardWorkbench] Error fetching attachments for ${normSymbol}/${cardId}:`, err);
      } finally {
        if (!isCancelled) {
          syncCache(latestNotes, latestActive, latestAtts);
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [cardId, normSymbol, cacheKey, syncCache]);

  // 2. Debounced 500ms auto-save to POST /api/workstation/notes
  const saveNote = useCallback(
    async (content: string, title?: string, tags?: string[]): Promise<CardNote | undefined> => {
      const current = activeNoteRef.current;
      const effectiveTitle = title !== undefined ? title : (current?.title || "");
      const effectiveTags = tags !== undefined ? tags : (current?.tags || []);
      const now = new Date();

      const noteToSave: CardNote = {
        id: current?.id,
        symbol: normSymbol,
        card_id: cardId,
        title: effectiveTitle,
        content,
        tags: effectiveTags,
        updated_at: now.toISOString(),
      };

      // Immediate optimistic update
      setActiveNote(noteToSave);
      setNotes((prevNotes) => {
        const exists = prevNotes.some((n) => n.id && n.id === noteToSave.id);
        const next = exists
          ? prevNotes.map((n) => (n.id === noteToSave.id ? noteToSave : n))
          : [noteToSave, ...prevNotes];

        syncCache(next, noteToSave, attachmentsRef.current);
        return next;
      });

      setIsSaving(true);
      pendingSaveRef.current = noteToSave;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      return new Promise<CardNote | undefined>((resolve) => {
        saveTimerRef.current = setTimeout(async () => {
          try {
            const payload = {
              symbol: normSymbol,
              card_id: cardId,
              title: noteToSave.title,
              content: noteToSave.content,
              tags: noteToSave.tags,
              id: noteToSave.id,
            };

            const res = await fetch("/api/workstation/notes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              const resData = await res.json();
              const savedNote = resData?.data || noteToSave;
              setActiveNote(savedNote);
              setNotes((prev) => {
                const next = prev.map((n) =>
                  (savedNote.id && n.id === savedNote.id) || (!n.id && n.card_id === cardId)
                    ? savedNote
                    : n
                );
                syncCache(next, savedNote, attachmentsRef.current);
                return next;
              });
              setLastSaved(new Date());
              resolve(savedNote);
            } else {
              // Graceful offline fallback: keep optimistic data
              setLastSaved(new Date());
              resolve(noteToSave);
            }
          } catch (err) {
            console.warn("[useCardWorkbench] Network sync failed, retained in local storage:", err);
            setLastSaved(new Date());
            resolve(noteToSave);
          } finally {
            setIsSaving(false);
          }
        }, 500);
      });
    },
    [cardId, normSymbol, syncCache]
  );

  // 3. File upload helper sending FormData to POST /api/workstation/attachments
  const uploadAttachment = useCallback(
    async (file: File): Promise<CardAttachment | undefined> => {
      setIsSaving(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("symbol", normSymbol);
        formData.append("card_id", cardId);
        formData.append("user_id", "default_user");

        const res = await fetch("/api/workstation/attachments", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          const newAtt: CardAttachment = json.data || {
            id: `att_${Date.now()}`,
            symbol: normSymbol,
            card_id: cardId,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type || "application/octet-stream",
            created_at: new Date().toISOString(),
          };
          setAttachments((prev) => {
            const next = [newAtt, ...prev];
            syncCache(notesRef.current, activeNoteRef.current, next);
            return next;
          });
          setLastSaved(new Date());
          return newAtt;
        } else {
          // Fallback optimistic attachment for offline run
          const fallbackAtt: CardAttachment = {
            id: `offline_${Date.now()}`,
            symbol: normSymbol,
            card_id: cardId,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type || "application/octet-stream",
            created_at: new Date().toISOString(),
          };
          setAttachments((prev) => {
            const next = [fallbackAtt, ...prev];
            syncCache(notesRef.current, activeNoteRef.current, next);
            return next;
          });
          setLastSaved(new Date());
          return fallbackAtt;
        }
      } catch (err) {
        console.warn("[useCardWorkbench] Attachment upload error, falling back locally:", err);
        const fallbackAtt: CardAttachment = {
          id: `local_${Date.now()}`,
          symbol: normSymbol,
          card_id: cardId,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || "application/octet-stream",
          created_at: new Date().toISOString(),
        };
        setAttachments((prev) => {
          const next = [fallbackAtt, ...prev];
          syncCache(notesRef.current, activeNoteRef.current, next);
          return next;
        });
        return fallbackAtt;
      } finally {
        setIsSaving(false);
      }
    },
    [cardId, normSymbol, syncCache]
  );

  // 4. Delete attachment helper
  const deleteAttachment = useCallback(
    async (id: string): Promise<boolean> => {
      setAttachments((prev) => {
        const next = prev.filter((a) => a.id !== id);
        syncCache(notesRef.current, activeNoteRef.current, next);
        return next;
      });
      try {
        const res = await fetch(`/api/workstation/attachments/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        return res.ok;
      } catch (err) {
        console.warn(`[useCardWorkbench] Delete attachment error for ${id}:`, err);
        return true;
      }
    },
    [syncCache]
  );

  // 5. Delete note helper
  const deleteNote = useCallback(
    async (id: string): Promise<boolean> => {
      setNotes((prev) => {
        const filtered = prev.filter((n) => n.id !== id);
        let nextActive = activeNoteRef.current;
        if (nextActive?.id === id) {
          nextActive = filtered[0] || null;
          setActiveNote(nextActive);
        }
        syncCache(filtered, nextActive, attachmentsRef.current);
        return filtered;
      });

      try {
        const res = await fetch(`/api/workstation/notes/${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        return res.ok;
      } catch (err) {
        console.warn(`[useCardWorkbench] Delete note error for ${id}:`, err);
        return true;
      }
    },
    [syncCache]
  );

  // 6. Manual refresh
  const refresh = useCallback(async () => {
    setIsLoading(true);
    let latestNotes = notesRef.current;
    let latestActive = activeNoteRef.current;
    let latestAtts = attachmentsRef.current;

    try {
      const notesUrl = `/api/workstation/notes/${encodeURIComponent(normSymbol)}?card_id=${encodeURIComponent(cardId)}`;
      const notesRes = await fetch(notesUrl, { cache: "no-store" });
      if (notesRes.ok) {
        const json = await notesRes.json();
        if (json && Array.isArray(json.data)) {
          latestNotes = json.data;
          setNotes(latestNotes);
          if (latestNotes.length > 0 && !latestActive) {
            latestActive = latestNotes[0];
            setActiveNote(latestActive);
          }
        }
      }

      const attUrl = `/api/workstation/attachments/${encodeURIComponent(normSymbol)}?card_id=${encodeURIComponent(cardId)}`;
      const attRes = await fetch(attUrl, { cache: "no-store" });
      if (attRes.ok) {
        const json = await attRes.json();
        if (json && Array.isArray(json.data)) {
          latestAtts = json.data;
          setAttachments(latestAtts);
        }
      }
    } finally {
      syncCache(latestNotes, latestActive, latestAtts);
      setIsLoading(false);
    }
  }, [cardId, normSymbol, syncCache]);

  return {
    notes,
    activeNote,
    attachments,
    isLoading,
    isSaving,
    lastSaved,
    saveNote,
    uploadAttachment,
    deleteAttachment,
    deleteNote,
    setActiveNote,
    refresh,
  };
}
