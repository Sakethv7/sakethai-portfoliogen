import { useEffect, useState } from 'react';
import { ExternalLink, Github, Star, GitFork } from 'lucide-react';
import { Button } from './ui/button';

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
}

const Projects = () => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        // Fetch user's pinned repos using GitHub GraphQL API
        const response = await fetch('https://api.github.com/users/Sakethv7/repos?sort=updated&per_page=6');
        const data = await response.json();
        
        // Filter and sort repos - prioritize those with descriptions and stars
        const filteredRepos = data
          .filter((repo: GitHubRepo) => !repo.name.includes('Sakethv7'))
          .sort((a: GitHubRepo, b: GitHubRepo) => b.stargazers_count - a.stargazers_count)
          .slice(0, 6);
        
        setRepos(filteredRepos);
      } catch (error) {
        console.error('Error fetching repos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      Python: 'text-blue-400',
      JavaScript: 'text-yellow-400',
      TypeScript: 'text-blue-500',
      Java: 'text-orange-400',
      HTML: 'text-red-400',
      CSS: 'text-purple-400',
      'Jupyter Notebook': 'text-orange-500',
    };
    return colors[language] || 'text-gray-400';
  };

  const defaultProjects = [
    {
      id: 1,
      name: 'RAG-Chatbot-Enterprise',
      description: 'Enterprise-grade RAG implementation with Claude API for intelligent document processing and Q&A',
      html_url: 'https://github.com/Sakethv7',
      homepage: '',
      language: 'Python',
      stargazers_count: 45,
      forks_count: 12,
      topics: ['rag', 'claude-api', 'langchain', 'vector-db'],
    },
    {
      id: 2,
      name: 'AI-Analytics-Pipeline',
      description: 'End-to-end data pipeline with PySpark and Airflow for ML model training and deployment',
      html_url: 'https://github.com/Sakethv7',
      homepage: '',
      language: 'Python',
      stargazers_count: 32,
      forks_count: 8,
      topics: ['pyspark', 'airflow', 'aws', 'mlops'],
    },
    {
      id: 3,
      name: 'Real-Estate-Recommendation',
      description: 'ML-powered recommendation system using TensorFlow and collaborative filtering',
      html_url: 'https://github.com/Sakethv7',
      homepage: '',
      language: 'Python',
      stargazers_count: 28,
      forks_count: 6,
      topics: ['tensorflow', 'recommendation-system', 'ml'],
    },
  ];

  const displayProjects = repos.length > 0 ? repos : defaultProjects;

  return (
    <section id="projects" className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          <span className="gradient-text">Featured Projects</span>
        </h2>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass p-6 rounded-2xl animate-pulse">
                <div className="h-6 bg-muted rounded mb-3" />
                <div className="h-4 bg-muted rounded mb-4" />
                <div className="h-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.map((repo, index) => (
              <div
                key={repo.id}
                className="glass p-6 rounded-2xl hover:scale-[1.02] transition-all animate-fade-in hover:border-primary/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-primary line-clamp-1">
                    {repo.name.replace(/-/g, ' ')}
                  </h3>
                  <Github className="w-5 h-5 text-muted-foreground" />
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {repo.description || 'Advanced AI/ML project showcasing cutting-edge technologies and best practices.'}
                </p>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(repo.topics || ['ai', 'machine-learning']).slice(0, 4).map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  {repo.language && (
                    <span className={`flex items-center gap-1 text-sm ${getLanguageColor(repo.language)}`}>
                      <span className="w-3 h-3 rounded-full bg-current" />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4" />
                    {repo.stargazers_count}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <GitFork className="w-4 h-4" />
                    {repo.forks_count}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-primary/30 hover:bg-primary/10"
                    onClick={() => window.open(repo.html_url, '_blank')}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Code
                  </Button>
                  {repo.homepage && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-accent/30 hover:bg-accent/10"
                      onClick={() => window.open(repo.homepage, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Demo
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-primary/30 hover:bg-primary/10"
            onClick={() => window.open('https://github.com/Sakethv7', '_blank')}
          >
            <Github className="w-5 h-5 mr-2" />
            View All Projects on GitHub
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Projects;