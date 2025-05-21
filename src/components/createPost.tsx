import { ChangeEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { Community, fetchCommunities } from "./communityLIst";

// Define the expected structure of the post data
interface PostInput {
  title: string;
  content: string;
  avatar_url: string | null;
  community_id?: number | null;
}

// Function to upload image to Supabase and insert the post into the database
const createPost = async (post: PostInput, imageFile: File) => {
  // Generate a unique file path for the image
  const filePath = `${post.title}-${Date.now()}-${imageFile.name}`;

  // Upload image to Supabase Storage (bucket: "post-images")
  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(filePath, imageFile);

  if (uploadError) throw new Error(uploadError.message); // Throw if upload fails

  // Get the public URL of the uploaded image
  const { data: publicURLData } = supabase.storage
    .from("post-images")
    .getPublicUrl(filePath);

  // Insert the post along with the image URL into the "posts" table
  const { data, error } = await supabase
    .from("posts")
    .insert({ ...post, image_url: publicURLData.publicUrl });

  if (error) throw new Error(error.message); // Throw if DB insert fails

  return data; // Return inserted data (optional)
};

const CreatePost = () => {
  // State for form inputs
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const { user } = useAuth(); // Get user data from Auth context
  const [communityId, setCommunityId] = useState<number | null>(null);

  const { data: communities } = useQuery<Community[], Error>({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  // State for storing selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mutation using React Query to handle post creation
  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: { post: PostInput; imageFile: File }) => {
      return createPost(data.post, data.imageFile);
    },
  });

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent page reload
    if (!selectedFile) return; // Do not submit if no file selected
    mutate({
      post: {
        title,
        content,
        avatar_url: user?.user_metadata.avatar_url || null,
        community_id: communityId,
      },
      imageFile: selectedFile,
    });
  };

  // State for community ID
  const handleCommunityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCommunityId(value ? Number(value) : null);
  };

  // Handle image file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]); // Save selected file to state
    }
  };

  return (
    <div className="text-white ">
      {/* Post creation form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        <div>
          <label htmlFor="title" className="block mb-2 font-medium">
            Title
          </label>
          <input
            type="text"
            id="title"
            //   value={title}
            onChange={(e) => setTitle(e.target.value)} // Update title state on change
            className="w-full border border-white/10 bg-transparent p-2 rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block mb-2 font-medium">
            Content
          </label>
          <textarea
            id="content"
            //   value={content}
            onChange={(e) => setContent(e.target.value)} // Update content state on change
            className="w-full border border-white/10 bg-transparent p-2 rounded"
            rows={5}
            required
          />
        </div>

        {/* Community selection dropdown */}
        <div>
          <label> Select Community</label>
          <select id="community" onChange={handleCommunityChange}>
            <option value={""}> -- Choose a Community -- </option>
            {communities?.map((community, key) => (
              <option key={key} value={community.id}>
                {community.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="image" className="block mb-2 font-medium">
            Upload Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange} // Call file change handler on input
            className="w-full text-gray-200"
          />
        </div>

        <button
          type="submit"
          className="bg-[#0ca2c4] hover:bg-[#85acb5] px-4 py-2 rounded transition-colors duration-200"
        >
          {isPending ? "Creating..." : "Create Post"} {/* Show loading state */}
        </button>

        {/* Display error if post creation fails */}
        {isError && <p className="text-red-500"> Error creating post.</p>}
      </form>
    </div>
  );
};

export default CreatePost;
