import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

export default defineEventHandler(async (event) => {

 const template = `Follow my instructions precisely to develop a highly effective Boolean query for a
 systematic mapping study literature search. Do not explain or elaborate. Only respond
 with exactly what I request. First, Given the following objective and research questions
 please identify 20 keywords that are relevant. The keywords you
 identify should be used to retrieve relevant studies, so be careful that the terms
 you choose are not too broad. You are not allowed to have duplicates in your list. 
 Keywords are most likely just one, maybe two words. Keywords can also be often used words from the research questions or objective.
 Please only give the list of keywords without hyphens or commas.
 
 Objective: {objective}
 
 Research Questions: 
 {research_questions}`;

  const parser = new StringOutputParser();

  const prompt = PromptTemplate.fromTemplate(template);

  const gpt = new ChatOpenAI({ model: "gpt-4o" });

  const chain = prompt.pipe(gpt).pipe(parser);

  const { objective, research_questions } = await readBody(
    event,
  );

  const response = await chain.invoke({ objective: objective, research_questions: research_questions});

  return response;
});
