<template>
  <section style="padding: 0.5rem;">
    <a class="button" @click="$emit('run')">Run</a>

    <span v-if="showCycles" style="margin-left: 2rem;">
      cycle:
      <a class="button" @click="$emit('update:cycle', Math.min(Math.max(cycle - 1, 0), numCycles - 1))">-</a>
      <div class="select">
        <select :value="cycle" @change="$emit('update:cycle', Number($event.target.value))">
          <option v-for="(n, index) in numCycles" :key="index" :value="index">{{ index }}</option>
        </select>
      </div>
      <a class="button" @click="$emit('update:cycle', Math.min(Math.max(cycle + 1, 0), numCycles - 1))">+</a>
      <a style="margin-left: 1rem;" class="button" @click="toggleTimer">{{ timer == null ? 'start' : 'stop' }}</a>
    </span>

    <span v-if="showChartOptions" style="margin-left: 2rem;">
      <label class="checkbox">
        <input type="checkbox" :checked="visualize" @change="$emit('update:visualize', $event.target.checked)">
        Visualize word/phoneme activations
      </label>
    </span>
  </section>
</template>

<script>
export default {
  props: {
    cycle: Number,
    numCycles: Number,
    showCycles: Boolean,
    showChartOptions: Boolean,
    visualize: Boolean
  },
  data() {
    return {
      timer: null
    }
  },
  methods: {
    toggleTimer() {
      if (this.timer == null) {
        const fn = () => {
          const newVal = Math.min(Math.max(this.cycle + 1, 0), this.numCycles - 1)
          this.$emit('update:cycle', newVal)
          if (newVal == this.numCycles - 1) {
            clearInterval(this.timer)
            this.timer = null
          }
        }
        this.timer = setInterval(fn, 250)
        fn()
      } else {
        clearInterval(this.timer)
        this.timer = null
      }
    }
  }
}
</script>
