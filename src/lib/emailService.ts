import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Order } from '../types/auth';

export const EMAILJS_CONFIG_KEY = 'bsv_emailjs_config';
const SETTINGS_COLLECTION = 'site_settings';

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  adminEmail?: string;
}

let cachedEmailConfig: EmailJSConfig | null = null;

export const getEmailConfig = (): EmailJSConfig => {
  if (cachedEmailConfig && (cachedEmailConfig.serviceId || cachedEmailConfig.templateId)) {
    return cachedEmailConfig;
  }
  try {
    const saved = localStorage.getItem(EMAILJS_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.serviceId || parsed.templateId || parsed.publicKey || parsed.adminEmail) {
        cachedEmailConfig = {
          serviceId: parsed.serviceId || '',
          templateId: parsed.templateId || '',
          publicKey: parsed.publicKey || '',
          adminEmail: parsed.adminEmail || 'btin2499@gmail.com',
        };
        return cachedEmailConfig;
      }
    }
  } catch (e) {
    console.error('Failed to load email config from localStorage', e);
  }
  return {
    serviceId: '',
    templateId: '',
    publicKey: '',
    adminEmail: 'btin2499@gmail.com',
  };
};

export const getEmailConfigAsync = async (): Promise<EmailJSConfig> => {
  const local = getEmailConfig();
  if (local.serviceId && local.templateId && local.publicKey) {
    return local;
  }

  // Try fetching from Firestore so that order notifications work across all devices & users
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'email');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as EmailJSConfig;
      if (data.serviceId || data.templateId || data.publicKey) {
        const merged: EmailJSConfig = {
          serviceId: data.serviceId || '',
          templateId: data.templateId || '',
          publicKey: data.publicKey || '',
          adminEmail: data.adminEmail || 'btin2499@gmail.com',
        };
        cachedEmailConfig = merged;
        try {
          localStorage.setItem(EMAILJS_CONFIG_KEY, JSON.stringify(merged));
        } catch {}
        return merged;
      }
    }
  } catch (e) {
    console.warn('Failed to load email config from Firestore:', e);
  }

  return local;
};

export const saveEmailConfig = async (config: EmailJSConfig) => {
  cachedEmailConfig = config;
  try {
    localStorage.setItem(EMAILJS_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save email config to localStorage', e);
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'email');
    await setDoc(docRef, JSON.parse(JSON.stringify(config)), { merge: true });
  } catch (e) {
    console.error('Failed to save email config to Firestore', e);
  }
};

export interface SendOtpParams {
  toEmail: string;
  toName: string;
  otpCode: string;
}

export const sendOtpViaEmailJS = async (params: SendOtpParams): Promise<{ success: boolean; message: string }> => {
  const config = await getEmailConfigAsync();

  if (!config.serviceId || !config.templateId || !config.publicKey) {
    return {
      success: false,
      message: 'NO_CONFIG',
    };
  }

  const templateParams = {
    to_email: params.toEmail,
    to_name: params.toName,
    otp_code: params.otpCode,
    reply_to: 'support@bansacviet.vn',
    app_name: 'Bản Sắc Việt',
    subject: `[Bản Sắc Việt] Mã OTP khôi phục mật khẩu: ${params.otpCode}`,
    title: `Mã OTP khôi phục mật khẩu: ${params.otpCode}`,
    message: `Mã OTP khôi phục mật khẩu của bạn là: ${params.otpCode}. Mã có hiệu lực trong 5 phút.`,
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.templateId,
        user_id: config.publicKey,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      return {
        success: true,
        message: `Đã gửi thành công email chứa mã OTP đến ${params.toEmail}`,
      };
    } else {
      const errText = await response.text();
      return {
        success: false,
        message: `Lỗi từ EmailJS: ${errText}`,
      };
    }
  } catch (error: any) {
    console.warn('EmailJS sending error:', error);
    const errText = error?.message || String(error);
    return {
      success: false,
      message: errText,
    };
  }
};

/**
 * Gửi email thông báo đơn hàng mới tới Admin khi có khách hàng đặt hàng thành công
 */
