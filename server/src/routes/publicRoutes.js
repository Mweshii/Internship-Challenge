// Routes anyone can call - no login needed. Mounted at /api in app.js.
import { Router } from 'express';
import { createContactMessage } from '../controllers/adminController.js';
import { createOrder } from '../controllers/orderController.js';
import { getSettings, listCategories, listProducts } from '../controllers/productController.js';
import { createRepair } from '../controllers/repairController.js';
import { createSellEnquiry } from '../controllers/sellController.js';
import { trackRecord } from '../controllers/trackingController.js';
import { submissionLimiter, trackingLimiter } from '../middleware/rateLimits.js';
import { uploadRepairImage, uploadSellPhotos, verifyUploadedImages } from '../middleware/upload.js';

const router = Router();

// Shop catalogue
router.get('/settings', getSettings);
router.get('/categories', listCategories);
router.get('/products', listProducts);

// Form submissions. Middleware runs left to right:
// rate limit -> save uploaded photos -> check they are real images -> controller.
router.post('/repairs', submissionLimiter, uploadRepairImage, verifyUploadedImages, createRepair);
router.post('/sell-enquiries', submissionLimiter, uploadSellPhotos, verifyUploadedImages, createSellEnquiry);
router.post('/orders', submissionLimiter, createOrder);
router.post('/contact', submissionLimiter, createContactMessage);

// Tracking uses POST so the reference and contact detail are not left in URLs,
// browser history or server logs.
router.post('/track', trackingLimiter, trackRecord);

export default router;
