<template>
  <div class="view-container">
    <h1>Analitik</h1>
    <p class="subtitle">Laporan keuangan dan insights</p>
    
    <AnalyticsView :snapshot="snapshot" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useTransactions } from '../composables/useTransactions'
import { useCategories } from '../composables/useCategories'
import { useAnalytics } from '../composables/useAnalytics'
import AnalyticsView from '../components/AnalyticsView.vue'

const { currentUser } = useAuth()
const { transactions, fetchTransactions } = useTransactions()
const { categories, fetchCategories } = useCategories()
const { snapshot } = useAnalytics(transactions, categories)

onMounted(async () => {
  if (currentUser.value?.id) {
    await fetchCategories(currentUser.value.id)
    await fetchTransactions(currentUser.value.id)
  }
})
</script>

<style scoped>
.view-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: var(--text-muted);
  margin: 0 0 2rem 0;
}
</style>
