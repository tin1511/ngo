import { Order } from '../types/auth';

export const EMAILJS_CONFIG_KEY = 'bsv_emailjs_config';

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  adminEmail?: string;
}

export const getEmailConfig = (): EmailJSConfig => {
  try {
    const saved = localStorage.getItem(EMAILJS_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.serviceId || parsed.templateId || parsed.publicKey || parsed.adminEmail) {
        return {
          serviceId: parsed.serviceId || '',
          templateId: parsed.templateId || '',
          publicKey: parsed.publicKey || '',
          adminEmail: parsed.adminEmail || 'btin2499@gmail.com',
        };
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

export const saveEmailConfig = (config: EmailJSConfig) => {
  localStorage.setItem(EMAILJS_CONFIG_KEY, JSON.stringify(config));
};

export interface SendOtpParams {
  toEmail: string;
  toName: string;
  otpCode: string;
}

export const sendOtpViaEmailJS = async (params: SendOtpParams): Promise<{ success: boolean; message: string }> => {
  const config = getEmailConfig();

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
  const config = getEmailConfig();
  const adminEmail = config.adminEmail || 'btin2499@gmail.com';

  const itemsFormatted = order.items
    .map((item, idx) => `${idx + 1}. ${item.productName} (SL: ${item.quantity}) - ${item.price.toLocaleString('vi-VN')}đ`)
    .join('\n');

  const notesFormatted = order.engravingNote || order.notes || 'Không có';

  const emailContent = `
=== ĐƠN HÀNG MỚI TỪ BẢN SẮC VIỆT ===
Mã đơn hàng: #${order.id}
Ngày tạo: ${new Date(order.createdAt).toLocaleString('vi-VN')}

THÔNG TIN KHÁCH HÀNG:
• Tên khách hàng: ${order.customerName}
• Số điện thoại: ${order.customerPhone}
• Địa chỉ giao hàng: ${order.customerAddress}
• Tài khoản đặt hàng: ${order.userEmail || order.username || 'Khách vãng lai'}

CHI TIẾT SẢN PHẨM DẶT HÀNG:
${itemsFormatted}

GHI CHÚ KHI ĐẶT: ${notesFormatted}

TỔNG CỘNG THANH TOÁN:
• Tạm tính: ${order.subtotal.toLocaleString('vi-VN')}đ
• Giảm giá: ${order.discount.toLocaleString('vi-VN')}đ
• Phí giao hàng: ${order.shippingFee.toLocaleString('vi-VN')}đ
• THÀNH TIỀN: ${order.total.toLocaleString('vi-VN')}đ
`;

  console.log(`📧 [ADMIN ORDER NOTIFICATION] Đã tạo thông báo gửi về email Admin: ${adminEmail}`);
  console.log(emailContent);

  if (!config.serviceId || !config.templateId || !config.publicKey) {
    return {
      success: true,
      message: `Đã lưu log thông báo đơn hàng #${order.id} gửi tới Email Admin: ${adminEmail}. (Nhập Service ID/Template ID trong Cấu hình EmailJS để gửi qua Gmail tự động).`,
    };
  }

  const templateParams = {
    to_email: adminEmail,
    to_name: 'Admin Bản Sắc Việt',
    order_id: order.id,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress,
    order_total: `${order.total.toLocaleString('vi-VN')}đ`,
    order_items: itemsFormatted,
    order_notes: notesFormatted,
    reply_to: order.userEmail || 'support@bansacviet.vn',
    app_name: 'Bản Sắc Việt',
    subject: `[ĐƠN HÀNG MỚI #${order.id}] Khách: ${order.customerName} - ${order.total.toLocaleString('vi-VN')}đ`,
    message: emailContent,
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

