<script setup lang='ts'>
import Papa from 'papaparse';
import { extractionItems, type ExtractionItem } from '~/utils/extraction_items';

declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean
  }
}

const toast = useToast()

const filesFound = ref(0)

const localExtractionItems = ref<ExtractionItem[]>(extractionItems)

const isLoading = ref(false)

const doneTesting = ref(false)

const isOpen = ref(false)

const editItem = ref<ExtractionItem | null>(null)

const editIndex = ref(-1)

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
    key: 'actions'
  },
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
  },
]

const items = (row: ExtractionItem) => [
  [{
    label: 'Edit',
    icon: 'i-heroicons-pencil-square-20-solid',
    click: () => {
      editItem.value = row
      isOpen.value = true
      editIndex.value = localExtractionItems.value.indexOf(row)
    }
  },
  {
    label: 'Delete',
    icon: 'i-heroicons-trash-20-solid',
    click: () => localExtractionItems.value.splice(localExtractionItems.value.indexOf(row), 1)
  }]
]

async function onExtract(isTest: boolean = true) {
  if (files.value === null) return;

  const formData = new FormData()

  if (isTest && files.value.length < 3) {
    toast.add({
      title: 'Error',
      description: 'Please select at least 3 files for the test extraction',
      color: "red"
    })
    return;
  }

  const length = isTest ? 3 : files.value.length

  for (let i = 0; i < length; i++) {
    formData.append(files.value[i].name, files.value[i])
  }

  formData.append('extractionItems', JSON.stringify(selected.value))

  try {
    isLoading.value = true

    // Versuche, die Daten an die API zu senden
    const body = await $fetch('/api/extract_information', {
      method: 'POST',
      body: formData,
    })

    if (isTest) {
      doneTesting.value = true
    }

    if (body == null) {
      toast.add({
        title: 'Error',
        description: 'No data found',
        color: "red"
      })
      return;
    }

    var csv = Papa.unparse(body, {
      delimiter: ";",
      header: true
    });

    var csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var csvURL = window.URL.createObjectURL(csvData);
    var tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', 'test_extraction.csv');
    tempLink.click();

    toast.add({
      title: 'Success',
      description: 'Extraction was successful. The file is downloaded.',
      color: "green"
    })

  } catch (error: any) {

    toast.add({
      title: 'Error',
      description: error,
    })

  } finally {
    isLoading.value = false
  }
}

const selected = ref<ExtractionItem[]>([])

</script>

<template>

  <Head>
    <Title>
      Extract Information
    </Title>
  </Head>
  <div>
    <header class="bg-white mt-12">

      <h1 class="text-3xl font-bold text-gray-900 mb-4">Extracting Information based on Extractions Items</h1>
      <!-- Write an introduction text -->
      <p class="text-gray-500 text-sm">
        This tool helps you to extract information based on extraction items from your papers.
      </p>
    </header>

    <UModal v-model="isOpen" :ui="{width: 'sm:max-w-3xl'}">
      <UCard :ui="{
        ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800'
      }">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Edit Extraction Item</h2>
            <UButton @click="isOpen = false" variant="outline" color="red">
              Close
            </UButton>
          </div>
        </template>


        <div class="flex flex-col gap-y-3">
          <UInput v-model="editItem!.title" type="text" placeholder="Title" />
          <UTextarea v-model="editItem!.question" type="text" placeholder="Question" />
          <UInput v-model="editItem!.return_type" type="text" placeholder="Return Type" />
        </div>

        
          <UButton @click="() => { 
            localExtractionItems[editIndex] = editItem!
            isOpen = false
          }" class="mt-4">
            Save
          </UButton>


      </UCard>
    </UModal>

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


      <UTable :rows="localExtractionItems" :columns="columns" v-model="selected">
        <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
    </div>

    <!-- start extraction -->
    <div class="my-12" v-if="filesFound > 0">
      <p class="text-xl text-gray-900 mt-4">3. Start with the Extraction</p>
      <p class="text-sm text-gray-500">We first start with a test extraction and only use 3 papers. On these you can
        test your extraction items (with question and return type) and check the results.</p>

      <div class="flex items-center gap-4">
        <UButton @click="onExtract" :loading="isLoading" class="mt-2">
          Start Test Extraction (3 Papers)
        </UButton>
        <p class="text-sm text-gray-500 mt-2" v-if="doneTesting">Test Extraction was successful. You can proceed with
          full extraction.</p>

      </div>
    </div>

    <div v-if="doneTesting" class="my-12">
      <UButton :loading="isLoading" @click="() => onExtract(false)" class="mt-6">
        Start Full Extraction
      </UButton>
    </div>
  </div>
</template>
