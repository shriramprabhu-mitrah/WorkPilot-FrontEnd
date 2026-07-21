import { colors } from "@/src/styles/colors";
import Panel from "@/src/app/components/common/panel/panel";
import BarChart from "@/src/app/components/common/charts/barChart";
import type {
  CallbackDataParams,
  TopLevelFormatterParams,
} from "echarts/types/dist/shared";
import type { EChartsOption } from "echarts";
import { statusData } from "@/src/modules/reports/data";
interface StatusDistributionCardProps {
  isMobile: boolean;
  chartHeight: number;
}

export default function StatusDistributionCard({
  isMobile,
  chartHeight,
}: StatusDistributionCardProps) {
  const option: EChartsOption = {
    animation: true,
    animationDuration: 1200,
    animationEasing: "cubicOut",
    animationDurationUpdate: 800,
    animationEasingUpdate: "cubicOut",
    grid: {
      left: 8,
      right: 8,
      top: 12,
      bottom: isMobile ? 48 : 36,
      containLabel: true,
    },
    tooltip: {
      trigger: "item",
      backgroundColor: colors.white,
      borderColor: colors.gray200,
      borderWidth: 1,
      textStyle: { color: colors.gray900, fontSize: 12 },
      formatter: (params: TopLevelFormatterParams) => {
        const p = (
          Array.isArray(params) ? params[0] : params
        ) as CallbackDataParams;
        return `<strong>${p.name}</strong><br/>Tasks : ${p.value}`;
      },
    },
    xAxis: {
      type: "category",
      data: statusData.map((item) => item.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: isMobile ? 9 : 11,
        color: colors.gray500,
        interval: 0,
        rotate: isMobile ? 30 : 0,
      },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: colors.gray100 } },
      axisLabel: { fontSize: 11, color: colors.gray500 },
    },
    series: [
      {
        type: "bar",
        barMaxWidth: 40,
        emphasis: { focus: "series" },
        animation: true,
        data: statusData.map((item) => ({
          value: item.value,
          itemStyle: { color: item.color, borderRadius: [4, 4, 0, 0] },
        })),
      },
    ],
  };

  return (
    <Panel
      title="Tasks by Status"
      subtitle="Current distribution across all projects"
    >
      <BarChart option={option} height={chartHeight} />
    </Panel>
  );
}
