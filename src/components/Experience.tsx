import { Briefcase, Calendar, MapPin } from 'lucide-react';

const Experience = () => {
  const experiences = [
    {
      title: 'Gen AI Data Analyst',
      company: 'Johnson & Johnson',
      location: 'New Brunswick, New Jersey',
      period: 'February 2025 - Present',
      current: true,
      highlights: [
        'Built end-to-end content ingestion pipeline with Claude API',
        'Implemented AI testing workflows and red-teamed Gen-AI chatbot',
        'Delivered 8+ Power BI dashboards for executive reporting',
        'Cut average resolution time by ~2 weeks through operations support',
      ],
    },
    {
      title: 'Data Analytics Engineer',
      company: 'iDwTeam LLC',
      location: 'Alpharetta, Georgia',
      period: 'November 2024 - February 2025',
      highlights: [
        'Architected GitLab CI/CD pipelines for SAP deployment',
        'Built Tableau dashboards for SAP infrastructure metrics',
        'Led vendor POCs and requirements gathering',
      ],
    },
    {
      title: 'Data Analytics Engineer',
      company: 'Hewlett Packard Inc.',
      location: 'Spring, TX',
      period: 'July 2024 - November 2024',
      highlights: [
        'Optimized ETL pipelines using PySpark, reducing execution time 25%',
        'Built 12+ Power BI dashboards with custom DAX measures',
        'Orchestrated Airflow DAGs reducing delivery timelines by 3 days',
        'Analyzed AI PC metrics using automated workflows on AWS EC2',
      ],
    },
    {
      title: 'Machine Learning Engineer Intern',
      company: 'ECrent Worldwide Company',
      location: 'Bengaluru, India',
      period: 'July 2021 - June 2022',
      highlights: [
        'Built recommendation systems contributing to 250 monthly bookings',
        'Developed RASA NLU chatbot automating 40+ daily queries',
        'Containerized ML models reducing infrastructure costs 29%',
        'Engineered A/B testing infrastructure for algorithm optimization',
      ],
    },
  ];

  return (
    <section id="experience" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          <span className="gradient-text">Experience</span>
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
                    <span className="inline-block px-3 py-1 bg-gradient-primary text-primary-foreground text-xs font-semibold rounded-full mb-3">
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