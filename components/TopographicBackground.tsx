const TopographicBackground = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-10">
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
          <circle id="pattern-circle" cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        </pattern>
        <rect fill="url(#pattern-circles)" width="100%" height="100%"/>
      </svg>
    </div>
  )
}

export default TopographicBackground