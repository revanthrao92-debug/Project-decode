import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import DecodeGrid from "@/components/DecodeGrid";
import FollowStrip from "@/components/FollowStrip";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <DecodeGrid />
        <FollowStrip />
      </main>
      <Footer />
    </>
  );
}