export const sendOrderNotificationToAdmin = async (order: Order): Promise<{ success: boolean; message: string }> => {
  const config = await getEmailConfigAsync();
  const adminEmail = config.adminEmail || 'btin2499@gmail.com';
  const nowStr = new Date(order.createdAt).toLocaleString('vi-VN');

  const itemsFormatted = order.items
    .map((item, idx) => `${idx + 1}. ${item.productName} (SL: ${item.quantity}) - ${item.price.toLocaleString('vi-VN')}đ${item.engravingNote ? ` [Khắc: ${item.engravingNote}]` : ''}`)
    .join('\n');

  const notesFormatted = order.engravingNote || order.notes || 'Không có';

  const emailContent = `
=== ĐƠN HÀNG MỚI TỪ BẢN SẮC VIỆT ===
Mã đơn hàng: #${order.id}
Ngày tạo: ${nowStr}

THÔNG TIN KHÁCH HÀNG:
• Tên khách hàng: ${order.customerName}
• Số điện thoại: ${order.customerPhone}
• Địa chỉ giao hàng: ${order.customerAddress}
• Tài khoản đặt hàng: ${order.userEmail || order.username || 'Khách vãng lai'}

CHI TIẾT SẢN PHẨM ĐẶT HÀNG:
${itemsFormatted}

GHI CHÚ KHI ĐẶT: ${notesFormatted}

TỔNG CỘNG THANH TOÁN:
• Tạm tính: ${order.subtotal.toLocaleString('vi-VN')}đ
• Giảm giá: ${order.discount.toLocaleString('vi-VN')}đ
• Phí giao hàng: ${order.shippingFee.toLocaleString('vi-VN')}đ
• THÀNH TIỀN: ${order.total.toLocaleString('vi-VN')}đ
`;

  console.log(`📧 [ADMIN ORDER NOTIFICATION] Đã tạo thông báo gửi về email Admin: ${adminEmail}`);

  if (!config.serviceId || !config.templateId || !config.publicKey) {
    console.warn('⚠️ Chưa cấu hình đầy đủ EmailJS (Service ID, Template ID, Public Key)');
    return {
      success: false,
      message: `Chưa lưu cấu hình EmailJS trên Admin Dashboard. Vui lòng vào Cấu Hình Email và bấm Lưu.`,
    };
  }

  // Provide all standard and custom variable names so EmailJS templates will render correctly
  const templateParams = {
    // Primary recipient
    to_email: adminEmail,
    to_name: 'Admin Bản Sắc Việt',

    // EmailJS Default Template compatible fields
    title: `Đơn hàng mới #${order.id} từ ${order.customerName}`,
    subject: `[ĐƠN HÀNG MỚI #${order.id}] Khách: ${order.customerName} - ${order.total.toLocaleString('vi-VN')}đ`,
    name: order.customerName,
    email: order.userEmail || 'customer@bansacviet.vn',
    message: emailContent,
    time: nowStr,
    date: nowStr,

    // Custom order parameters
    order_id: order.id,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress,
    order_total: `${order.total.toLocaleString('vi-VN')}đ`,
    order_items: itemsFormatted,
    order_notes: notesFormatted,
    reply_to: order.userEmail || 'support@bansacviet.vn',
    app_name: 'Bản Sắc Việt',
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: config.serviceId,
        template_id: config.templateId,
        user_id: config.publicKey,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      console.log(`✅ [EMAIL SENT] Đã gửi mail đơn hàng #${order.id} thành công đến Admin: ${adminEmail}`);
      return {
        success: true,
        message: `Đã gửi mail thông báo đơn hàng mới #${order.id} thành công đến Admin: ${adminEmail}`,
      };
    } else {
      const errText = await response.text();
      console.warn('Lỗi từ EmailJS khi gửi thông báo đơn hàng:', errText);
      return {
        success: false,
        message: `Lỗi từ EmailJS: ${errText}`,
      };
    }
  } catch (error: any) {
    console.warn('Lỗi kết nối khi gửi mail thông báo đơn hàng:', error);
    return {
      success: false,
      message: error?.message || String(error),
    };
  }
};


