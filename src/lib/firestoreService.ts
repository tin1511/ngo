import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDoc,
  getDocs,
  query,
  where,
  addDoc
} 
from 'firebase/firestore';
import { db } from './firebase';
import { Product, PRODUCTS } from '../data/products';
import { UserAccount, FooterConfig, DEFAULT_FOOTER_CONFIG, HeaderConfig, DEFAULT_HEADER_CONFIG, ShippingConfig, DEFAULT_SHIPPING_CONFIG, Order, OrderStatus, Voucher, DEFAULT_VOUCHERS, ProductReview } from '../types/auth';

const PRODUCTS_COLLECTION = 'products';
const USERS_COLLECTION = 'users';
const LOGS_COLLECTION = 'login_logs';
const META_COLLECTION = '_metadata';
const SETTINGS_COLLECTION = 'site_settings';
const ORDERS_COLLECTION = 'orders';

/**
 * Remove undefined properties from an object so Firestore setDoc/updateDoc doesn't fail.
 */
function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

let isProductInitChecked = false;

/**
 * Real-time listener for Products collection in Firestore.
 * Initializes default products ONLY ONCE per Firestore database instance,
 * so user deletions are permanently respected.
 */
export function subscribeToProducts(
  onProductsUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, PRODUCTS_COLLECTION);

  // Check Firestore initialization status once on app startup
  if (!isProductInitChecked) {
    isProductInitChecked = true;
    const initDocRef = doc(db, META_COLLECTION, 'products_init');
    getDoc(initDocRef)
      .then(async (snapshot) => {
        if (!snapshot.exists()) {
          // Record init flag in Firestore first
          await setDoc(initDocRef, { initializedAt: new Date().toISOString() });
          // Check if products exist before seeding
          const prodDocs = await collection(db, PRODUCTS_COLLECTION);
          console.log('Initializing default products in Firestore database...');
          for (const item of PRODUCTS) {
            const cleanItem = cleanForFirestore(item);
            await setDoc(doc(db, PRODUCTS_COLLECTION, cleanItem.id), cleanItem);
          }
        }
      })
      .catch((e) => {
        console.error('Error checking Firestore initialization state:', e);
      });
  }

  return onSnapshot(
    colRef,
    (snapshot) => {
      const productList: Product[] = snapshot.docs.map((d) => d.data() as Product);
      onProductsUpdate(productList);
    },
    (err) => {
      console.error('Firestore products listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Restore default sample products to Firestore manually (for Admin use)
 */
export async function restoreDefaultProductsToFirestore(): Promise<void> {
  for (const item of PRODUCTS) {
    const cleanItem = cleanForFirestore(item);
    await setDoc(doc(db, PRODUCTS_COLLECTION, cleanItem.id), cleanItem);
  }
}

/**
 * Add or overwrite a product in Firestore
 */
export async function addProductToFirestore(product: Product): Promise<void> {
  const cleanProduct = cleanForFirestore(product);
  await setDoc(doc(db, PRODUCTS_COLLECTION, cleanProduct.id), cleanProduct);
}

/**
 * Update an existing product in Firestore
 */
export async function updateProductInFirestore(product: Product): Promise<void> {
  const cleanProduct = cleanForFirestore(product);
  await setDoc(doc(db, PRODUCTS_COLLECTION, cleanProduct.id), cleanProduct, { merge: true });
}

/**
 * Delete a product from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
}

/**
 * Toggle stock status for a product in Firestore
 */
export async function toggleStockInFirestore(productId: string, currentStock: boolean): Promise<void> {
  await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
    inStock: !currentStock,
  });
}

let isUserInitChecked = false;

/**
 * Real-time listener for User accounts in Firestore.
 */
export function subscribeToUsers(
  onUsersUpdate: (users: Array<UserAccount & { password?: string }>) => void
) {
  const colRef = collection(db, USERS_COLLECTION);

  if (!isUserInitChecked) {
    isUserInitChecked = true;
    const initDocRef = doc(db, META_COLLECTION, 'users_init');
    getDoc(initDocRef)
      .then(async (snapshot) => {
        if (!snapshot.exists()) {
          await setDoc(initDocRef, { initializedAt: new Date().toISOString() });
          const defaultAdmin = {
            username: 'admin',
            password: 'hminh0812',
            name: 'Quản Trị Viên (Admin)',
            email: 'admin@bansacviet.vn',
            role: 'admin',
            avatar: '👑',
          };
          const defaultUser = {
            username: 'khachhang',
            password: '123456',
            name: 'Khách Hàng Thử Nghiệm',
            email: 'khachhang@bansacviet.vn',
            role: 'user',
            avatar: '👤',
          };
          try {
            await setDoc(doc(db, USERS_COLLECTION, defaultAdmin.username), defaultAdmin);
            await setDoc(doc(db, USERS_COLLECTION, defaultUser.username), defaultUser);
          } catch (e) {
            console.error('Error seeding default users:', e);
          }
        }
      })
      .catch((e) => {
        console.error('Error checking users Firestore init:', e);
      });
  }

  return onSnapshot(
    colRef,
    (snapshot) => {
      const userList = snapshot.docs.map((d) => d.data() as UserAccount & { password?: string });
      onUsersUpdate(userList);
    },
    (err) => {
      console.error('Firestore users listener error:', err);
    }
  );
}

/**
 * Save or update user in Firestore
 */
export async function saveUserToFirestore(
  user: UserAccount & { password?: string }
): Promise<void> {
  const cleanUser = cleanForFirestore(user);
  await setDoc(doc(db, USERS_COLLECTION, cleanUser.username.toLowerCase()), cleanUser, { merge: true });
}

/**
 * Record login logs in Firestore
 */
export async function recordLoginLogToFirestore(
  username: string,
  status: 'Thành công' | 'Thất bại'
): Promise<void> {
  try {
    const logData = {
      username,
      status,
      timestamp: new Date().toLocaleString('vi-VN'),
      device: window.navigator.userAgent || 'Unknown Device',
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, LOGS_COLLECTION), logData);
  } catch (e) {
    console.error('Error saving login log to Firestore:', e);
  }
}

