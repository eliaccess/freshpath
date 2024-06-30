import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { OpenaiService } from '@/services/openai.service';
import { Submission } from '@/interfaces/images.interface';
import { HttpException } from '@/exceptions/HttpException';
import { ContractsService } from '@/services/contracts.service';
import { CaptchaService } from '@/services/captcha.service';

export class SubmissionController {
  public openai = Container.get(OpenaiService);
  public contracts = Container.get(ContractsService);
  public captcha = Container.get(CaptchaService);

  public submitReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body: Omit<Submission, 'timestamp'> = req.body;

      if (!(await this.captcha.validateCaptcha(body.captcha))) {
        throw new HttpException(400, 'Invalid captcha. Please try again.');
      }

      const submissionRequest: Submission = {
        ...body,
        timestamp: Date.now(),
      };

      // Submission validation with smart contract 
      await this.contracts.validateSubmission(submissionRequest);

      const foodResult = await this.openai.simulateAnalysis(body.foodImage);

      if (foodResult == undefined || !('is_food' in (foodResult as object))) {
        throw new HttpException(500, 'Error validating image');
      }

      const isFood = foodResult['is_food'];

      if (!isFood) res.status(400).json({validation: foodResult})
      else {
        // Estimation of the weight of food saved
        const foodFactor = foodResult['weight_estimation']

        const receiptResult = await this.openai.simulateAnalysis(body.receiptImage);
        const isReceipt = foodResult['is_receipt'];

        if(!isReceipt) res.status(400).json({validation: receiptResult})
        else {
          // It is a receipt, then send money
          await this.contracts.registerSubmission(submissionRequest);
          res.status(200).json({ validation: "Success! Tokens credited on your account." });
        }
      }
    } catch (error) {
      next(error);
    }
  };
}
