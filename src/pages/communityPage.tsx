import { useParams } from "react-router";
import CommunityDisplay from "../components/communityDisplay";


const CommunityPage = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="pt-20">
      <CommunityDisplay communityId={Number(id)} />
    </div>
  );
};

export default CommunityPage;