import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Label,
} from "recharts";

import useWindowsDimensions from "@/hooks/useWindowsDimensions";
import { formatAmount } from "@/lib/utils";
import AmountNumber from "../AmountNumber";

const COLORS = ["var(--danger)", "var(--success)"];

interface PaymentDonutChartProps {
  totalLabel: string;
  total: number;
  paidLabel: string;
  paid: number;
}

const PaymentDonutChart = ({
  totalLabel,
  total: rawTotal,
  paidLabel,
  paid: rawPaid,
}: PaymentDonutChartProps) => {
  const { width } = useWindowsDimensions();
  const isMobile = width < 1280;

  if (totalLabel === undefined) return null;

  const total = Math.max(rawTotal, 0);
  const paid = Math.min(rawPaid, rawTotal);

  const pending = total - paid;

  const percentage = total > 0 ? ((paid / total) * 100).toFixed(0) : "0";

  const data = [
    { name: totalLabel, value: pending },
    { name: paidLabel, value: paid },
  ];

  return (
    <ResponsiveContainer height={200} width={isMobile ? "100%" : 200}>
      <PieChart>
        <Pie
          data={data}
          labelLine={false}
          innerRadius={40}
          outerRadius={60}
          paddingAngle={5}
          fill="var(--background)"
          stroke="var(--background)"
          strokeWidth={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}

          <Label
            value={`${percentage}%`}
            position="center"
            style={{
              fontSize: "22px",
              fontWeight: 600,
              fill: "var(--success)",
            }}
          />
        </Pie>

        <Tooltip
          formatter={(value: number, name: string) => [
            <AmountNumber key={`${name}-${value}`} size="xs">
              {formatAmount(value)}
            </AmountNumber>,
            name,
          ]}
          contentStyle={{
            backgroundColor: "var(--info)",
            border: "1px solid var(--foreground)",
            padding: "4px 8px",
          }}
          itemStyle={{
            fontWeight: 600,
            fontSize: "12px",
            color: "var(--background)",
            padding: 0,
          }}
        />

        <Legend
          align="left"
          verticalAlign="bottom"
          wrapperStyle={{
            display: "flex",
            justifyContent: isMobile ? "start" : "center",
          }}
          content={({ payload }) => (
            <ul className="m-0 list-none p-0">
              {payload?.map((entry) => (
                <li
                  key={`${entry.value}-${entry.color}`}
                  className="flex items-center gap-x-1 font-semibold"
                >
                  <span
                    className="mr-0.5 inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: entry.color,
                    }}
                  />
                  <span
                    className="text-sm"
                    style={{
                      color: entry.color,
                    }}
                  >
                    {entry.value}:
                  </span>
                  <AmountNumber size="sm">
                    {formatAmount(entry.payload?.value)}
                  </AmountNumber>
                </li>
              ))}
            </ul>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PaymentDonutChart;
