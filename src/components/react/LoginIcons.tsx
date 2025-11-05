import { ShieldCheck, BarChart3, FileText, Lock, Mail, AlertCircle, LogIn } from 'lucide-react';

export function LoginIcons() {
  return {
    Shield: () => <ShieldCheck className="w-16 h-16 text-[#B8E6E0]" />,
    Chart: () => <BarChart3 className="w-6 h-6 text-[#B8E6E0]" />,
    Document: () => <FileText className="w-6 h-6 text-[#B8E6E0]" />,
    Security: () => <Lock className="w-6 h-6 text-[#B8E6E0]" />,
    EmailIcon: () => <Mail className="h-5 w-5 text-gray-400" />,
    LockIcon: () => <Lock className="h-5 w-5 text-gray-400" />,
    ErrorIcon: () => <AlertCircle className="w-5 h-5 text-red-500" />,
    LoginIcon: () => <LogIn className="w-5 h-5" />,
  };
}
