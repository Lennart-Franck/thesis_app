import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

interface CriteriaResponse {
  decision: string;
  explanation: string;
  score: number;
}

export default defineEventHandler(async (event) => {
  const { includeCriteria, excludeCriteria, json } = await readBody(
    event,
  );

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (const row of json) {
    const criteriaText = `Title: ${row.Title}\nYear: ${row.Year}\nKeywords: ${row.Keywords}\nAbstract: ${row.Abstract}`;

    let includeCount = 0;
    let excludeCount = 0;

    for (const criteria of includeCriteria) {
      const result = await isCriteriaMet(criteria, criteriaText);
      row[criteria] = result.decision;
      row[`${criteria} Explanation`] = result.explanation;
      row[`${criteria} Confidence`] = result.score;
      if (result.decision === 'yes') {
        includeCount++;
      }
    }

    for (const criteria of excludeCriteria) {
      const result = await isCriteriaMet(criteria, criteriaText);
      row[criteria] = result.decision;
      row[`${criteria} Explanation`] = result.explanation;
      row[`${criteria} Confidence`] = result.score;
      if (result.decision === 'no') {
        excludeCount++;
      }
    }

    const includeCriteriaMet = includeCount === includeCriteria.length; 
    const excludeCriteriaMet = excludeCount === excludeCriteria.length;

    if (includeCriteriaMet && excludeCriteriaMet) {
      row['Suggested Prediction'] = 'Include';
    } else {
      row['Suggested Prediction'] = 'Exclude';
    }

    await delay(10000); // 10 Sekunden Wartezeit für Ratelimit
  }

  return json;
});

const isCriteriaMet = async (criteria: string, text: string): Promise<CriteriaResponse> => {
  const includeTemplate = `You will be given a text which consists of a title, year, keywords and an abstract. You will also be given a criteria. You have to decide if the text meets the criteria or not.
  
  Criteria: {criteria}
  
  Text: {text}
  
  Only answer in JSON with the following keys:
  - "decision" which is only yes or no
  - "explanation" which is a short explanation that includes text citations for why you made your decision
  - "score" the probability between 0.0 and 1.0 that your answer is correct.`;

  const parser = new StringOutputParser();

  const prompt = PromptTemplate.fromTemplate(includeTemplate);

  const gpt = new ChatOpenAI({ model: "gpt-4o", model_kwargs: {"response_format": {"type": "json_object"}} });

  const chain = prompt.pipe(gpt).pipe(parser);

  const response = await chain.invoke({ criteria: criteria, text: text});
  const cleanedApiResponseString = response.replace(/```json|```/g, "").trim();

  const result: CriteriaResponse = JSON.parse(cleanedApiResponseString);
  return result;

};
