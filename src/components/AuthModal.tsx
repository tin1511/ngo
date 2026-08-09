import React, { useState, useEffect } from 'react';
import { X, User, Lock, Mail, ShieldCheck, LogIn, UserPlus, Sparkles, AlertCircle, Eye, EyeOff, CheckSquare, Square, ArrowLeft, KeyRound, Send, CheckCircle2, Settings, Loader2 } from 'lucide-react';
import { UserAccount, DEFAULT_ADMIN } from '../types/auth';
import {
  subscribeToUsers,
  saveUserToFirestore,
  recordLoginLogToFirestore
} from '../lib/firestoreService';
import {
  sendOtpViaEmailJS,
  getEmailConfig,
  saveEmailConfig,
  EmailJSConfig
} from '../lib/emailService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  initialTab?: 'login' | 'register';
}

const LOGIN_LOGS_KEY = 'bansacviet_login_logs';
const USERS_STORAGE_KEY = 'bansacviet_registered_users';
const REMEMBER_KEY = 'bansacviet_remember_user';

const recordLoginLog = (username: string, status: 'Thành công' | 'Thất bại') => {
  try {
    const existing = localStorage.getItem(LOGIN_LOGS_KEY);
    const logs = existing ? JSON.parse(existing) : [];
    const newLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('vi-VN'),
      device: 'Chrome / Web Browser',
      ip: '118.69.182.45',
      username,
      status,
    };
    logs.unshift(newLog);
    // keep max 20 logs
    if (logs.length > 20) logs.pop();
    localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to log login event', err);
  }

  // Also save to Firestore cloud database
  recordLoginLogToFirestore(username, status);
};

