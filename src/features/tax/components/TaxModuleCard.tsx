import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
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
      className={`h-full rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-xl ${accentColor}`}
      sx={{
        borderRadius: 3,
        transition: 'transform .2s ease, box-shadow .2s ease',
        '&:hover': { transform: 'translateY(-2px)' },
      }}
      elevation={0}
    >
      <CardActionArea className="h-full" onClick={() => onSelect(route)} aria-label={`Open ${title}`}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '190px 1fr' }, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 2.5 }, background: '#f8fafc' }}>
            <img
              src={image}
              alt={title}
              style={{
                width: '100%',
                maxWidth: '100%',
                height: 'auto',
                maxHeight: 'clamp(120px, 20vw, 210px)',
                objectFit: 'contain',
              }}
            />
          </Box>
          <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h6" className="font-semibold text-slate-900">
              {title}
            </Typography>
            <Typography variant="body2" className="mt-1 text-slate-600" sx={{ mb: 1.2 }}>
              {subtitle}
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, color: '#1565c0', fontWeight: 700, fontSize: '0.95rem' }}>
              Start <ArrowForwardRoundedIcon fontSize="small" />
            </Box>
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}
