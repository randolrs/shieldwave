export default function GlowInput({ className = '', ...props }) {
  return (
    <div className={`glow-wrap ${className}`}>
      <input className="input-field" {...props} />
    </div>
  );
}

export function GlowTextarea({ className = '', ...props }) {
  return (
    <div className={`glow-wrap ${className}`}>
      <textarea className="input-field" {...props} />
    </div>
  );
}
