import React from 'react';
import { VIEWBOX_CENTER_X, VIEWBOX_CENTER_Y } from './constants';

const MIN_PERCENTAGE = 0;
const MAX_PERCENTAGE = 100;

function Path({
  className,
  counterClockwise,
  pathRadius,
  percentage,
  strokeWidth,
  style,
}: {
  className?: string;
  counterClockwise: boolean;
  pathRadius: number;
  percentage: number;
  strokeWidth: number;
  style?: object;
}) {
  return (
    <path
      className={className}
      style={Object.assign({}, style, getDashStyle({ pathRadius, percentage, counterClockwise }))}
      d={getPathDescription({
        pathRadius,
        counterClockwise,
      })}
      strokeWidth={strokeWidth}
      fillOpacity={0}
    />
  );
}

function getPathDescription({
  pathRadius,
  counterClockwise,
}: {
  pathRadius: number;
  counterClockwise: boolean;
}) {
  const radius = pathRadius;
  const rotation = counterClockwise ? 1 : 0;

  // Move to center of canvas
  // Relative move to top canvas
  // Relative arc to bottom of canvas
  // Relative arc to top of canvas
  return `
      M ${VIEWBOX_CENTER_X},${VIEWBOX_CENTER_Y}
      m 0,-${radius}
      a ${radius},${radius} ${rotation} 1 1 0,${2 * radius}
      a ${radius},${radius} ${rotation} 1 1 0,-${2 * radius}
    `;
}

function getDashStyle({
  pathRadius,
  percentage,
  counterClockwise,
}: {
  pathRadius: number;
  percentage: number;
  counterClockwise: boolean;
}) {
  const diameter = Math.PI * 2 * pathRadius;
  const truncatedPercentage = Math.min(Math.max(percentage, MIN_PERCENTAGE), MAX_PERCENTAGE);
  const gapLength = (1 - truncatedPercentage / 100) * diameter;

  return {
    strokeDasharray: `${diameter}px ${diameter}px`,
    strokeDashoffset: `${counterClockwise ? -gapLength : gapLength}px`,
  };
}

export default Path;