/**
  * Subscribe to Footer configuration settings from Firestore
  */
export function subscribeToFooterConfig(
  onFooterUpdate: (config: FooterConfig) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, 'footer');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as FooterConfig;
        onFooterUpdate({ ...DEFAULT_FOOTER_CONFIG, ...data });
      } else {
        onFooterUpdate(DEFAULT_FOOTER_CONFIG);
      }
    },
    (err) => {
      console.error('Firestore footer config listener error:', err);
      onFooterUpdate(DEFAULT_FOOTER_CONFIG);
    }
  );
}

/**
  * Save updated Footer configuration to Firestore
  */
export async function saveFooterConfigToFirestore(config: FooterConfig): Promise<void> {
  const cleanConfig = cleanForFirestore(config);
  await setDoc(doc(db, SETTINGS_COLLECTION, 'footer'), cleanConfig, { merge: true });
}

/**
  * Subscribe to Header configuration settings from Firestore
  */
export function subscribeToHeaderConfig(
  onHeaderUpdate: (config: HeaderConfig) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, 'header');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as HeaderConfig;
        onHeaderUpdate({ ...DEFAULT_HEADER_CONFIG, ...data });
      } else {
        onHeaderUpdate(DEFAULT_HEADER_CONFIG);
      }
    },
    (err) => {
      console.error('Firestore header config listener error:', err);
      onHeaderUpdate(DEFAULT_HEADER_CONFIG);
    }
  );
}

/**
  * Save updated Header configuration to Firestore
  */
export async function saveHeaderConfigToFirestore(config: HeaderConfig): Promise<void> {
  const cleanConfig = cleanForFirestore(config);
  await setDoc(doc(db, SETTINGS_COLLECTION, 'header'), cleanConfig, { merge: true });
}

/**
  * Subscribe to Shipping configuration settings from Firestore
  */
export function subscribeToShippingConfig(
  onShippingUpdate: (config: ShippingConfig) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, 'shipping');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ShippingConfig;
        onShippingUpdate({ ...DEFAULT_SHIPPING_CONFIG, ...data });
      } else {
        onShippingUpdate(DEFAULT_SHIPPING_CONFIG);
      }
    },
    (err) => {
      console.error('Firestore shipping config listener error:', err);
      onShippingUpdate(DEFAULT_SHIPPING_CONFIG);
    }
  );
}

