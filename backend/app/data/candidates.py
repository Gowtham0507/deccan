import json
import random
from pathlib import Path

CANDIDATES = [
    {
        "id": "c001", "name": "Arjun Mehta", "current_role": "Senior Data Scientist", "current_company": "Flipkart",
        "years_experience": 6, "location": "Bengaluru", "remote_preference": "hybrid",
        "skills": ["Python", "TensorFlow", "Spark", "SQL", "MLflow", "AWS SageMaker", "NLP", "Tableau"],
        "education": "M.Tech in Computer Science, IIT Bombay",
        "salary_expectation": "28 LPA", "persona_notes": "Open to 20% hike, dislikes travel, loves ML infra challenges.",
        "bio": "6 years in large-scale ML systems. Built recommendation engine serving 50M users at Flipkart.",
        "avatar_seed": "arjun"
    },
    {
        "id": "c002", "name": "Priya Nair", "current_role": "ML Engineer", "current_company": "Swiggy",
        "years_experience": 4, "location": "Bengaluru", "remote_preference": "remote",
        "skills": ["Python", "PyTorch", "FastAPI", "Docker", "Kubernetes", "GCP", "Feature Engineering"],
        "education": "B.Tech in CS, NIT Trichy",
        "salary_expectation": "22 LPA", "persona_notes": "Wants fully remote, not open to relocation.",
        "bio": "Built real-time food ETA prediction models. Strong MLOps background with GCP.",
        "avatar_seed": "priya"
    },
    {
        "id": "c003", "name": "Rohan Desai", "current_role": "Data Engineer", "current_company": "Razorpay",
        "years_experience": 5, "location": "Mumbai", "remote_preference": "onsite",
        "skills": ["Apache Kafka", "Spark", "dbt", "Airflow", "Python", "Snowflake", "AWS"],
        "education": "B.Tech in Information Technology, VIT",
        "salary_expectation": "24 LPA", "persona_notes": "Wants growth into architecture roles. Loyal but underpaid.",
        "bio": "Designed real-time data pipelines processing 10M events/day for payments platform.",
        "avatar_seed": "rohan"
    },
    {
        "id": "c004", "name": "Sneha Kapoor", "current_role": "Product Data Analyst", "current_company": "PhonePe",
        "years_experience": 3, "location": "Bengaluru", "remote_preference": "hybrid",
        "skills": ["SQL", "Python", "Tableau", "A/B Testing", "Excel", "Google Analytics", "Mixpanel"],
        "education": "MBA in Business Analytics, ISB Hyderabad",
        "salary_expectation": "18 LPA", "persona_notes": "Eager to move into ML. Will accept slight pay cut for growth.",
        "bio": "Led analytics for PhonePe's Mutual Funds product. Strong stakeholder communication.",
        "avatar_seed": "sneha"
    },
    {
        "id": "c005", "name": "Vikram Singh", "current_role": "AI Research Engineer", "current_company": "Samsung R&D",
        "years_experience": 7, "location": "Noida", "remote_preference": "remote",
        "skills": ["PyTorch", "Transformers", "ONNX", "C++", "CUDA", "Computer Vision", "LLMs"],
        "education": "PhD in Machine Learning, IIT Delhi",
        "salary_expectation": "40 LPA", "persona_notes": "Very selective. Wants cutting-edge research environment.",
        "bio": "Published 4 papers in NeurIPS/CVPR. Specializes in on-device ML optimization.",
        "avatar_seed": "vikram"
    },
    {
        "id": "c006", "name": "Ananya Krishnan", "current_role": "Backend Engineer (Python)", "current_company": "Zepto",
        "years_experience": 4, "location": "Mumbai", "remote_preference": "hybrid",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Celery", "Docker", "AWS Lambda"],
        "education": "B.Tech in CS, BITS Pilani",
        "salary_expectation": "22 LPA", "persona_notes": "Wants to pivot into AI/ML engineering roles.",
        "bio": "Built high-throughput order management APIs handling 100K RPM at Zepto.",
        "avatar_seed": "ananya"
    },
    {
        "id": "c007", "name": "Karthik Rajan", "current_role": "MLOps Engineer", "current_company": "Infosys",
        "years_experience": 5, "location": "Chennai", "remote_preference": "remote",
        "skills": ["MLflow", "Kubeflow", "Terraform", "GCP", "Docker", "Python", "CI/CD", "Prometheus"],
        "education": "B.Tech in CS, Anna University",
        "salary_expectation": "20 LPA", "persona_notes": "Unhappy with slow growth at Infosys. Ready to move.",
        "bio": "Set up end-to-end MLOps pipelines for 15+ client ML projects at Infosys.",
        "avatar_seed": "karthik"
    },
    {
        "id": "c008", "name": "Meera Pillai", "current_role": "NLP Scientist", "current_company": "Sarvam AI",
        "years_experience": 5, "location": "Bengaluru", "remote_preference": "hybrid",
        "skills": ["Python", "HuggingFace", "LangChain", "RAG", "Fine-tuning", "BERT", "LLMs", "Indic NLP"],
        "education": "M.S. in Computational Linguistics, IIIT Hyderabad",
        "salary_expectation": "30 LPA", "persona_notes": "Passionate about Indic language models. Wants mission-driven company.",
        "bio": "Core NLP engineer on Sarvam's multilingual LLM stack serving 5M users.",
        "avatar_seed": "meera"
    },
    {
        "id": "c009", "name": "Aditya Bansal", "current_role": "Full Stack Developer", "current_company": "Razorpay",
        "years_experience": 4, "location": "Bengaluru", "remote_preference": "hybrid",
        "skills": ["React", "Node.js", "TypeScript", "GraphQL", "PostgreSQL", "Redis", "AWS"],
        "education": "B.Tech in CS, DTU Delhi",
        "salary_expectation": "20 LPA", "persona_notes": "Wants to join a startup. Excited by equity.",
        "bio": "Built Razorpay's merchant onboarding portal used by 1M+ businesses.",
        "avatar_seed": "aditya"
    },
    {
        "id": "c010", "name": "Shruti Joshi", "current_role": "Data Scientist", "current_company": "Urban Company",
        "years_experience": 3, "location": "Gurugram", "remote_preference": "hybrid",
        "skills": ["Python", "Scikit-learn", "SQL", "XGBoost", "Feature Engineering", "Pandas", "Power BI"],
        "education": "B.Sc Statistics, Delhi University + PGDip Data Science",
        "salary_expectation": "16 LPA", "persona_notes": "Looking for her first big-company move. Very coachable.",
        "bio": "Built demand forecasting models that improved service partner utilization by 18%.",
        "avatar_seed": "shruti"
    },
    {
        "id": "c011", "name": "Suresh Babu", "current_role": "Cloud Architect", "current_company": "TCS",
        "years_experience": 10, "location": "Hyderabad", "remote_preference": "hybrid",
        "skills": ["AWS", "Azure", "Terraform", "Kubernetes", "Python", "Microservices", "SRE"],
        "education": "B.Tech, Osmania University",
        "salary_expectation": "35 LPA", "persona_notes": "Senior, wants strategic role. Long notice period (90 days).",
        "bio": "Architected cloud migration for 3 Fortune 500 clients. AWS Solutions Architect Professional certified.",
        "avatar_seed": "suresh"
    },
    {
        "id": "c012", "name": "Divya Menon", "current_role": "Computer Vision Engineer", "current_company": "Ola Electric",
        "years_experience": 4, "location": "Bengaluru", "remote_preference": "onsite",
        "skills": ["Python", "OpenCV", "YOLO", "TensorRT", "PyTorch", "ROS", "CUDA", "Edge AI"],
        "education": "M.Tech in Robotics, IISc Bengaluru",
        "salary_expectation": "25 LPA", "persona_notes": "Wants to work on autonomous systems. Not interested in pure SaaS.",
        "bio": "Developed camera-based obstacle detection for Ola's EV scooters. Deployed on 200K units.",
        "avatar_seed": "divya"
    },
    {
        "id": "c013", "name": "Nikhil Sharma", "current_role": "GenAI Engineer", "current_company": "Accenture",
        "years_experience": 3, "location": "Pune", "remote_preference": "remote",
        "skills": ["LangChain", "LlamaIndex", "OpenAI API", "Pinecone", "Python", "RAG", "Prompt Engineering"],
        "education": "B.Tech in IT, Pune University",
        "salary_expectation": "18 LPA", "persona_notes": "Excited about LLM product opportunities. Wants startup energy.",
        "bio": "Built RAG-based enterprise chatbots for 5 major banking clients at Accenture.",
        "avatar_seed": "nikhil"
    },
    {
        "id": "c014", "name": "Pooja Reddy", "current_role": "HR Analytics Specialist", "current_company": "Deloitte",
        "years_experience": 4, "location": "Hyderabad", "remote_preference": "hybrid",
        "skills": ["SQL", "Python", "Power BI", "Excel", "Workday Analytics", "People Analytics"],
        "education": "MBA HR + BA Statistics",
        "salary_expectation": "17 LPA", "persona_notes": "Interested in intersection of AI and HR tech.",
        "bio": "Led workforce analytics dashboards for 3 large enterprise clients at Deloitte.",
        "avatar_seed": "pooja"
    },
    {
        "id": "c015", "name": "Rahul Verma", "current_role": "Reinforcement Learning Researcher", "current_company": "Microsoft Research India",
        "years_experience": 6, "location": "Bengaluru", "remote_preference": "remote",
        "skills": ["Python", "PyTorch", "RL", "Gym", "Stable-Baselines3", "Simulation", "Robotics"],
        "education": "PhD CS, IIT Kanpur",
        "salary_expectation": "45 LPA", "persona_notes": "Very high bar. Only interested in frontier research problems.",
        "bio": "Pioneered RL-based supply chain optimization. 3 publications in ICML.",
        "avatar_seed": "rahul"
    },
    {
        "id": "c016", "name": "Ishaan Bhatia", "current_role": "Data Science Manager", "current_company": "Myntra",
        "years_experience": 8, "location": "Bengaluru", "remote_preference": "hybrid",
        "skills": ["Python", "ML Strategy", "Stakeholder Management", "A/B Testing", "SQL", "Team Leadership"],
        "education": "MBA, IIM Ahmedabad",
        "salary_expectation": "38 LPA", "persona_notes": "Looking for VP/Director level role. Manages team of 12.",
        "bio": "Led DS team that personalized fashion recommendations for 40M Myntra users.",
        "avatar_seed": "ishaan"
    },
    {
        "id": "c017", "name": "Tanvi Shah", "current_role": "Frontend Engineer", "current_company": "Cred",
        "years_experience": 4, "location": "Bengaluru", "remote_preference": "remote",
        "skills": ["React", "Next.js", "TypeScript", "Tailwind", "Framer Motion", "Figma", "Web Performance"],
        "education": "B.Tech in CS, SIES Mumbai",
        "salary_expectation": "22 LPA", "persona_notes": "Wants to join design-forward product companies.",
        "bio": "Built Cred's animated rewards UI with <100ms interaction times. Design + code hybrid.",
        "avatar_seed": "tanvi"
    },
    {
        "id": "c018", "name": "Gaurav Tiwari", "current_role": "Quant Analyst", "current_company": "Goldman Sachs",
        "years_experience": 5, "location": "Mumbai", "remote_preference": "onsite",
        "skills": ["Python", "R", "SQL", "Statistical Modeling", "Time Series", "Risk Modeling", "Bloomberg API"],
        "education": "M.Sc Statistics, IIT Bombay",
        "salary_expectation": "42 LPA", "persona_notes": "High salary expectations. Only open to fintech/quant roles.",
        "bio": "Modeled credit risk for GS's derivatives desk. Deep expertise in stochastic processes.",
        "avatar_seed": "gaurav"
    },
    {
        "id": "c019", "name": "Lavanya Subramanian", "current_role": "AI Product Manager", "current_company": "Freshworks",
        "years_experience": 6, "location": "Chennai", "remote_preference": "hybrid",
        "skills": ["Product Strategy", "LLM Products", "SQL", "User Research", "Roadmapping", "Python basics"],
        "education": "B.Tech + MBA, IIT Madras",
        "salary_expectation": "32 LPA", "persona_notes": "Wants to own AI product end-to-end. Dislikes pure tech roles.",
        "bio": "Launched Freshdesk's AI triage feature used by 60K+ companies globally.",
        "avatar_seed": "lavanya"
    },
    {
        "id": "c020", "name": "Dev Patel", "current_role": "Site Reliability Engineer", "current_company": "Atlassian",
        "years_experience": 5, "location": "Bengaluru", "remote_preference": "remote",
        "skills": ["Kubernetes", "Terraform", "Prometheus", "Grafana", "Python", "Go", "AWS", "Incident Management"],
        "education": "B.Tech CS, NIT Surathkal",
        "salary_expectation": "28 LPA", "persona_notes": "Wants a platform/infra engineering leadership role.",
        "bio": "Managed 99.99% uptime SLO for Jira Cloud serving 10M+ users.",
        "avatar_seed": "dev"
    },
]


