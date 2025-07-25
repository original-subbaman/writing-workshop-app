import { Box, Container } from "@radix-ui/themes";
import dayjs from "dayjs";
import { useState } from "react";
import DateFilter from "../components/MyPosts/DateFilter";
import PostSection from "../components/PostSection/PostSection";
import QuoteSearchBox from "../components/QuoteSearchBox";
import useAuth from "../hooks/auth/useAuth";
import useGetUserPosts from "../hooks/post/useGetUserPosts";
import useDebounceSearch from "../hooks/useDebounceSearch";
const MyPosts = () => {
  const { user } = useAuth();
  const [filterDate, setFilterDate] = useState({
    from: dayjs().startOf("year"),
    to: dayjs(),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const debounceSearch = useDebounceSearch(searchTerm);

  const { data: posts } = useGetUserPosts({
    id: user.id,
    from: filterDate.from,
    to: filterDate.to,
    search: debounceSearch,
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <Container my={"8"}>
        <Box className="flex-1">
          <QuoteSearchBox handleSearchChange={handleSearchChange} size="2" />
        </Box>
        <DateFilter
          from={filterDate.from}
          to={filterDate.to}
          setFilterDate={setFilterDate}
        />
      </Container>
      <PostSection posts={posts} />
    </>
  );
};

export default MyPosts;
