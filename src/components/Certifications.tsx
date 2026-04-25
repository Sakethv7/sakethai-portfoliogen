import { Award, Clock } from 'lucide-react';

const Certifications = () => {
  const inProgress = [
    {
      title: 'LangGraph Fundamentals',
      issuer: 'DeepLearning.AI',
      tags: ['LangGraph', 'Agentic AI', 'Stateful Agents'],
    },
    {
      title: 'LLM Engineering — Foundations & Production Tracks',
      issuer: 'Ed Donner',
      tags: ['LLM Engineering', 'Production AI', 'LLM Systems'],
    },
    {
      title: 'AWS Certified Machine Learning Specialty',
      issuer: 'Amazon Web Services',
      tags: ['AWS', 'Machine Learning', 'Cloud AI'],
    },
    {
      title: 'Databricks Generative AI Engineer Associate',
      issuer: 'Databricks',
      tags: ['Databricks', 'GenAI', 'Lakehouse'],
    },
  ];

  const completed = [
    {
      title: 'Agentic AI',
      issuer: 'DeepLearning.AI',
      instructor: 'Andrew Ng',
      description: '5-course specialization covering agentic workflows, reflection patterns, tool use, and highly autonomous agent design.',
      tags: ['Agentic AI', 'Multi-Agent Systems', 'Tool Use', 'LLM Orchestration'],
      highlight: true,
    },
    {
      title: 'Claude Code in Action',
      issuer: 'Anthropic',
      description: 'Hands-on course covering Claude Code CLI, hooks, MCP servers, and agentic coding workflows.',
      tags: ['Claude Code', 'Agentic Coding', 'MCP'],
    },
    {
      title: 'Building with Claude API',
      issuer: 'Anthropic',
      description: 'Hands-on course covering Claude API integration for building production AI applications.',
      tags: ['Claude API', 'Anthropic', 'LLM Applications'],
    },
    {
      title: 'Intro to Agent Skills & Subagents',
      issuer: 'Anthropic',
      description: 'Foundations of agent skill design, subagent orchestration, and managing multi-agent systems within Anthropic\'s platform.',
      tags: ['Agent Skills', 'Subagents', 'Multi-Agent'],
    },
    {
      title: 'Claude 101',
      issuer: 'Anthropic',
      description: 'Foundational course on working with Claude, prompt design, and effective AI collaboration.',
      tags: ['Claude', 'Prompt Engineering', 'Anthropic'],
    },
    {
      title: 'AI Fluency Framework',
      issuer: 'Anthropic',
      description: 'Framework for understanding and applying AI capabilities across different domains and use cases.',
      tags: ['AI Fluency', 'Applied AI', 'Anthropic'],
    },
  ];

  return (
    <section id="certifications" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          <span className="gradient-text">Certifications & Courses</span>
        </h2>

        {/* In Progress */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-accent" />
            <h3 className="text-xl font-bold text-accent">In Progress (2026)</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {inProgress.map((cert, index) => (
              <div
                key={index}
                className="glass p-5 rounded-2xl hover:scale-[1.02] transition-all animate-fade-in hover:border-accent/50 border border-accent/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent/20 rounded-lg shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-accent leading-tight">{cert.title}</h4>
                    <p className="text-sm font-semibold text-muted-foreground mt-0.5">{cert.issuer}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cert.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full"
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

        {/* Completed */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-primary">Completed (2025–2026)</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {completed.map((cert, index) => (
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
                      {'instructor' in cert && cert.instructor && (
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
      </div>
    </section>
  );
};

export default Certifications;
