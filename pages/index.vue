<script setup lang='ts'>
const toast = useToast()

const objective = ref('')

const research_questions = ref<any>(null)

const newQuestion = ref('')

const isRQLoading = ref(false)

const isKeywordLoading = ref(false)

const isSearchStringLoading = ref(false)

const keywords = ref<{ title: string; isChecked: boolean; }[] | null>(null)

const searchString = ref('')

async function onGenerateRQ() {
  isRQLoading.value = true
  try {
    // Versuche, die Daten an die API zu senden
    const body = await $fetch('/api/create_rq', {
      method: 'POST',
      body: {
        objective: objective.value,
      }
    })

    const cleanedApiResponseString = body.replace(/```json|```/g, "").trim();

    const apiResponse = JSON.parse(cleanedApiResponseString);

    console.log(apiResponse)

    const questions = apiResponse.Questions.map((q: { Question: String; }) => q.Question);

    research_questions.value = questions

    console.log(research_questions.value)

  } catch (error: any) {

    toast.add({
      title: 'Error',
      description: error,
    })

  } finally {
    isRQLoading.value = false
  }
}

function addQuestion() {
  research_questions.value.push(
   newQuestion.value
  )
  newQuestion.value = ''
}

async function createKeywords() {
  isKeywordLoading.value = true
  try {
    // Versuche, die Daten an die API zu senden
    const body = await $fetch('/api/create_keywords', {
      method: 'POST',
      body: {
        objective: objective.value,
        questions: String(research_questions.value),
      }
    })

    console.log(body)

    // for each newline make a string and add to array
    keywords.value = body.split('\n').map((k: string) => {
      return {
        title: k.replace(/^\d+\.\s*/gm, '').trim(),
        isChecked: false
      };
    });


  } catch (error: any) {

    toast.add({
      title: 'Error',
      description: error,
    })

  } finally {
    isKeywordLoading.value = false
  }

}

const columns = [{
  key: 'id',
  label: 'ID'
}, {
  key: 'question',
  label: 'Research Question'
}]

async function createSearchString() {

  const selectedKeywords = keywords.value!.filter(k => k.isChecked).map(k => k.title);

  isSearchStringLoading.value = true
  try {
    // Versuche, die Daten an die API zu senden
    const body = await $fetch('/api/create_search_string', {
      method: 'POST',
      body: {
        keywords: selectedKeywords
      }
    })

    console.log(body)

    searchString.value = body;


  } catch (error: any) {

    toast.add({
      title: 'Error',
      description: error,
    })

  } finally {
    isSearchStringLoading.value = false
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.add({
    title: 'Copied to clipboard',
    description: text,
  })
}

</script>

<template>
  <div class="mb-20">

    <header class="bg-white mt-12">

      <h1 class="text-3xl font-bold text-gray-900 mb-4">Creating Research Questions and Search String</h1>
      <!-- Write an introduction text -->
      <p class="text-gray-500 text-sm">This tool helps you to create Research Questions and a Search String for your
        research project. You can start by entering your objective and we will generate some research questions for you.
        You can add more questions if you want. Based on the research questions, we will help you define keywords for
        the search string. Finally, we will help you create the search string based on the selected keywords.</p>
    </header>

    <p class="text-xl text-gray-900 mt-4">1. Objective:</p>
    <p class="text-sm text-gray-500">Please enter your Objective for the creating Research Questions:</p>

    <div class="mt-4 flex gap-x-2">
      <UInput v-model="objective" icon="i-heroicons-magnifying-glass-20-solid" size="sm" color="white" :trailing="false"
        placeholder="Objective..." class="w-full" />
      <UButton label="Create RQs" @click="onGenerateRQ" :loading="isRQLoading" />
    </div>
    <div v-if="research_questions" class="my-8">
      <p class="text-xl text-gray-900 mt-4">2. Research Questions:</p>
      <p class="text-gray-500 text-sm mb-4">Based on your objective, we have generated some research questions for you.
        You can add more questions if you want.</p>
      
        <div v-for="(question, index) in research_questions" class="my-2">
          <UInput v-model="research_questions[index]" placeholder="Add question"
            :ui="{ icon: { trailing: { pointer: '' } } }">
            <template #trailing>
              <UButton color="gray" variant="link" icon="i-heroicons-x-mark-20-solid" :padded="false"
                @click="research_questions.splice(index, 1)" />
            </template>
          </UInput>
      </div>

      <!--<UTable :rows="research_questions" :columns="columns" />-->
      <p class="text-sm text-gray-500 w-72 mt-4 ">Add Research Question:</p>
      <div class="flex gap-x-4 mt-2">

        <UInput v-model="newQuestion" class="w-full" placeholder="Enter your question" />
        <UButton class="" @click="addQuestion">Add Question</UButton>
      </div>
    </div>



    <div v-if="research_questions" class="my-8">
      <p class="text-xl text-gray-900">3. Keywords:</p>
      <p class="text-gray-500 text-sm mb-4">Next we help you define keywords for the search string. You can select or
        deselect keywords</p>
      <UButton @click="createKeywords" :loading="isKeywordLoading">Generate Keywords</UButton>
      <div v-if="keywords" class="mt-4">
        <UCheckbox v-for="keyword in keywords" :label="keyword.title" v-model="keyword.isChecked" />
      </div>
    </div>


    <div v-if="searchString" class="my-8">
      <p class="text-xl text-gray-900">4. Search String:</p>
      <p class="text-gray-500 text-sm mb-4">Finally, we help you create the search string based on the selected keywords
      </p>

      <UButton label="Create Search String" v-if="keywords" :loading="isSearchStringLoading"
        @click="createSearchString" />

      <div class="mt-4">

        <UTextarea v-model="searchString" class="w-full" />
        <UButton class="mt-2" label="Copy to Clipboard" @click="copyToClipboard(searchString)" />

      </div>
    </div>
  </div>
</template>
