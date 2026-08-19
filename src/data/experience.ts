export type EmploymentType = 'Full-time' | 'Contract' | 'Part-time';

export interface ExperienceItem {
  id: string;
  company: string;
  title: string;
  employmentType: EmploymentType;
  period: string;
  location: string;
  workMode: 'On-site' | 'Remote';
  current?: boolean;
  summary: string;
  highlights: string[];
}

export const experiences: ExperienceItem[] = [
  {
    id: 'johnson-johnson', company: 'Johnson & Johnson', title: 'Data Scientist', employmentType: 'Contract',
    period: 'Feb 2025 – Present', location: 'New Brunswick, New Jersey', workMode: 'On-site', current: true,
    summary: 'AI quality, observability, and data systems for JAIDA, an enterprise RAG and support-automation platform serving approximately 140,000 internal users.',
    highlights: [
      'Designed JAIDA routing and outcome taxonomies connecting self-service answers, knowledge gaps, live-agent handoffs, and ServiceNow case creation.',
      'Built Databricks ETL and Power BI measurement layers that connect interaction data, traces, API payloads, latency, token usage, and downstream workflows.',
      'Built a Phoenix and AWS Bedrock evaluation harness for relevance, answer quality, hallucination risk, retrieval failure, latency, and regression testing.',
      'Turned root-cause findings into KPI definitions, lineage, governance guidance, runbooks, dashboards, and leadership reporting.',
    ],
  },
  {
    id: 'idwteam', company: 'iDwTeam LLC', title: 'Data Science Engineer', employmentType: 'Full-time',
    period: 'Nov 2024 – Feb 2025', location: 'Alpharetta, Georgia', workMode: 'Remote',
    summary: 'AI-enabled HR operations analytics combining unstructured query analysis, lakehouse modeling, and stakeholder-facing dashboards.',
    highlights: [
      'Built an HR operations analytics prototype using synthetic and proxy data to simulate enterprise workflows.',
      'Applied TF-IDF, topic modeling, and semantic similarity to recurring patterns in unstructured query logs.',
      'Modeled downstream analytics data in Databricks and built Tableau views for ticket, hierarchy, and workflow metrics.',
    ],
  },
  {
    id: 'hp', company: 'HP', title: 'Data Science Engineer', employmentType: 'Contract',
    period: 'Jul 2024 – Nov 2024', location: 'Spring, Texas', workMode: 'On-site',
    summary: 'Distributed data pipelines and business-facing telemetry analytics for hardware engineering teams.',
    highlights: [
      'Built Airflow DAGs running PySpark transformations from S3 telemetry into Redshift views for Power BI reporting.',
      'Optimized AWS EMR processing by approximately 25% through query optimization and repartitioning.',
      'Translated power, sensor, BIOS, and utilization telemetry into KPIs used by hardware, software, and chip-design stakeholders.',
    ],
  },
  {
    id: 'asu', company: 'Arizona State University', title: 'Data Science Graduate Assistant', employmentType: 'Part-time',
    period: 'Feb 2023 – May 2024', location: 'Tempe, Arizona', workMode: 'On-site',
    summary: 'Applied NLP research for educational analytics and student-feedback analysis.',
    highlights: [
      'Researched transformer models and semantic-similarity methods for identifying at-risk students.',
      'Built Python sentiment-analysis workflows using BERT and RoBERTa on course feedback and evaluations.',
      'Created Tableau dashboards for student engagement and performance trends and collaborated with faculty on applied research.',
    ],
  },
  {
    id: 'ecrent', company: 'ECrent Worldwide Company Limited', title: 'Machine Learning Engineer', employmentType: 'Full-time',
    period: 'Jul 2021 – Jun 2022', location: 'Bengaluru, Karnataka, India', workMode: 'Remote',
    summary: 'Recommendation, prediction, and conversational ML systems for a real-estate marketplace.',
    highlights: [
      'Built a content-based property recommendation system using structured attributes and listing descriptions.',
      'Combined Word2Vec text embeddings with structured features, ranked candidates by similarity, and evaluated results with Precision@K and Recall@K.',
      'Built regression and classification models for price and booking likelihood and deployed a Rasa NLU assistant for intent and entity extraction.',
    ],
  },
];
