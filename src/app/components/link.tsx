import React from "react";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export function Link({ children, ...props }: LinkProps) {
  return (
    <a {...props} style={{ cursor: "pointer" }}>
      {children}
    </a>
  );
}
