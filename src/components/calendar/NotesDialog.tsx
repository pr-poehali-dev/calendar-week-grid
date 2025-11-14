import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { safeLocalStorage } from '@/utils/localStorage';
import { debounce } from '@/utils/debounce';
import { Note } from '@/types/notes';

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notesContent: string;
  onNotesChange: (value: string) => void;
}

const NotesDialog = ({ isOpen, onClose, notesContent, onNotesChange }: NotesDialogProps) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = safeLocalStorage.getJSON<Note[]>('calendar_notes_list', []);
    if (saved.length > 0) {
      return saved;
    }
    if (notesContent) {
      return [{ id: '1', title: 'Общие заметки', content: notesContent }];
    }
    return [];
  });
  
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    safeLocalStorage.setJSON('calendar_notes_list', updatedNotes);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditTitle('');
    setEditContent('');
    setEditingNote(null);
  };

  const handleSaveNote = () => {
    if (!editTitle.trim()) return;
    
    if (editingNote) {
      const updatedNotes = notes.map(n =>
        n.id === editingNote.id ? { ...n, title: editTitle.trim(), content: editContent } : n
      );
      saveNotes(updatedNotes);
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: editTitle.trim(),
        content: editContent
      };
      const updatedNotes = [...notes, newNote];
      saveNotes(updatedNotes);
    }
    
    setIsCreating(false);
    setEditingNote(null);
    setSelectedNoteId(null);
  };

  const handleOpenNote = (note: Note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsCreating(false);
  };

  const handleDeleteClick = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete) {
      const updatedNotes = notes.filter(n => n.id !== noteToDelete);
      saveNotes(updatedNotes);
      
      if (editingNote?.id === noteToDelete) {
        setEditingNote(null);
        setIsCreating(false);
      }
    }
    setDeleteConfirmOpen(false);
    setNoteToDelete(null);
  };

  const handleBack = () => {
    setIsCreating(false);
    setEditingNote(null);
    setSelectedNoteId(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-6">
          {!isCreating && !editingNote ? (
            <>
              <DialogHeader>
                <DialogTitle>Заметки</DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Button
                  onClick={handleCreateNew}
                  size="icon"
                  className="w-16 h-16 rounded-full"
                >
                  <Icon name="Plus" className="w-8 h-8" />
                </Button>
                
                {notes.length > 0 && (
                  <div className="w-full space-y-2 mt-8">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="flex items-center gap-3 p-4 rounded-lg bg-[#3A3A3A] hover:bg-[#4A4A4A] cursor-pointer transition-colors"
                        onClick={() => handleOpenNote(note)}
                      >
                        <Icon name="FileText" className="w-5 h-5 text-[#999]" />
                        <span className="flex-1 font-medium">{note.title}</span>
                        <Icon name="ChevronRight" className="w-5 h-5 text-[#666]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="h-8 w-8"
                  >
                    <Icon name="ArrowLeft" className="w-4 h-4" />
                  </Button>
                  <DialogTitle>{isCreating ? 'Новая заметка' : 'Редактирование'}</DialogTitle>
                </div>
              </DialogHeader>
              
              <div className="flex-1 flex flex-col gap-4">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Название заметки"
                  className="text-lg font-semibold"
                />
                
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Введите текст заметки..."
                  className="flex-1 resize-none text-base"
                />
                
                <div className="flex gap-2 justify-between">
                  <div>
                    {editingNote && (
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteClick(editingNote.id)}
                      >
                        <Icon name="Trash2" className="w-4 h-4 mr-2" />
                        Удалить
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBack}>
                      Отмена
                    </Button>
                    <Button onClick={handleSaveNote} disabled={!editTitle.trim()}>
                      Сохранить
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заметку?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя будет отменить. Заметка будет удалена безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NotesDialog;