/**
  * Save updated Shipping configuration to Firestore
  */
export async function saveShippingConfigToFirestore(config: ShippingConfig): Promise<void> {
  const cleanConfig = cleanForFirestore(config);
  await setDoc(doc(db, SETTINGS_COLLECTION, 'shipping'), cleanConfig, { merge: true });
}

/**
 * Subscribe to Craft Videos list from Firestore
 */
export function subscribeToCraftVideos(
  onUpdate: (videos: any[]) => void,
  defaultVideos: any[]
) {
  const docRef = doc(db, SETTINGS_COLLECTION, 'craft_videos');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          onUpdate(data.items);
          return;
        }
      }
      onUpdate(defaultVideos);
    },
    (err) => {
      console.error('Firestore craft videos listener error:', err);
      onUpdate(defaultVideos);
    }
  );
}

/**
 * Save Craft Videos list to Firestore
 */
export async function saveCraftVideosToFirestore(videos: any[]): Promise<void> {
  // Sanitize video items to avoid huge base64 strings breaking Firestore 1MB doc limit
  const sanitized = videos.map((v) => {
    let finalVideoUrl = v.videoUrl || '';
    let finalThumbUrl = v.thumbnailUrl || '';

    // If videoUrl is base64 and > 600KB, fallback to default sample video URL if needed to preserve Firestore doc
    if (finalVideoUrl.startsWith('data:') && finalVideoUrl.length > 800000) {
      console.warn('Video Data URL is too large for single Firestore doc, using fallback sample MP4 URL');
      finalVideoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-carpenter-working-with-wood-41618-large.mp4';
    }

    if (finalThumbUrl.startsWith('data:') && finalThumbUrl.length > 800000) {
      finalThumbUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';
    }

    return {
      id: String(v.id || 'vid-' + Date.now()),
      title: String(v.title || ''),
      description: String(v.description || ''),
      videoUrl: finalVideoUrl,
      thumbnailUrl: finalThumbUrl,
      duration: String(v.duration || '01:30'),
      tag: String(v.tag || 'Chế Tác Gỗ'),
    };
  });

  const cleanData = cleanForFirestore({ items: sanitized });
  await setDoc(doc(db, SETTINGS_COLLECTION, 'craft_videos'), cleanData, { merge: true });
}

/**
 * Real-time listener for Orders collection in Firestore.
 */
export function subscribeToOrders(
  onOrdersUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, ORDERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const orderList: Order[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
        } as Order;
      });
      // Sort orders by createdAt descending (newest first)
      orderList.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      onOrdersUpdate(orderList);
    },
    (err) => {
      console.error('Firestore orders listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Add a new Customer Order to Firestore
 */
export async function addOrderToFirestore(order: Order): Promise<void> {
  const cleanOrder = cleanForFirestore(order);
  await setDoc(doc(db, ORDERS_COLLECTION, cleanOrder.id), cleanOrder);
}

/**
 * Update Customer Order Status in Firestore
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  status: OrderStatus,
  notes?: string
): Promise<void> {
  const updateData: Record<string, any> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (status === 'Đã hoàn thành') {
    updateData.deliveredAt = new Date().toISOString();
  }
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);
}

/**
 * Request Order Return / Exchange (7-day policy)
 */
export async function requestOrderReturnInFirestore(
  orderId: string,
  returnReason: string,
  returnImages?: string[]
): Promise<void> {
  const updateData: Record<string, any> = {
    returnRequested: true,
    returnReason,
    returnRequestedAt: new Date().toISOString(),
    returnStatus: 'pending' as const,
    updatedAt: new Date().toISOString(),
  };
  if (returnImages && returnImages.length > 0) {
    updateData.returnImages = returnImages;
  }
  await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);
}

/**
 * Process Order Return / Exchange by Admin
 */
export async function processOrderReturnInFirestore(
  orderId: string,
  returnStatus: 'approved' | 'rejected',
  adminReturnNote?: string
): Promise<void> {
  const updateData = {
    returnStatus,
    adminReturnNote: adminReturnNote || '',
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);
}

/**
 * Delete an Order from Firestore
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
}

/**
 * Clear/Reset all Orders in Firestore (Reset statistics to 0)
 */
export async function clearAllOrdersFromFirestore(orders: Order[]): Promise<void> {
  for (const o of orders) {
    if (o.id) {
      await deleteDoc(doc(db, ORDERS_COLLECTION, o.id));
    }
  }
}

/**
 * Real-time listener for Vouchers in Firestore
 */
export function subscribeToVouchers(
  onVouchersUpdate: (vouchers: Voucher[]) => void,
  defaultVouchers: Voucher[] = DEFAULT_VOUCHERS
) {
  const docRef = doc(db, SETTINGS_COLLECTION, 'vouchers');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          onVouchersUpdate(data.items);
          return;
        }
      }
      onVouchersUpdate(defaultVouchers);
    },
    (err) => {
      console.error('Firestore vouchers listener error:', err);
      onVouchersUpdate(defaultVouchers);
    }
  );
}

