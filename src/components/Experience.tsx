import { Briefcase, Calendar, MapPin } from 'lucide-react';

const Experience = () => {
  const experiences = [
    {
      title: 'Data Scientist',
      company: 'Johnson & Johnson',
      location: 'New Brunswick, NJ',
      period: 'February 2025 - Present',
      current: true,
      highlights: [
        'Building JAIDA—an enterprise RAG platform serving 140K+ employees with 10K-25K monthly queries using Qdrant, Claude/OpenAI APIs, and LangChain',
        'Implementing MCP-based agent routing and contract intelligence systems for automated document analysis',
        'Designing red-teaming workflows and automated evaluation frameworks to reduce hallucinations and improve response accuracy',
        'Developing production observability dashboards tracking latency, usage patterns, and quality signals with Arize Phoenix'
      ],
    },
    {
      title: 'Data Analytics Engineer',
      company: 'iDwTeam LLC',
      location: 'Alpharetta, GA',
      period: 'November 2024 - February 2025',
      highlights: [
        'Architected GitLab CI/CD pipelines with Python automation for SAP landscape deployment, reducing system maintenance windows',
        'Built Tableau dashboards to visualize SAP infrastructure metrics across 5 distinct client environments',
        'Led vendor POCs and requirements gathering to align technical infrastructure with business strategy'
      ],
    },
    {
      title: 'Data Analytics Engineer',
      company: 'Hewlett Packard Inc. (HP)',
      location: 'Spring, TX',
      period: 'July 2024 - November 2024',
      highlights: [
        'Optimized large-scale data pipelines using PySpark on AWS EMR, achieving a 25% reduction in total processing time',
        'Orchestrated Apache Airflow workflows that accelerated analytics delivery timelines by three business days',
        'Analyzed AI PC performance signals (BIOS, ToF, power consumption) via automated cloud workflows to drive hardware optimization',
        'Built executive-ready Power BI dashboards with advanced DAX measures on AWS Redshift for real-time trend analysis'
      ],
    },
    {
      title: 'Machine Learning Engineer Intern',
      company: 'ECrent Worldwide Company',
      location: 'Bengaluru, India',
      period: 'July 2021 - June 2022',
      highlights: [
        'Deployed TensorFlow and Hugging Face recommendation systems, contributing to 250+ additional monthly bookings',
        'Containerized ML models using Docker and Kubernetes on AWS EKS, reducing monthly infrastructure costs by 29% ($17K → $12K)',
        'Developed RASA NLU chatbot with intent classification, automating 40+ daily queries and streamlining customer service',
        'Engineered A/B testing infrastructure with ML-driven feature importance analysis for algorithm optimization'
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
