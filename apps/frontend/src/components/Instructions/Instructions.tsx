import { Card, Flex } from "@chakra-ui/react";
import { Step } from "./Step";

const Steps = [
  {
    icon: "/steps/1.svg",
    title: "Donate to your nearest food bank",
    description: "Donate food, reduce waste",
  },
  {
    icon: "/steps/2.svg",
    title: "Upload the receipt",
    description: "Upload your receipt and our AI will verify the transaction.",
  },
  {
    icon: "/steps/4.svg",
    title: "Food!",
    description: "Let us get a peek at your donation!",
  },
  {
    icon: "/steps/3.svg",
    title: "Earn 🤑",
    description: "Earn B3TR for donating food.",
  },
];

export const Instructions = () => {
  return (
    <Card mt={3} w={"full"}>
      <Flex
        p={{ base: 4 }}
        w="100%"
        direction={{ base: "column", md: "row" }}
      >
        {Steps.map((step, index) => (
          <Step key={index} {...step} />
        ))}
      </Flex>
    </Card>
  );
};
