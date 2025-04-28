import CommunityLIst from "../components/communityLIst";

const CommunitiesPage = () => {
  return (
    <div className="pt-20">
      <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Communities
      </h2>
      <CommunityLIst />
    </div>
  );
};

export default CommunitiesPage;