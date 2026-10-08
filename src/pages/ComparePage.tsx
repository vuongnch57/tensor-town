import { chrome } from '@/content/chrome';
import { PagePlaceholder } from '@/ui/PagePlaceholder';

export function ComparePage() {
  return <PagePlaceholder {...chrome.placeholders.compare} />;
}
