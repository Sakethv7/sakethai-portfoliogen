import Hero from '@/components/Hero';
import ProductionWork from '@/components/ProductionWork';
import Projects from '@/components/Projects';
import SystemDesign from '@/components/SystemDesign';
import Skills from '@/components/Skills';
import CurrentFocus from '@/components/CurrentFocus';
import Experience from '@/components/Experience';
import Certifications from '@/components/Certifications';
import Contact from '@/components/Contact';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <Navigation />

      <main className="relative z-10">
        <Hero />
        <ProductionWork />
        <Projects />
        <SystemDesign />
        <Skills />
        <CurrentFocus />
        <Experience />
        <Certifications />
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
