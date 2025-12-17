import { Router } from 'express';
import { ContactController } from '../controllers/ContactController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { createContactValidation } from '../utils/validators';

const router = Router();

// Public routes
router.post('/', createContactValidation, handleValidationErrors, ContactController.createMessage);

// Protected routes (Admin only)
router.get('/', ContactController.getAllMessages);
router.get('/unread-count', authenticateToken, requireAdmin, ContactController.getUnreadCount);
router.get('/:id', authenticateToken, requireAdmin, ContactController.getMessageById);
router.put('/:id/read', authenticateToken, requireAdmin, ContactController.markAsRead);
router.put('/:id/unread', authenticateToken, requireAdmin, ContactController.markAsUnread);
router.delete('/:id', authenticateToken, requireAdmin, ContactController.deleteMessage);

export default router;