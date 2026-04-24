export function ScannerStyles() {
  return (
    <style>{`
      .scanner-active {
        background: transparent !important;
      }
      
      @keyframes scan {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(100%);
        }
      }
    `}</style>
  );
}
