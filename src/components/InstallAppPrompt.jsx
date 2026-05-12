import React from 'react';
import { Alert, Button, Stack, Typography } from '@mui/material';

export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [isInstalled, setIsInstalled] = React.useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
  );

  React.useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <Alert severity='info' sx={{ borderRadius: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent='space-between'>
        <Typography variant='body2'>Install this app for faster access and a standalone experience on your device.</Typography>
        <Button onClick={handleInstall} variant='contained' size='small'>Install App</Button>
      </Stack>
    </Alert>
  );
}
