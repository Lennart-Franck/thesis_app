<script setup>
import Papa from 'papaparse';

const toast = useToast()

const includeCriteria = ref([null])
const excludeCriteria = ref([null])

const isLoading = ref(false)

const { files, open, reset, onChange } = useFileDialog(
  {
    accept: ".csv",
    multiple: false,
  }
)

async function sortPapers() {

  if (files.value === null || files.value.length === 0) {
    toast.add({
      title: 'Error',
      description: 'Please upload a file',
      color: "red"
    })
    return
  }

  if (includeCriteria.value[0] === null || excludeCriteria.value[0] === null) {
    toast.add({
      title: 'Error',
      description: 'Please add at least one include/exclude criteria',
      color: "red"

    })
    return
  }

  isLoading.value = true

  try {

    Papa.parse(files.value[0], {
      header: true,
      delimiter: ";",
      complete: async function (results) {
        const file = results.data;

        const body = await $fetch('/api/criteria_matching', {
          method: 'POST',
          body: {
            includeCriteria: includeCriteria.value,
            excludeCriteria: excludeCriteria.value,
            json: file,
          }
        });

        var csv = Papa.unparse(body, {
          delimiter: ";",
          header: true
        });

        var csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var csvURL = null;
        if (navigator.msSaveBlob) {
          csvURL = navigator.msSaveBlob(csvData, 'download.csv');
        } else {
          csvURL = window.URL.createObjectURL(csvData);
        }
        var tempLink = document.createElement('a');
        tempLink.href = csvURL;
        tempLink.setAttribute('download', 'download.csv');
        tempLink.click();
      }
    });

  } catch (error) {
    toast.add({
      title: 'Error',
      description: error,
    })
  }
  isLoading.value = false
}
</script>

<template>
  <div>
    <header class="bg-white mt-12">

      <h1 class="text-3xl font-bold text-gray-900 mb-4">Sorting Papers based on Criteria</h1>
      <!-- Write an introduction text -->
      <p class="text-gray-500 text-sm">
        In this step, you can sort the papers based on include and exclude criteria. You can add multiple criteria and
        sort the papers based on the criteria
      </p>
    </header>

    <!-- file upload -->
    <div class="my-12">
      <p class="text-xl text-gray-900 mt-4">1. File:</p>

      <p class="text-sm text-gray-500">Please upload your .csv file with ";" as a delimiter. The file should have the
        following columns: Title, Abstract, Year, Keywords.</p>
      <div class="flex">
        <UButton @click="open()" class="mt-2">
          Choose file
        </UButton>
        <p class="text-gray-500 ml-4 mt-2" v-if="files">{{ files[0]?.name }}</p>
      </div>

    </div>

    <div class="my-12">
      <p class="text-xl text-gray-900 mt-4">2. Define Include Criteria:</p>
      <p class="text-sm text-gray-500">Please add the criteria that you want to include in the sorting process. You can
        add as many as you like.</p>
      <div v-for="(criteria, index) in includeCriteria" class="my-2">
        <UInput v-model="includeCriteria[index]" placeholder="Add criteria"
          :ui="{ icon: { trailing: { pointer: '' } } }">
          <template #trailing>
            <UButton color="gray" variant="link" icon="i-heroicons-x-mark-20-solid" :padded="false"
              @click="includeCriteria.splice(index, 1)" />
          </template>
        </UInput>
      </div>
      <UButton @click="includeCriteria.push(null)" class="my-2">Add criteria</UButton>
    </div>

    <div class="my-12">
      <p class="text-xl text-gray-900 mt-4">3. Define Exclude Criteria:</p>
      <p class="text-sm text-gray-500">Please add the criteria that you want to exclude in the sorting process. You can
        add as many as you like.</p>
      <div v-for="(criteria, index) in excludeCriteria" class="my-2">
        <UInput v-model="excludeCriteria[index]" placeholder="Add criteria"
          :ui="{ icon: { trailing: { pointer: '' } } }">
          <template #trailing>
            <UButton color="gray" variant="link" icon="i-heroicons-x-mark-20-solid" :padded="false"
              @click="excludeCriteria.splice(index, 1)" />
          </template>
        </UInput>
      </div>
      <UButton @click="excludeCriteria.push(null)" class="my-2">Add criteria</UButton>
    </div>

    <div class="my-12">
      <p class="text-xl text-gray-900 mt-4">4. Sort Papers:</p>
      <p class="text-sm text-gray-500">Click the button below to sort the papers based on the criteria you defined
        above. This may take some time. The file will be downloaded.</p>

      <UButton @click="sortPapers" :loading="isLoading" class="mt-2">Sort Papers</UButton>
    </div>
  </div>
</template>
