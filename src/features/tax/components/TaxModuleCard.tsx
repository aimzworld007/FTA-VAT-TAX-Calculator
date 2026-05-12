import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

type TaxModuleCardProps = {
  title: string;
  subtitle: string;
  image: string;
  route: string;
  chips?: string[];
  onSelect: (route: string) => void;
};

export function TaxModuleCard({
  title,
  subtitle,
  image,
  route,
  chips = [],
  onSelect,
}: TaxModuleCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '1px solid #dbe6f3',
        boxShadow: '0 8px 24px rgba(15,23,42,.08)',
        overflow: 'hidden',
      }}
      elevation={0}
    >
      <CardActionArea onClick={() => onSelect(route)} aria-label={`Open ${title}`}>
        <CardContent sx={{ p: 1.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Box sx={{ width: 82, minWidth: 82, height: 60, borderRadius: 2.5, bgcolor: '#f8fafc', display: 'grid', placeItems: 'center', p: 0.7 }}>
              <img src={image} alt={title} style={{ width: '100%', maxWidth: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{title}</Typography>
              <Typography variant='body2' sx={{ color: '#475569', mt: 0.35 }}>{subtitle}</Typography>
            </Box>
            <IconButton sx={{ bgcolor: '#2563eb', color: '#fff', '&:hover': { bgcolor: '#1d4ed8' }, width: 36, height: 36 }}>
              <ArrowForwardRoundedIcon fontSize='small' />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7, mt: 1.3 }}>
            {chips.map((chip) => <Chip key={chip} label={chip} size='small' sx={{ bgcolor: '#eef2ff', color: '#334155', borderRadius: 2 }} />)}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
