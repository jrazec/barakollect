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