import { Mail, Linkedin, Github, Phone, FileText, Send } from 'lucide-react';
import { Button } from './ui/button';

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'sakethv7@gmail.com',
      href: 'mailto:sakethv7@gmail.com',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'sakethvelidimalla',
      href: 'https://www.linkedin.com/in/sakethvelidimalla/',
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'Sakethv7',
      href: 'https://github.com/Sakethv7',
    },
  ];

  return (
    <section id="contact" className="py-20 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          <span className="gradient-text">Get In Touch</span>
        </h2>

        <div className="text-center mb-12">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            I'm always interested in discussing AI innovations, data engineering challenges, 
            or potential collaboration opportunities. Let's connect and build something amazing together!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {contactInfo.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="glass p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-all animate-fade-in hover:border-primary/50 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-3 bg-gradient-primary rounded-lg group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-foreground">{item.value}</p>
                </div>
              </a>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4">
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold glow-primary"
              onClick={() => window.open('mailto:sakethv7@gmail.com', '_blank')}
            >
              <Send className="mr-2 h-5 w-5" />
              Send Email
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 hover:bg-primary/10"
              onClick={() => window.open('https://drive.google.com/file/d/your-resume-id/view', '_blank')}
            >
              <FileText className="mr-2 h-5 w-5" />
              Download Resume
            </Button>
          </div>

          {/* Social links */}
          <div className="flex gap-4 mt-8">
            <a
              href="https://linkedin.com/in/sakethvelidimalla"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 glass rounded-full hover:scale-110 transition-transform hover:bg-primary/10"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/Sakethv7"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 glass rounded-full hover:scale-110 transition-transform hover:bg-primary/10"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="mailto:sakethv7@gmail.com"
              className="p-3 glass rounded-full hover:scale-110 transition-transform hover:bg-primary/10"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;