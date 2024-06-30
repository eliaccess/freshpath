import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { SubmissionController } from '@/controllers/images.controller';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { SubmitDto } from '@/dtos/images.dto';

export class ImagesRoute implements Routes {
  public router = Router();
  public submission = new SubmissionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`/submitImages`, ValidationMiddleware(SubmitDto), this.submission.submitReceipt);
  }
}
