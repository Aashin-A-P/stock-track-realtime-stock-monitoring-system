import { Router } from 'express';
import { addInvoice, deleteAllProductsByInvoiceId, deleteInvoice, showInvoice, showInvoices, updateInvoice } from './InvoiceController';
import { validateData } from '../../middlewares/validationMiddleware';
import { createInvoiceSchema } from '../../db/schemas/invoicesSchema';
import { verifyToken } from '../../middlewares/authMiddleware';
import { createLocationSchema } from '../../db/schemas/locationsSchema';
import { addLocation, deleteLocation, searchLocation, showLocation, showLocations, updateLocation } from './LocationController';
import { addStatus, deleteStatus, searchStatus, showStatus, showStatuses, updateStatus } from './statusController';
import { createStatusSchema } from '../../db/schemas/statusSchema';
import { createCategorySchema } from '../../db/schemas/categoriesSchema';
import { addCategory, deleteCategory, searchCategory, showCategories, showCategory, updateCategory } from './CategoriesController';
import { logger } from '../../middlewares/logMiddleware';
import { createProductSchema } from '../../db/schemas/productsSchema';
import { addStock, deleteStock, getAllStock, getPaginatedProducts, handleInvoiceWithProducts, getProductById, getReportData, updateStock } from './StockController';
import { hasPrivilege,loadUserPrivileges } from '../../middlewares/privilegeMiddleware';

const router = Router();

// // Invoice Routes
// @ts-ignore
router.post('/invoice/add', verifyToken, validateData(createInvoiceSchema), logger, addInvoice);
// @ts-ignore
router.get('/invoice/:id', verifyToken, logger, showInvoice);
// @ts-ignore
router.put('/invoice/:id', verifyToken, validateData(createInvoiceSchema), logger, updateInvoice);
// @ts-ignore
router.delete('/invoice/:id', verifyToken, logger, deleteInvoice);
// @ts-ignore
router.delete('/invoice/products/:id', verifyToken, logger, deleteAllProductsByInvoiceId);
router.get('/invoice/', verifyToken, logger, showInvoices);

// // Location Routes
// @ts-ignore
router.post('/location/add', verifyToken, validateData(createLocationSchema), logger, addLocation);
// @ts-ignore
router.get('/location/search', verifyToken, logger, searchLocation);
// @ts-ignore
router.put('/location/update/:locationId', verifyToken, validateData(createLocationSchema), logger, updateLocation);
// @ts-ignore
router.delete('/location/delete/:locationId', verifyToken, logger, deleteLocation);
// @ts-ignore
router.get('/location/:locationId', verifyToken, logger, showLocation);
// @ts-ignore
router.get('/locations', verifyToken, logger, showLocations);

// // Status Routes (previously referred to as Remarks in comments)
// @ts-ignore
router.post('/status/add', verifyToken, validateData(createStatusSchema), logger, addStatus);
// @ts-ignore
router.get('/status/search', verifyToken, logger, searchStatus);
// @ts-ignore
router.get('/status/:id', verifyToken, logger, showStatus);
// @ts-ignore
router.put('/status/:id', verifyToken, validateData(createStatusSchema), logger, updateStatus);
// @ts-ignore
router.delete('/status/:id', verifyToken, logger, deleteStatus);
// @ts-ignore
router.get('/status/', verifyToken, logger, showStatuses);

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
// router.get("/search", verifyToken, logger, searchStock); // This line was commented out, keeping it as is.
router.get("/details", verifyToken,loadUserPrivileges,hasPrivilege('read_stock'), logger, getPaginatedProducts);
// @ts-ignore
router.post('/submit', verifyToken, loadUserPrivileges,hasPrivilege('create_stock'), logger, handleInvoiceWithProducts);
// @ts-ignore
router.post('/add', verifyToken,loadUserPrivileges, hasPrivilege('create_stock'),validateData(createProductSchema), logger, addStock);
// @ts-ignore
router.get('/report', logger, getReportData); // Added logger here. Note: verifyToken was not present.
// @ts-ignore
router.delete("/:productId", verifyToken,loadUserPrivileges,hasPrivilege('delete_stock'), logger, deleteStock);
// @ts-ignore
router.put("/:productId",verifyToken,loadUserPrivileges,hasPrivilege("update_stock"),validateData(createProductSchema),logger,updateStock);
// @ts-ignore
router.get("/:productId", verifyToken,loadUserPrivileges, hasPrivilege('read_stock'), logger, getProductById);
// @ts-ignore
router.get('/', verifyToken,loadUserPrivileges, hasPrivilege('read_stock'), logger, getAllStock);
                                                            
export default router;