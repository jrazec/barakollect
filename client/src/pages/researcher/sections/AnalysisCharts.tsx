import CardComponent from '@/components/CardComponent';
import { BarChartComponent, CorrelationGrid, LineChartComponent, PieChartComponent, ScatterChartComponent } from '@/components/ChartComponent';
import type { CardAttributes } from '@/interfaces/global';

const AnalysisCharts = ({ activeTab }: { activeTab: string }) => {
  const morphs: CardAttributes[] = [
    {
      title: "Monthly Morphological Trends",
      content: (<LineChartComponent />),
      subtitle: "",
      description: "",
    },
    {
      title: "Size Distribution Box Plot",
      content: (<BarChartComponent />),
      subtitle: "This graph shows the size of liberica kinersu",
      description: (
        <>
          <span>Liberica</span>
          <span>Excelsa</span>
        </>
      ),
    },
    {
      title: "Major vs Minor Axis Scatter Plot",
      content: (<ScatterChartComponent />),
      subtitle: "12mm",
      description: (
        <>
          <span>Liberica</span>
          <span>Excelsa</span>
        </>
      )
    },
    {
      title: "Feature Correlation Matrix",
      content: (<CorrelationGrid />),
      subtitle: "Length, Width, Area, Perimeter",
      description: (
        <>
          <span>Darker color = stronger correlation</span>
        </>
      ),
    },
  ]
  const geogs: CardAttributes[] = [
    {
      title: "Bean Type Distribution",
      content: (<PieChartComponent />),
      subtitle: "Libérica: 65%",
      description: (
        <>
          <span>Libérica</span>
          <span>Excelsa</span>
          <span>Unclassified</span>
        </>
      ),
    },
    {
      title: "Size Distribution by Variety",
      content: (<BarChartComponent />),
      subtitle: "Size Distribution",
      description: (
        <>
          <span>Liberica</span>
          <span>Excelsa</span>
        </>
      ),
    },
    {
      title: "Feature Correlation Matrix",
      content: (<CorrelationGrid />),
      subtitle: "Length, Width, Area, Perimeter",
      description: (
        <>
          <span>Darker color = stronger correlation</span>
        </>
      ),
    },
  ]
  const distribs: CardAttributes[] = [
    {
      title: "Geographic Data View",
      content: (<BarChartComponent />),
      subtitle: "mean distribution across different farming regions",
      description: (
        <>
          <span>Showing data from 3 farms across the region</span>
        </>
      ),
    },
  ]
  const comps: CardAttributes[] = [
    {
      title: "Feature Averages by Farm",
      content: (<BarChartComponent />),
      subtitle: "Comparative analysis across different farming regions.",
      description: (
        <>
          <span>length</span>
          <span>width</span>
          <span>area</span>
        </>
      ),
    },
  ]
  const chartsByTab: Record<string, CardAttributes[]> = {
    "Morphological":morphs,
    "Distributions":distribs,
    "Geographic":geogs,
    "Comparison":comps,
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 1fr">
        {chartsByTab[activeTab]?.map((card) => (
          <CardComponent item={card} />
        ))}
      </div>
    </>
  );
};

export default AnalysisCharts;
