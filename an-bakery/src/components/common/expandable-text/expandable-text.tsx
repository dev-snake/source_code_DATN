import { Button } from "@nextui-org/react";
import { useState } from "react";

interface ExpandableTextProps {
  children: string;
}
const ExpandableText: React.FC<ExpandableTextProps> = ({ children }) => {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 60;
  if (children.length <= LIMIT) return children;
  const summaryText = expanded ? children : `${children.slice(0, LIMIT)}...`;
  return (
    <>
      {summaryText}{" "}
      <Button color="primary" size="sm" variant="flat" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Ẩn" : "Xem thêm"}
      </Button>
    </>
  );
};

export default ExpandableText;
