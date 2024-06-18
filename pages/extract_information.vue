<script setup lang='ts'>
import { extractionItems, type ExtractionItem } from '~/utils/extraction_items';


const toast = useToast()

const filesFound = ref(0)

const localExtractionItems = ref<ExtractionItem[]>(extractionItems)

const insertItem = ref<ExtractionItem>({
  title: '',
  question: '',
  return_type: ''
})

const { files, open, reset, onChange } = useFileDialog(
  {
    accept: ".pdf",
    multiple: true,
    directory: true
  }
)

onChange((files) => {

  // check if files are .pdf
  if (files != null) {
    [...files].forEach(file => {
      if (!file.name.endsWith('.pdf')) {
        toast.add({
          title: 'Error',
          description: 'Please use a directory with only .pdf files',
          color: "red"
        })
        reset()
        return;
      }
    })
  }

  filesFound.value = files != null ? files.length : 0
})

function addItem() {
  if (insertItem.value.title === '' || insertItem.value.question === '' || insertItem.value.return_type === '') {
    toast.add({
      title: 'Error',
      description: 'Please fill out all fields',
      color: "red"
    })
    return;
  }

  localExtractionItems.value.push(insertItem.value)
  insertItem.value = {
    title: '',
    question: '',
    return_type: ''
  }

}

const columns = [
  {
    key: 'title',
    label: 'Title'
  },
  {
    key: 'question',
    label: 'Question'
  },
  {
    key: 'return_type',
    label: 'Return Type'
  }
]

function select(row: ExtractionItem) {
  const index = selected.value.findIndex((item) => item.title === row.title)
  if (index === -1) {
    selected.value.push(row)
  } else {
    selected.value.splice(index, 1)
  }
}

async function onExtract() {
  if (files.value === null) return;

  const formData = new FormData()

  for (let i = 0; i < files.value.length; i++) {
    formData.append(files.value[i].name, files.value[i])
  }

  formData.append('extractionItems', JSON.stringify(selected.value))

  try {
    // Versuche, die Daten an die API zu senden
    const body = await $fetch('/api/extract_information', {
      method: 'POST',
      body: formData,
    })

    console.log(body)

  } catch (error: any) {

    toast.add({
      title: 'Error',
      description: error,
    })

  }
}

const selected = ref<ExtractionItem[]>([])

</script>

<template>
  <div>
    <header class="bg-white mt-12">

      <h1 class="text-3xl font-bold text-gray-900 mb-4">Extracting Information based on Extractions Items</h1>
      <!-- Write an introduction text -->
      <p class="text-gray-500 text-sm">
        This tool helps you to extract information based on extraction items from your papers.
      </p>
    </header>

    <!-- file upload -->
    <div class="my-12">
      <p class="text-xl text-gray-900 mt-4">1. Files:</p>

      <p class="text-sm text-gray-500">Please select the folder where all the .pdf-Files are located that you want to
        apply the data extraction to. The directory should only include .pdf-files.</p>
      <div class="flex">
        <UButton @click="open()" class="mt-2">
          Choose directory
        </UButton>
        <p class="text-gray-500 ml-4 mt-3" v-if="filesFound">{{ filesFound }} Dateien gefunden</p>
      </div>
    </div>

    <!-- define extraction items -->
    <div class="my-12" v-if="filesFound > 0">
      <p class="text-xl text-gray-900 mt-4">2. Add Extraction Items:</p>
      <p class="text-sm text-gray-500">Please define the extraction items you want to extract from the papers. You need
        to define Title, Question and Return Type for each extraction item.</p>
      <div class="mt-4">
        <div class="flex flex-col gap-y-2">
          <UInput v-model="insertItem.title" type="text" placeholder="Title" />
          <UTextarea v-model="insertItem.question" type="text" placeholder="Question" />
          <UInput v-model="insertItem.return_type" type="text" placeholder="Return Type" />
        </div>
        <div class="mt-4">
          <UButton @click="addItem">
            Add Extraction Item
          </UButton>
        </div>
      </div>
    </div>


    <!-- show extraction items -->
    <div class="my-12" v-if="filesFound > 0">
      <p class="text-xl text-gray-900 mt-4">3. Select Extraction Items:</p>
      <p class="text-sm text-gray-500">Please select the extractions items that you want to include.</p>


      <UTable :rows="localExtractionItems" :columns="columns" v-model="selected" @select="select" />
    </div>

    <!-- start extraction -->
    <div class="mt-4" v-if="filesFound > 0">
      <p class="text-xl text-gray-900 mt-4">3. Start with the Extraction</p>
      <p class="text-sm text-gray-500">We first start with a test extraction and only use 3 papers. On these you can
        test your extraction items (with question and return type) and check the results.</p>
      <UButton @click="onExtract" class="mt-2">
        Start Test Extraction
      </UButton>
    </div>
  </div>
</template>
