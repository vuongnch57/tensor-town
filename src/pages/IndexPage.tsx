import { chrome } from '@/content/chrome';
import { PagePlaceholder } from '@/ui/PagePlaceholder';

export function IndexPage() {
  return <PagePlaceholder {...chrome.placeholders.index} />;
}
