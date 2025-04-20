import PostList from "../components/postList";


const Home = () => {
    return (
        <div className="pt-10">
            <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-[#85acb5] to-[#b753e9] bg-clip-text text-transparent">
                Recent Posts
            </h2>
            <div>
                <PostList />
            </div>
        </div>
    );
};

export default Home;