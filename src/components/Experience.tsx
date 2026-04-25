import { Briefcase, Calendar, MapPin } from 'lucide-react';

const Experience = () => {
  const experiences = [
    {
      title: 'Data Scientist',
      company: 'Johnson & Johnson',
      location: 'New Brunswick, NJ',
      period: 'November 2024 – February 2025',
      current: false,
      highlights: [
        'Contributed to JAIDA, a production-scale RAG system serving ~140,000 internal users, supporting enterprise knowledge retrieval through document chunking, embedding generation, and vector indexing in Qdrant with role-based collection routing',
        'Engineered and maintained LLM-powered retrieval pipelines, including ingestion, embedding workflows, and semantic search layers to improve response relevance and knowledge base coverage',
        'Built a three-layer query analytics pipeline using AWS Bedrock (Llama 3) as an LLM-as-a-Judge system, combining rule-based classification, batch LLM categorization, and keyword fallback to analyze thousands of user queries',
        'Designed and implemented LLM evaluation and regression testing frameworks using LangChain, reducing reliance on manual QA and enabling scalable validation of response accuracy and retrieval quality',
        'Leveraged Arize Phoenix for AI observability, monitoring prompt flows, retrieval paths, and model behavior to identify latency bottlenecks, hallucination patterns, and retrieval anomalies in production',
      ],
    },
    {
      title: 'Data Science Engineer',
      company: 'iDwTeam LLC',
      location: 'Alpharetta, GA',
      period: 'November 2024 – February 2025',
      highlights: [
        'Built an internal AI-enabled HR operations analytics tool integrating NLP pipelines and dashboards to simulate enterprise workflows using synthetic and proxy datasets',
        'Applied NLP techniques (TF-IDF, topic modeling, semantic similarity) to analyze unstructured query logs and extract actionable insights on operational inefficiencies and recurring issues',
        'Modeled and structured data within a Databricks Lakehouse architecture, supporting scalable data processing and analytics workflows',
        'Developed Tableau dashboards visualizing ticket volumes, organizational hierarchy, and workflow metrics to support internal analysis',
      ],
    },
    {
      title: 'Data Science Engineer',
      company: 'Hewlett Packard Inc. (HP)',
      location: 'Spring, TX',
      period: 'July 2024 – November 2024',
      highlights: [
        'Optimized distributed data pipelines using PySpark on AWS EMR, reducing end-to-end processing time by ~25% and improving scalability of large-scale hardware telemetry processing',
        'Orchestrated and maintained Apache Airflow DAGs to automate data workflows, improving pipeline reliability and ensuring consistent delivery of analytics datasets',
        'Designed and implemented end-to-end data architecture from raw telemetry ingestion (AWS S3) → transformation (PySpark) → warehousing (Redshift) → visualization (Power BI)',
        'Built Power BI dashboards with advanced DAX measures on Redshift views to surface insights on PC hardware performance, including power consumption, time-of-flight sensor data, and BIOS utilization metrics',
      ],
    },
    {
      title: 'Machine Learning Engineer',
      company: 'ECrent Worldwide Company',
      location: 'Bengaluru, India',
      period: 'July 2021 – June 2022',
      highlights: [
        'Built and deployed a content-based recommendation system for real estate listings using listing features (location, price, amenities, textual descriptions) to deliver personalized property suggestions',
        'Implemented semantic similarity matching using Word2Vec embeddings (pretrained + fine-tuned) to improve relevance of recommendations based on listing descriptions and user preferences',
        'Evaluated recommendation performance using ranking metrics (Precision@K, Recall@K) via Scikit-learn-based workflows to measure relevance and optimize recommendation outputs',
        'Integrated recommendation logic into the application backend, supporting real-time suggestion generation for end users',
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
