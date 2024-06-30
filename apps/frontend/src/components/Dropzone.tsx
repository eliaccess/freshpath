import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { ScanIcon } from "./Icon";
import { blobToBase64, getDeviceId, resizeImage } from "../util";
import { useWallet } from "@vechain/dapp-kit-react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { submitImages } from "../networking";
import { useDisclosure, useSubmission } from "../hooks";

export const Dropzone = () => {
  const { account } = useWallet();

  const { executeRecaptcha } = useGoogleReCaptcha();

  const { setIsLoading, setResponse } = useSubmission();
  const { onOpen } = useDisclosure();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      onFileUpload(acceptedFiles); // Pass the files to the callback
    },
    maxFiles: 2, // Allow only one file
    accept: {
      "image/*": [], // Accept only image files
    },
  });

  const handleCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      alert("Recaptcha not loaded");
      return;
    }

    const token = await executeRecaptcha("submit_receipt");
    return token;
  }, [executeRecaptcha]);

  const onFileUpload = useCallback(
    async (files: File[]) => {
      if (files.length != 2) {
        alert(files.length);
        return;
      }

      if (!account) {
        alert("Please connect your wallet");
        return;
      }

      setIsLoading(true);
      onOpen();

      const file1 = files[0];
      const file2 = files[1];

      const resizedBlob1 = await resizeImage(file1);
      const resizedBlob2 = await resizeImage(file2);
      const base64Image1 = await blobToBase64(resizedBlob1 as Blob);
      const base64Image2 = await blobToBase64(resizedBlob2 as Blob);

      const captcha = await handleCaptchaVerify();

      if (!captcha) {
        alert("Captcha failed, please try again");
        return;
      }

      const deviceID = await getDeviceId();

      try {
        const response = await submitImages({
          address: account,
          captcha,
          deviceID,
          image1: base64Image1,
          image2: base64Image2
        });

        console.log(response);

        setResponse(response);
      } catch (error) {
        alert("Error submitting receipt");
      } finally {
        setIsLoading(false);
      }
    },
    [account, handleCaptchaVerify, onOpen, setIsLoading, setResponse]
  );

  return (
    <VStack w={"full"} mt={3}>
      
        <table>
          <td>
          <Box
              {...getRootProps()}
              p={5}
              padding={10}
              border="2px"
              borderColor={isDragActive ? "green.300" : "gray.300"}
              borderStyle="dashed"
              borderRadius="md"
              bg={isDragActive ? "green.100" : "gray.50"}
              textAlign="center"
              cursor="pointer"
              _hover={{
                borderColor: "green.500",
                bg: "green.50",
              }}
              w={"full"}
              h={"200px"}
              display="flex" // Make the Box a flex container
              alignItems="center" // Align items vertically in the center
              justifyContent="center" // Center content horizontally
            >
            <input {...getInputProps()} />
            <HStack>
              <ScanIcon size={120} color={"gray"} />
              <Text>Upload a picture of your receipt and the food donation</Text>
            </HStack>
            </Box>
            </td>
        </table>
    </VStack>
  );
};
