import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

export default defineEventHandler(async (event) => {

  const classify_template = `Task: Categorize the following keywords into one of the PICO categories: Problem (P), Intervention (I), Comparison (C), Outcome (O).

  PICO Definitions for Software Engineering: 
  - Problem (P): Keywords related to the issue, challenge, or context being addressed. This could include specific software problems, development challenges, or the context in which the software operates. Examples: "software bugs," "performance bottlenecks," "legacy code maintenance."
  - Intervention (I): Keywords related to the technique, method, tool, or approach being studied to address the problem. Examples: "automated testing," "agile methodology," "refactoring."
  Comparison (C): Keywords related to the alternative to the intervention. This could include traditional methods, different techniques, or no intervention at all. Examples: "manual testing," "waterfall model," "no optimization."
  - Outcome (O): Keywords related to the results or effects being measured. This could include improvements, performance metrics, or any measurable effects of the intervention. Examples: "reduced defect rate," "increased development speed," "enhanced security."
  - When an item does not fit one of these categories, mark it as (N/A). 
  
  Instructions: For each keyword provided, categorize it into one of the PICO categories by writing the appropriate letter (P, I, C, O, N/A) next to the keyword.
  
  keywords:
  {keywords}`;

  const search_string_template = `
  Using the categorized keywords, create a Boolean query that can be
  submitted to IEEE or Scopus which groups together keywords from each category. 
  For example:
  ((itemP1[Title/Abstract] OR itemP2[Title/Abstract] or itemP3[Title/Abstract]) AND
  (itemI1[Title/Abstract] OR itemI1[Title/Abstract] OR itemI1[Title/Abstract]) AND
  (itemC1[Title/Abstract] OR itemC2[Title/Abstract] OR itemC3[Title/Abstract])) AND
  (itemO1[Title/Abstract] OR itemO2[Title/Abstract] OR itemO3[Title/Abstract])

  Please only provide the search string.
  
  categorized list: {keywords}`

  const parser = new StringOutputParser();

  const prompt = PromptTemplate.fromTemplate(classify_template);

  const gpt = new ChatOpenAI({ model: "gpt-4o" });

  const chain = prompt.pipe(gpt).pipe(parser);

  const { keywords } = await readBody(
    event,
  );

  const response = await chain.invoke({ keywords: keywords });

  const search_string_prompt = PromptTemplate.fromTemplate(search_string_template);

  const search_string_chain = search_string_prompt.pipe(gpt).pipe(parser);

  const search_string_response = await search_string_chain.invoke({ keywords: response });

  return search_string_response;
});
