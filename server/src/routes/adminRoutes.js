// Everything the admin dashboard needs. Mounted at /api/admin in app.js.
import { Router } from 'express';
import { getOverview, listMessages, sendUpload } from '../controllers/adminController.js';
import { getOrder, listOrders, updateOrderStatus } from '../controllers/orderController.js';
import { createProduct, listAllProducts, updateProduct } from '../controllers/productController.js';
import { getRepair, listRepairs, updateRepairStatus } from '../controllers/repairController.js';
import {
  getSellEnquiry,
  listSellEnquiries,
  reviewSellEnquiry,
  updateSellStatus,
} from '../controllers/sellController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// This one line protects EVERY route below it: the check happens on the
// server, so hiding the dashboard link in the browser is not what keeps
// customer data private - this is.
router.use(requireAdmin);

router.get('/overview', getOverview);
router.get('/messages', listMessages);
router.get('/uploads/:fileName', sendUpload);

router.get('/repairs', listRepairs);
router.get('/repairs/:id', getRepair);
router.patch('/repairs/:id/status', updateRepairStatus);

router.get('/orders', listOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/sell-enquiries', listSellEnquiries);
router.get('/sell-enquiries/:id', getSellEnquiry);
router.patch('/sell-enquiries/:id/status', updateSellStatus);
router.patch('/sell-enquiries/:id/review', reviewSellEnquiry);

router.get('/products', listAllProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);

export default router;
