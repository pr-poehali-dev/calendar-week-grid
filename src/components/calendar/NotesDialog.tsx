import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notesContent: string;
  onNotesChange: (value: string) => void;
}

const NotesDialog = ({ isOpen, onClose, notesContent, onNotesChange }: NotesDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Заметки</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <Textarea
            value={notesContent}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Введите ваши заметки здесь..."
            className="w-full h-full resize-none text-base"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesDialog;
