import PageContainer from "@/components/PageContainer";
import Spinner from "@/components/Spinner";

const LoadingPage = () => {
  return (
    <PageContainer centered>
      <Spinner className="h-12 w-12" />
    </PageContainer>
  );
};

export default LoadingPage;
