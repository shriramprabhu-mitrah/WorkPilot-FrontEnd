import { colors } from "@/src/styles/colors";
import Panel from "@/src/app/components/common/panel/panel";
import Piechart from "@/src/app/components/common/charts/pieChart";
import type { CallbackDataParams } from "echarts/types/dist/shared";
import { priorityData } from "@/src/modules/reports/data";
interface PriorityDistributionCardProps {
  isMobile: boolean;
  chartHeight: number;
}

export default function PriorityDistributionCard({
  isMobile,
  chartHeight,
}: PriorityDistributionCardProps) {
  return (
    <Panel
      title="Tasks by Priority"
      subtitle="Risk distribution across active sprint"
    >
      <Piechart
        data={priorityData}
        radius={["0%", "72%"]}
        center={isMobile ? ["36%", "50%"] : ["40%", "50%"]}
        startAngle={30}
        label={{
          show: true,
          formatter: (p: CallbackDataParams) => `${p.name}: ${p.value}`,
          color: colors.gray700,
          fontSize: isMobile ? 10 : 12,
        }}
        labelline={{ show: true, lineStyle: { color: colors.gray400 } }}
        height={chartHeight}
      />
    </Panel>
  );
}
