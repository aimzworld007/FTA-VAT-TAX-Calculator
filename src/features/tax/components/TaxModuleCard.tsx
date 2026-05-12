import React from 'react';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

type TaxModuleCardProps = {
  title: string;
  subtitle: string;
  image: string;
  route: string;
  accentColor?: string;
  onSelect: (route: string) => void;
};

export function TaxModuleCard({
  title,
  subtitle,
  image,
  route,
  accentColor = 'border-slate-200 hover:border-slate-300',
  onSelect,
}: TaxModuleCardProps) {
  return (
    <Card
      className={`h-full rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${accentColor}`}
      elevation={0}
    >
      <CardActionArea className="h-full" onClick={() => onSelect(route)}>
        <div className="flex h-full min-h-[320px] flex-col overflow-hidden">
          <div className="flex h-[220px] items-center justify-center overflow-hidden bg-slate-50 px-5 pt-5">
            <img
              src={image}
              alt={title}
              className="mx-auto max-h-[220px] w-full object-contain"
            />
          </div>
          <CardContent className="flex items-center justify-between gap-3 p-5">
            <div>
              <Typography variant="h6" className="font-semibold text-slate-900">
                {title}
              </Typography>
              <Typography variant="body2" className="mt-1 text-slate-600">
                {subtitle}
              </Typography>
            </div>
            <ArrowForwardRoundedIcon className="text-slate-500" />
          </CardContent>
        </div>
      </CardActionArea>
    </Card>
  );
}
