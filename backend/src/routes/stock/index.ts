
import { Router } from 'express';
import { addInvoice, deleteInvoice, showInvoice, showInvoices, updateInvoice } from './InvoiceController';
import { validateData } from '../../middlewares/validationMiddleware';
import { createInvoiceSchema } from '../../db/schemas/invoicesSchema';
import { verifyToken } from '../../middlewares/authMiddleware';
import { createLocationSchema } from '../../db/schemas/locationsSchema';
import { addLocation, deleteLocation, showLocation, showLocations, updateLocation } from './LocationController';
import { addRemark, deleteRemark, showRemark, showRemarks, updateRemark } from './RemarksController';
import { createRemarkSchema } from '../../db/schemas/remarksSchema';
import { createCategorySchema } from '../../db/schemas/categoriesSchema';
import { addCategory, deleteCategory, showCategories, showCategory, updateCategory } from './CategoriesController';
import { logger } from '../../middlewares/logMiddleware';
import { createProductSchema } from '../../db/schemas/productsSchema';
import { addStock, deleteStock, getAllStock, searchStock, updateStock } from './StockController';

const router = Router();

// router.post('/addStock', validateData(), addPrivilege);


// // Invoice Routes
// @ts-ignore
router.post('/invoice/add', verifyToken, validateData(createInvoiceSchema), addInvoice);
// @ts-ignore
router.get('/invoice/:id', verifyToken, showInvoice);
router.get('/invoice/', verifyToken, showInvoices);
// @ts-ignore
router.put('/invoice/:id', verifyToken, validateData(createInvoiceSchema), updateInvoice);
// @ts-ignore
router.delete('/invoice/:id', verifyToken, deleteInvoice);

// // Location Routes
// @ts-ignore
router.post('/location/add', verifyToken, validateData(createLocationSchema), addLocation);
// @ts-ignore
router.get('/location/:locationId', verifyToken, showLocation);
// @ts-ignore
router.get('/locations', verifyToken, showLocations);
// @ts-ignore
router.put('/location/update/:locationId', verifyToken, validateData(createLocationSchema), updateLocation);
// @ts-ignore
router.delete('/location/delete/:locationId', verifyToken, deleteLocation);

// // Remarks Routes
// @ts-ignore
router.post('/remark/add', verifyToken, validateData(createRemarkSchema), addRemark);
// @ts-ignore
router.get('/remark/:id', verifyToken, showRemark);
// @ts-ignore
router.get('/remark/', verifyToken, showRemarks);
// @ts-ignore
router.put('/remark/:id', verifyToken, validateData(createRemarkSchema), updateRemark);
// @ts-ignore
router.delete('/remark/:id', verifyToken, deleteRemark);

// // Categories Routes
// @ts-ignore
router.post('/category/add', verifyToken, validateData(createCategorySchema), logger, addCategory);
// @ts-ignore
router.get('/category/:id', verifyToken, logger, showCategory);
// @ts-ignore
router.get('/category/', verifyToken, logger, showCategories);
// @ts-ignore
router.put('/category/:id', verifyToken, validateData(createCategorySchema), logger, updateCategory);
// @ts-ignore
router.delete('/category/:id', verifyToken, logger, deleteCategory);


// // stocks route
// @ts-ignore
router.get('/', verifyToken, logger, getAllStock);
// @ts-ignore
router.post('/', verifyToken, validateData(createProductSchema), logger, addStock);
// @ts-ignore
router.get("/search", verifyToken, logger, searchStock);
// @ts-ignore
router.delete("/:productId", verifyToken, logger, deleteStock);
// @ts-ignore
router.put("/:productId", verifyToken, validateData(createProductSchema), logger, updateStock);

export default router;
