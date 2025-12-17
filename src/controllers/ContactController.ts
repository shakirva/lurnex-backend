import { Request, Response, NextFunction } from 'express';
import { ContactModel } from '../models/Contact';
import { ApiResponse, CreateContactRequest, PaginationParams } from '../types';

export class ContactController {
  static async createMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const messageData: CreateContactRequest = req.body;
      const message = await ContactModel.create(messageData);

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async getAllMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const unreadOnly = req.query.unread === 'true';

      const pagination: PaginationParams = { page, limit, offset };
      const { messages, total } = await ContactModel.findAll(pagination, unreadOnly);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        message: 'Messages retrieved successfully',
        data: messages,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async getMessageById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        } as ApiResponse);
        return;
      }

      const messageId = parseInt(req.params.id);
      const message = await ContactModel.findById(messageId);

      if (!message) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Message retrieved successfully',
        data: message
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        } as ApiResponse);
        return;
      }

      const messageId = parseInt(req.params.id);
      const updatedMessage = await ContactModel.markAsRead(messageId);

      if (!updatedMessage) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Message marked as read',
        data: updatedMessage
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async markAsUnread(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        } as ApiResponse);
        return;
      }

      const messageId = parseInt(req.params.id);
      const updatedMessage = await ContactModel.markAsUnread(messageId);

      if (!updatedMessage) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Message marked as unread',
        data: updatedMessage
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        } as ApiResponse);
        return;
      }

      const messageId = parseInt(req.params.id);
      const success = await ContactModel.delete(messageId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Message deleted successfully'
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        } as ApiResponse);
        return;
      }

      const count = await ContactModel.getUnreadCount();

      res.json({
        success: true,
        message: 'Unread count retrieved successfully',
        data: { count }
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }
}