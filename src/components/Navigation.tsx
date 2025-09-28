import { useState, useEffect } from 'react';
import { Menu, X, Code2 } from 'lucide-react';
import { Button } from './ui/button';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Skills', href: '#skills' },
    { label: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all ${scrolled ? 'glass' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }} className="flex items-center gap-2">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">SV</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="hover:bg-primary/10 hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-primary/10"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden glass">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;