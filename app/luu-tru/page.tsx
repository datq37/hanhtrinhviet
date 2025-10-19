import MainHeader from "../components/MainHeader";
import Accommodation from "../sections/Accommodation";
import Footer from "../sections/Footer";

export default function AccommodationPage() {
  return (
    <main className="bg-white">
      <MainHeader variant="dark" />
      <Accommodation />
      <Footer />
    </main>
  );
}
