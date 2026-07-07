import { Briefcase, Calendar, MapPin } from 'lucide-react';

const Experience = () => {
  const experiences = [
    {
      title: 'Data Scientist',
      company: 'Johnson & Johnson',
      location: 'New Brunswick, NJ',
      period: 'February 2025 – Present',
      current: true,
      highlights: [
        'Own evaluation, analytics, reporting, and observability layers for JAIDA, a ServiceNow-based enterprise RAG question-answering system serving ~140,000 internal users across HR, procurement, finance, case management, and content governance',
        'Built a production LLM evaluation and observability loop using rule-based classification, AWS Bedrock / Llama 3.2 judging, keyword fallback, and Arize Phoenix traces to detect retrieval faults, no-context sessions, routing gaps, hallucination patterns, and latency anomalies across thousands of daily queries',
        'Built an LLM-driven content regression pipeline comparing generated answers against ground truth and retrieved ServiceNow knowledge-base context to detect answer drift, retrieval misses, hallucination risk, and low-quality source articles before release',
        'Architected cross-system analytics with ServiceNow, Genesys, and business operations stakeholders, connecting AI assistant sessions, support redirects, case creation, and survey feedback; surfaced a 50–60% downstream case conversion rate used in leadership prioritization',
        'Designed failure-triage logic separating RAG quality issues into retrieval, generation, routing, content-quality, and telemetry categories, improving root-cause analysis for production quality reviews',
        'Designed an AI measurement layer with multi-table semantic models, session/query-grain KPIs, containment metrics, and repeat-user analysis for weekly executive quality reviews',
      ],
    },
    {
      title: 'Data Science Engineer',
      company: 'Hewlett Packard Inc. (HP)',
      location: 'Spring, TX',
      period: 'July 2024 – November 2024',
      current: false,
      highlights: [
        'Optimized PySpark pipelines on AWS EMR, reducing end-to-end processing time by ~25% through query optimization and repartitioning',
        'Orchestrated Airflow DAGs across S3 ingestion, PySpark transformation, Redshift warehousing, and Power BI reporting',
        'Translated raw hardware telemetry signals into engineering KPIs via advanced DAX; outputs used by hardware, software, and chip design teams to drive cross-functional design decisions',
      ],
    },
    {
      title: 'Machine Learning Engineer',
      company: 'ECrent Worldwide Company',
      location: 'Remote',
      period: 'July 2021 – June 2022',
      current: false,
      highlights: [
        'Built a real estate recommendation system matching users to relevant property listings based on listing text and structured attributes',
        'Fine-tuned Word2Vec embeddings and ranked candidates by cosine similarity to improve relevance of recommendations based on listing descriptions and user preferences',
        'Served recommendations through a Flask API and evaluated relevance with Precision-at-K and Recall-at-K',
      ],
    },
  ];

  return (
    <section id="experience" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          <span className="gradient-text">Professional Experience</span>
        </h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-px h-full w-0.5 bg-gradient-to-b from-primary via-accent to-cyber" />

          {experiences.map((exp, index) => (
            <div
              key={index}
              className={`relative flex items-center mb-12 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full glow-primary" />

              {/* Content */}
              <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} pl-8 md:pl-0`}>
                <div className="glass p-6 rounded-2xl hover:scale-[1.02] transition-transform animate-fade-in">
                  {exp.current && (
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold rounded-full mb-3">
                      Current
                    </span>
                  )}

                  <h3 className="text-xl font-bold text-primary mb-1">{exp.title}</h3>
                  <h4 className="text-lg font-semibold mb-3">{exp.company}</h4>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {exp.period}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {exp.location}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {exp.highlights.map((highlight, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start">
                        <span className="text-accent mr-2 mt-1">▸</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
