import { SVGProps } from 'react';

const Creator = (props: SVGProps<SVGSVGElement>) => (
  <svg width={49} height={49} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx={24.562} cy={24.953} rx={23.977} ry={24.024} fill="#C4C4C4" />
    <mask
      id="a"
      style={{
        maskType: 'alpha',
      }}
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={49}
      height={49}
    >
      <ellipse cx={24.562} cy={24.953} rx={23.977} ry={24.024} fill="#C4C4C4" />
    </mask>
    <g mask="url(#a)">
      <rect x={-14.486} y={-14.172} width={39.733} height={38.438} rx={7.2} fill="#39C0BA" />
      <rect width={39.771} height={38.4} rx={7.2} transform="rotate(-45.056 25.248 -3.904)" fill="#FFCE20" />
      <rect
        width={39.807}
        height={38.366}
        rx={7.2}
        transform="rotate(-78.023 42.242 22.418) skewX(-.045)"
        fill="#BB85FF"
      />
      <rect
        width={39.791}
        height={38.382}
        rx={7.2}
        transform="rotate(-119.952 16.285 29.346) skewX(.097)"
        fill="#7520FF"
      />
    </g>
  </svg>
);

export default Creator;
