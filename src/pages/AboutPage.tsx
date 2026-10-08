import { chrome } from '@/content/chrome';
import { PagePlaceholder } from '@/ui/PagePlaceholder';

export function AboutPage() {
  return <PagePlaceholder {...chrome.placeholders.about} />;
}
