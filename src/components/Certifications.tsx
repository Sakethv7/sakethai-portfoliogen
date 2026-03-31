import { Award, ExternalLink } from 'lucide-react';

const Certifications = () => {
  const certifications = [
    {
      title: 'Agentic AI',
      issuer: 'DeepLearning.AI',
      instructor: 'Andrew Ng',
      description: '5-module course covering agentic workflows, reflection design pattern, tool use, practical tips for building agentic AI, and patterns for highly autonomous agents.',
      tags: ['Agentic AI', 'Multi-Agent Systems', 'Tool Use', 'LLM Orchestration'],
      highlight: true,
    },
    {
      title: 'Building with Claude API',
      issuer: 'Anthropic',
      description: 'Hands-on course covering Claude API integration for building production AI applications.',
      tags: ['Claude API', 'Anthropic', 'LLM Applications'],
    },
    {
      title: 'Intro to Agent Skills',
      issuer: 'Anthropic',
      description: 'Introduction to building and deploying agent skills using Anthropic\'s platform and tooling.',
      tags: ['Agent Skills', 'Claude', 'Anthropic'],
    },
    {
      title: 'Intro to Subagents',
      issuer: 'Anthropic',
      description: 'Foundations of subagent architecture — designing, orchestrating, and managing subagents within larger agentic systems.',
      tags: ['Subagents', 'Multi-Agent', 'Orchestration'],
    },
  ];

  return (
    <section id="certifications" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          <span className="gradient-text">Licenses & Certifications</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {certifications.map((cert, index) => (
            <div
              key={index}
              className={`glass p-6 rounded-2xl hover:scale-[1.02] transition-all animate-fade-in ${
                cert.highlight ? 'border border-primary/40 hover:border-primary/70' : 'hover:border-primary/50'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-primary rounded-lg shrink-0 mt-1">
                  <Award className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-primary leading-tight">{cert.title}</h3>
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {cert.issuer}
                    {cert.instructor && (
                      <span className="text-muted-foreground font-normal"> · {cert.instructor}</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{cert.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {cert.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-secondary/50 hover:bg-primary/20 rounded-full transition-colors cursor-default hover:text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
