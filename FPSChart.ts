// Declare Chart to avoid TypeScript errors
declare const Chart: any;

export class FPSChart {
  private chart: any;
  private fpsData: number[] = [];
  private chartPromise: Promise<void>;
  private containerId: string;
  private minValue: number | null = null;
  private maxValue: number | null = null;

  constructor(containerId: string = 'fpsChartContainer') {
    this.containerId = containerId;
    this.chartPromise = this.loadChartJS().then(() => this.initChart());
  }

  private loadChartJS(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Chart !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Chart.js'));
      document.head.appendChild(script);
    });
  }

  private initChart(): void {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      document.body.appendChild(container);
    }

    Object.assign(container.style, {
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '300px',
      height: '200px',
      zIndex: '9999',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      border: '1px solid #ccc',
      borderRadius: '5px',
      padding: '10px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    });

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }

    const config = {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'FPS',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time (frame index)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'FPS'
            },
            min: this.minValue ?? undefined,
            max: this.maxValue ?? undefined
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  async addFPSValue(fps: number): Promise<void> {
    await this.chartPromise;
    this.fpsData.push(fps);
    this.updateChart();
  }

  async addFPSArray(fpsArray: number[]): Promise<void> {
    await this.chartPromise;
    this.fpsData.push(...fpsArray);
    this.updateChart();
  }

  setMinValue(value: number | null): void {
    this.minValue = value;
    this.updateYAxisRange();
  }

  setMaxValue(value: number | null): void {
    this.maxValue = value;
    this.updateYAxisRange();
  }

  async clear(): Promise<void> {
    await this.chartPromise;
    this.fpsData = [];
    this.updateChart();
  }

  private updateYAxisRange(): void {
    if (this.chart && this.chart.options && this.chart.options.scales && this.chart.options.scales.y) {
      this.chart.options.scales.y.min = this.minValue ?? undefined;
      this.chart.options.scales.y.max = this.maxValue ?? undefined;
      this.chart.update();
    }
  }

  private updateChart(): void {
    const labels = this.fpsData.map((_, index) => index.toString());
    
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = this.fpsData;

    if (this.minValue === null && this.maxValue === null) {
      const maxFPS = Math.max(...this.fpsData, 0);
      const minFPS = Math.min(...this.fpsData, 0);
      if (this.chart.options && this.chart.options.scales && this.chart.options.scales.y) {
        this.chart.options.scales.y.min = Math.max(0, minFPS - 5);
        this.chart.options.scales.y.max = maxFPS + 5;
      }
    }

    this.chart.update();
  }
}