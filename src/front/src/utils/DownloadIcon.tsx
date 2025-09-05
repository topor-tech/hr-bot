import { Icon } from '@iconify/react';

type Props = {
  size?: number;
  className?: string;
  onClick?: () => void;
  title?: string;
};

export default function DownloadIcon({ size = 16, className, onClick, title }: Props) {
  return (
    <span 
      className={className}
      onClick={onClick}
      title={title}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Icon 
        icon="lucide:download" 
        width={size} 
        height={size} 
      />
    </span>
  );
}
