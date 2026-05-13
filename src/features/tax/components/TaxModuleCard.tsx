import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Building2, FileSpreadsheet } from 'lucide-react';

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
  const [hasImageError, setHasImageError] = React.useState(false);
  const fallbackIcon = title.toLowerCase().includes('corporate') ? <Building2 size={28} /> : <FileSpreadsheet size={28} />;

  return (
    <Card
      sx={{
        borderRadius: '18px',
        border: '1px solid #E5EAF2',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
      elevation={0}
    >
      <CardActionArea onClick={() => onSelect(route)} aria-label={`Open ${title}`}>
        <CardContent sx={{ p: 2.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box sx={{ width: 72, minWidth: 72, height: 72, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid #E5EAF2', display: 'grid', placeItems: 'center', p: 1 }}>
              {hasImageError ? (
                <Box sx={{ color: '#2563eb', display: 'grid', placeItems: 'center' }} aria-label={`${title} icon fallback`}>
                  {fallbackIcon}
                </Box>
              ) : (
                <img
                  src={image}
                  alt={title}
                  onError={() => setHasImageError(true)}
                  style={{ width: '100%', maxWidth: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, fontSize: { xs: '1rem', sm: '1.05rem' } }}>{title}</Typography>
              <Typography variant='body2' sx={{ color: '#64748b', mt: 0.5, lineHeight: 1.35 }}>{subtitle}</Typography>
            </Box>
            <IconButton sx={{ bgcolor: '#2563eb', color: '#fff', '&:hover': { bgcolor: '#1d4ed8' }, width: 44, height: 44, flexShrink: 0 }}>
              <ArrowForwardRoundedIcon fontSize='small' />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
            {chips.map((chip) => <Chip key={chip} label={chip} size='small' sx={{ bgcolor: '#F1F5F9', color: '#334155', borderRadius: '10px', height: 24, '& .MuiChip-label': { px: 1, fontSize: '0.72rem', fontWeight: 600 } }} />)}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
