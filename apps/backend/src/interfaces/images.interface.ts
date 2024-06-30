export interface Submission {
    _id?: string;
    round?: number;
    address: string;
    captcha: string;
    timestamp: number;
    image1?: string;
    image2?: string;
    deviceID?: string;
  }  