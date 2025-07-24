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

export interface User {
    name: string,
    role: string
}

export interface NavItems {
    icon: React.ReactNode,
    label: string,
    route?: string,
    active?: boolean
}


export type NavItem = {
  label: string;
  icon: React.ReactNode;
  route: string;
  active?: boolean;
};

export type SidebarNavProps = {
  changeActiveNav: Function;
  show: boolean;
  navigationItems:Record<string, NavItems[]>;
  role: string;
};