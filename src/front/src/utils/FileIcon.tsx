import { Icon } from '@iconify/react';

// map extensions to Tabler file-type icons (fallbacks go to Lucide)
const extToIcon: Record<string, string> = {
  pdf: 'tabler:file-type-pdf',
  doc: 'tabler:file-type-doc',
  docx: 'tabler:file-type-doc',
  xls: 'tabler:file-type-xls',
  xlsx: 'tabler:file-type-xls',
  csv: 'tabler:file-type-csv',
  ppt: 'tabler:file-type-ppt',
  pptx: 'tabler:file-type-ppt',
  txt: 'tabler:file-type-txt',
  json: 'lucide:file-json',      // Lucide fallback
  zip: 'lucide:file-archive',
  jpg: 'lucide:file-image',
  jpeg: 'lucide:file-image',
  png: 'lucide:file-image',
  gif: 'lucide:file-image',
  svg: 'lucide:file-image',
  mp3: 'lucide:file-audio',
  wav: 'lucide:file-audio',
  mp4: 'lucide:file-video',
  mov: 'lucide:file-video',
  ts: 'lucide:file-code',
  js: 'lucide:file-code',
  py: 'lucide:file-code',
  sql: 'lucide:file-code',
};

type Props = {
  filename?: string;
  ext?: string;           // optional override
  size?: number;          // px
  className?: string;     // for color in dark theme
};

export default function FileIcon({ filename, ext, size = 22, className }: Props) {
  const e = (ext ?? filename?.split('.').pop() ?? '').toLowerCase();
  const name = extToIcon[e] || 'lucide:file-text'; // generic fallback
  return <Icon icon={name} width={size} height={size} className={className} />;
}
