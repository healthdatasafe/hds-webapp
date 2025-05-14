
import React from 'react';
import { Avatar as UIAvatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string;
  name: string;
  className?: string;
};

const Avatar = ({ src, name, className }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <UIAvatar className={cn("border border-border", className)}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {initials}
      </AvatarFallback>
    </UIAvatar>
  );
};

export default Avatar;