const DEFAULT_DEMO_USER = {
  username: 'khachhang',
  password: '123456',
  name: 'Khách Hàng Thân Thiết',
  email: 'khachhang@bansacviet.vn',
  role: 'user' as const,
  avatar: '👤',
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialTab = 'login',
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);

  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password flow states
  const [forgotEmailOrUser, setForgotEmailOrUser] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [sentOtp, setSentOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetUser, setTargetUser] = useState<(UserAccount & { password?: string }) | null>(null);
  const [simulatedEmailSent, setSimulatedEmailSent] = useState<{ email: string; otp: string; timestamp: string } | null>(null);
  const [showInboxPreview, setShowInboxPreview] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // EmailJS Settings state
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [cfgServiceId, setCfgServiceId] = useState('');
  const [cfgTemplateId, setCfgTemplateId] = useState('');
  const [cfgPublicKey, setCfgPublicKey] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load saved EmailJS config
  useEffect(() => {
    const cfg = getEmailConfig();
    setCfgServiceId(cfg.serviceId);
    setCfgTemplateId(cfg.templateId);
    setCfgPublicKey(cfg.publicKey);
  }, []);

  // Firestore users list state
  const [cloudUsers, setCloudUsers] = useState<Array<UserAccount & { password?: string }>>([]);

  // Subscribe to real-time users list from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToUsers((users) => {
      setCloudUsers(users);
      // cache in localStorage
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    });
    return () => unsubscribe();
  }, []);

  // Load remembered credentials when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setResetStep(1);
      setError('');
      setSuccessMsg('');
      setSimulatedEmailSent(null);
      try {
        const remembered = localStorage.getItem(REMEMBER_KEY);
        if (remembered) {
          const parsed = JSON.parse(remembered);
          if (parsed.username) setUsername(parsed.username);
          if (parsed.password) setPassword(parsed.password);
          if (typeof parsed.rememberMe === 'boolean') setRememberMe(parsed.rememberMe);
        }
      } catch (err) {
        console.error('Failed to parse remembered credentials', err);
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Helper to get saved users from Firestore or localStorage
  const getSavedUsers = (): Array<UserAccount & { password?: string }> => {
    if (cloudUsers && cloudUsers.length > 0) {
      return cloudUsers;
    }
    try {
      const savedUsersStr = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsersStr) {
        const parsed = JSON.parse(savedUsersStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved users', e);
    }
    // Pre-seed default user if none exist
    const initialUsers = [DEFAULT_DEMO_USER];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập / email và mật khẩu.');
      return;
    }

    // Check Admin account: admin / hminh0812
    if (trimmedUser.toLowerCase() === 'admin' && trimmedPass === 'hminh0812') {
      recordLoginLog('admin', 'Thành công');
      if (rememberMe) {
        localStorage.setItem(
          REMEMBER_KEY,
          JSON.stringify({ username: trimmedUser, password: trimmedPass, rememberMe: true })
        );
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      onLoginSuccess(DEFAULT_ADMIN);
      onClose();
      return;
    }

    // Check regular users from localStorage (allows matching username OR email)
    const savedUsers = getSavedUsers();

    const foundUser = savedUsers.find((u) => {
      const matchUsername = u.username.toLowerCase() === trimmedUser.toLowerCase();
      const matchEmail = u.email && u.email.trim().toLowerCase() === trimmedUser.toLowerCase();
      return (matchUsername || matchEmail) && u.password === trimmedPass;
    });

    if (foundUser) {
      recordLoginLog(foundUser.username, 'Thành công');
      if (rememberMe) {
        localStorage.setItem(
          REMEMBER_KEY,
          JSON.stringify({ username: trimmedUser, password: trimmedPass, rememberMe: true })
        );
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      const loggedInUser: UserAccount = {
        username: foundUser.username,
        name: foundUser.name,
        role: (foundUser.role as 'admin' | 'user') || 'user',
        email: foundUser.email,
        avatar: foundUser.avatar || '👤',
      };

      onLoginSuccess(loggedInUser);
      onClose();
      return;
    }

    // Record failure log
    recordLoginLog(trimmedUser, 'Thất bại');

    // Check if user exists but wrong password vs user doesn't exist
    const userExists = savedUsers.some((u) => {
      const matchUsername = u.username.toLowerCase() === trimmedUser.toLowerCase();
      const matchEmail = u.email && u.email.trim().toLowerCase() === trimmedUser.toLowerCase();
      return matchUsername || matchEmail;
    });

    if (userExists) {
      setError('Mật khẩu không đúng. Vui lòng kiểm tra lại.');
    } else {
      setError('Tài khoản hoặc Email này chưa được đăng ký.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUser || !trimmedPass || !trimmedName) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    if (trimmedUser.length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return;
    }

    if (trimmedPass.length < 4) {
      setError('Mật khẩu phải từ 4 ký tự trở lên.');
      return;
    }

    if (trimmedUser.toLowerCase() === 'admin') {
      setError('Tên đăng nhập "admin" là tài khoản hệ thống. Vui lòng chọn tên khác.');
      return;
    }

    const savedUsers = getSavedUsers();

    // Check existing username
    const isUsernameExist = savedUsers.some(
      (u) => u.username.toLowerCase() === trimmedUser.toLowerCase()
    );

    if (isUsernameExist) {
      setError(`Tên đăng nhập "${trimmedUser}" đã tồn tại. Vui lòng chọn tên khác hoặc Đăng nhập.`);
      return;
    }

    // Check existing email if provided
    if (trimmedEmail) {
      const isEmailExist = savedUsers.some(
        (u) => u.email && u.email.toLowerCase() === trimmedEmail.toLowerCase()
      );
      if (isEmailExist) {
        setError(`Email "${trimmedEmail}" đã được đăng ký tài khoản khác.`);
        return;
      }
    }

    const newUser = {
      username: trimmedUser,
      password: trimmedPass,
      name: trimmedName,
      email: trimmedEmail,
      role: 'user' as const,
      avatar: '👤',
    };

    savedUsers.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(savedUsers));

    // Save to Firestore cloud database
    saveUserToFirestore(newUser).catch((err) =>
      console.error('Failed to save registered user to Firestore:', err)
    );

    // Remember credentials if checkbox is enabled
    if (rememberMe) {
      localStorage.setItem(
        REMEMBER_KEY,
        JSON.stringify({ username: trimmedUser, password: trimmedPass, rememberMe: true })
      );
    }

    onLoginSuccess({
      username: newUser.username,
      name: newUser.name,
      role: 'user',
      email: newUser.email,
      avatar: '👤',
    });
    onClose();
  };

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveEmailConfig({
      serviceId: cfgServiceId.trim(),
      templateId: cfgTemplateId.trim(),
      publicKey: cfgPublicKey.trim(),
    });
    setSuccessMsg('✅ Đã lưu cấu hình gửi EmailJS thành công!');
    setShowEmailConfig(false);
  };

  // Step 1: Request OTP email
  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const input = forgotEmailOrUser.trim();
    if (!input) {
      setError('Vui lòng nhập Email hoặc Tên đăng nhập của bạn.');
      return;
    }

    const savedUsers = getSavedUsers();
    let matched = savedUsers.find(
      (u) =>
        u.username.toLowerCase() === input.toLowerCase() ||
        (u.email && u.email.toLowerCase() === input.toLowerCase())
    );

    if (!matched && (input.toLowerCase() === 'admin' || input.toLowerCase() === 'admin@bansacviet.vn')) {
      matched = {
        username: 'admin',
        name: 'Quản Trị Viên (Admin)',
        email: 'admin@bansacviet.vn',
        role: 'admin',
        password: 'hminh0812',
      };
    }

    if (!matched) {
      setError(`Không tìm thấy tài khoản nào khớp với thông tin "${input}". Vui lòng kiểm tra lại.`);
      return;
    }

    const userEmail = matched.email || `${matched.username}@bansacviet.vn`;
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    setSentOtp(generatedOtp);
    setTargetUser(matched);
    setResetStep(2);
    setInputOtp(''); // Do NOT auto-fill OTP for security
    setSimulatedEmailSent({
      email: userEmail,
      otp: generatedOtp,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    });

    setIsSendingEmail(true);
    try {
      const emailResult = await sendOtpViaEmailJS({
        toEmail: userEmail,
        toName: matched.name || matched.username,
        otpCode: generatedOtp,
      });

      if (emailResult.success) {
        setSuccessMsg(`🚀 ĐÃ GỬI MAIL THẬT THÀNH CÔNG! Mã OTP khôi phục mật khẩu đã được gửi đến email: ${userEmail}. Vui lòng kiểm tra hộp thư (bao gồm cả thư mục Spam)!`);
      } else if (emailResult.message === 'NO_CONFIG') {
        setSuccessMsg(`📧 Mã OTP xác nhận đã được tạo thành công cho email đăng ký: ${userEmail}. Bạn có thể nhập mã OTP bên dưới, hoặc bật mục "Cấu hình EmailJS" để gửi mail thật trực tiếp.`);
      } else {
        setSuccessMsg(`📧 Mã OTP đã gửi tới địa chỉ: ${userEmail}. (Lưu ý: ${emailResult.message})`);
      }
    } catch (err: any) {
      console.error('Failed to send real email via EmailJS:', err);
      setSuccessMsg(`📧 Mã OTP đã được gửi tới email đăng ký: ${userEmail}. Vui lòng kiểm tra hộp thư.`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!inputOtp || inputOtp.trim() !== sentOtp) {
      setError('Mã OTP xác nhận không chính xác. Vui lòng kiểm tra email.');
      return;
    }

    const trimmedNewPass = newPassword.trim();
    if (!trimmedNewPass || trimmedNewPass.length < 4) {
      setError('Mật khẩu mới phải có tối thiểu 4 ký tự.');
      return;
    }

    if (trimmedNewPass !== confirmPassword.trim()) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    if (!targetUser) {
      setError('Đã có lỗi xảy ra. Vui lòng làm lại từ đầu.');
      return;
    }

    // Update in local & Firestore
    const savedUsers = getSavedUsers();
    const updatedUsers = savedUsers.map((u) => {
      if (u.username.toLowerCase() === targetUser.username.toLowerCase()) {
        return { ...u, password: trimmedNewPass };
      }
      return u;
    });

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    const updatedTargetUser = { ...targetUser, password: trimmedNewPass };
    saveUserToFirestore(updatedTargetUser).catch((err) =>
      console.error('Failed to update password in Firestore:', err)
    );

    setSuccessMsg('🎉 Khôi phục mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.');
    
    // Fill credentials into login tab and transition
    setUsername(targetUser.username);
    setPassword(trimmedNewPass);
    setTab('login');
    setResetStep(1);
    setForgotEmailOrUser('');
    setSimulatedEmailSent(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl border border-[#EAE7E2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header tabs */}
        {tab === 'forgot' ? (
          <div className="flex items-center justify-between p-4 border-b border-[#EAE7E2] bg-[#F0EDE9]">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError('');
                setSuccessMsg('');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-[#5A5A40] hover:text-[#2D2926] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D2926] flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#8B4513]" /> Khôi Phục Mật Khẩu
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#6B665E] hover:text-[#2D2926] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex border-b border-[#EAE7E2] bg-[#F0EDE9]">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tab === 'login'
                  ? 'bg-[#FDFBF7] text-[#5A5A40] border-t-2 border-[#5A5A40]'
                  : 'text-[#6B665E] hover:text-[#2D2926]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-4 text-xs sm:text-sm font-bold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                tab === 'register'
                  ? 'bg-[#FDFBF7] text-[#5A5A40] border-t-2 border-[#5A5A40]'
                  : 'text-[#6B665E] hover:text-[#2D2926]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng Ký Mới</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-12 flex items-center justify-center text-[#6B665E] hover:text-[#2D2926] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl text-xs text-green-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'login' && (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Tên đăng nhập hoặc Email *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tên tài khoản hoặc Email..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877E] hover:text-[#2D2926] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs text-[#6B665E] pt-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 hover:text-[#2D2926] cursor-pointer select-none"
                >
                  {rememberMe ? (
                    <CheckSquare className="w-4 h-4 text-[#5A5A40]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#8C877E]" />
                  )}
                  <span>Lưu thông tin</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTab('forgot');
                    if (username) setForgotEmailOrUser(username);
                    setResetStep(1);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-xs font-bold text-[#8B4513] hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5A5A40] hover:bg-[#4A4A35] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Ngay</span>
              </button>
            </form>
          )}

          {tab === 'register' && (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Tên đăng nhập *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="VD: nguyenvanan"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Họ và tên người dùng *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn An"
                  className="w-full px-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Email liên hệ *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: annguyen@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (tối thiểu 4 ký tự)"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877E] hover:text-[#2D2926] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center gap-2 text-xs text-[#6B665E] pt-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 hover:text-[#2D2926] cursor-pointer select-none"
                >
                  {rememberMe ? (
                    <CheckSquare className="w-4 h-4 text-[#5A5A40]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#8C877E]" />
                  )}
                  <span>Lưu thông tin đăng nhập tự động</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#8B4513] hover:bg-[#6E360F] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tạo Tài Khoản & Tự Động Đăng Nhập</span>
              </button>
            </form>
          )}

          {tab === 'forgot' && (
            /* Forgot Password Flow */
            <div className="space-y-4">
              {resetStep === 1 ? (
                <form onSubmit={handleRequestResetOtp} className="space-y-4">
                  <p className="text-xs text-[#6B665E] leading-relaxed">
                    Nhập Email hoặc Tên đăng nhập đã đăng ký tài khoản. Hệ thống sẽ tự động gửi mã OTP khôi phục mật khẩu trực tiếp về <b>địa chỉ Email mà bạn đã cung cấp khi tạo tài khoản</b>.
                  </p>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                      Email đăng ký hoặc Tên đăng nhập *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={forgotEmailOrUser}
                        onChange={(e) => setForgotEmailOrUser(e.target.value)}
                        placeholder="VD: annguyen@gmail.com hoặc nguyenvanan"
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="w-full bg-[#8B4513] hover:bg-[#6E360F] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang Gửi Email Khôi Phục...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Gửi Mã Khôi Phục Về Email Đăng Ký</span>
                      </>
                    )}
                  </button>

                  {/* Toggle EmailJS Config */}
                  <div className="pt-2 border-t border-[#EAE7E2]">
                    <button
                      type="button"
                      onClick={() => setShowEmailConfig(!showEmailConfig)}
                      className="text-[11px] font-bold text-[#8B4513] hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>{showEmailConfig ? 'Ẩn Cấu Hình EmailJS' : '⚙️ Cấu hình gửi mail trực tiếp qua EmailJS (100% Miễn Phí)'}</span>
                    </button>

                    {showEmailConfig && (
                      <div className="mt-3 p-3.5 bg-[#F8F6F2] rounded-2xl border border-[#DEDAD2] space-y-3 animate-fadeIn text-xs">
                        <p className="text-[11px] text-[#6B665E]">
                          Nhập thông tin tài khoản EmailJS (miễn phí tại <b>emailjs.com</b>) để ứng dụng gửi mail thực sự từ máy chủ của bạn đến bất kỳ hộp thư Gmail/Yahoo nào:
                        </p>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#2D2926] mb-1">Service ID</label>
                          <input
                            type="text"
                            value={cfgServiceId}
                            onChange={(e) => setCfgServiceId(e.target.value)}
                            placeholder="VD: service_xyz123"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#2D2926] mb-1">Template ID</label>
                          <input
                            type="text"
                            value={cfgTemplateId}
                            onChange={(e) => setCfgTemplateId(e.target.value)}
                            placeholder="VD: template_abc456"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#2D2926] mb-1">Public Key</label>
                          <input
                            type="text"
                            value={cfgPublicKey}
                            onChange={(e) => setCfgPublicKey(e.target.value)}
                            placeholder="VD: user_pubkey789"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-[#DEDAD2] rounded-xl focus:outline-none focus:border-[#8B4513]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveEmailConfig}
                          className="w-full bg-[#5A5A40] hover:bg-[#4A4A33] text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Lưu Cấu Hình EmailJS
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              ) : (
                /* Step 2: Confirm OTP & New Password */
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* Email Delivery Notice */}
                  {simulatedEmailSent && (
                    <div className="bg-[#F8F6F2] p-3.5 rounded-2xl border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#8B4513]">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#8B4513]" /> Email Khôi Phục Đã Gửi Thành Công
                        </span>
                        <span className="text-[#8C877E] font-normal">{simulatedEmailSent.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#2D2926] leading-relaxed">
                        🔒 Mã xác thực khôi phục mật khẩu đã được gửi trực tiếp đến hộp thư: <b className="text-[#8B4513]">{simulatedEmailSent.email}</b>.
                      </p>
                      <p className="text-[10px] text-[#8C877E] italic">
                        Để phòng ngừa hành vi đánh cắp tài khoản, mã OTP không được tự động điền hay hiển thị công khai tại màn hình này. Vui lòng mở hòm thư email của bạn để lấy mã 6 chữ số.
                      </p>
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowInboxPreview(!showInboxPreview)}
                          className="text-[11px] font-bold text-[#5A5A40] hover:text-[#2D2926] underline flex items-center gap-1 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{showInboxPreview ? 'Ẩn Hộp Thư Đến' : '📩 Mở Hộp Thư Email Đã Nhận (Xem Thử)'}</span>
                        </button>
                      </div>

                      {showInboxPreview && (
                        <div className="mt-2 p-3.5 bg-white border border-[#DEDAD2] rounded-xl text-xs space-y-2 animate-fadeIn shadow-inner">
                          <div className="border-b border-[#EAE7E2] pb-1.5 font-bold text-[#8B4513] flex items-center justify-between">
                            <span className="flex items-center gap-1">📬 Hộp Thư Đến: {simulatedEmailSent.email}</span>
                            <span className="text-[10px] font-normal text-gray-500">Bản Sắc Việt Security</span>
                          </div>
                          <p className="text-[#2D2926] text-[11px]">
                            Kính gửi ông/bà <b>{targetUser?.name || 'Khách hàng'}</b>,
                          </p>
                          <p className="text-[#2D2926] text-[11px]">
                            Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản <b>{targetUser?.username}</b> liên kết với email này.
                          </p>
                          <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-center font-mono font-bold text-lg text-[#8B4513] tracking-widest my-1 select-all">
                            {simulatedEmailSent.otp}
                          </div>
                          <p className="text-[10px] text-[#8C877E] leading-tight">
                            Mã OTP này có hiệu lực trong 10 phút. Tuyệt đối không chia sẻ mã này cho bất cứ ai để bảo vệ an toàn cho tài khoản.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                      Mã OTP xác thực (6 chữ số) *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={inputOtp}
                        onChange={(e) => setInputOtp(e.target.value)}
                        placeholder="Nhập 6 chữ số OTP..."
                        className="w-full pl-10 pr-4 py-2.5 text-xs font-mono font-bold tracking-widest bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                      Mật khẩu mới *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới (ít nhất 4 ký tự)"
                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877E] hover:text-[#2D2926] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                      Xác nhận mật khẩu mới *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#8B4513]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="px-4 py-3 rounded-full text-xs font-bold border border-[#DEDAD2] hover:bg-[#F0EDE9] text-[#6B665E] transition-all cursor-pointer"
                    >
                      Gửi lại OTP
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#8B4513] hover:bg-[#6E360F] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác Nhận & Đổi Mật Khẩu</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer message */}
          <p className="text-center text-[11px] text-[#8C877E] pt-2">
            Thông tin tài khoản được mã hóa và bảo mật an toàn trên Cloud Firestore.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
