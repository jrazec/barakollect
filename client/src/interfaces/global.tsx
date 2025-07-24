export interface CardAttributes {
    title: string,
    subtitle: string,
    content: React.ReactNode,
    description?: React.ReactNode,
};


export interface Stat {
  label: string;
  value: string;
  subtext?: string;
}

export interface NotifAttributes {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'info' | 'warning' | 'error';
}