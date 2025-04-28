import CreatePost from "../components/createPost";


const CreatePostPage = () => {
    return (
        <div className="pt-20">
            <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r bg-clip-text text-[#85acb5]">
                Create New Post
            </h2>
            <CreatePost />
        </div>
    );
};

export default CreatePostPage;