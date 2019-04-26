import React from 'react';

const MIN_PERCENTAGE = 0;
const MAX_PERCENTAGE = 100;
const MAX_X = 100;
const MAX_Y = 100;
const FULL_RADIUS = 50;
const CENTER_X = 50;
const CENTER_Y = 50;

type CircularProgressbarDefaultProps = {
  strokeWidth: number;
  className: string;
  text: string;
  background: boolean;
  backgroundPadding: number;
  initialAnimation: boolean;
  counterClockwise: boolean;
  classes: {
    root: string;
    trail: string;
    path: string;
    text: string;
    background: string;
  };
  styles: {
    root?: object;
    trail?: object;
    path?: object;
    text?: object;
    background?: object;
  };
};

type CircularProgressbarProps = CircularProgressbarDefaultProps & {
  percentage: number;
};

type CircularProgressbarState = {
  percentage: number;
};

class CircularProgressbar extends React.Component<
  CircularProgressbarProps,
  CircularProgressbarState
> {
  initialTimeout: number | undefined = undefined;
  requestAnimationFrame: number | undefined = undefined;

  static defaultProps: CircularProgressbarDefaultProps = {
    strokeWidth: 8,
    className: '',
    text: '',
    background: false,
    backgroundPadding: 0,
    initialAnimation: false,
    counterClockwise: false,
    classes: {
      root: 'CircularProgressbar',
      trail: 'CircularProgressbar-trail',
      path: 'CircularProgressbar-path',
      text: 'CircularProgressbar-text',
      background: 'CircularProgressbar-background',
    },
    styles: {
      root: {},
      trail: {},
      path: {},
      text: {},
      background: {},
    },
  };

  constructor(props: CircularProgressbarProps) {
    super(props);

    this.state = {
      percentage: props.initialAnimation ? 0 : props.percentage,
    };
  }

  componentDidMount() {
    if (this.props.initialAnimation) {
      this.initialTimeout = window.setTimeout(() => {
        this.requestAnimationFrame = window.requestAnimationFrame(() => {
          this.setState({
            percentage: this.props.percentage,
          });
        });
      }, 0);
    }
  }

  componentWillReceiveProps(nextProps: CircularProgressbarProps) {
    this.setState({
      percentage: nextProps.percentage,
    });
  }

  componentWillUnmount() {
    clearTimeout(this.initialTimeout);
    if (this.requestAnimationFrame) {
      window.cancelAnimationFrame(this.requestAnimationFrame);
    }
  }

  getBackgroundPadding() {
    if (this.props.background) {
      // Default padding to be the same as strokeWidth
      // Compare to null because 0 is falsy
      if (this.props.backgroundPadding == null) {
        return this.props.strokeWidth;
      }
      return this.props.backgroundPadding;
    }
    // Don't add padding if not displaying background
    return 0;
  }

  // SVG path description, or `d`, specifies how the path should be drawn
  getPathDescription() {
    const radius = this.getPathRadius();
    const rotation = this.props.counterClockwise ? 1 : 0;

    // Move to center of canvas
    // Relative move to top canvas
    // Relative arc to bottom of canvas
    // Relative arc to top of canvas
    return `
      M ${CENTER_X},${CENTER_Y}
      m 0,-${radius}
      a ${radius},${radius} ${rotation} 1 1 0,${2 * radius}
      a ${radius},${radius} ${rotation} 1 1 0,-${2 * radius}
    `;
  }

  getPathStyles() {
    const diameter = Math.PI * 2 * this.getPathRadius();

    // Keep percentage within range (MIN_PERCENTAGE, MAX_PERCENTAGE)
    const truncatedPercentage = Math.min(
      Math.max(this.state.percentage, MIN_PERCENTAGE),
      MAX_PERCENTAGE,
    );
    const pathLength = (1 - truncatedPercentage / 100) * diameter;

    return {
      // Have dash be full diameter, and gap be full diameter
      strokeDasharray: `${diameter}px ${diameter}px`,
      // Have gap start appearing after `pathLength` distance
      strokeDashoffset: `${this.props.counterClockwise ? -pathLength : pathLength}px`,
    };
  }

  getPathRadius() {
    // The radius of the path is defined to be in the middle, so in order for the path to
    // fit perfectly inside the 100x100 viewBox, need to subtract half the strokeWidth
    return FULL_RADIUS - this.props.strokeWidth / 2 - this.getBackgroundPadding();
  }

  render() {
    const { percentage, className, classes, styles, strokeWidth, text } = this.props;
    const pathDescription = this.getPathDescription();

    return (
      <svg
        className={`${classes.root} ${className}`}
        style={styles.root}
        viewBox={`0 0 ${MAX_X} ${MAX_Y}`}
      >
        {this.props.background ? (
          <circle
            className={classes.background}
            style={styles.background}
            cx={CENTER_X}
            cy={CENTER_Y}
            r={FULL_RADIUS}
          />
        ) : null}

        <path
          className={classes.trail}
          style={styles.trail}
          d={pathDescription}
          strokeWidth={strokeWidth}
          fillOpacity={0}
        />

        <path
          className={classes.path}
          d={pathDescription}
          strokeWidth={strokeWidth}
          fillOpacity={0}
          style={Object.assign({}, styles.path, this.getPathStyles())}
        />

        {text ? (
          <text className={classes.text} style={styles.text} x={CENTER_X} y={CENTER_Y}>
            {text}
          </text>
        ) : null}
      </svg>
    );
  }
}

export default CircularProgressbar;
