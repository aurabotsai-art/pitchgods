export function UserName({
  name,
  color,
  flair,
  className = "",
}: {
  name: string;
  color?: string | null;
  flair?: string | null;
  className?: string;
}) {
  return (
    <span className={className} style={color ? { color } : undefined}>
      {name}
      {flair && <span className="ml-0.5 text-glory">{flair}</span>}
    </span>
  );
}
