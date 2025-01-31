import React from 'react';
import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';

export function showAlert(message: string, severity: 'success' | 'error' | 'warning' | 'info', duration: number = 3000) {
    return (
        <Snackbar open={true} autoHideDuration={duration}>
            <Alert severity={severity}>
                {message}
            </Alert>
        </Snackbar>
    );
}