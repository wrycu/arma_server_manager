import { useState } from 'react';

export function useTitleEditing() {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');

  const startEditingTitle = (currentTitle: string) => {
    setEditingTitle(currentTitle);
    setIsEditingTitle(true);
  };

  const saveTitle = (onSave: (title: string) => void) => {
    if (!editingTitle.trim()) return;

    const trimmedTitle = editingTitle.trim();
    onSave(trimmedTitle);
    setIsEditingTitle(false);
    setEditingTitle('');
  };

  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    setEditingTitle('');
  };

  const handleTitleKeyDown = (
    e: React.KeyboardEvent,
    onSave: (title: string) => void
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTitle(onSave);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditingTitle();
    }
  };

  return {
    isEditingTitle,
    editingTitle,
    setEditingTitle,
    startEditingTitle,
    saveTitle,
    cancelEditingTitle,
    handleTitleKeyDown,
  };
}
