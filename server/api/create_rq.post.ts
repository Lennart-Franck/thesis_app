import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

export default defineEventHandler(async (event) => {

 const template = `Given the objective "{objective}" please develop four research questions.

  Research Questions have the following characteristics:
    - In general, a good research question should be appropriate, meaningful, and purposeful
    - Provide an overview of a research area and identify the quantity and type of research and results available within it.
    - Focused on the topic area, venues, research methods or trends
    - Be short sentenced and not to detailed
 
  Please follow the characteristics and only provide the question in JSON format with the keys 'Id' and 'Question' and root key 'Questions'.`;

  const parser = new StringOutputParser();

  const prompt = PromptTemplate.fromTemplate(template);

  const gpt = new ChatOpenAI({ model: "gpt-4o" });

  const chain = prompt.pipe(gpt).pipe(parser);

  const { objective } = await readBody(
    event,
  );

  const response = await chain.invoke({ objective: objective });

  return response;
});
