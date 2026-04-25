import { Zap } from 'lucide-react';

const CurrentFocus = () => {
  const areas = [
    {
      title: 'AI Observability Systems',
      description: 'LLM tracing, latency profiling, hallucination detection, and performance monitoring across prompt-retrieval-generation pipelines.',
      items: ['End-to-end trace instrumentation', 'Retrieval anomaly detection', 'Hallucination pattern analysis'],
    },
    {
      title: 'LLM Evaluation Frameworks',
      description: 'Automated scoring pipelines: LLM-as-Judge, ground-truth regression testing, and multi-dimensional quality metrics.',
      items: ['Automated regression suites', 'Multi-model benchmarking', 'Response quality scoring'],
    },
    {
      title: 'Agentic AI Workflows',
      description: 'Multi-agent orchestration with LangGraph, tool use, memory systems, and MCP-based agent routing for real-world tasks.',
      items: ['LangGraph state machines', 'Tool use + memory integration', 'MCP-based agent routing'],
    },
  ];

  return (
    <section id="focus" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-neon animate-pulse" />
          <span className="text-sm font-mono text-neon uppercase tracking-widest">Currently Building</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          <span className="gradient-text">Current Focus</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {areas.map((area, index) => (
            <div
              key={area.title}
              className="glass p-6 rounded-2xl hover:scale-[1.02] transition-all animate-fade-in hover:border-neon/40 border border-transparent"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                <h3 className="text-base font-bold text-primary">{area.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{area.description}</p>
              <ul className="space-y-1.5">
                {area.items.map((item) => (
                  <li key={item} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-neon mt-0.5">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CurrentFocus;