/**
 * Save Vouchers to Firestore
 */
export async function saveVouchersToFirestore(vouchers: Voucher[]): Promise<void> {
  const cleanData = cleanForFirestore({ items: vouchers, updatedAt: new Date().toISOString() });
  await setDoc(doc(db, SETTINGS_COLLECTION, 'vouchers'), cleanData, { merge: true });
}

/**
 * Real-time listener for Product Reviews in Firestore
 */
export function subscribeToReviews(
  onReviewsUpdate: (reviews: ProductReview[]) => void
) {
  const REVIEWS_COLLECTION = 'product_reviews';
  const colRef = collection(db, REVIEWS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const reviewList: ProductReview[] = snapshot.docs.map((d) => d.data() as ProductReview);
      reviewList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onReviewsUpdate(reviewList);
    },
    (err) => {
      console.error('Firestore reviews listener error:', err);
    }
  );
}

/**
 * Submit a product review and update average rating in Firestore
 */
export async function addProductReviewToFirestore(
  review: ProductReview,
  currentProduct?: Product
): Promise<void> {
  const REVIEWS_COLLECTION = 'product_reviews';
  const cleanReview = cleanForFirestore(review);
  await setDoc(doc(db, REVIEWS_COLLECTION, review.id), cleanReview);

  if (currentProduct) {
    await recalculateProductRatingInFirestore(currentProduct.id);
  }
}

/**
 * Update an existing customer review.
 */
export async function updateProductReviewInFirestore(
  reviewId: string,
  updates: Pick<ProductReview, 'rating' | 'comment'>,
  productId: string
): Promise<void> {
  const REVIEWS_COLLECTION = 'product_reviews';
  await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
    rating: updates.rating,
    comment: updates.comment,
    updatedAt: new Date().toISOString(),
  });
  await recalculateProductRatingInFirestore(productId);
}

/**
 * Delete a customer review.
 */
export async function deleteProductReviewFromFirestore(
  reviewId: string,
  productId: string
): Promise<void> {
  const REVIEWS_COLLECTION = 'product_reviews';
  await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
  await recalculateProductRatingInFirestore(productId);
}

/**
 * Recalculate product rating/count from the actual product_reviews documents.
 * This keeps the product card rating in sync after add/edit/delete.
 */
export async function recalculateProductRatingInFirestore(productId: string): Promise<void> {
  const REVIEWS_COLLECTION = 'product_reviews';
  const reviewsQuery = query(
    collection(db, REVIEWS_COLLECTION),
    where('productId', '==', productId)
  );
  const snapshot = await getDocs(reviewsQuery);
  const ratings = snapshot.docs
    .map((d) => Number(d.data()?.rating) || 0)
    .filter((rating) => rating > 0);

  const reviewsCount = ratings.length;
  const rating = reviewsCount > 0
    ? Number((ratings.reduce((sum, value) => sum + value, 0) / reviewsCount).toFixed(1))
    : 0;

  await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
    rating,
    reviewsCount,
  });
}

export { compressImageFile, uploadOrderImage } from './imageUtils';
