import { SizeIcon } from "@radix-ui/react-icons";
import {
  Box,
  Container,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import { CupertinoPane } from "cupertino-pane";
import DOMPurify from "dompurify";
import { useEffect, useRef, useState } from "react";
import "../components/BottomPane/bottom-pane.css";
import Loading from "../components/Loading";
import QuoteSearchBox from "../components/QuoteSearchBox";
import useAuth from "../hooks/auth/useAuth";
import useFilterLanguage from "../hooks/language/useFilterLanguage";
import useGetLanguage from "../hooks/language/useGetLanguage";
import useGetPostById from "../hooks/post/useGetPostById";
import useDebounceSearch from "../hooks/useDebounceSearch";
import { convertISOTimeToIST } from "../utils/Date";

function LanguageWall(props) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [postId, setPostId] = useState();
  const debounceSearch = useDebounceSearch(searchTerm);
  let paneRef = useRef(null);
  let paneInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize the Cupertino Pane
    paneInstanceRef.current = new CupertinoPane(paneRef.current, {
      // You can customize options here
      darkMode: true,
      backdrop: true,
      draggableOver: true,
      showDraggable: true,
      breaks: {
        top: { enabled: true, height: 600, bounce: true },
      },
    });

    // Show the pane when the component mounts

    // Cleanup on unmount
  }, []);

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleQuoteClick = (postId) => {
    setPostId(postId);
    paneInstanceRef.current.present({ animate: true });
  };

  const { data: post } = useGetPostById({ postId: postId });
  const postHTML = DOMPurify.sanitize(post?.post);

  const {
    data: quotes,
    isLoading: isFetching,
    isFetched: isLanguageFetched,
  } = useGetLanguage({
    userId: user.id,
  });

  const filteredList = useFilterLanguage(quotes, debounceSearch);

  return (
    <Container className="mt-8" size={"2"}>
      <QuoteSearchBox handleSearchChange={handleSearchChange} />
      {isFetching && <Loading message={"Loading..."} />}

      {isLanguageFetched && quotes.length === 0 && (
        <Flex
          align={"center"}
          justify={"center"}
          className="min-h-[50vh] text-gray-500"
        >
          <Heading as="h1">No quotes to show</Heading>
        </Flex>
      )}

      {isLanguageFetched && quotes.length > 0 && (
        <Container className="text-white font-madimiOne" py={{ sm: "8" }}>
          {filteredList.map((quote, index) => (
            <Text
              mr={"3"}
              key={quote.id}
              onClick={() => handleQuoteClick(quote.post_id)}
              className={` ${
                index % 3 === 0 ? "text-3xl" : "text-lg"
              }  hover:bg-radix-green/20 hover:px-[2px] duration-500 transition-all cursor-pointer tracking-wider`}
            >
              {quote.language}
            </Text>
          ))}
        </Container>
      )}

      <div
        ref={paneRef}
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <Box>
          <Box className="flex justify-between border-b">
            <Box className="flex flex-col">
              <Text size={"4"} weight={"bold"} className="font-lora">
                Author: {post?.user?.user_name}
              </Text>
              <Text size={"2"} weight={"medium"} color="gray">
                <span style={{ fontWeight: "bold" }}>Posted On:</span> {"  "}
                {convertISOTimeToIST(post?.created_at || undefined)}
              </Text>
            </Box>
            <Tooltip content="Expand">
              <IconButton
                style={{
                  position: "absolute",
                  marginTop: "10px",
                  right: "20px",
                  color: "darkgray",
                  borderRadius: "50%",
                  background: "#ebebeb",
                  padding: "1px",
                  width: "26px",
                  height: "26px",
                }}
                onClick={() => paneInstanceRef.current.moveToBreak("top")}
              >
                <SizeIcon style={{ color: "#7a7a7e" }} />
              </IconButton>
            </Tooltip>
          </Box>
          <ScrollArea mt={"6"}>
            <div
              dangerouslySetInnerHTML={{ __html: postHTML }}
              style={{ fontFamily: "lora" }}
            ></div>
          </ScrollArea>
        </Box>
      </div>
    </Container>
  );
}

export default LanguageWall;
