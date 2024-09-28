import React from "react";
import { Card, Text, Flex, Box } from "@radix-ui/themes";
import { HeartIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { getRandomDimensions } from "../../utils/Helper";
function PostButton({ children }) {
  return (
    <button className="bg-transparent duration-300 transition-all hover:bg-radix-grass flex items-center justify-center w-12 h-12">
      {children}
    </button>
  );
}
function Post({ content, author, width, height }) {
  return (
    <Card
      className={`relative block
      w-[${width}] h-[${height}]
       text-white cursor-pointer drop-shadow-lg decoration-slate-200 hover:border-2 hover:border-radix-green hover:scale-105 duration-300 transition-all`}
      style={{ backgroundColor: "#191919" }}
    >
      <Box className="bg-dark-light p-4 z-0 max-h-[300px]">
        <Text
          className="cursor-pointer"
          onClick={(event) => console.log(event)}
          onMouseUp={(event) => console.log(event.type)}
          wrap={"wrap"}
        >
          {content}
        </Text>
      </Box>
      <Box className="bg-white bg-opacity-0 absolute inset-0 opacity-0 hover:opacity-100 duration-500 trasition-all rounded-b-lg text-white z-10">
        <Flex
          className="bg-radix-green bottom-0 absolute inset-x-0"
          justify="between"
          align="center"
        >
          <Text size="4" className="pl-4 py-2">
            {`@${author}`}
          </Text>
        </Flex>
      </Box>
    </Card>
  );
}

export default Post;
