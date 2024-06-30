import axios from "axios";
import { ReceiptData, ImagesData } from "./type";
import { backendURL } from "../config";

export type Response = {
  validation: {
    validityFactor: number;
    descriptionOfAnalysis: string;
  };
};

export const submitReceipt = async (
  data: ReceiptData
): Promise<Response> => {
  try {
    const response = await axios.post(
      `${backendURL}/submitReceipt`, 
      data
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Error posting data:", error);
    throw error;
  } 
};

export type ResponseImages = {
  validation: string;
  status: number;
};

export const submitImages = async (
  data: ImagesData
): Promise<ResponseImages> => {
  try {
    const response = await axios.post(
      `${backendURL}/submitImages`, 
      data
    );

    return response.data;
  } catch (error: unknown) {
    console.error("Error posting data:", error);
    throw error;
  } 
};
