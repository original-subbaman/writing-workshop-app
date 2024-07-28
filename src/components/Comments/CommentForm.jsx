import { Flex, TextArea, Button, Text, Theme } from "@radix-ui/themes";
import { useState } from "react";
const CommentForm = ({ handleSubmit, submitLabel }) => {
  const [text, setText] = useState("");
  const isTextAreaDisabled = text.length === 0;

  const onSubmit = (event) => {
    event.preventDefault();
    handleSubmit(text);
    setText("");
  };
  return (
    <Theme accentColor="green">
      <form onSubmit={onSubmit} className="flex flex-col gap-2 text-white">
        <Text size={"4"} weight={"bold"} className="text-white mb-2">
          Leave a comment
        </Text>
        <TextArea
          color="green"
          variant="soft"
          value={text}
          className="h-40  "
          onChange={(event) => setText(event.target.value)}
          placeholder="Add a comment..."
        />
        <div className="flex justify-end">
          <Button
            variant="soft"
            size={"3"}
            type="submit"
            disabled={isTextAreaDisabled}
            className="w-32 font-bold text-2xl"
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Theme>
  );
};

export default CommentForm;
