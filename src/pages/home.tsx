import PostList from "../components/postList";


const Home = () => {
    return (
        <div className="pt-10">
            <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r bg-clip-text text-[#85acb5]">
                Recent Posts
            </h2>
            <div>
                <PostList />
            </div>
        </div>
    );
};

export default Home;