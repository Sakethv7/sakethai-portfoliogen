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
  // Not on the résumé: listed only in the LinkedIn-style full history.
  linkedinOnly?: boolean;
  summary: string;
  highlights: string[];
}

export const experiences: ExperienceItem[] = [
  {
    id: 'johnson-johnson', company: 'Johnson & Johnson', title: 'Data Scientist', employmentType: 'Contract',
    period: 'Feb 2025 – Present', location: 'New Brunswick, New Jersey', workMode: 'On-site', current: true,
    summary: 'AI quality, observability, and data systems for an enterprise RAG and support-automation platform serving approximately 140,000 internal users.',
    highlights: [
      'Owned evaluation, analytics, reporting, and observability for a production enterprise RAG system serving approximately 140,000 internal users across knowledge retrieval, case-management, and content-governance workflows.',
      'Built a three-layer LLM-as-judge pipeline on AWS Bedrock / Llama 3.2 combining rule-based classifiers, batch LLM categorization, and keyword fallbacks to evaluate thousands of queries daily.',
      'Built LLM regression tests with ground-truth benchmarks, judge-based similarity scoring, and cross-run tracking to detect relevance, hallucination, latency, and retrieval-quality regressions before deployment.',
      'Designed containment, query-resolution, repeat-user, and satisfaction metrics from session and query evidence, then used cross-system analysis to separate immediate friction from delayed unresolved needs.',
      'Connected enterprise RAG traces, DynamoDB records, API payloads, and ServiceNow workflow tables to separate AI, routing, knowledge, and downstream-intake failure modes with row-level evidence.',
      'Built DynamoDB-to-Databricks data pipelines and Power BI semantic models with schema checks, Delta/Parquet validation, KPI definitions, lineage notes, and leadership reporting.',
      'Integrated enterprise AI interaction evidence with unified ServiceNow intake-event data across case creation, external forms, and live-agent channels, preserving row-level Q&A, article, taxonomy, action, target, and case evidence for review.',
      'Conducted cross-system spike analysis linking RAG failures to downstream case patterns, including greeting-drop analysis, no-answer clusters, and same-day versus delayed escalation buckets.',
    ],
  },
  {
    id: 'idwteam', company: 'iDwTeam LLC', title: 'Data Science Engineer', employmentType: 'Full-time',
    period: 'Nov 2024 – Feb 2025', location: 'Alpharetta, Georgia', workMode: 'Remote', linkedinOnly: true,
    summary: 'AI-enabled HR operations analytics combining unstructured query analysis, lakehouse modeling, and stakeholder-facing dashboards.',
    highlights: [
      'Built an HR operations analytics prototype using synthetic and proxy data to simulate enterprise workflows.',
      'Applied TF-IDF, topic modeling, and semantic similarity to recurring patterns in unstructured query logs.',
      'Modeled downstream analytics data in Databricks and built Tableau views for ticket, hierarchy, and workflow metrics.',
    ],
  },
  {
    id: 'hp', company: 'Hewlett Packard Inc.', title: 'Data Science Engineer', employmentType: 'Contract',
    period: 'Jul 2024 – Nov 2024', location: 'Spring, Texas', workMode: 'On-site',
    summary: 'Distributed data pipelines and business-facing telemetry analytics for hardware engineering teams.',
    highlights: [
      'Built Airflow DAGs running PySpark transformations from S3 PC telemetry into Redshift views for Power BI reporting across hardware, software, power, sensor, and BIOS data.',
      'Optimized PySpark processing on AWS EMR, reducing runtime by approximately 25% through query optimization, repartitioning, and pipeline tuning.',
      'Built engineering KPI reports that helped hardware, software, and chip-design stakeholders compare telemetry trends, prioritize defects, and support roadmap and funding decisions.',
      'Translated raw hardware telemetry into stable analytical tables and Power BI measures so engineering teams could inspect component-level trends without relying on ad-hoc extracts.',
    ],
  },
  {
    id: 'asu', company: 'Arizona State University', title: 'Data Science Graduate Assistant', employmentType: 'Part-time',
    period: 'Feb 2023 – May 2024', location: 'Tempe, Arizona', workMode: 'On-site', linkedinOnly: true,
    summary: 'Applied NLP research for educational analytics and student-feedback analysis.',
    highlights: [
      'Researched transformer models and semantic-similarity methods for identifying at-risk students.',
      'Built Python sentiment-analysis workflows using BERT and RoBERTa on course feedback and evaluations.',
      'Created Tableau dashboards for student engagement and performance trends and collaborated with faculty on applied research.',
    ],
  },
  {
    id: 'ecrent', company: 'ECrent Worldwide Company', title: 'Machine Learning Engineer', employmentType: 'Full-time',
    period: 'Jul 2021 – Jun 2022', location: 'Bengaluru, Karnataka, India', workMode: 'Remote',
    summary: 'Recommendation and semantic-ranking systems for a real-estate marketplace.',
    highlights: [
      'Built and deployed a content-based recommendation system for real-estate listings using structured attributes and text descriptions to generate personalized suggestions.',
      'Implemented semantic-similarity ranking with Word2Vec embeddings and evaluated results with Precision-at-K and Recall-at-K.',
      'Integrated top-N retrieval into the application backend for real-time Flask API serving.',
      'Prepared feature extraction and evaluation scripts that made recommendation changes measurable before exposing ranked listings through the application workflow.',
    ],
  },
];

export const resumeExperiences = experiences.filter((item) => !item.linkedinOnly);
