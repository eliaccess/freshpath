import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { OpenaiService } from '@/services/openai.service';
import { Submission } from '@/interfaces/images.interface';
import { HttpException } from '@/exceptions/HttpException';
import { ContractsService } from '@/services/contracts.service';
import { CaptchaService } from '@/services/captcha.service';
import { REWARD_AMOUNT } from '@/config';

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
      // await this.contracts.validateSubmission(submissionRequest); // TODO: remove comment
      const foodResult1 = await this.openai.simulateAnalysis(body.image1); // Change with this.openai.validateReceiptImage
      const foodResult2 = await this.openai.simulateAnalysis(body.image2);
      
      if ((foodResult1 == undefined || !('is_food' in (foodResult1 as object))) &&
          (foodResult2 == undefined || !('is_food' in (foodResult2 as object)))) {
        throw new HttpException(500, 'Error validating image');
      }

      const foodResult = foodResult1['is_food'] ? foodResult1 : foodResult2;

      const isFood = foodResult['is_food'];

      if (!isFood) res.status(400).json({validation: foodResult, status: 400})
      else {
        // Estimation of the weight of food saved
            const foodFactor = foodResult['weight_estimation']

            const receiptResult1 = await this.openai.simulateAnalysis(body.image1); // Change with this.openai.validateReceiptImage
            const receiptResult2 = await this.openai.simulateAnalysis(body.image2);

            const receiptResult = receiptResult1['is_receipt'] ? receiptResult1 : receiptResult2;
            const isReceipt = foodResult['is_receipt'];

            if(!isReceipt) res.status(400).json({validation: receiptResult, status: 400})
            else {
              // It is a receipt, then send money
              //await this.contracts.registerSubmission(submissionRequest, foodFactor); // TODO: remove comment
              let message = "Success! " + (parseInt(REWARD_AMOUNT) * foodFactor).toString() + " tokens credited on your account."
              console.log(message)
              res.status(200).json({ validation: message, status: 200});
            }
          }
        } catch (error) {
          next(error);
        }
  };
}
