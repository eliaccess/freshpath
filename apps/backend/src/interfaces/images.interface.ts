export interface Submission {
    _id?: string;
    round?: number;
    address: string;
    captcha: string;
    timestamp: number;
    foodImage?: string;
    receiptImage?: string;
    deviceID?: string;
  }  