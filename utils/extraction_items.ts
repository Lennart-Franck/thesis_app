export interface ExtractionItem {
  title: string;
  question: string;
  return_type: string;
}

export const extractionItems: ExtractionItem[] = [
  {
    title: "SWEBOK Category Identification",
    question: "Which SWEBOK category (or categories) does this study primarily address?",
    return_type: `One or more of the following categories: 
      "Software Requirements",
      "Software Design",
      "Software Construction",
      "Software Testing",
      "Software Maintenance",
      "Software Configuration Management",
      "Software Engineering Management",
      "Software Engineering Process",
      "Software Engineering Models and Methods",
      "Software Quality",
      "Software Engineering Professional Practice",
      "Software Engineering Economics",
      "Computing Foundations",
      "Mathematical Foundations",
      "Engineering Foundations"`
  },
  {
    title: "Research Method Identification",
    question: "What research method does this study employ?",
    return_type: `One of the following categories:
      "Experiment",
      "Case Study",
      "Survey",
      "Action Research",
      "Grounded Theory",
      "Ethnography",
      "Systematic Literature Review",
      "Meta-Analysis",
      "Simulation",
      "Field Study",
      "Formal Methods"`
  }, {
  title: "Research Type Identification",
  question: "What research type does this study represent?",
  return_type: `One of the following types:
    "Qualitative",
    "Quantitative",
    "Mixed Methods",
    "Theoretical",
    "Empirical",
    "Experimental",
    "Descriptive",
    "Exploratory",
    "Explanatory",
    "Evaluative"`
}
];
