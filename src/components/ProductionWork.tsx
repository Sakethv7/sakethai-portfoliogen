import { Users, Cpu, ShieldCheck, BarChart3 } from 'lucide-react';

const ProductionWork = () => {
  const systems = [
    {
      icon: Cpu,
      title: 'RAG Retrieval Pipeline',
      description: 'End-to-end knowledge retrieval: document chunking → embedding generation → Qdrant vector indexing with role-based collection routing.',
    },
    {
      icon: ShieldCheck,
      title: 'LLM Evaluation Framework',
      description: 'Three-layer evaluation: rule-based classification → LLM-as-a-Judge (AWS Bedrock/Llama 3) → keyword fallback. Automated regression testing replaced manual QA.',
    },
    {
      icon: BarChart3,
      title: 'AI Observability System',
      description: 'Arize Phoenix tracing across prompt flows, retrieval paths, and generation. Identifies latency bottlenecks, hallucination patterns, and retrieval anomalies in production.',
    },
    {
      icon: Users,
      title: 'Content Governance Pipeline',
      description: 'Tracks knowledge base freshness, approval workflows, and coverage completeness. Mitigates risks from outdated or low-quality content reaching ~140K users.',
    },
  ];

  return (
    <section id="production" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 text-sm font-mono rounded-full mb-6">
            Production AI Systems
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
          <span className="gradient-text">Johnson & Johnson — JAIDA</span>
        </h2>
        <p className="text-center text-muted-foreground mb-4 text-lg">
          Enterprise RAG platform · ~140,000 users · Production LLMOps
        </p>

        {/* Architecture flow */}
        <div className="glass p-6 rounded-2xl mb-10 overflow-x-auto">
          <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-widest">System Architecture</p>
          <div className="font-mono text-sm text-center space-y-1 min-w-[600px]">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded border border-primary/20">Knowledge Sources</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded border border-primary/20">Chunking</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded border border-primary/20">Embeddings</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded border border-primary/20">Qdrant (Role-Based)</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded border border-primary/20">LLM</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded border border-primary/20">Response</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-accent pt-1">
              <span className="text-muted-foreground">↓</span>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-accent/10 text-accent rounded border border-accent/20">Arize Phoenix (Observability)</span>
              <span className="text-muted-foreground">+</span>
              <span className="px-3 py-1 bg-accent/10 text-accent rounded border border-accent/20">LLM-as-Judge Eval Layer</span>
              <span className="text-muted-foreground">+</span>
              <span className="px-3 py-1 bg-accent/10 text-accent rounded border border-accent/20">Regression Testing</span>
            </div>
          </div>
        </div>

        {/* Systems grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {systems.map((system, index) => {
            const Icon = system.icon;
            return (
              <div
                key={system.title}
                className="glass p-6 rounded-2xl hover:border-primary/50 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gradient-primary rounded-lg shrink-0">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary mb-1">{system.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{system.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Problems solved */}
        <div className="glass p-6 rounded-2xl">
          <p className="text-xs font-mono text-muted-foreground mb-4 uppercase tracking-widest">Problems Solved in Production</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { problem: 'Hallucination', solution: 'LLM-as-Judge + regression testing suite to catch generation failures before they reach users' },
              { problem: 'Retrieval gaps', solution: 'Query analytics pipeline categorizing no-answer patterns and topic coverage holes across 140K user queries' },
              { problem: 'Latency & anomalies', solution: 'Arize Phoenix tracing across the full prompt-retrieval-generation path with alerting on deviation' },
            ].map((item) => (
              <div key={item.problem} className="space-y-1">
                <p className="text-sm font-bold text-accent">↳ {item.problem}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductionWork;
