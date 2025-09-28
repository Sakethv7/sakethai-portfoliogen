import { useEffect, useState } from 'react';
import { ChevronDown, Terminal, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const Hero = () => {
  const [text, setText] = useState('');
  const fullText = 'AI Data Engineer';
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-mesh animate-gradient-shift" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Terminal-style header */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 glass rounded-full animate-fade-in">
          <Terminal className="w-4 h-4 text-neon" />
          <span className="text-sm font-mono text-muted-foreground">sakethv7@portfolio:~$</span>
          <span className="text-sm font-mono text-neon">whoami</span>
        </div>

        {/* Name with gradient */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-up">
          <span className="gradient-text">Saketh Velidimalla</span>
        </h1>

        {/* Typing animation */}
        <div className="h-12 mb-8">
          <p className="text-2xl md:text-3xl font-mono text-muted-foreground animate-fade-in">
            {text}
            {showCursor && <span className="text-neon">|</span>}
          </p>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in opacity-0 [animation-delay:1s] [animation-fill-mode:forwards]">
          Specializing in generative AI solutions, RAG implementations, and enterprise chatbot development. 
          Building the future with Python, AWS, and cutting-edge ML technologies.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-16 animate-fade-in opacity-0 [animation-delay:1.5s] [animation-fill-mode:forwards]">
          <Button
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 text-lg glow-primary transition-all hover:scale-105"
            onClick={() => scrollToSection('projects')}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            View Projects
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary/30 hover:bg-primary/10 hover:border-primary px-8 py-6 text-lg transition-all hover:scale-105"
            onClick={() => scrollToSection('contact')}
          >
            Get In Touch
          </Button>
        </div>

        {/* Scroll indicator */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
          onClick={() => scrollToSection('about')}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </div>

        {/* Floating badges */}
        <div className="absolute -top-20 left-10 animate-float">
          <div className="glass px-4 py-2 rounded-full">
            <span className="text-sm font-mono text-neon">Gen AI</span>
          </div>
        </div>
        <div className="absolute -top-10 right-20 animate-float [animation-delay:1s]">
          <div className="glass px-4 py-2 rounded-full">
            <span className="text-sm font-mono text-cyber">RAG</span>
          </div>
        </div>
        <div className="absolute bottom-32 -left-10 animate-float [animation-delay:2s]">
          <div className="glass px-4 py-2 rounded-full">
            <span className="text-sm font-mono text-accent">AWS</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;