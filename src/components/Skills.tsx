import { Code2, Database, Cloud, Brain, Sparkles, Terminal } from 'lucide-react';

const Skills = () => {
  const skillCategories = [
    {
      title: 'AI / LLM Systems',
      icon: Brain,
      skills: [
        'LangChain', 'LangGraph', 'OpenAI', 'Anthropic SDK', 'Semantic Search', 'RAG Pipelines'
      ],
    },
    {
      title: 'AI Observability & Evals',
      icon: Sparkles,
      skills: [
        'Arize Phoenix', 'LLM Evals', 'LLM-as-a-Judge', 'Hallucination Detection',
        'Regression Testing', 'Tracing', 'Latency Monitoring'
      ],
    },
    {
      title: 'Agentic AI',
      icon: Terminal,
      skills: [
        'LangGraph', 'Multi-Agent Orchestration', 'Tool Use', 'MCP',
        'Anthropic SDK', 'Memory Systems', 'Agent Skills', 'Subagents'
      ],
    },
    {
      title: 'Data & Pipelines',
      icon: Database,
      skills: [
        'PySpark', 'Apache Airflow', 'DynamoDB', 'Databricks', 'ETL Workflows', 'Data Lakes'
      ],
    },
    {
      title: 'Infrastructure & Cloud',
      icon: Cloud,
      skills: [
        'AWS (S3, EC2, Bedrock, CloudWatch)', 'Docker', 'Python', 'FastAPI', 'REST APIs'
      ],
    },
    {
      title: 'Vector Databases & Analytics',
      icon: Code2,
      skills: [
        'Qdrant', 'PostgreSQL', 'AWS Redshift', 'Power BI (DAX)', 'Tableau', 'CloudWatch Metrics'
      ],
    },
  ];

  return (
    <section id="skills" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          <span className="gradient-text">Technical Skills</span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="glass p-6 rounded-2xl hover:scale-[1.02] transition-all animate-fade-in hover:border-primary/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold">{category.title}</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-sm bg-secondary/50 hover:bg-primary/20 rounded-full transition-colors cursor-pointer hover:text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Education Section based on Resume */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center glass p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4 gradient-text">Education</h3>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">Arizona State University</p>
              <p className="text-muted-foreground">Master of Science in Information Technology (Data Science)</p>
              <div className="pt-2">
                <span className="text-2xl font-bold text-primary">GPA: 4.0/4.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
