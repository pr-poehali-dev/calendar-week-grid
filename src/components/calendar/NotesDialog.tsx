import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Note {
  id: string;
  title: string;
  content: string;
}

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notesContent: string;
  onNotesChange: (value: string) => void;
}

const NotesDialog = ({ isOpen, onClose, notesContent, onNotesChange }: NotesDialogProps) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('calendar_notes_list');
    if (saved) {
      return JSON.parse(saved);
    }
    if (notesContent) {
      return [{ id: '1', title: 'Общие заметки', content: notesContent }];
    }
    return [];
  });
  
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );
  
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('calendar_notes_list', JSON.stringify(updatedNotes));
  };

  const handleAddNote = () => {
    if (!newNoteTitle.trim()) return;
    
    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle.trim(),
      content: ''
    };
    
    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    setSelectedNoteId(newNote.id);
    setNewNoteTitle('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    saveNotes(updatedNotes);
    
    if (selectedNoteId === id) {
      setSelectedNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
    }
  };

  const handleContentChange = (content: string) => {
    if (!selectedNoteId) return;
    
    const updatedNotes = notes.map(n =>
      n.id === selectedNoteId ? { ...n, content } : n
    );
    saveNotes(updatedNotes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Заметки</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-[#3A3A3A] flex flex-col">
            <div className="p-3 border-b border-[#3A3A3A]">
              {isAddingNote ? (
                <div className="flex gap-2">
                  <Input
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Название темы"
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNote();
                      if (e.key === 'Escape') setIsAddingNote(false);
                    }}
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleAddNote}
                    className="h-8 w-8"
                  >
                    <Icon name="Check" className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsAddingNote(true)}
                  className="w-full h-8 text-sm"
                  variant="outline"
                >
                  <Icon name="Plus" className="w-4 h-4 mr-2" />
                  Новая заметка
                </Button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 cursor-pointer hover:bg-[#3A3A3A] border-b border-[#2A2A2A] flex items-center justify-between group ${
                    selectedNoteId === note.id ? 'bg-[#3A3A3A]' : ''
                  }`}
                  onClick={() => setSelectedNoteId(note.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{note.title}</div>
                    <div className="text-xs text-[#999] truncate mt-1">
                      {note.content ? note.content.substring(0, 30) + '...' : 'Пусто'}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="Trash2" className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex flex-col p-6">
            {selectedNote ? (
              <>
                <h3 className="text-lg font-semibold mb-3">{selectedNote.title}</h3>
                <Textarea
                  value={selectedNote.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Введите текст заметки..."
                  className="flex-1 resize-none text-base"
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#999]">
                <div className="text-center">
                  <Icon name="FileText" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Выберите или создайте заметку</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesDialog;
