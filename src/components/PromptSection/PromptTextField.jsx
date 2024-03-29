import React from "react";
import { Flex, Button, Text, AlertDialog } from "@radix-ui/themes";
import { Pencil1Icon } from "@radix-ui/react-icons";
import InputAlertDialog from "./InputAlertDialog";

function PromptTextField(props) {
  return (
    <Flex direction="column" gap="4" className="md:w-[800px]">
      <AlertDialog.Trigger>
        <Button
          size="4"
          variant="soft"
          radius="large"
          className="h-14 rounded-lg"
        >
          <Pencil1Icon className="w-5 h-5 md:w-6 md:h-6 mr-[2px]" />
          <Text className="text-xl md:text-2xl">Submit your piece</Text>
        </Button>
      </AlertDialog.Trigger>
      <InputAlertDialog />
    </Flex>
  );
}

export default PromptTextField;
