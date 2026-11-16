import Intro from "@/components/Intro";
import Masthead from "@/components/Masthead";
import GlobeStage from "@/components/GlobeStage";
import NewsGrid from "@/components/NewsGrid";
import FollowStrip from "@/components/FollowStrip";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Intro />
      <Masthead />
      <main className="flex-1">
        <GlobeStage />
        <NewsGrid />
        <FollowStrip />
      </main>
      <Footer />
    </>
  );
}
