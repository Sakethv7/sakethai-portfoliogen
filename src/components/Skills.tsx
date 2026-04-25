import { Code2, Database, Cloud, Brain, Sparkles, Terminal } from 'lucide-react';

const Skills = () => {
  const skillCategories = [
    {
      title: 'LLM & RAG Systems',
      icon: Brain,
      skills: [
        'RAG Pipelines', 'LangChain', 'Semantic Search', 'Vector Indexing',
        'Sentence Embeddings', 'Retrieval Optimization', 'Qdrant', 'DynamoDB'
      ],
    },
    {
      title: 'Agentic AI',
      icon: Sparkles,
      skills: [
        'LangGraph', 'Multi-Agent Orchestration', 'Tool Use', 'MCP',
        'Anthropic SDK', 'Memory Systems', 'FastAPI', 'Agent Skills'
      ],
    },
    {
      title: 'AI Observability & Evals',
      icon: Code2,
      skills: [
        'Arize Phoenix', 'LLM-as-a-Judge', 'Regression Testing',
        'Hallucination Detection', 'Latency Tracing', 'CloudWatch Monitoring'
      ],
    },
    {
      title: 'Data & Pipeline Engineering',
      icon: Database,
      skills: [
        'PySpark', 'Apache Airflow', 'ETL Pipelines', 'Databricks',
        'Data Lakes', 'AWS EMR', 'AWS S3', 'Data Modeling'
      ],
    },
    {
      title: 'Cloud & Infrastructure',
      icon: Cloud,
      skills: [
        'AWS Bedrock', 'AWS EC2', 'AWS Redshift', 'CloudWatch',
        'Docker', 'Python', 'REST APIs', 'Git'
      ],
    },
    {
      title: 'ML & Deep Learning',
      icon: Terminal,
      skills: [
        'PyTorch', 'TensorFlow', 'Scikit-learn', 'AWS SageMaker',
        'Word2Vec', 'RASA NLU', 'Transfer Learning'
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

      </div>
    </section>
  );
};

export default Skills;
