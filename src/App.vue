<template>
  <div id="app">
    <div style="flex: 0 1 auto;">
      <section class="hero is-primary" style="padding: 0.5rem 1rem 0 1rem;">
        <div class="hero-foot">
          <nav class="tabs is-boxed">
            <ul>
              <li v-for="(tab, index) in tabs" :key="index" :class="{ 'is-active': activeTab == index }">
                <a @click="activeTab = index">{{ tab }}</a>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      <simulation-toolbar
        v-if="activeTab != 0"
        @run="run"
        :cycle.sync="cycle"
        :num-cycles="numCycles"
        :show-cycles="[1, 2 , 3, 4].indexOf(activeTab) >= 0"
        :visualize.sync="showVisualizations"
        :show-chart-options="activeTab == 1" />
    </div>

    <div v-if="activeTab == 0" style="display: flex; flex: 1 1 auto;">
      <config :config="config" />
    </div>
    <div v-else-if="activeTab == 1" style="display: flex; flex: 1 1 auto; min-height: 0;">
      <simulation-page
        :sim-config="config"
        :phonemes="phonemes"
        :feature-data="featureData"
        :word-data="wordData"
        :input-data="inputData"
        :phoneme-data="phonemeData"
        :visualize="showVisualizations" />
    </div>
    <div v-else-if="activeTab == 7" style="display: flex; flex: 1 1 auto; min-height: 0;">
      <analysis :chart-data="chartData" :config="analysisConfig" />
    </div>
    <pre v-else style="flex: 1 1 auto; margin: 0; background: #eee; width: 100%; overflow: scroll;">{{ dat }}</pre>
  </div>
</template>

<script>
import { TraceSim, createDefaultConfig, doSimAnalysis, formatAnalysis, TraceDomain, TraceCalculationType, TraceChoice } from 'tracejs'
import SimulationToolbar from './components/SimulationToolbar.vue'
import Config from './components/Config.vue'
import SimulationPage from './components/SimulationPage.vue'
import Analysis from './components/Analysis.vue'

const chartColors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#000000']

export default {
  name: 'app',
  data() {
    return {
      tabs: ['Config', 'Simulation', 'Input', 'Feature', 'Phoneme', 'Word', 'Analysis', 'Analysis (Chart)'],
      activeTab: 0,
      config: createDefaultConfig(),
      analysisConfig: {
        domain: TraceDomain.WORDS,
        itemsToWatch: 10,
        calculationType: TraceCalculationType.STATIC,
        alignment: 4,
        choice: TraceChoice.NORMAL,
        kValue: 0
      },
      cycle: -1,
      numCycles: 0,
      analysis: [],

      // chart data
      chartData: { datasets: [] },
      featureData: [],
      wordData: [],
      inputData: [],
      phonemeData: [],

      showVisualizations: false
    }
  },
  created() {
    // create the sim here, and not in data, because we don't want Vue to watch the data changes
    // this.config.modelInput = '-gradu^l-'
    // this.config.decay.W = 0.03
    this.sim = new TraceSim(JSON.parse(JSON.stringify(this.config)))
  },
  computed: {
    phonemes() {
      return (this.sim && this.sim.phonemes && this.sim.phonemes.sorted()) || []
    },
    lexicon() {
      return (this.sim && this.sim.config && this.sim.config.lexicon) || []
    },
    dat() {
      if (!this.sim || this.cycle < 0 || this.numCycles <= this.cycle)
        return ''

      switch (this.activeTab) {
        case 2:
          return this.sim.inputLayer[this.cycle]
            .map((row, index) => [index, ...row.map(x => x.toFixed(4))].join('\t'))
            .join('\n')
        case 3:
          return this.sim.featLayer[this.cycle]
            .map((row, index) => [index, ...row.map(x => x.toFixed(4))].join('\t'))
            .join('\n')
        case 4:
          return this.sim.phonLayer[this.cycle]
            .map((row, index) => [this.sim.phonemes && this.sim.phonemes.byIndex(index).label, ...row.map(x => x.toFixed(4))].join('\t'))
            .join('\n')
        case 5:
          return this.sim.wordLayer[this.cycle]
            .map((row, index) => [this.sim.config.lexicon[index].phon, ...row.map(x => x.toFixed(4))].join('\t'))
            .join('\n')
        case 6:
          return this.analysisData
        default:
          return ''
      }
    },
    analysisData() {
      return formatAnalysis(this.chartData.datasets, true)
    }
  },
  watch: {
    cycle: function() {
      this.updateSimPage()
    }
  },
  methods: {
    run() {
      // eslint-disable-next-line
      console.time('trace.js')
      this.sim = new TraceSim(JSON.parse(JSON.stringify(this.config)))

      this.sim.cycle(60)
      this.numCycles = this.sim.getStepsRun()
      this.cycle = this.clamp(this.cycle, 0, this.numCycles)

      // do the simulation analysis with the values that were modified by the Analysis component
      // make sure to attach sim to config
      // then configure each row with the chart.js options
      this.chartData = {
        datasets: doSimAnalysis({ ...this.analysisConfig, sim: this.sim })
          .map((x, idx) => ({
            ...x,
            fill: false,
            borderColor: chartColors[idx],
            showLine: true
          }))
      }

      this.updateSimPage()

      // eslint-disable-next-line
      console.timeEnd('trace.js')
    },
    clamp(num, min, max) {
      return Math.min(Math.max(num, min), max)
    },
    updateSimPage() {
      if (this.cycle < 0 || this.numCycles <= this.cycle) {
        this.featureData = []
        this.wordData = []
        this.inputData = []
        this.phonemeData = []
      } else {
        this.featureData = this.sim.featLayer[this.cycle]
        this.wordData = this.sim.wordLayer[this.cycle]
        this.inputData = this.sim.inputLayer[this.cycle]
        this.phonemeData = this.sim.phonLayer[this.cycle]
      }
    }
  },
  components: { SimulationToolbar, Config, SimulationPage, Analysis }
}
</script>

<style>
body, html {
  margin: 0;
  height: 100%;
}
#app {
  height: 100%;
  display: flex;
  flex-flow: column;
}
</style>
