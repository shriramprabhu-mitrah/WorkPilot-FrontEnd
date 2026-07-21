"use client";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import ReactEcharts from "echarts-for-react";
import * as echarts from "echarts";
import { EChartsOption, PieSeriesOption } from "echarts";
import type { TopLevelFormatterParams } from "echarts/types/dist/shared";
import { colors } from "@/src/styles/colors";
import { useResize } from "@/src/hooks/useResize";

interface PieChartProps {
  legends?: EChartsOption["legend"];
  name?: string;
  radius?: PieSeriesOption["radius"];
  center?: PieSeriesOption["center"];
  itemstyle?: PieSeriesOption["itemStyle"];
  rosetype?: PieSeriesOption["roseType"];
  labelline?: PieSeriesOption["labelLine"];
  label?: PieSeriesOption["label"];
  data?: PieSeriesOption["data"];
  title?: EChartsOption["title"];
  graphic?: EChartsOption["graphic"];
  tooltip?: EChartsOption["tooltip"];
  padAngle?: number;
  startAngle?: number;
  minAngle?: number;
  minShowLabelAngle?: number;
  height?: number | string;
  className?: string;
}

const defaultTooltip: EChartsOption["tooltip"] = {
  trigger: "item",
  backgroundColor: colors.white,
  borderColor: colors.gray200,
  borderWidth: 1,
  textStyle: { color: colors.gray900, fontSize: 12 },
  formatter: (params: TopLevelFormatterParams) => {
    const p = Array.isArray(params) ? params[0] : params;
    return `<strong>${p.name}</strong><br/>${Number(p.value).toFixed(2)}`;
  },
};

const Piechart = forwardRef<ReactEcharts, Readonly<PieChartProps>>(
  (
    {
      legends,
      name,
      radius,
      center,
      itemstyle,
      rosetype,
      labelline,
      label,
      data,
      title,
      graphic,
      tooltip,
      padAngle = 0,
      startAngle = 40,
      minAngle,
      minShowLabelAngle,
      height = "100%",
      className = "",
    },
    ref,
  ) => {
    const innerRef = useRef<ReactEcharts | null>(null);
    const { width } = useResize();
    const [renderVersion, setRenderVersion] = useState(0);
    const optionSignature = useMemo(
      () =>
        JSON.stringify({
          title,
          legends,
          tooltip,
          radius,
          center,
          itemstyle,
          rosetype,
          labelline,
          label,
          data,
          graphic,
          padAngle,
          startAngle,
          minAngle,
          minShowLabelAngle,
          name,
        }),
      [
        title,
        legends,
        tooltip,
        radius,
        center,
        itemstyle,
        rosetype,
        labelline,
        label,
        data,
        graphic,
        padAngle,
        startAngle,
        minAngle,
        minShowLabelAngle,
        name,
      ],
    );

    useEffect(() => {
      const timer = window.setTimeout(() => {
        setRenderVersion((value) => value + 1);
      }, 0);

      return () => window.clearTimeout(timer);
    }, [width, height, optionSignature]);

    useEffect(() => {
      innerRef.current?.getEchartsInstance().resize();
    }, [width, renderVersion]);

    const normalizedData = Array.isArray(data)
      ? data.map((item) => {
          if (typeof item === "object" && item !== null) {
            const pieItem = item as {
              name?: string;
              value?: number;
              itemStyle?: { color?: string };
            };
            return {
              ...pieItem,
              label: {
                color: pieItem.itemStyle?.color ?? colors.gray700,
              },
            };
          }

          return item;
        })
      : data;

    const option: EChartsOption = {
      animation: true,
      animationDuration: 1000,
      animationEasing: "cubicOut",
      animationDurationUpdate: 700,
      animationEasingUpdate: "cubicOut",
      title,
      legend: legends,
      tooltip: tooltip ?? defaultTooltip,
      series: [
        {
          name,
          type: "pie",
          emphasis: { disabled: true },
          radius,
          center,
          roseType: rosetype,
          itemStyle: itemstyle,
          labelLine: labelline,
          label: {
            ...label,
            color: colors.gray700,
            formatter: (params: TopLevelFormatterParams) => {
              const singleParams = Array.isArray(params) ? params[0] : params;
              return `${singleParams.name}: ${singleParams.value}`;
            },
          },
          padAngle,
          minAngle,
          minShowLabelAngle,
          data: normalizedData,
          startAngle,
        },
      ],
      graphic,
    };

    return (
      <div className={className} style={{ height }}>
        <ReactEcharts
          key={renderVersion}
          notMerge
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref)
              (ref as React.MutableRefObject<ReactEcharts | null>).current =
                node;
          }}
          echarts={echarts}
          option={option}
          style={{ width: "100%", height: "100%" }}
          opts={{ renderer: "svg" }}
        />
      </div>
    );
  },
);

Piechart.displayName = "Piechart";
export default Piechart;
