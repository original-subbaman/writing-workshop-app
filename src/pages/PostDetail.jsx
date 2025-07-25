import { AlertDialogPortal } from "@radix-ui/react-alert-dialog";
import { HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons";
import {
  AlertDialogRoot,
  Box,
  Button,
  Container,
  Heading,
  Section,
  Text,
} from "@radix-ui/themes";
import DOMPurify from "dompurify";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import CommentSection from "../components/Comments/CommentSection";
import ReportPostDialog from "../components/PostDetail/ReportPostDialog";
import ResponseSnackbar from "../components/ResponseSnackbar";
import ScrollToTop from "../components/ScrollToTop";
import SelectedText from "../components/SelectedText";
import useAuth from "../hooks/auth/useAuth";
import useRecordLanguage from "../hooks/language/useRecordLanguage";
import useNotifyPostLike from "../hooks/notification/useNotifyPostLike";
import useRemovePostNotification from "../hooks/notification/useRemovePostNotification";
import useGetPost from "../hooks/post/useGetPost";
import useReportPost from "../hooks/post/useReportPost";
import UseToggleLikeOnPost from "../hooks/post/useToggleLikeOnPost";
import { actionTypes } from "../reducers/responseReducer";
import { setOpenReportPost } from "../slice/postDetailSlice";
import { resetResponse, setError, setSuccess } from "../slice/responseSlice";
import { convertISOTimestamp } from "../utils/Date";

export default function PostDetail() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  let { id } = useParams();

  const openReportPost = useSelector(
    (state) => state.postDetail.openReportPost
  );
  const { success, error, message } = useSelector((state) => state.response);
  const dispatch = useDispatch();
  const [selectedText, setSelectedText] = useState();

  const closeAlert = () => dispatch(resetResponse());

  const { mutate: toggleLike, isPending: isUpdating } = UseToggleLikeOnPost({
    onSuccess: (data, variables, context) => {
      const { success, isLiked } = data;

      if (success && isLiked) {
        notifyLikePost({
          postId: id,
          recipientId: authorId,
          senderId: user.id,
          message: `@${user.user_name} liked your post`,
        });
      }

      if (success && !isLiked) {
        rmPostNotification({
          postId: id,
          recipientId: authorId,
          senderId: user.id,
        });
      }
    },
  });

  const { mutate: recordLanguage } = useRecordLanguage({
    onSuccess: (data) => dispatch(setSuccess("Language captured successfully")),
    onError: (error) => dispatch(setError("Error capturing language")),
  });

  const { mutate: reportPost } = useReportPost(
    () => dispatch(setSuccess("Post reported successfully")),
    (error) => {
      dispatch(setError(error?.message || "Error reporting post"));
    }
  );

  const { mutate: notifyLikePost } = useNotifyPostLike(
    () => {
      console.log("post notified");
    },
    (error) => {
      console.log(error);
    }
  );

  const { mutate: rmPostNotification } = useRemovePostNotification(
    () => {
      console.log("rm post notified");
    },
    (error) => {
      console.log(error);
    }
  );

  const { data } = useGetPost({
    postId: id,
    userId: user?.id,
    isUpdating: false,
    staleTime: 0,
  });

  const handleCaptureLanguage = () => {
    if (isAuthenticated) {
      recordLanguage({
        language: selectedText,
        postId: id,
        userId: user?.id, // replace by actual user id
      });
      return;
    }
    navigate("/login");
  };

  function getSelectionText() {
    const selection = window.getSelection().toString();
    if (selection) {
      setSelectedText(selection);
    }
  }

  async function handleLikePost(postId, userId) {
    if (isAuthenticated) {
      toggleLike({ postId, userId: userId });
      return;
    }
    navigate("/login");
  }

  function handleReportClick() {
    if (isAuthenticated) {
      dispatch(setOpenReportPost(true));
    }
    navigate("/login");
  }

  const author = data?.post.user.user_name;
  const authorId = data?.post.user.id;
  const createdAt = data?.post.created_at;
  const post = DOMPurify.sanitize(data?.post.post);
  const hasLiked = data?.hasLiked;

  return (
    <>
      <ScrollToTop />
      {/* Report Post Dialog */}
      <AlertDialogRoot open={openReportPost}>
        <AlertDialogPortal>
          <ReportPostDialog
            onClose={() => dispatch(setOpenReportPost(false))}
            onConfirm={reportPost}
            postId={id}
            userId={user?.id}
          />
        </AlertDialogPortal>
      </AlertDialogRoot>
      {/* Error Deleting Message */}
      <ResponseSnackbar
        open={error}
        autoHideDuration={3000}
        onClose={closeAlert}
        severity={"error"}
        message={message}
      />
      {/* Success Deleting Message */}
      <ResponseSnackbar
        open={success}
        autoHideDuration={3000}
        onClose={closeAlert}
        severity={"success"}
        message={message}
      />
      <Container>
        <Section size={"1"} className="text-center">
          <Heading className="text-white">{author}</Heading>
          <Text className="text-gray-500">
            Posted On: {convertISOTimestamp(createdAt)}
          </Text>
        </Section>
        <Section className="rounded-md px-8 bg-gray-50 bg-opacity-5 mb-2">
          <SelectedText
            selectedText={selectedText}
            captureLanguage={handleCaptureLanguage}
          />
          <Box
            dangerouslySetInnerHTML={{ __html: post }}
            onMouseMove={(event) => getSelectionText()}
            onMouseUp={(event) => window.getSelection().removeAllRanges()}
            className="text-white text-start font-primary font-extralight whitespace-pre-line"
          />
        </Section>
        <Box className="flex items-end justify-end   gap-4 my-0  max-h-['10px']">
          {/* Like Button */}
          <Button
            className="cursor-pointer"
            onClick={() => handleLikePost(id, user?.id)}
          >
            {hasLiked ? <HeartFilledIcon /> : <HeartIcon />}
            Like
          </Button>
          {/* Report Button */}
          <Button
            className="cursor-pointer"
            color="gray"
            onClick={handleReportClick}
          >
            Report
          </Button>
        </Box>
        <Box className="mb-8">
          <CommentSection
            postId={id}
            onPostComment={() =>
              dispatch({
                type: actionTypes.SET_SUCCESS,
                payload: "Comment posted!",
              })
            }
            onPostCommentError={() =>
              dispatch({
                type: actionTypes.SET_ERROR,
                payload: "Posting comment failed",
              })
            }
          />
        </Box>
      </Container>
    </>
  );
}
