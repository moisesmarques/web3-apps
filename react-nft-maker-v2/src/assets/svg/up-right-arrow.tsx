import * as React from 'react';
import { SVGProps } from 'react';

const UpRightArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg width={16} height={17} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M14.88 1.932H8.916m5.964 0L1.462 15.59 14.88 1.932Zm0 0v6.07-6.07Z"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default UpRightArrow;
