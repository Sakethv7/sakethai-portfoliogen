import { Code2, Database, Cloud, Brain, Sparkles, Terminal } from 'lucide-react';

const Skills = () => {
  const skillCategories = [
    {
      title: 'AI & Machine Learning',
      icon: Brain,
      skills: [
        'TensorFlow', 'PyTorch', 'Scikit-learn', 'Hugging Face',
        'RAG Systems', 'LLM Integration', 'Claude API', 'RASA NLU', 'AWS SageMaker'
      ],
    },
    {
      title: 'Programming',
      icon: Code2,
      skills: [
        'Python', 'SQL', 'Java', 'C/C++', 'Node.js',
        'RESTful APIs', 'Spring Boot', 'Flask'
      ],
    },
    {
      title: 'Data Engineering',
      icon: Database,
      skills: [
        'PySpark', 'Hadoop', 'Hive', 'MapReduce',
        'Apache Airflow', 'ETL Pipelines', 'Data Modeling'
      ],
    },
    {
      title: 'Cloud & Infrastructure',
      icon: Cloud,
      skills: [
        'AWS (EMR, EC2, S3, Redshift, EKS)', 'Azure DevOps',
        'Docker', 'Kubernetes', 'CI/CD Pipelines'
      ],
    },
    {
      title: 'Databases',
      icon: Terminal,
      skills: [
        'PostgreSQL', 'MongoDB', 'DynamoDB',
        'AWS Redshift', 'Snowflake', 'MySQL'
      ],
    },
    {
      title: 'Visualization & BI',
      icon: Sparkles,
      skills: [
        'Power BI', 'Tableau', 'DAX Queries',
        'Advanced Analytics', 'Dashboard Development'
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

        {/* Additional certifications or achievements */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center glass p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4 gradient-text">Education</h3>
            <div className="space-y-2">
              <p className="text-lg font-semibold">Arizona State University</p>
              <p className="text-muted-foreground">Master of Science in Information Technology (Data Science)</p>
              <p className="text-2xl font-bold text-primary">GPA: 4.0/4.0</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;