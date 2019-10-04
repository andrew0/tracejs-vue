import Vue from 'vue'
import SimulationChart from './SimulationChart.vue'

export default {
  render(createElement) {
    return createElement('div', {
      style: {
        width: '100%',
        height: '100%'
      }
    }, [
      createElement('iframe', {
        style: {
          width: '100%',
          height: '100%'
        },
        on: {
          load: this.injectChart
        },
        ref: 'iframe'
      }),
      createElement('simulation-chart', {
        props: {
          chartData: []
        },
        ref: 'chart'
      })
    ])
  },
  methods: {
    testing(test) {
      console.log(test)
    },
    injectChart() {
      const el = document.createElement('div')
      this.$refs.iframe.contentDocument.body.appendChild(el)
      
      //this.$refs.iframe.contentDocument.body.appendChild(this.$refs.chart)
      // const el = document.createElement('div')
      // this.$el.contentDocument.body.appendChild(el)

      // const SimulationChartClass = Vue.extend(SimulationChart)
      // const instance = new SimulationChartClass({
      //   propsData: {
      //     styles: {
      //       width: '100%',
      //       height: '100%',
      //       'min-width': '0',
      //       'min-height': '0'
      //     },
      //     chartData: []
      //   }
      // })
      // this.$nextTick(() => instance.$mount(el))
      //instance.$el.style.cssText = 'position: relative; width: 100%; height: 100%; min-width: 0; min-height: 0;'
    }
  },
  components: { SimulationChart }
}
