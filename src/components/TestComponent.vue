<template>
  <div>
    <div>
      <simulation-chart :chart-data="[]" />
    </div>
  </div>
</template>

<script>
import SimulationChart from './SimulationChart.vue'

export default {
  components: { SimulationChart }
}
</script>