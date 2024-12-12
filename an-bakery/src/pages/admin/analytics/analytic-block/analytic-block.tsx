import clsx from "clsx";

interface AnalyticBlockProps {
  title: string;
  mainNum: number;
  subNum: number;
  diffNum: number;
  chartId: string;
}

const AnalyticBlock = ({ title, mainNum, subNum, diffNum, chartId }: AnalyticBlockProps) => (
  <div className={"flex w-full flex-col gap-2 rounded-xl border-dark/25 p-4 shadow-custom"}>
    <h4 className={"font-semibold"}>{title}</h4>
    <div className={"flex items-center gap-2"}>
      <div className={"flex flex-col gap-2"}>
        <div className="flex items-end gap-2">
          <h2 className={"text-primary"}>{mainNum?.toLocaleString("vi-VN") ?? "-"}</h2>
          <h4 className={"text-dark/35"}>{subNum?.toLocaleString("vi-VN") ?? "-"}</h4>
        </div>
        <p
          className={clsx("small min-w-max", {
            "text-danger": diffNum < 0,
            "text-success": diffNum >= 0,
          })}
        >
          {diffNum >= 0 ? "Tăng" : "Giảm"} <strong>{Math.abs(diffNum)}</strong> so với tháng trước
        </p>
      </div>
      <div id={chartId} className={"flex items-center"}></div>
    </div>
  </div>
);

export default AnalyticBlock;
