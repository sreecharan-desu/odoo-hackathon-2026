import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function Skeleton({ width, height, circle, style, className = "" }: SkeletonProps) {
  const customStyle: React.CSSProperties = {
    width: width !== undefined ? width : "100%",
    height: height !== undefined ? height : "1em",
    borderRadius: circle ? "50%" : "4px",
    ...style,
  };

  return (
    <div
      className={`skeleton-box ${className}`}
      style={customStyle}
    />
  );
}
