import { GitBranch, Eye, FlaskConical, Layers } from 'lucide-react';

const SystemDesign = () => {
  const principles = [
    {
      icon: Layers,
      title: 'Retrieval-First Architectures',
      description: 'RAG before fine-tuning. Design retrieval pipelines (chunking → embeddings → vector DB → reranking) that reduce hallucination at the source.',
    },
    {
      icon: FlaskConical,
      title: 'Evaluation-Driven Development',
      description: 'Ship with a test harness. LLM-as-Judge, regression suites, ground-truth datasets — evaluation is a first-class system component, not an afterthought.',
    },
    {
      icon: Eye,
      title: 'Observability-First Systems',
      description: 'Instrument before you scale. Trace prompt flows, retrieval paths, and generation outputs. Debug latency bottlenecks and retrieval anomalies in production.',
    },
    {
      icon: GitBranch,
      title: 'Scalable Pipeline Design',
      description: 'ETL → inference → evaluation as a continuous loop. Systems that can ingest new knowledge, evaluate quality, and improve without manual intervention.',
    },
  ];

  return (
    <section id="approach" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-sm font-mono rounded-full mb-6">
            How I Build
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
          <span className="gradient-text">System Design Approach</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-base max-w-2xl mx-auto">
          I build AI systems, not just models. The difference is in how you handle reliability, evaluation, and production failure modes.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {principles.map((p, index) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="glass p-6 rounded-2xl hover:border-primary/50 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gradient-primary rounded-lg shrink-0">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual pipeline */}
        <div className="glass p-6 rounded-2xl mt-8 overflow-x-auto">
          <p className="text-xs font-mono text-muted-foreground mb-4 uppercase tracking-widest">The Loop</p>
          <div className="font-mono text-sm min-w-[640px]">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded border border-primary/20">Ingest</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded border border-primary/20">Embed</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded border border-primary/20">Retrieve</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded border border-primary/20">Generate</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1.5 bg-accent/10 text-accent rounded border border-accent/20">Evaluate</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1.5 bg-accent/10 text-accent rounded border border-accent/20">Observe</span>
              <span className="text-muted-foreground">→</span>
              <span className="px-3 py-1.5 bg-neon/10 text-neon rounded border border-neon/20">Improve</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SystemDesign;
