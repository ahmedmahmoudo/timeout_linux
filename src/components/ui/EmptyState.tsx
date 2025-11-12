import { Text } from "./Text";

type EmptyTabStateProps = {
  title: string;
  description: string;
};

export function EmptyTabState({ title, description }: EmptyTabStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <Text as="h3" variant="subtitle">
        {title}
      </Text>
      <Text as="p" variant="muted" className="max-w-md text-neutral-400">
        {description}
      </Text>
    </div>
  );
}
