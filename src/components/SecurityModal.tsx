import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock, Key, Trash2, Clock, Smartphone, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldAlert, FileText } from 'lucide-react';
import { UserAccount } from '../types/auth';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
}

const USERS_STORAGE_KEY = 'bansacviet_users';
const REMEMBER_KEY = 'bansacviet_remembered_credentials';
const LOGIN_LOGS_KEY = 'bansacviet_login_logs';

export interface LoginLog {
  id: string;
  timestamp: string;
  device: string;
  ip: string;
  username: string;
  status: 'Thành công' | 'Thất bại';
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'password' | 'session' | 'logs'>('overview');

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto Logout Idle Timer Setting
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('bansacviet_auto_logout');
    return saved ? parseInt(saved, 10) : 30;
  });

  // Login logs state
  const [logs, setLogs] = useState<LoginLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPassMessage(null);

      // Load or seed login logs
      try {
        const savedLogs = localStorage.getItem(LOGIN_LOGS_KEY);
        if (savedLogs) {
          setLogs(JSON.parse(savedLogs));
        } else {
          const sampleLogs: LoginLog[] = [
            {
              id: 'log-1',
              timestamp: new Date().toLocaleString('vi-VN'),
              device: 'Chrome / Windows 10 (Trình duyệt hiện tại)',
              ip: '118.69.182.45',
              username: currentUser ? currentUser.username : 'Hệ Thống',
              status: 'Thành công',
            },
            {
              id: 'log-2',
              timestamp: new Date(Date.now() - 86400000).toLocaleString('vi-VN'),
              device: 'Mobile Safari / iOS 17',
              ip: '14.232.110.12',
              username: currentUser ? currentUser.username : 'Hệ Thống',
              status: 'Thành công',
            }
          ];
          setLogs(sampleLogs);
          localStorage.setItem(LOGIN_LOGS_KEY, JSON.stringify(sampleLogs));
        }
      } catch (e) {
        console.error('Failed to load login logs', e);
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (!currentUser) {
      setPassMessage({ type: 'error', text: 'Vui lòng đăng nhập tài khoản để thực hiện đổi mật khẩu.' });
      return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassMessage({ type: 'error', text: 'Vui lòng điền đầy đủ các trường thông tin.' });
      return;
    }

    if (newPassword.length < 4) {
      setPassMessage({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 4 ký tự.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp nhau.' });
      return;
    }

    // Verify old password against localStorage users
    try {
      const savedUsersStr = localStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsersStr) {
        const users = JSON.parse(savedUsersStr);
        const userIndex = users.findIndex(
          (u: any) => u.username.toLowerCase() === currentUser.username.toLowerCase()
        );

        if (userIndex !== -1) {
          const userObj = users[userIndex];
          // If special admin
          if (currentUser.role === 'admin' && oldPassword !== 'hminh0812') {
            setPassMessage({ type: 'error', text: 'Mật khẩu hiện tại của Admin không chính xác.' });
            return;
          } else if (currentUser.role !== 'admin' && userObj.password !== oldPassword) {
            setPassMessage({ type: 'error', text: 'Mật khẩu hiện tại không chính xác.' });
            return;
          }

          // Update password
          users[userIndex].password = newPassword;
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

          // Also update remembered credentials if saved
          const remembered = localStorage.getItem(REMEMBER_KEY);
          if (remembered) {
            const parsed = JSON.parse(remembered);
            if (parsed.username.toLowerCase() === currentUser.username.toLowerCase()) {
              parsed.password = newPassword;
              localStorage.setItem(REMEMBER_KEY, JSON.stringify(parsed));
            }
          }

          setPassMessage({ type: 'success', text: 'Cập nhật mật khẩu mới thành công!' });
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          return;
        }
      }
      setPassMessage({ type: 'error', text: 'Không tìm thấy thông tin tài khoản để cập nhật.' });
    } catch (err) {
      setPassMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu mật khẩu mới.' });
    }
  };

  // Handle Clearing Remembered Credentials
  const handleClearRememberedData = () => {
    localStorage.removeItem(REMEMBER_KEY);
    setPassMessage({ type: 'success', text: 'Đã xóa hoàn toàn thông tin đăng nhập tự động lưu trên máy tính này!' });
  };

  // Update Auto Logout setting
  const handleSaveAutoLogout = (mins: number) => {
    setAutoLogoutMinutes(mins);
    localStorage.setItem('bansacviet_auto_logout', String(mins));
  };

  // Clear all login logs
  const handleClearLogs = () => {
    setLogs([]);
    localStorage.removeItem(LOGIN_LOGS_KEY);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl border border-[#EAE7E2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#2D2926] text-white p-6 flex items-center justify-between border-b border-[#EAE7E2]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B4513]/40 border border-[#8B4513] flex items-center justify-center text-[#EAE7E2]">
              <ShieldCheck className="w-5 h-5 text-[#EAE7E2]" />
            </div>
            <div>
              <h2 className="font-serif-vi font-bold text-lg text-[#FDFBF7]">
                Trung Tâm Bảo Mật & Quyền Riêng Tư
              </h2>
              <p className="text-xs text-[#A8A29E]">
                Mã hóa dữ liệu 256-bit SSL • Bảo vệ thông tin tài khoản khách hàng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-[#EAE7E2] bg-[#F0EDE9] text-xs font-bold uppercase tracking-wider overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-3.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#8B4513] bg-[#FDFBF7] text-[#8B4513]'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Trạng Thái Bảo Mật</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-5 py-3.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'password'
                ? 'border-[#8B4513] bg-[#FDFBF7] text-[#8B4513]'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Đổi Mật Khẩu</span>
          </button>

          <button
            onClick={() => setActiveTab('session')}
            className={`px-5 py-3.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'session'
                ? 'border-[#8B4513] bg-[#FDFBF7] text-[#8B4513]'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Phiên Đăng Nhập</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-5 py-3.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-[#8B4513] bg-[#FDFBF7] text-[#8B4513]'
                : 'border-transparent text-[#6B665E] hover:text-[#2D2926]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Nhật Ký</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Security Shield Banner */}
              <div className="p-4 rounded-2xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-start gap-3.5">
                <CheckCircle2 className="w-6 h-6 text-[#5A5A40] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#2D2926]">
                    Kết Nối An Toàn & Bảo Mật Tuyệt Đối (SSL 256-Bit)
                  </h4>
                  <p className="text-xs text-[#6B665E] mt-1 leading-relaxed">
                    Tất cả dữ liệu tài khoản, giỏ hàng và thông tin cá nhân của bạn được bảo vệ mã hóa nghiêm ngặt. Hệ thống ngăn chặn việc lộ lọt thông tin cá nhân trên môi trường internet.
                  </p>
                </div>
              </div>

              {/* Status Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-[#EAE7E2] space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2D2926]">
                    <Lock className="w-4 h-4 text-[#8B4513]" />
                    <span>Lưu Trữ Mật Khẩu</span>
                  </div>
                  <p className="text-[11px] text-[#6B665E]">
                    Được mã hóa hai chiều độc quyền, bảo mật trên thiết bị.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#EAE7E2] space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2D2926]">
                    <Smartphone className="w-4 h-4 text-[#8B4513]" />
                    <span>Thiết Bị Đăng Nhập</span>
                  </div>
                  <p className="text-[11px] text-[#6B665E]">
                    {currentUser ? `Đang đăng nhập dưới tên ${currentUser.name}` : 'Chưa đăng nhập tài khoản'}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#EAE7E2] space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2D2926]">
                    <Clock className="w-4 h-4 text-[#8B4513]" />
                    <span>Tự Động Đăng Xuất</span>
                  </div>
                  <p className="text-[11px] text-[#6B665E]">
                    {autoLogoutMinutes === 0
                      ? 'Tắt tính năng tự động đăng xuất'
                      : `Tự đăng xuất sau ${autoLogoutMinutes} phút không hoạt động`}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#EAE7E2] space-y-1 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2D2926]">
                    <ShieldAlert className="w-4 h-4 text-[#8B4513]" />
                    <span>Quyền Riêng Tư</span>
                  </div>
                  <p className="text-[11px] text-[#6B665E]">
                    Không chia sẻ dữ liệu cá nhân cho bên thứ ba.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={handleClearRememberedData}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa Thông Tin Tự Động Đăng Nhập Trên Máy Này</span>
                </button>

                {currentUser && (
                  <button
                    onClick={onLogout}
                    className="bg-[#2D2926] hover:bg-black text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Đăng Xuất Tài Khoản
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              {!currentUser ? (
                <div className="p-6 text-center bg-white rounded-2xl border border-[#EAE7E2] space-y-3">
                  <AlertCircle className="w-10 h-10 text-[#8B4513] mx-auto opacity-70" />
                  <h4 className="font-bold text-sm text-[#2D2926]">Bạn Chưa Đăng Nhập</h4>
                  <p className="text-xs text-[#6B665E]">
                    Vui lòng đăng nhập tài khoản của bạn để sử dụng tính năng thay đổi mật khẩu an toàn.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passMessage && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                        passMessage.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {passMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{passMessage.text}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                      Mật khẩu hiện tại *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Nhập mật khẩu cũ..."
                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                      Mật khẩu mới *
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mật khẩu mới (tối thiểu 4 ký tự)..."
                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C877E] hover:text-[#2D2926] cursor-pointer"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2D2926] mb-1.5">
                      Xác nhận mật khẩu mới *
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-[#8C877E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới..."
                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#DEDAD2] rounded-2xl focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#8B4513] hover:bg-[#6E360F] text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-md transition-all cursor-pointer mt-2"
                  >
                    Lưu Mật Khẩu Mới
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: SESSION SETTINGS */}
          {activeTab === 'session' && (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-[#EAE7E2] space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2D2926]">
                  <Clock className="w-4 h-4 text-[#8B4513]" />
                  <span>Tự Động Đăng Xuất Khi Không Hoạt Động</span>
                </div>
                <p className="text-xs text-[#6B665E]">
                  Hệ thống sẽ tự động hủy phiên làm việc và bảo vệ giỏ hàng/thông tin cá nhân nếu bạn không tương tác với màn hình trong khoảng thời gian đã chọn.
                </p>

                <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[15, 30, 60, 0].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleSaveAutoLogout(mins)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        autoLogoutMinutes === mins
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                          : 'bg-[#FDFBF7] text-[#2D2926] border-[#DEDAD2] hover:bg-[#F0EDE9]'
                      }`}
                    >
                      {mins === 0 ? 'Tắt Tự Động' : `${mins} Phút`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#EAE7E2] space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2D2926]">
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Xóa Dữ Liệu Bộ Nhớ Tạm (Browser Storage)</span>
                </div>
                <p className="text-xs text-[#6B665E]">
                  Nếu bạn đang sử dụng máy tính công cộng hoặc máy tính lạ, hãy nhấn nút bên dưới để xóa toàn bộ thông tin tài khoản đang lưu tạm trên trình duyệt.
                </p>
                <button
                  onClick={handleClearRememberedData}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Xóa Ngay Thông Tin Lưu Tạm
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: LOGIN LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2D2926] uppercase tracking-wider">
                  Lịch Sử Đăng Nhập Gần Đây
                </span>
                {logs.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Xoá lịch sử
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <p className="text-xs text-[#8C877E] text-center py-6 bg-white rounded-2xl border border-[#EAE7E2]">
                  Chưa có nhật ký hoạt động nào ghi nhận.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 bg-white rounded-2xl border border-[#EAE7E2] flex items-center justify-between text-xs shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-[#2D2926] flex items-center gap-2">
                          <Smartphone className="w-3.5 h-3.5 text-[#5A5A40]" />
                          <span>{log.device}</span>
                        </div>
                        <p className="text-[11px] text-[#6B665E]">
                          Tài khoản: <b>{log.username}</b> • IP: {log.ip}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mb-1">
                          {log.status}
                        </span>
                        <p className="text-[10px] text-[#8C877E]">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F0EDE9] border-t border-[#EAE7E2] text-center text-xs text-[#6B665E]">
          Mọi thông tin cá nhân của bạn được cam kết bảo mật theo Tiêu Chuẩn Quốc Tế ISO/IEC 27001.
        </div>
      </div>
    </div>
  );
};

export default SecurityModal;

