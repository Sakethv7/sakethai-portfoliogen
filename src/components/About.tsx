import { Brain, Briefcase, GraduationCap, Target } from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Years Experience', value: '2+', icon: Briefcase },
    { label: 'AI Projects', value: '15+', icon: Brain },
    { label: 'Data Processed', value: '50TB+', icon: Target },
    { label: 'Master\'s GPA', value: '4.0', icon: GraduationCap },
  ];

  return (
    <section id="about" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          <span className="gradient-text">About Me</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Bio */}
          <div className="space-y-6 animate-fade-in">
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4 text-primary">Data Scientist</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Currently at <span className="text-primary font-semibold">Johnson & Johnson</span>, I collaborated in building intelligent search systems that help employees find answers from thousands of company documents instantly. Our Conversation Gen AI Application understands context, searches through contracts and policies automatically, and delivers accurate responses—reducing manual look up time and
              evolve with gen ai integrated systems</p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                With a Master's in Data Science from Arizona State University (4.0 GPA) and experience at HP inc., GSTN, and DRDO. I turn complex data problems into practical AI solutions that make work easier and faster.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                My expertise spans AI, RAG systems (Retrievers and Ingestion pipelines), Database Management (Vector, SQL, NoSQL), knowledge graphs, and advanced analytics—delivering insights that drive real business impact.
              </p>
            </div>

            {/* Key Focus Areas */}
            <div className="glass p-6 rounded-2xl">
              <h4 className="text-lg font-semibold mb-3 text-accent">Current Focus</h4>
              <div className="flex flex-wrap gap-2">
                {['AI & RAG Systems', 'Vector Databases', 'Knowledge Graphs', 'SQL & NoSQL', 'Advanced Analytics', 'MLOps'].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm bg-gradient-primary text-primary-foreground rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in [animation-delay:200ms]">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="glass p-6 rounded-2xl text-center hover:scale-105 transition-transform cursor-pointer hover:border-primary/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;