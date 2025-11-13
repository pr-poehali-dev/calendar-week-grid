import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp = ({ isOpen, onClose }: KeyboardShortcutsHelpProps) => {
  const shortcuts = [
    { keys: ['Ctrl', 'N'], description: 'Создать новое событие' },
    { keys: ['Escape'], description: 'Закрыть диалоги' },
    { keys: ['T'], description: 'Перейти к сегодня' },
    { keys: ['←'], description: 'Предыдущая неделя' },
    { keys: ['→'], description: 'Следующая неделя' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Keyboard" className="w-5 h-5" />
            Горячие клавиши
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-[#3A3A3A] last:border-0"
            >
              <span className="text-sm text-[#E5E5E5]">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 text-xs font-semibold bg-[#3A3A3A] border border-[#555] rounded"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={onClose} className="w-full mt-4">
          Понятно
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;
