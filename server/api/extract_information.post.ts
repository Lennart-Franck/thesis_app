import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import formidable from 'formidable'
import fs from 'fs'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { ExtractionItem } from '~/utils/extraction_items'

export default defineEventHandler(async (event) => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  const uploadPath = `${__dirname}/../uploads`
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath)
  }

  const form = formidable({ uploadDir: uploadPath, keepExtensions: true })

  const [fields, files] = await form.parse(event.node.req)

  // extract field names extractionItems
  const extractionItems = fields.extractionItems

  if (extractionItems === undefined) return

  const json: ExtractionItem[] = JSON.parse(extractionItems[0])

  const returnJson = []

  for (const file of Object.values(files)) {
    if (file === undefined) continue

    var item = {}

    const pdfPath = file[0].filepath
    const originalFilename = file[0].originalFilename

    const docs = await indexingLoadDocuments(pdfPath)
    const allSplits = await indexingSplitDocuments(docs)
    const vectorStore = await indexingStoreVectors(allSplits)

    const resultObject: { filename: string | null; [key: string]: any } = { filename: originalFilename }

    for (const item of json) {
      const result = await retrieveDocumentsAndGenerate(vectorStore, item.question, item.return_type)
      
      console.log(result)
      resultObject[item.title] = result
    }

    returnJson.push(resultObject)
  }

  return returnJson
})

async function indexingLoadDocuments(pdfPath: string) {
  const loader = new PDFLoader(pdfPath)
  const docs = await loader.load()
  return docs
}

async function indexingSplitDocuments(docs: any) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 40,
  })
  return await textSplitter.splitDocuments(docs)
}

async function indexingStoreVectors(allSplits: any) {
  const vectorStore = await MemoryVectorStore.fromDocuments(allSplits, new OpenAIEmbeddings())

  return vectorStore
}

async function retrieveDocumentsAndGenerate(vectorStore: MemoryVectorStore, question: string, return_type: string) {
  const retriever = vectorStore.asRetriever(3)

  const llm = new ChatOpenAI({ model: 'gpt-4o' })

  const prompt = PromptTemplate.fromTemplate(template)
  //const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  const ragChain = await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser: new StringOutputParser(),
  })

  const result = await ragChain.invoke({
    question: question,
    return_type: return_type,
    context: await retriever.invoke(question),
  })

  return result
}

const template = `You are an assistant for question-answering tasks for study extraction items. 
Use the following pieces of retrieved context to answer the question and use the given return types. If you don't know the answer return 'not sure'. Only answer with the information in the return type format.
Question: {question}
Return Type: {return_type}
Context: {context}
Answer:
`
