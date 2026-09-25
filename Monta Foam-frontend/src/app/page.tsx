import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Hero from "@/components/sections/Hero";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import ServicesPreview from "@/components/sections/ServicesPreview";
import Gallery from "@/components/sections/Gallery";
import Testimonials from "@/components/sections/Testimonials";
import ContactCta from "@/components/sections/ContactCta";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WhyChooseUs />
        <ServicesPreview />
        <Gallery />
        <Testimonials />
        <ContactCta />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
