import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AuthScreenProps {
  vkIdInput: string;
  setVkIdInput: (value: string) => void;
  onLogin: () => void;
}

const AuthScreen = ({ vkIdInput, setVkIdInput, onLogin }: AuthScreenProps) => {
  const handleVKLogin = () => {
    if (!vkIdInput.trim()) {
      toast.error('Введите ваш VK ID');
      return;
    }
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2A2A2A]">
      <Card className="w-full max-w-md p-8 bg-[#4A4A4A] border-[#3A3A3A]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Календарь фотографа</h1>
          <p className="text-[#999]">Войдите через ВКонтакте</p>
        </div>
        
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Введите ваш VK ID или любое имя"
            value={vkIdInput}
            onChange={(e) => setVkIdInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVKLogin()}
            className="w-full text-white bg-[#3A3A3A] border-[#555]"
            autoFocus
          />
          <Button 
            onClick={handleVKLogin}
            className="w-full bg-[#0077FF] hover:bg-[#0066DD] text-white py-6 text-lg font-semibold"
          >
            Войти
          </Button>
          <p className="text-xs text-[#999] text-center">
            Введите свой VK ID (например, id123456789) или любое уникальное имя.
            Это будет вашим личным календарём.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AuthScreen;
