export default function WaveTransition() {
  return (
    <div className="section-transition st-wave" aria-hidden="true">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,60 C280,120 560,0 840,60 C1050,100 1260,20 1440,50 L1440,120 L0,120 Z"
          fill="#0c0804"
        />
        <path
          d="M0,80 C320,20 680,110 1000,55 C1160,25 1320,90 1440,70 L1440,120 L0,120 Z"
          fill="#100806"
          opacity="0.9"
        />
      </svg>
    </div>
  )
}
