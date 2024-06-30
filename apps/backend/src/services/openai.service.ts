import { HttpException } from '@/exceptions/HttpException';
import { openAIHelper } from '@/server';
import { isBase64Image } from '@/utils/data';
import { Service } from 'typedi';

@Service()
export class OpenaiService {
  public async validateImage(image: string): Promise<unknown> {
    if (!isBase64Image(image)) throw new HttpException(400, 'Invalid image format');

    const prompt = `
                    Analyze the image provided. The image MUST satisfy all of the following criteria:
                        1. It must have as subject a receipt of purchase of at least one product.
                        2. It must not be a screenshot.
                        3. It must include the date of the purchase.
                        4. It must include the name of the store where the purchase was made.
                    Please respond using a JSON object without comments and do not add any other descriptions and comments:
                    {
                    'validityFactor': number, // 0-1, 1 if it satisfies all the criteria, 0 otherwise
                    'descriptionOfAnalysis': string, // indicate your analysis of the image and why it satisfies or not the criteria. The analysis will be shown to the user so make him understand why the image doesn't satisfy the criteria if it doesn't without going into detail on exact criteria. Remember we are rewarding users that drink coffee in a sustainable way.
                    }
                    `;

    const gptResponse = await openAIHelper.askChatGPTAboutImage({
      base64Image: image,
      prompt,
    });

    const responseJSONStr = openAIHelper.getResponseJSONString(gptResponse);

    return openAIHelper.parseChatGPTJSONString(responseJSONStr);
  }

  public async validateReceiptImage(image: string): Promise<unknown> {
    if (!isBase64Image(image)) throw new HttpException(400, 'Invalid image format');

    const prompt = `
                    As input, you will get a picture. Process it and respect the following decision tree:
                    1. Does the picture a food bank donation receipt, or email confirmation?
                    - Yes, then go to step 2
                    - No, then go to step 6
                    2. Does the receipt looks like a legit one?
                    - Yes, then go to step 3
                    - No, then go to step 6
                    3. Is there the name of the food bank, or a company number?
                    - Yes, then go to step 4
                    - No, then go to step 5
                    4. Extract the name of the company as company_name, and / or the company number as company_number, and return this in a json format, with is_receipt as true as well
                    5. Return a json object that contains is_receipt variable as true
                    6. Return a json object that contains is_receipt variable as false
                    `;

    const gptResponse = await openAIHelper.askChatGPTAboutImage({
      base64Image: image,
      prompt,
    });

    const responseJSONStr = openAIHelper.getResponseJSONString(gptResponse);

    return openAIHelper.parseChatGPTJSONString(responseJSONStr);
  }

  public async validateFoodImage(image: string): Promise<unknown> {
    if (!isBase64Image(image)) throw new HttpException(400, 'Invalid image format');

    const prompt = `
                    As input, you will get a picture. Process it and respect the following decision tree:
                    1. Does the picture contain food ?
                    - Yes, then go to step 2
                    - No, then return a json with an is_food variable as false
                    2. Estimate the weight of food in pounds on the picture, then go to step 3
                    3. Return a json object containing an is_food variable as true, and an weight_estimation variable as a float value estimated on step 2.
                    `;

    const gptResponse = await openAIHelper.askChatGPTAboutImage({
      base64Image: image,
      prompt,
    });

    const responseJSONStr = openAIHelper.getResponseJSONString(gptResponse);

    return openAIHelper.parseChatGPTJSONString(responseJSONStr);
  }

  public async simulateAnalysis(image: string): Promise<unknown> {
    const dataMock = {is_receipt: true, is_food: true, weight_estimation: 2, validityFactor: 1}
    return dataMock
  }
}
