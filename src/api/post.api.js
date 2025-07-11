import { endOfDay, formatISO } from "date-fns";
import supabase from "../supabase_client/create_client";

export async function fetchPosts({ date }) {
  const { data } = await supabase
    .from("post")
    .select("*, user (id, name, user_name)")
    // .gte("created_at", formatISO(startOfDay(date)))
    .lte("created_at", formatISO(endOfDay(date)))
    .order("created_at", { ascending: false });
  return data;
}

export async function fetchPostsPagination({ pageParam }) {
  const limit = 5;
  let query = supabase
    .from("post")
    .select("*, user (id, name, user_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (pageParam) {
    query = query.lt("created_at", pageParam);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Pagination error:", error);
    throw new Error(error.message);
  }

  const nextCursor =
    data && data.length === limit
      ? data[data.length - 1].created_at
      : undefined;

  return {
    data: data ?? [],
    nextCursor,
    hasMore: nextCursor !== undefined,
  };
}

export async function fetchPostsById({ id, from, to, search }) {
  const { data } = await supabase
    .from("post")
    .select("*, user (id, name, user_name)")
    .eq("user_id", id)
    .ilike("post", `%${search}%`)
    .gte("created_at", from)
    .lte("created_at", to);
  return data;
}

export async function getPostById(id) {
  const { data } = await supabase
    .from("post")
    .select("*, user (id, name, user_name)")
    .eq("id", id)
    .single();
  return data;
}

export async function fetchPostAndLikeStatus(postId, userId) {
  const { data: post, error: postError } = await supabase
    .from("post")
    .select("*, user (id, name, user_name)")
    .eq("id", postId)
    .single();

  if (postError) {
    console.log("Error fetching posts: ", postError);
    return;
  }

  // Checking if user has liked the post
  const { data: like, error: likeError } = await supabase
    .from("likes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (likeError && likeError.code !== "PGRST116") {
    // PGRST116 indicates no rows were found, which is expected if the user hasn't liked the post
    console.error("Error checking like status:", likeError);
    return;
  }

  const hasLiked = like !== null;

  return { post, hasLiked };
}

export async function addPost(post, userId) {
  const { data, error } = await supabase.from("post_comment").insert([
    {
      post: post,
      user_id: userId,
    },
  ]);

  if (error) throw error;

  return data;
}

/**
 * Adds a comment to a post in the database.
 *
 * @param {string} postId - The UUID of the post being commented on.
 * @param {string} userId - The UUID of the user making the comment.
 * @param {string} comment - The content of the comment.
 * @returns {Promise<object>} - Returns the inserted comment object.
 * @throws {Error} - Throws an error if input validation fails or if the database insert operation fails.
 */
export async function postComment(postId, userId, comment) {
  if (!postId || !userId || !comment) {
    throw new Error("Missing postId or userId or comment");
  }
  const { data, error } = await supabase
    .from("post_comment")
    .insert([
      {
        user_id: userId,
        post_id: postId,
        comment: comment,
      },
    ])
    .select();

  if (error) {
    throw new Error(error.message || "Failed to post comment");
  }

  return data;
}

export async function loadComments(postId) {
  if (!postId) {
    throw new Error("Missing postId");
  }

  const { data, error } = await supabase
    .from("post_comment")
    .select("*, user(id, name, user_name)")
    .eq("post_id", postId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to load comments");
  }

  return data;
}

export async function reportComment(
  postId,
  commentId,
  userId,
  reason,
  additionalInfo
) {
  if (!postId || !commentId || !userId || !reason) {
    throw new Error("Missing postId, commentId, userId or reason");
  }
  const { reportError } = await supabase
    .from("comment_report")
    .insert([
      {
        post_id: postId,
        comment_id: commentId,
        user_id: userId,
        reason: reason,
        additional_info: additionalInfo,
      },
    ])
    .select();

  const { commentError } = await supabase
    .from("post_comment")
    .update({ is_hidden: true })
    .eq("id", commentId);

  if (reportError || commentError) {
    throw new Error(error.message || "Failed to report comment");
  }
}

/**
 * Reports a post by inserting a report record into the 'post_report' table in Supabase.
 * only if the same user has not already reported the same post.
 *
 * @param {string} postId - The ID of the post being reported.
 * @param {string} userId - The ID of the user reporting the post.
 * @param {string} reason - The reason for reporting the post (e.g., spam, offensive content).
 * @param {string} [additionalInfo] - Optional additional information about the report.
 * @throws Will throw an error if required parameters are missing or if the database operation fails.
 */
export async function reportPost(postId, userId, reason, additionalInfo) {
  if (!postId || !userId || !reason) {
    throw new Error("Missing postId, commentId, userId or reason");
  }

  // Check if a report already exists for the same user and post
  const { data: existingReports, error: fetchError } = await supabase
    .from("post_report")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId);

  if (fetchError) {
    throw new Error(
      fetchError.message || "Failed to check for existing report"
    );
  }

  let reportError = null;
  if (existingReports.length > 0) {
    const { error: updateError } = await supabase
      .from("post_report")
      .update({
        reason: reason,
        additional_info: additionalInfo,
      })
      .eq("post_id", postId)
      .eq("user_id", userId);

    reportError = updateError;
  } else {
    const { error: insertError } = await supabase
      .from("post_report")
      .insert([
        {
          post_id: postId,
          user_id: userId,
          reason: reason,
          additional_info: additionalInfo,
        },
      ])
      .select();

    reportError = insertError;
  }

  if (reportError) {
    throw new Error(error.message || "Failed to report post");
  }
}

export async function deleteComment(commentId) {
  if (!commentId) {
    throw new Error("Missing commentId");
  }
  const { error } = await supabase
    .from("post_comment")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw new Error(error.message || "Failed to delete comment");
  }

  return true;
}