def get_all_candidates():
    return CANDIDATES


def get_candidate_by_id(candidate_id: str):
    return next((c for c in CANDIDATES if c["id"] == candidate_id), None)


def get_candidates_as_text(candidate: dict) -> str:
    """Convert candidate profile to embeddable text."""
    return (
        f"{candidate['name']} is a {candidate['current_role']} at {candidate['current_company']} "
        f"with {candidate['years_experience']} years of experience. "
        f"Skills: {', '.join(candidate['skills'])}. "
        f"Education: {candidate['education']}. "
        f"Location: {candidate['location']} ({candidate['remote_preference']}). "
        f"Bio: {candidate['bio']}"
    )

def _generate_synthetic_candidates(count: int = 2000):
    first_names = ["Ravi", "Sneha", "Kunal", "Amit", "Pooja", "Vikram", "Neha", "Rahul", "Aisha", "Karthik", "Sanya", "Arun", "Divya", "Tarun", "Nisha", "Rohit", "Meghna", "Kabir", "Aditi", "Siddharth"]
    last_names = ["Sharma", "Verma", "Patel", "Reddy", "Iyer", "Nair", "Das", "Bose", "Menon", "Gupta", "Rao", "Joshi", "Kapoor", "Singh", "Chauhan", "Sen", "Bhat", "Mehta", "Desai"]
    roles = ["Software Engineer", "Data Scientist", "ML Engineer", "Product Manager", "Backend Developer", "Frontend Engineer", "DevOps Engineer", "QA Engineer", "Data Engineer", "SRE", "Cloud Architect", "Full Stack Developer", "AI Researcher", "Mobile Engineer"]
    companies = ["TCS", "Infosys", "Wipro", "Amazon", "Google", "Microsoft", "Flipkart", "Swiggy", "Zomato", "PhonePe", "Razorpay", "Cred", "Ola", "Uber", "Meta", "Netflix", "Atlassian", "Adobe", "Salesforce"]
    locations = ["Bengaluru", "Mumbai", "Pune", "Hyderabad", "Chennai", "Delhi", "Gurugram", "Noida", "Remote"]
    all_skills = ["Python", "Java", "C++", "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Django", "Flask", "FastAPI", "Spring Boot", "SQL", "MongoDB", "PostgreSQL", "Redis", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins", "Git", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "NLP", "Computer Vision", "Data Analysis", "Tableau", "Power BI", "Rust", "Go", "GraphQL", "Kafka", "Spark"]
    educations = ["B.Tech in CS", "M.Tech in CS", "MCA", "B.Sc in IT", "M.Sc in IT", "PhD in CS", "B.E. in Electronics", "B.Tech in IT", "MBA", "BCA"]
    
    unique_signatures = {f"{c['name']}_{c['current_role']}_{c['years_experience']}" for c in CANDIDATES}
    start_idx = len(CANDIDATES) + 1
    
    added_count = 0
    attempts = 0
    
    while added_count < count and attempts < 10000:
        attempts += 1
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        role = random.choice(roles)
        # Weight experience: 15% freshers (0-1), 60% mid (2-8), 25% senior (9-25)
        r = random.random()
        if r < 0.15:
            years_exp = random.randint(0, 1)
        elif r < 0.75:
            years_exp = random.randint(2, 8)
        else:
            years_exp = random.randint(9, 25)
            
        signature = f"{name}_{role}_{years_exp}"
        if signature in unique_signatures:
            continue
            
        unique_signatures.add(signature)
        
        cid = f"c{start_idx + added_count:04d}"
        num_skills = random.randint(4, 8)
        c_skills = random.sample(all_skills, num_skills)
        
        CANDIDATES.append({
            "id": cid,
            "name": name,
            "current_role": role,
            "current_company": random.choice(companies),
            "years_experience": years_exp,
            "location": random.choice(locations),
            "remote_preference": random.choice(["remote", "hybrid", "onsite"]),
            "skills": c_skills,
            "education": random.choice(educations),
            "salary_expectation": f"{random.randint(5, 60)} LPA" if years_exp > 0 else "Negotiable",
            "persona_notes": f"Synthetic candidate {cid}",
            "bio": f"{'Experienced' if years_exp > 3 else 'Junior'} {role} with {years_exp} years working with {c_skills[0]} and {c_skills[1]}.",
            "avatar_seed": f"seed_{cid}"
        })
        added_count += 1

# Generate 2000 unique candidates immediately on import
_generate_synthetic_candidates(2000)
