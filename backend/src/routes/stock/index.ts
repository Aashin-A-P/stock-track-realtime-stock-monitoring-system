
import { Router } from 'express';
import { addInvoice, deleteInvoice, showInvoice, showInvoices, updateInvoice } from './InvoiceController';
import { validateData } from '../../middlewares/validationMiddleware';
import { createInvoiceSchema } from '../../db/schemas/invoicesSchema';
import { verifyToken } from '../../middlewares/authMiddleware';
import { createLocationSchema } from '../../db/schemas/locationsSchema';
import { addLocation, deleteLocation, searchLocation, showLocation, showLocations, updateLocation } from './LocationController';
import { addRemark, deleteRemark, searchRemark, showRemark, showRemarks, updateRemark } from './RemarksController';
import { createRemarkSchema } from '../../db/schemas/remarksSchema';
import { createCategorySchema } from '../../db/schemas/categoriesSchema';
import { addCategory, deleteCategory, searchCategory, showCategories, showCategory, updateCategory } from './CategoriesController';
import { logger } from '../../middlewares/logMiddleware';
import { createProductSchema } from '../../db/schemas/productsSchema';
import { addStock, deleteStock, getAllStock, getPaginatedProducts, handleInvoiceWithProducts, searchStock, updateStock, getProductById } from './StockController';

const router = Router();

// // Invoice Routes
// @ts-ignore
router.post('/invoice/add', verifyToken, validateData(createInvoiceSchema), addInvoice);
// @ts-ignore
router.get('/invoice/:id', verifyToken, showInvoice);
// @ts-ignore
router.put('/invoice/:id', verifyToken, validateData(createInvoiceSchema), updateInvoice);
// @ts-ignore
router.delete('/invoice/:id', verifyToken, deleteInvoice);
router.get('/invoice/', verifyToken, showInvoices);

// // Location Routes
// @ts-ignore
router.post('/location/add', verifyToken, validateData(createLocationSchema), addLocation);
// @ts-ignore
router.get('/location/search', verifyToken, searchLocation);
// @ts-ignore
router.put('/location/update/:locationId', verifyToken, validateData(createLocationSchema), updateLocation);
// @ts-ignore
router.delete('/location/delete/:locationId', verifyToken, deleteLocation);
// @ts-ignore
router.get('/location/:locationId', verifyToken, showLocation);
// @ts-ignore
router.get('/locations', verifyToken, showLocations);

// // Remarks Routes
// @ts-ignore
router.post('/remark/add', verifyToken, validateData(createRemarkSchema), addRemark);
// @ts-ignore
router.get('/remark/search', verifyToken, searchRemark);
// @ts-ignore
router.get('/remark/:id', verifyToken, showRemark);
// @ts-ignore
router.put('/remark/:id', verifyToken, validateData(createRemarkSchema), updateRemark);
// @ts-ignore
router.delete('/remark/:id', verifyToken, deleteRemark);
// @ts-ignore
router.get('/remark/', verifyToken, showRemarks);

// // Categories Routes
// @ts-ignore
router.post('/category/add', verifyToken, validateData(createCategorySchema), logger, addCategory);
// @ts-ignore
router.get('/category/search', verifyToken, logger, searchCategory);
// @ts-ignore
router.get('/category/:id', verifyToken, logger, showCategory);
// @ts-ignore
router.put('/category/:id', verifyToken, validateData(createCategorySchema), logger, updateCategory);
// @ts-ignore
router.delete('/category/:id', verifyToken, logger, deleteCategory);
// @ts-ignore
router.get('/category/', verifyToken, logger, showCategories);


// // stocks route
// @ts-ignore
// router.get("/search", verifyToken, logger, searchStock);
router.get("/details", verifyToken, logger, getPaginatedProducts);
// @ts-ignore
router.post('/submit', verifyToken, logger, handleInvoiceWithProducts);
// @ts-ignore
router.post('/add', verifyToken, validateData(createProductSchema), logger, addStock);
// @ts-ignore
router.delete("/:productId", verifyToken, logger, deleteStock);
// @ts-ignore
router.put("/:productId", verifyToken, validateData(createProductSchema), logger, updateStock);
// @ts-ignore
router.get("/:productId", verifyToken, logger, getProductById);
// @ts-ignore
router.get('/', verifyToken, logger, getAllStock);
                                                            
export default router;
