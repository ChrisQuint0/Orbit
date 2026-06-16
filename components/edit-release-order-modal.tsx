"use client";

import { useState, useEffect } from "react";
import { X, GripVertical } from "lucide-react";
import { Reorder } from "framer-motion";

export interface CrewMember {
  id: string;
  name: string;
  status: string;
  avatar: string;
}

interface EditReleaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  crew: CrewMember[];
  onSave: (newCrew: CrewMember[]) => void;
}

export function EditReleaseOrderModal({
  isOpen,
  onClose,
  crew,
  onSave,
}: EditReleaseOrderModalProps) {
  const [items, setItems] = useState<CrewMember[]>(crew);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setItems(crew);
    }
  }, [isOpen, crew]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--color-orbit-void-950)]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[500px] rounded-[var(--radius-orbit-xl)] bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--orbit-border)] px-6 py-4 bg-[var(--orbit-bg-card)] z-10 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-[var(--orbit-text-primary)]">
              Edit Release Order
            </h2>
            <p className="text-sm text-[var(--orbit-text-secondary)]">
              Drag to reorder the crew members.
            </p>
          </div>
          <button
            onClick={onClose}
            className="orbit-icon-btn rounded-full hover:bg-[var(--orbit-bg-elevated)] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
            {items.map((member, idx) => (
              <Reorder.Item
                key={member.id}
                value={member}
                className="flex items-center gap-3 p-3 rounded-[var(--radius-orbit-md)] bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] hover:border-[var(--orbit-brand)]/50 transition-colors cursor-grab active:cursor-grabbing select-none"
              >
                <div className="text-[var(--orbit-text-muted)] p-1 -ml-1 hover:text-white cursor-grab">
                  <GripVertical className="h-4 w-4" />
                </div>
                
                <div className="flex items-center gap-3 flex-1">
                  <div className="orbit-avatar">{member.avatar}</div>
                  <span className="font-medium text-sm text-[var(--orbit-text-primary)] flex-1 truncate">
                    {member.name}
                  </span>
                </div>

                <div className="flex items-center justify-center w-6 h-6 rounded bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] text-xs font-medium text-[var(--orbit-text-secondary)]">
                  {idx + 1}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--orbit-border)] flex items-center justify-end gap-3 shrink-0 bg-[var(--orbit-bg-card)]">
          <button
            type="button"
            onClick={onClose}
            className="orbit-btn-neutral px-5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="orbit-btn-primary px-6 shadow-[0_4px_14px_rgba(124,110,247,0.3)]"
          >
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
}
