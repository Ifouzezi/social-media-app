import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

// Define the props expected by the LikeButton component
interface Props {
  postId: number;
}

// Define the structure of a Vote object
interface Vote {
  id: number;
  post_id: number;
  user_id: string;
  vote: number; // 1 for like, -1 for dislike
}

// Function to handle voting logic (like/dislike or undo vote)
const vote = async (voteValue: number, postId: number, userId: string) => {
  // Check if the user has already voted on this post
  const { data: existingVote } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingVote) {
    // If the same vote is clicked again, remove the vote (toggle off)
    if (existingVote.vote === voteValue) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("id", existingVote.id);

      if (error) throw new Error(error.message);
    } else {
      // Otherwise, update the vote value
      const { error } = await supabase
        .from("votes")
        .update({ vote: voteValue })
        .eq("id", existingVote.id);

      if (error) throw new Error(error.message);
    }
  } else {
    // If no existing vote, insert a new one
    const { error } = await supabase
      .from("votes")
      .insert({ post_id: postId, user_id: userId, vote: voteValue });
    if (error) throw new Error(error.message);
  }
};

// Fetch all votes for a specific post
const fetchVotes = async (postId: number): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId);

  if (error) throw new Error(error.message);
  return data as Vote[];
};

// LikeButton component that allows users to like or dislike a post
const LikeButton = ({ postId }: Props) => {
  const { user } = useAuth(); // Get current logged-in user

  const queryClient = useQueryClient(); // For invalidating and refetching queries

  // Query to fetch votes for the given post
  const {
    data: votes,
    isLoading,
    error,
  } = useQuery<Vote[], Error>({
    queryKey: ["votes", postId],
    queryFn: () => fetchVotes(postId),
    refetchInterval: 5000, // Auto-refetch every 5 seconds
  });

  // Mutation for handling user voting action
  const { mutate } = useMutation({
    mutationFn: (voteValue: number) => {
      if (!user) throw new Error("You must be logged in to Vote!");
      return vote(voteValue, postId, user.id);
    },
    onSuccess: () => {
      // Refresh vote data after successful mutation
      queryClient.invalidateQueries({ queryKey: ["votes", postId] });
    },
  });

  if (isLoading) {
    return <div> Loading votes...</div>; // Show loading message
  }

  if (error) {
    return <div> Error: {error.message}</div>; // Show error message
  }

  // Count likes and dislikes
  const likes = votes?.filter((v) => v.vote === 1).length || 0;
  const dislikes = votes?.filter((v) => v.vote === -1).length || 0;

  // Determine the current user's vote
  const userVote = votes?.find((v) => v.user_id === user?.id)?.vote;

  return (
    <div className="flex items-center space-x-4 my-4">
      {/* Like Button */}
      <button
        onClick={() => mutate(1)}
        className={`px-3 py-1 cursor-pointer rounded transition-colors duration-150 ${
          userVote === 1 ? "bg-green-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        👍 {likes}
      </button>
      {/* Dislike Button */}
      <button
        onClick={() => mutate(-1)}
        className={`px-3 py-1 cursor-pointer rounded transition-colors duration-150 ${
          userVote === -1 ? "bg-red-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        👎 {dislikes}
      </button>
    </div>
  );
};

export default LikeButton;
